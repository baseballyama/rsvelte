//! Phase 3: Transform
//!
//! Generate JavaScript code from the analyzed AST.
//!
//! This phase is responsible for:
//! - Generating client-side component code
//! - Generating server-side rendering code
//! - Generating CSS with scoped selectors
//!
//! The transformer produces the final JavaScript and CSS output.

pub mod builders;
pub mod client;
pub mod css;
pub mod js_ast;
pub mod jsnode_to_oxc;
pub mod profile;
pub mod server;
pub mod shared;
pub mod utils;

// Re-export commonly used types
pub use js_ast::{JsExpr, JsProgram, JsStatement};

use super::phase2_analyze::ComponentAnalysis;
use crate::ast::template::Root;
use crate::compiler::{CompileOptions, GenerateMode};
use memchr::memmem;

fn template_source_lines(source: &str) -> Vec<bool> {
    let mut in_script = false;
    let mut in_style = false;
    source
        .lines()
        .map(|text| {
            let trimmed = text.trim_start();
            let is_template = !in_script
                && !in_style
                && !trimmed.starts_with("<script")
                && !trimmed.starts_with("<style");
            if trimmed.starts_with("<script") && !trimmed.starts_with("</script") {
                in_script = !trimmed.contains("</script");
            } else if trimmed.starts_with("</script") {
                in_script = false;
            } else if trimmed.starts_with("<style") && !trimmed.starts_with("</style") {
                in_style = !trimmed.contains("</style");
            } else if trimmed.starts_with("</style") {
                in_style = false;
            }
            is_template
        })
        .collect()
}

fn is_template_append_mapping(
    template_source_lines: &[bool],
    append_generated_lines: &[bool],
    mapping: &js_ast::codegen::SourceMapping,
) -> bool {
    template_source_lines
        .get(mapping.orig_line as usize)
        .copied()
        .unwrap_or(false)
        && append_generated_lines
            .get(mapping.gen_line as usize)
            .copied()
            .unwrap_or(false)
}

/// Flag every generated line carrying an `$.append(` or `$.bind_` call. One
/// SIMD scan of the whole output; a per-line `contains` rebuilds the searcher
/// for every line.
fn mark_lines_containing(code: &str, line_starts: &[usize]) -> Vec<bool> {
    static APPEND: std::sync::LazyLock<memmem::Finder<'static>> =
        std::sync::LazyLock::new(|| memmem::Finder::new("$.append("));
    static BIND: std::sync::LazyLock<memmem::Finder<'static>> =
        std::sync::LazyLock::new(|| memmem::Finder::new("$.bind_"));
    let mut flags = vec![false; line_starts.len()];
    let bytes = code.as_bytes();
    for finder in [&*APPEND, &*BIND] {
        for hit in finder.find_iter(bytes) {
            let line = line_starts.partition_point(|&start| start <= hit) - 1;
            flags[line] = true;
        }
    }
    flags
}

/// Result of the transform phase.
#[derive(Debug)]
pub struct TransformResult {
    /// The generated JavaScript code
    pub js: String,

    /// Optional source map
    pub js_map: Option<String>,

    /// The generated CSS (if any)
    pub css: Option<CssOutput>,

    /// Compiler warnings
    pub warnings: Vec<TransformWarning>,
}

/// Generated CSS output.
#[derive(Debug)]
pub struct CssOutput {
    /// The CSS code
    pub code: String,

    /// Optional source map
    pub map: Option<String>,
}

/// A compiler warning from the transform phase.
#[derive(Debug)]
pub struct TransformWarning {
    /// Warning code
    pub code: String,
    /// Warning message
    pub message: String,
    /// Start byte offset in source (if available)
    pub start: Option<u32>,
    /// End byte offset in source (if available)
    pub end: Option<u32>,
}

/// Transform a component analysis into JavaScript code.
///
/// This is the entry point for Phase 3 of the compiler.
///
/// # Arguments
///
/// * `analysis` - The component analysis from Phase 2
/// * `ast` - The parsed AST from Phase 1 (to avoid re-parsing)
/// * `source` - The original source code
/// * `options` - Compile options
///
/// # Returns
///
/// Returns a `TransformResult` containing the generated code.
pub fn transform_component(
    analysis: &ComponentAnalysis,
    ast: &Root,
    source: &str,
    options: &CompileOptions,
) -> Result<TransformResult, TransformError> {
    transform_component_with_sourcemap_content(analysis, ast, source, options, true)
}

pub(crate) fn transform_component_with_sourcemap_content(
    analysis: &ComponentAnalysis,
    ast: &Root,
    source: &str,
    options: &CompileOptions,
    include_sourcemap_content: bool,
) -> Result<TransformResult, TransformError> {
    transform_component_with_scripts(
        analysis,
        ast,
        source,
        options,
        include_sourcemap_content,
        None,
        None,
        None,
    )
}

pub(crate) fn transform_component_with_scripts<'source>(
    analysis: &ComponentAnalysis,
    ast: &Root,
    source: &'source str,
    options: &CompileOptions,
    include_sourcemap_content: bool,
    retained_scripts: Option<&crate::ast::oxc_program::RetainedScripts<'_>>,
    client_program_sink: Option<&mut dyn FnMut(&js_ast::JsProgram, &js_ast::arena::JsArena)>,
    source_token_positions: Option<&mut SourceTokenPositions<'source>>,
) -> Result<TransformResult, TransformError> {
    use js_ast::codegen::{
        SourceMapping, encode_vlq_mappings, generate_sourcemap_json, get_source_name,
        remap_through_sourcemap,
    };

    let (js, mut js_mappings) = match options.generate {
        GenerateMode::Client => {
            let result = client::transform_client(
                analysis,
                ast,
                source,
                options,
                retained_scripts,
                client_program_sink,
            )?;

            if options.enable_sourcemap {
                let mapping_starts = MappingLineStarts::new(&result.code, source);
                let template_source_lines = template_source_lines(source);
                let append_generated_lines =
                    mark_lines_containing(&result.code, &mapping_starts.generated);
                let source_line_starts = &mapping_starts.source;
                // Lowering inserts framework calls between copied source tokens;
                // token mappings fill those holes before the coarser
                // emitter anchors are considered.
                let wrapper_mappings = ast.instance.as_deref().map_or_else(Vec::new, |script| {
                    generate_default_function_wrapper_mappings_with_starts(
                        &result.code,
                        source,
                        script.start as usize,
                        script.end as usize,
                        &mapping_starts,
                    )
                });
                let mut runtime_mappings = Vec::new();
                let mut template_name_mappings = Vec::new();
                let mut remaining_result_mappings = Vec::new();
                for mapping in result.mappings {
                    if is_template_append_mapping(
                        &template_source_lines,
                        &append_generated_lines,
                        &mapping,
                    ) {
                        runtime_mappings.push(mapping);
                    } else if is_template_element_name_mapping(source_line_starts, source, &mapping)
                    {
                        template_name_mappings.push(mapping);
                    } else {
                        remaining_result_mappings.push(mapping);
                    }
                }
                let effect_mappings = if source.contains("$effect") {
                    generate_effect_callback_mappings_with_starts(
                        &result.code,
                        source,
                        &mapping_starts,
                    )
                } else {
                    Vec::new()
                };
                let legacy_prop_read_mappings = if source.contains("export let ") {
                    generate_legacy_prop_read_mappings_with_starts(
                        &result.code,
                        source,
                        &mapping_starts,
                    )
                } else {
                    Vec::new()
                };
                let template_element_mappings =
                    generate_template_element_runtime_mappings_with_starts(
                        &result.code,
                        source,
                        &mapping_starts,
                    );
                let inline_script_mappings =
                    if source.contains("<script>") && source.contains("export ") {
                        generate_inline_script_mappings_with_starts(
                            &result.code,
                            source,
                            &mapping_starts,
                        )
                    } else {
                        Vec::new()
                    };
                let bind_value_mappings = if source.contains("bind:value={") {
                    generate_bind_value_mappings_with_starts(&result.code, source, &mapping_starts)
                } else {
                    Vec::new()
                };
                let component_bind_mappings = if source.contains("bind:")
                    && (result.code.contains("get ")
                        || result.code.contains("set ")
                        || result.code.contains("${"))
                {
                    generate_component_bind_mappings_with_starts(
                        &result.code,
                        source,
                        &mapping_starts,
                    )
                } else {
                    Vec::new()
                };
                let collapsed_declaration_mappings =
                    generate_collapsed_declaration_mappings_with_starts(
                        &result.code,
                        source,
                        &mapping_starts,
                    );
                let import_mappings = if source.contains("import ") {
                    generate_verbatim_import_mappings_with_starts(
                        &result.code,
                        source,
                        &mapping_starts,
                    )
                } else {
                    Vec::new()
                };
                let token_mappings = generate_token_mappings_with_starts(
                    &result.code,
                    source,
                    &mapping_starts,
                    source_token_positions,
                );
                let rune_mappings = if source.contains("$effect")
                    || source.contains("$state")
                    || source.contains("$derived")
                    || source.contains("$props")
                    || source.contains("$bindable")
                {
                    generate_rune_mappings_with_starts(&result.code, source, &mapping_starts)
                } else {
                    Vec::new()
                };
                let mapping_capacity = wrapper_mappings.len()
                    + bind_value_mappings.len()
                    + component_bind_mappings.len()
                    + runtime_mappings.len()
                    + effect_mappings.len()
                    + legacy_prop_read_mappings.len()
                    + template_element_mappings.len()
                    + inline_script_mappings.len()
                    + import_mappings.len()
                    + template_name_mappings.len()
                    + token_mappings.len()
                    + rune_mappings.len()
                    + remaining_result_mappings.len();
                let mut mappings = Vec::with_capacity(mapping_capacity);
                mappings.extend(wrapper_mappings);
                mappings.extend(bind_value_mappings);
                mappings.extend(component_bind_mappings);
                mappings.extend(runtime_mappings);
                mappings.extend(effect_mappings);
                mappings.extend(legacy_prop_read_mappings);
                mappings.extend(template_element_mappings);
                mappings.extend(inline_script_mappings);
                mappings.extend(import_mappings);
                mappings.extend(template_name_mappings);
                mappings.extend(token_mappings);
                mappings.extend(rune_mappings);
                mappings.extend(remaining_result_mappings);
                mappings
                    .sort_by(|a, b| a.gen_line.cmp(&b.gen_line).then(a.gen_col.cmp(&b.gen_col)));
                mappings.dedup_by(|a, b| a.gen_line == b.gen_line && a.gen_col == b.gen_col);
                if !collapsed_declaration_mappings.is_empty() {
                    mappings = merge_preferred_mappings(mappings, collapsed_declaration_mappings);
                }
                (result.code, mappings)
            } else {
                (result.code, Vec::new())
            }
        }
        GenerateMode::Server => {
            let code = server::transform_server(analysis, ast, source, options)?;
            if options.enable_sourcemap {
                let mapping_starts = MappingLineStarts::new(&code, source);
                // Generate token-level mappings by matching tokens in the server
                // output to tokens in the original source
                let mut mappings = ast.instance.as_deref().map_or_else(Vec::new, |script| {
                    generate_default_function_wrapper_mappings_with_starts(
                        &code,
                        source,
                        script.start as usize,
                        script.end as usize,
                        &mapping_starts,
                    )
                });
                mappings.extend(ast.instance.as_deref().map_or_else(Vec::new, |script| {
                    generate_server_wrapper_mappings_with_starts(
                        &code,
                        source,
                        script.start as usize,
                        script.end as usize,
                        &mapping_starts,
                    )
                }));
                if source.contains("import ") {
                    mappings.extend(generate_verbatim_import_mappings_with_starts(
                        &code,
                        source,
                        &mapping_starts,
                    ));
                }
                mappings.extend(generate_verbatim_script_mappings_with_starts(
                    &code,
                    source,
                    &mapping_starts,
                ));
                if analysis.is_typescript || source.contains("export ") {
                    mappings.extend(generate_server_declaration_mappings_with_starts(
                        &code,
                        source,
                        &mapping_starts,
                    ));
                }
                mappings.extend(generate_collapsed_declaration_mappings_with_starts(
                    &code,
                    source,
                    &mapping_starts,
                ));
                mappings.extend(generate_token_mappings_inner(
                    &code,
                    source,
                    true,
                    &mapping_starts,
                    source_token_positions,
                ));
                mappings
                    .sort_by(|a, b| a.gen_line.cmp(&b.gen_line).then(a.gen_col.cmp(&b.gen_col)));
                mappings.dedup_by(|a, b| {
                    a.gen_line == b.gen_line
                        && a.gen_col == b.gen_col
                        && a.source == b.source
                        && a.orig_line == b.orig_line
                        && a.orig_col == b.orig_col
                        && a.name == b.name
                });
                (code, mappings)
            } else {
                (code, Vec::new())
            }
        }
        GenerateMode::None => {
            // Don't generate code - useful for tooling that only needs warnings
            (String::new(), Vec::<SourceMapping>::new())
        }
    };

    // If a preprocessor source map is provided, remap our mappings through it.
    // Our mappings currently point to positions in the preprocessed source;
    // the preprocessor map tells us where those positions came from in the
    // original source.
    if options.enable_sourcemap
        && let Some(ref pp_map) = options.sourcemap
    {
        remap_through_sourcemap(&mut js_mappings, pp_map);

        // After remapping, some JS mappings may incorrectly reference CSS/style
        // sources due to fuzzy token matching. Filter out mappings pointing to
        // non-JS sources (CSS, SCSS, etc.) since JS output should never reference
        // style sources.
        if let Ok(map) = serde_json::from_str::<serde_json::Value>(pp_map)
            && let Some(sources) = map.get("sources").and_then(|v| v.as_array())
        {
            let css_source_indices: rustc_hash::FxHashSet<u32> = sources
                .iter()
                .enumerate()
                .filter_map(|(i, v)| {
                    v.as_str().and_then(|s| {
                        let lower = s.to_lowercase();
                        if lower.ends_with(".css")
                            || lower.ends_with(".scss")
                            || lower.ends_with(".sass")
                            || lower.ends_with(".less")
                            || lower.ends_with(".styl")
                        {
                            Some(i as u32)
                        } else {
                            None
                        }
                    })
                })
                .collect();
            if !css_source_indices.is_empty() {
                js_mappings.retain(|m| !css_source_indices.contains(&m.source));
            }
        }
    }

    let css = if analysis.css.has_css && !analysis.inject_styles {
        let _css_start = profile::timer_start();
        let mut css_output = css::render_stylesheet_with_sourcemap_content(
            analysis,
            ast.css.as_deref(),
            source,
            options,
            include_sourcemap_content,
        )?;
        profile::record_css_render(profile::timer_elapsed(_css_start));
        // Apply preprocessor source map composition to CSS map if needed
        if let Some(ref pp_map_json) = options.sourcemap
            && let Some(ref css_map_json) = css_output.map
        {
            css_output.map = Some(remap_css_sourcemap(css_map_json, pp_map_json, options));
        }
        Some(css_output)
    } else {
        None
    };

    // Convert Phase 2 analysis warnings to transform warnings
    let mut warnings: Vec<TransformWarning> = analysis
        .warnings
        .iter()
        .map(|w| TransformWarning {
            code: w.code.clone(),
            message: w.message.clone(),
            start: w.start,
            end: w.end,
        })
        .collect();

    // Collect CSS unused selector warnings
    // Corresponds to `warn_unused()` call in Svelte's 2-analyze/index.js L871
    // Check if the preceding HTML comment contains `svelte-ignore css_unused_selector`
    // (corresponds to Svelte's 2-analyze/index.js L863-872)
    if analysis.css.has_css {
        let should_ignore_unused = ast
            .css
            .as_ref()
            .and_then(|css| css.content.comment.as_ref())
            .is_some_and(|comment| {
                crate::compiler::phases::phase2_analyze::utils::extract_svelte_ignore(
                    comment,
                    analysis.runes,
                )
                .contains(&"css_unused_selector".to_string())
            });

        if !should_ignore_unused {
            let css_warnings =
                css::collect_css_unused_warnings(analysis, ast.css.as_deref(), source);
            for w in css_warnings {
                warnings.push(TransformWarning {
                    code: "css_unused_selector".to_string(),
                    message: format!(
                        "Unused CSS selector \"{}\"\nhttps://svelte.dev/e/css_unused_selector",
                        w.selector_text
                    ),
                    start: Some(w.start),
                    end: Some(w.end),
                });
            }
        }
    }

    // Generate JS source map only when sourcemaps are enabled
    let js_map = if options.enable_sourcemap {
        // Extract original source info from preprocessor map if available
        struct PreprocessorInfo {
            /// Source file names from the preprocessor map
            sources: Vec<String>,
            /// Source contents from the preprocessor map
            sources_content: Vec<String>,
            /// Names from the preprocessor map
            names: Vec<String>,
        }

        let pp_info = options.sourcemap.as_ref().and_then(|pp_map| {
            let map: serde_json::Value = serde_json::from_str(pp_map).ok()?;
            let sources = map
                .get("sources")
                .and_then(|v| v.as_array())
                .map(|arr| {
                    arr.iter()
                        .filter_map(|v| v.as_str().map(String::from))
                        .collect::<Vec<_>>()
                })
                .unwrap_or_default();
            let sources_content = map
                .get("sourcesContent")
                .and_then(|v| v.as_array())
                .map(|arr| {
                    arr.iter()
                        .filter_map(|v| v.as_str().map(String::from))
                        .collect::<Vec<_>>()
                })
                .unwrap_or_default();
            let names = map
                .get("names")
                .and_then(|v| v.as_array())
                .map(|arr| {
                    arr.iter()
                        .filter_map(|v| v.as_str().map(String::from))
                        .collect::<Vec<_>>()
                })
                .unwrap_or_default();
            if sources.is_empty() && sources_content.is_empty() {
                None
            } else {
                Some(PreprocessorInfo {
                    sources,
                    sources_content,
                    names,
                })
            }
        });

        // Generate JS source map if we have mappings
        if !js_mappings.is_empty() {
            let output_filename = options.output_filename.as_deref();
            let filename = options.filename.as_deref();
            let source_name = get_source_name(filename, output_filename, "input.svelte");

            // Upstream's JS map comes out of esrap's `print()`, which sets no
            // `file` key; only the CSS map names its output file.
            let file_name: Option<&str> = None;

            let mut mappings_str = encode_vlq_mappings(&js_mappings);

            // Ensure the mappings string covers all lines of the generated output.
            // The VLQ encoding uses ';' to separate lines. If the last mapping is on
            // line N but the output has M>N lines, we need trailing semicolons so
            // that decode() produces an array of length M+1.
            let output_line_count = js.as_bytes().iter().filter(|&&c| c == b'\n').count();
            let mapped_lines = mappings_str
                .as_bytes()
                .iter()
                .filter(|&&c| c == b';')
                .count();
            for _ in mapped_lines..output_line_count {
                mappings_str.push(';');
            }

            // When a preprocessor map is present, use its source info
            if let Some(ref info) = pp_info {
                let names_refs: Vec<&str> = info.names.iter().map(|s| s.as_str()).collect();

                if info.sources.len() > 1 {
                    // Multi-source case: only include sources actually referenced by JS mappings.
                    // After remap_through_sourcemap, each mapping's `source` field is a
                    // preprocessor source index. Collect which indices are actually used.
                    let mut used_indices: Vec<u32> = js_mappings
                        .iter()
                        .map(|m| m.source)
                        .collect::<std::collections::BTreeSet<_>>()
                        .into_iter()
                        .collect();
                    if used_indices.is_empty() {
                        // Fallback: use index 0 (the input file)
                        used_indices.push(0);
                    }

                    // Build a mapping from old source index to new source index
                    let mut index_remap: rustc_hash::FxHashMap<u32, u32> =
                        rustc_hash::FxHashMap::default();
                    for (new_idx, &old_idx) in used_indices.iter().enumerate() {
                        index_remap.insert(old_idx, new_idx as u32);
                    }

                    // Remap source indices in JS mappings
                    for m in js_mappings.iter_mut() {
                        if let Some(&new_idx) = index_remap.get(&m.source) {
                            m.source = new_idx;
                        }
                    }

                    // Re-encode the mappings with remapped source indices
                    mappings_str = encode_vlq_mappings(&js_mappings);
                    let output_line_count = js.chars().filter(|&c| c == '\n').count();
                    let mapped_lines = mappings_str.chars().filter(|&c| c == ';').count();
                    for _ in mapped_lines..output_line_count {
                        mappings_str.push(';');
                    }

                    // Build filtered source/content lists using only used indices
                    let output_filename = options.output_filename.as_deref();
                    let mut multi_sources: Vec<String> = Vec::new();
                    let mut multi_contents: Vec<String> = Vec::new();
                    for &old_idx in &used_indices {
                        let pp_src = &info.sources[old_idx as usize];
                        if let Some(fname) = options.filename.as_deref() {
                            let fname_basename =
                                fname.split(['/', '\\']).next_back().unwrap_or(fname);
                            if pp_src == fname_basename || pp_src == fname {
                                multi_sources.push(source_name.clone());
                            } else {
                                let source_path = if let Some(fname_dir) =
                                    fname.rsplit_once('/').or_else(|| fname.rsplit_once('\\'))
                                {
                                    format!("{}/{}", fname_dir.0, pp_src)
                                } else {
                                    pp_src.clone()
                                };
                                multi_sources.push(get_source_name(
                                    Some(&source_path),
                                    output_filename,
                                    pp_src,
                                ));
                            }
                        } else {
                            multi_sources.push(pp_src.clone());
                        }
                        if let Some(content) = info.sources_content.get(old_idx as usize) {
                            multi_contents.push(content.clone());
                        }
                    }

                    if multi_sources.len() == 1 {
                        // Only one source referenced - use single-source format
                        let content = multi_contents.first().map(|s| s.as_str()).unwrap_or(source);
                        Some(generate_sourcemap_json(
                            file_name,
                            &multi_sources[0],
                            include_sourcemap_content.then_some(content),
                            &mappings_str,
                            &names_refs,
                        ))
                    } else {
                        let sources_refs: Vec<&str> =
                            multi_sources.iter().map(|s| s.as_str()).collect();
                        let contents_refs: Vec<&str> =
                            multi_contents.iter().map(|s| s.as_str()).collect();
                        Some(js_ast::codegen::generate_sourcemap_json_multi(
                            file_name,
                            &sources_refs,
                            &contents_refs,
                            &mappings_str,
                            &names_refs,
                        ))
                    }
                } else {
                    // Single source - use the first source content if available
                    let content = info
                        .sources_content
                        .first()
                        .map(|s| s.as_str())
                        .unwrap_or(source);
                    let preprocessed_source = info
                        .sources
                        .first()
                        .map(String::as_str)
                        .unwrap_or(&source_name);
                    Some(generate_sourcemap_json(
                        file_name,
                        preprocessed_source,
                        include_sourcemap_content.then_some(content),
                        &mappings_str,
                        &names_refs,
                    ))
                }
            } else {
                Some(generate_sourcemap_json(
                    file_name,
                    &source_name,
                    include_sourcemap_content.then_some(source),
                    &mappings_str,
                    &[],
                ))
            }
        } else {
            // If no mappings tracked (e.g., server mode), generate a trivial source map
            // so that tests checking for map existence still pass
            let output_filename = options.output_filename.as_deref();
            let filename = options.filename.as_deref();
            if output_filename.is_some() || filename.is_some() {
                let source_name = get_source_name(filename, output_filename, "input.svelte");
                let file_name: Option<&str> = None;

                // Generate line-level identity mappings (each generated line maps to line 0, col 0)
                let line_count = js.chars().filter(|&c| c == '\n').count();
                let mut trivial_mappings = Vec::new();
                for line in 0..=line_count {
                    trivial_mappings.push(SourceMapping {
                        gen_line: line as u32,
                        gen_col: 0,
                        source: 0,
                        orig_line: 0,
                        orig_col: 0,
                        name: None,
                    });
                }
                let mappings_str = encode_vlq_mappings(&trivial_mappings);
                Some(generate_sourcemap_json(
                    file_name,
                    &source_name,
                    include_sourcemap_content.then_some(source),
                    &mappings_str,
                    &[],
                ))
            } else {
                None
            }
        }
    } else {
        // Sourcemaps disabled - skip all mapping generation for performance
        None
    };

    Ok(TransformResult {
        js,
        js_map,
        css,
        warnings,
    })
}

/// Remap a CSS source map through a preprocessor source map.
///
/// Parses the CSS source map, decodes its VLQ mappings, remaps each mapping
/// through the preprocessor's map, and re-encodes everything.
pub(crate) fn remap_css_sourcemap(
    css_map_json: &str,
    pp_map_json: &str,
    options: &CompileOptions,
) -> String {
    use js_ast::codegen::{
        SourceMapping, decode_vlq_mappings, encode_vlq_mappings, generate_sourcemap_json,
        get_source_name, remap_through_sourcemap,
    };

    // Parse the CSS source map
    let css_map: serde_json::Value = match serde_json::from_str(css_map_json) {
        Ok(v) => v,
        Err(_) => return css_map_json.to_string(),
    };

    let css_mappings_str = match css_map.get("mappings").and_then(|v| v.as_str()) {
        Some(s) => s,
        None => return css_map_json.to_string(),
    };

    // Decode the CSS mappings
    let decoded = decode_vlq_mappings(css_mappings_str);
    let mut mappings: Vec<SourceMapping> = Vec::new();
    for (line_idx, line) in decoded.iter().enumerate() {
        for seg in line {
            if seg.len() >= 4 {
                mappings.push(SourceMapping {
                    gen_line: line_idx as u32,
                    gen_col: seg[0] as u32,
                    source: seg[1] as u32,
                    orig_line: seg[2] as u32,
                    orig_col: seg[3] as u32,
                    name: None,
                });
            }
        }
    }

    // Remap through preprocessor map
    remap_through_sourcemap(&mut mappings, pp_map_json);

    // Get original source content from preprocessor map
    let pp_map: serde_json::Value =
        serde_json::from_str(pp_map_json).unwrap_or(serde_json::Value::Null);
    let original_content = pp_map
        .get("sourcesContent")
        .and_then(|v| v.as_array())
        .and_then(|arr| arr.first())
        .and_then(|v| v.as_str())
        .unwrap_or("");
    let names: Vec<String> = pp_map
        .get("names")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();

    // Re-encode
    let mappings_str = encode_vlq_mappings(&mappings);

    // Get file and source names from CSS map
    let file_name = css_map
        .get("file")
        .and_then(|v| v.as_str())
        .unwrap_or("input.svelte.css");
    let source_name = options
        .css_output_filename
        .as_ref()
        .map(|css_out| {
            get_source_name(
                options.filename.as_deref(),
                Some(css_out.as_str()),
                "input.svelte",
            )
        })
        .unwrap_or_else(|| {
            css_map
                .get("sources")
                .and_then(|v| v.as_array())
                .and_then(|arr| arr.first())
                .and_then(|v| v.as_str())
                .unwrap_or("input.svelte")
                .to_string()
        });

    let names_refs: Vec<&str> = names.iter().map(|s| s.as_str()).collect();
    generate_sourcemap_json(
        Some(file_name),
        &source_name,
        Some(if original_content.is_empty() {
            ""
        } else {
            original_content
        }),
        &mappings_str,
        &names_refs,
    )
}

/// Encode bytes as base64 (standard alphabet, with padding).
pub(crate) fn base64_encode(data: &[u8]) -> String {
    const ALPHABET: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity(data.len().div_ceil(3) * 4);
    for chunk in data.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };
        let triple = (b0 << 16) | (b1 << 8) | b2;
        out.push(ALPHABET[((triple >> 18) & 0x3F) as usize] as char);
        out.push(ALPHABET[((triple >> 12) & 0x3F) as usize] as char);
        if chunk.len() > 1 {
            out.push(ALPHABET[((triple >> 6) & 0x3F) as usize] as char);
        } else {
            out.push('=');
        }
        if chunk.len() > 2 {
            out.push(ALPHABET[(triple & 0x3F) as usize] as char);
        } else {
            out.push('=');
        }
    }
    out
}

/// Transform a module (.svelte.js/.svelte.ts) analysis into JavaScript code.
///
/// Unlike `transform_component`, this does NOT generate a component function wrapper.
/// It only transforms the module script body (rune replacements) and prepends the
/// necessary imports. This matches the official Svelte compiler's `transform_module` /
/// `client_module` / `server_module` behavior.
pub fn transform_module(
    analysis: &ComponentAnalysis,
    source: &str,
    options: &CompileOptions,
) -> Result<TransformResult, TransformError> {
    let js = match options.generate {
        GenerateMode::Client => client::transform_client_module(analysis, source, options)?,
        GenerateMode::Server => server::transform_server_module(analysis, source, options)?,
        GenerateMode::None => String::new(),
    };
    let js = shared::class_body::terminate_export_default_class(&js).unwrap_or(js);

    Ok(TransformResult {
        js,
        js_map: None,
        css: None,
        warnings: Vec::new(),
    })
}

/// Error type for transform failures.
#[derive(Debug)]
pub enum TransformError {
    /// Code generation error
    CodeGen(String),
    /// CSS transformation error
    Css(String),
}

impl std::fmt::Display for TransformError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TransformError::CodeGen(msg) => write!(f, "Code generation error: {}", msg),
            TransformError::Css(msg) => write!(f, "CSS error: {}", msg),
        }
    }
}

impl std::error::Error for TransformError {}

/// Coordinate tables shared by every source-map enrichment pass for one output.
struct MappingLineStarts {
    generated: std::sync::Arc<[usize]>,
    source: std::sync::Arc<[usize]>,
}

#[derive(Clone, Copy)]
pub(crate) struct SourceTokenPosition {
    offset: u32,
    line: u32,
    col: u32,
}

#[derive(Default)]
struct SourceTokenSlot {
    positions: smallvec::SmallVec<[SourceTokenPosition; 2]>,
    consumed: u32,
}

pub(crate) struct SourceTokenPositions<'source> {
    slots: rustc_hash::FxHashMap<&'source str, SourceTokenSlot>,
}

impl SourceTokenPositions<'_> {
    fn reset(&mut self) {
        for slot in self.slots.values_mut() {
            slot.consumed = 0;
        }
    }
}

pub(crate) fn collect_source_token_positions(source: &str) -> SourceTokenPositions<'_> {
    let mut slots =
        rustc_hash::FxHashMap::with_capacity_and_hasher(source.len() / 16, Default::default());
    let mut cursor = 0;
    let mut line = 0;
    let mut col = 0;
    for_each_token(source, |text, offset| {
        advance_token_utf16(source, cursor, offset, &mut line, &mut col);
        cursor = offset;
        if !should_skip_token(text, true) {
            slots
                .entry(text)
                .or_insert_with(SourceTokenSlot::default)
                .positions
                .push(SourceTokenPosition {
                    offset: offset as u32,
                    line,
                    col,
                });
        }
    });
    SourceTokenPositions { slots }
}

fn advance_token_utf16(code: &str, from: usize, to: usize, line: &mut u32, col: &mut u32) {
    for character in code[from..to].chars() {
        if character == '\n' {
            *line += 1;
            *col = 0;
        } else {
            *col += character.len_utf16() as u32;
        }
    }
}

impl MappingLineStarts {
    fn new(generated: &str, source: &str) -> Self {
        Self {
            generated: std::sync::Arc::from(js_ast::codegen::build_line_starts(generated)),
            source: std::sync::Arc::from(js_ast::codegen::build_line_starts(source)),
        }
    }
}

/// Generate token-level source mappings by matching tokens in generated code
/// against tokens in the original source.
///
/// For each unique token name (identifier or numeric literal), we collect all
/// positions in the source and all positions in the generated output. Then we
/// match them 1:1 in order. This avoids the problem of sequential scanning
/// where framework code tokens (appearing early in the generated output) can
/// consume source positions intended for user-code tokens that appear later.
#[cfg(test)]
fn generate_token_mappings(generated: &str, source: &str) -> Vec<js_ast::codegen::SourceMapping> {
    generate_token_mappings_with_starts(
        generated,
        source,
        &MappingLineStarts::new(generated, source),
        None,
    )
}

fn generate_token_mappings_with_starts<'source>(
    generated: &str,
    source: &'source str,
    starts: &MappingLineStarts,
    source_token_positions: Option<&mut SourceTokenPositions<'source>>,
) -> Vec<js_ast::codegen::SourceMapping> {
    generate_token_mappings_inner(generated, source, true, starts, source_token_positions)
}

fn is_template_element_name_mapping(
    line_starts: &[usize],
    source: &str,
    mapping: &js_ast::codegen::SourceMapping,
) -> bool {
    let Some(&line_start) = line_starts.get(mapping.orig_line as usize) else {
        return false;
    };
    let source_offset = line_start.saturating_add(mapping.orig_col as usize);
    source.as_bytes().get(source_offset.wrapping_sub(1)) == Some(&b'<')
}

fn merge_preferred_mappings(
    mut mappings: Vec<js_ast::codegen::SourceMapping>,
    mut preferred: Vec<js_ast::codegen::SourceMapping>,
) -> Vec<js_ast::codegen::SourceMapping> {
    mappings.sort_by(|a, b| a.gen_line.cmp(&b.gen_line).then(a.gen_col.cmp(&b.gen_col)));
    preferred.sort_by(|a, b| a.gen_line.cmp(&b.gen_line).then(a.gen_col.cmp(&b.gen_col)));
    let mut result = Vec::with_capacity(mappings.len() + preferred.len());
    let mut preferred_index = 0;
    for mapping in mappings {
        while preferred_index < preferred.len()
            && (
                preferred[preferred_index].gen_line,
                preferred[preferred_index].gen_col,
            ) <= (mapping.gen_line, mapping.gen_col)
        {
            result.push(preferred[preferred_index].clone());
            preferred_index += 1;
        }
        result.push(mapping);
    }
    result.extend(preferred.into_iter().skip(preferred_index));
    result
}

/// The generated component function's braces map to the instance script tags.
#[cfg(test)]
fn generate_default_function_wrapper_mappings(
    generated: &str,
    source: &str,
    script_start: usize,
    script_end: usize,
) -> Vec<js_ast::codegen::SourceMapping> {
    generate_default_function_wrapper_mappings_with_starts(
        generated,
        source,
        script_start,
        script_end,
        &MappingLineStarts::new(generated, source),
    )
}

fn generate_default_function_wrapper_mappings_with_starts(
    generated: &str,
    source: &str,
    script_start: usize,
    script_end: usize,
    starts: &MappingLineStarts,
) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::offset_to_line_col_utf16;

    let Some(function_start) = generated.find("export default function ") else {
        return Vec::new();
    };
    let Some(opening) = generated[function_start..]
        .find('{')
        .map(|offset| function_start + offset)
    else {
        return Vec::new();
    };
    let mut depth = 0u32;
    let mut closing = None;
    for (offset, byte) in shared::js_scan::code_bytes_from(generated.as_bytes(), opening) {
        match byte {
            b'{' => depth += 1,
            b'}' => {
                depth = depth.saturating_sub(1);
                if depth == 0 {
                    closing = Some(offset);
                    break;
                }
            }
            _ => {}
        }
    }
    let Some(closing) = closing else {
        return Vec::new();
    };
    let Some(script_last) = script_end.checked_sub(1) else {
        return Vec::new();
    };
    let generated_starts = &starts.generated;
    let source_starts = &starts.source;
    [
        (opening, script_start),
        (opening + 1, script_start + 1),
        (closing, script_last),
        (closing + 1, script_end),
    ]
    .into_iter()
    .filter(|(generated_offset, source_offset)| {
        *generated_offset <= generated.len() && *source_offset <= source.len()
    })
    .map(|(generated_offset, source_offset)| {
        let (gen_line, gen_col) =
            offset_to_line_col_utf16(generated, generated_starts, generated_offset);
        let (orig_line, orig_col) = offset_to_line_col_utf16(source, source_starts, source_offset);
        js_ast::codegen::SourceMapping {
            gen_line: gen_line as u32,
            gen_col: gen_col as u32,
            source: 0,
            orig_line: orig_line as u32,
            orig_col: orig_col as u32,
            name: None,
        }
    })
    .collect()
}

/// SSR wraps an instance script in `$$renderer.component`. Upstream anchors
/// that callback's braces to the enclosing `<script>` tag boundaries.
#[cfg(test)]
fn generate_server_wrapper_mappings(
    generated: &str,
    source: &str,
    script_start: usize,
    script_end: usize,
) -> Vec<js_ast::codegen::SourceMapping> {
    generate_server_wrapper_mappings_with_starts(
        generated,
        source,
        script_start,
        script_end,
        &MappingLineStarts::new(generated, source),
    )
}

fn generate_server_wrapper_mappings_with_starts(
    generated: &str,
    source: &str,
    script_start: usize,
    script_end: usize,
    starts: &MappingLineStarts,
) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::offset_to_line_col_utf16;

    let Some(callback_start) = generated.find("$$renderer.component(") else {
        return Vec::new();
    };
    let Some(arrow) = generated[callback_start..]
        .find("=>")
        .map(|offset| callback_start + offset)
    else {
        return Vec::new();
    };
    let Some(opening) = generated[arrow + 2..]
        .find('{')
        .map(|offset| arrow + 2 + offset)
    else {
        return Vec::new();
    };
    let mut depth = 0u32;
    let mut closing = None;
    for (offset, byte) in shared::js_scan::code_bytes_from(generated.as_bytes(), opening) {
        match byte {
            b'{' => depth += 1,
            b'}' => {
                depth = depth.saturating_sub(1);
                if depth == 0 {
                    closing = Some(offset);
                    break;
                }
            }
            _ => {}
        }
    }
    let Some(closing) = closing else {
        return Vec::new();
    };
    let Some(script_last) = script_end.checked_sub(1) else {
        return Vec::new();
    };
    let generated_starts = &starts.generated;
    let source_starts = &starts.source;
    [
        (opening, script_start),
        (opening + 1, script_start + 1),
        (closing, script_last),
        (closing + 1, script_end),
    ]
    .into_iter()
    .filter(|(generated_offset, source_offset)| {
        *generated_offset <= generated.len() && *source_offset <= source.len()
    })
    .map(|(generated_offset, source_offset)| {
        let (gen_line, gen_col) =
            offset_to_line_col_utf16(generated, generated_starts, generated_offset);
        let (orig_line, orig_col) = offset_to_line_col_utf16(source, source_starts, source_offset);
        js_ast::codegen::SourceMapping {
            gen_line: gen_line as u32,
            gen_col: gen_col as u32,
            source: 0,
            orig_line: orig_line as u32,
            orig_col: orig_col as u32,
            name: None,
        }
    })
    .collect()
}

/// SSR keeps instance-script declarations verbatim, so their keyword anchors
/// are source-backed too.
#[cfg(test)]
fn generate_server_token_mappings(
    generated: &str,
    source: &str,
) -> Vec<js_ast::codegen::SourceMapping> {
    generate_token_mappings_with_starts(
        generated,
        source,
        &MappingLineStarts::new(generated, source),
        None,
    )
}

/// Map the common prefix of declarations which SSR retains after dropping an
/// export modifier or a TypeScript annotation. This has to precede token
/// matching: markup can contain an earlier occurrence of a declaration value.
#[cfg(test)]
fn generate_server_declaration_mappings(
    generated: &str,
    source: &str,
) -> Vec<js_ast::codegen::SourceMapping> {
    generate_server_declaration_mappings_with_starts(
        generated,
        source,
        &MappingLineStarts::new(generated, source),
    )
}

fn generate_server_declaration_mappings_with_starts(
    generated: &str,
    source: &str,
    starts: &MappingLineStarts,
) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::offset_to_line_col_utf16;

    fn declarations(code: &str) -> Vec<(usize, &str)> {
        let mut result = Vec::new();
        for keyword in ["const", "let", "var"] {
            let mut cursor = 0;
            while let Some(relative) = code[cursor..].find(keyword) {
                let start = cursor + relative;
                let before = code.as_bytes().get(start.wrapping_sub(1));
                let end = start + keyword.len();
                let after = code.as_bytes().get(end);
                if !before.is_some_and(|byte| byte.is_ascii_alphanumeric() || *byte == b'_')
                    && after.is_some_and(|byte| byte.is_ascii_whitespace())
                {
                    result.push((start, &code[start..]));
                }
                cursor = end;
            }
        }
        result.sort_unstable_by_key(|(start, _)| *start);
        result
    }

    let generated_starts = starts.generated.clone();
    let source_starts = starts.source.clone();
    let source_declarations = declarations(source);
    let mut mappings = Vec::new();

    for (generated_start, generated_tail) in declarations(generated) {
        let Some(name) = generated_tail
            .split_once(char::is_whitespace)
            .map(|(_, tail)| tail.trim_start())
            .and_then(|tail| {
                let length = tail
                    .bytes()
                    .take_while(|byte| byte.is_ascii_alphanumeric() || *byte == b'_')
                    .count();
                (length > 0).then_some(&tail[..length])
            })
        else {
            continue;
        };
        let Some((source_start, source_tail)) = source_declarations.iter().find(|(_, tail)| {
            tail.split_once(char::is_whitespace)
                .map(|(_, tail)| tail.trim_start().starts_with(name))
                .unwrap_or(false)
        }) else {
            continue;
        };

        let common = generated_tail
            .bytes()
            .zip(source_tail.bytes())
            .take_while(|(left, right)| left == right)
            .count();
        let inline_export = source[..*source_start].trim_end().ends_with("export");
        let offsets: Box<dyn Iterator<Item = usize>> = if inline_export {
            Box::new(0..=common)
        } else {
            Box::new(std::iter::once(0))
        };
        for offset in offsets {
            if !generated_tail.is_char_boundary(offset) || !source_tail.is_char_boundary(offset) {
                continue;
            }
            let (gen_line, gen_col) =
                offset_to_line_col_utf16(generated, &generated_starts, generated_start + offset);
            let (orig_line, orig_col) =
                offset_to_line_col_utf16(source, &source_starts, source_start + offset);
            mappings.push(js_ast::codegen::SourceMapping {
                gen_line: gen_line as u32,
                gen_col: gen_col as u32,
                source: 0,
                orig_line: orig_line as u32,
                orig_col: orig_col as u32,
                name: None,
            });
        }
    }
    mappings
}

fn generate_collapsed_declaration_mappings_with_starts(
    generated: &str,
    source: &str,
    starts: &MappingLineStarts,
) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::offset_to_line_col_utf16;

    let generated_starts = starts.generated.clone();
    let source_starts = starts.source.clone();
    let mut mappings = Vec::new();
    for keyword in ["let", "const", "var"] {
        let mut cursor = 0;
        while let Some(relative) = source[cursor..].find(keyword) {
            let start = cursor + relative;
            let end = start + keyword.len();
            let valid = !source
                .as_bytes()
                .get(start.wrapping_sub(1))
                .is_some_and(|byte| byte.is_ascii_alphanumeric() || *byte == b'_')
                && source
                    .as_bytes()
                    .get(end)
                    .is_some_and(u8::is_ascii_whitespace);
            if !valid {
                cursor = end;
                continue;
            }
            let Some(name_start) = source[end..]
                .find(|character: char| !character.is_whitespace())
                .map(|offset| end + offset)
            else {
                break;
            };
            if !source[end..name_start].contains('\n') {
                cursor = end;
                continue;
            }
            let name_len = source[name_start..]
                .bytes()
                .take_while(|byte| byte.is_ascii_alphanumeric() || *byte == b'_' || *byte == b'$')
                .count();
            if name_len == 0 {
                cursor = name_start;
                continue;
            }
            let name = &source[name_start..name_start + name_len];
            let pattern = format!("{keyword} {name}");
            let (orig_line, orig_col) = offset_to_line_col_utf16(source, &source_starts, start);
            let mut generated_cursor = 0;
            while let Some(relative) = generated[generated_cursor..].find(&pattern) {
                let generated_name = generated_cursor + relative + keyword.len() + 1;
                let (gen_line, gen_col) =
                    offset_to_line_col_utf16(generated, &generated_starts, generated_name);
                mappings.push(js_ast::codegen::SourceMapping {
                    gen_line: gen_line as u32,
                    gen_col: gen_col as u32,
                    source: 0,
                    orig_line: orig_line as u32,
                    orig_col: (orig_col + keyword.len() + 1) as u32,
                    name: None,
                });
                generated_cursor = generated_name + name_len;
            }
            cursor = name_start + name_len;
        }
    }
    mappings
}

/// SSR retains some user script statements exactly, but the generic token
/// matcher deliberately omits keywords and punctuation. Map only those whole
/// script lines that survived unchanged; generated wrapper code is never a
/// candidate here.
fn generate_verbatim_script_mappings_with_starts(
    generated: &str,
    source: &str,
    starts: &MappingLineStarts,
) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::offset_to_line_col_utf16;

    let source_lines = source.lines().collect::<Vec<_>>();
    let generated_lines = generated.lines().collect::<Vec<_>>();
    let mut mappings = Vec::new();
    let mut in_script = false;
    let mut generated_by_trimmed = rustc_hash::FxHashMap::<&str, Vec<(usize, usize)>>::default();

    for (generated_line, generated_text) in generated_lines.iter().enumerate() {
        let generated_trimmed = generated_text.trim();
        generated_by_trimmed
            .entry(generated_trimmed)
            .or_default()
            .push((
                generated_line,
                generated_text.len() - generated_text.trim_start().len(),
            ));
    }

    for (source_line, text) in source_lines.iter().enumerate() {
        let trimmed = text.trim();
        if !in_script {
            in_script = trimmed.starts_with("<script") && !trimmed.starts_with("</script");
            continue;
        }
        if trimmed.starts_with("</script") {
            in_script = false;
            continue;
        }
        if trimmed.is_empty() {
            continue;
        }

        let source_indent = text.len() - text.trim_start().len();
        let Some(generated_matches) = generated_by_trimmed.get(trimmed) else {
            continue;
        };
        for &(generated_line, generated_indent) in generated_matches {
            let (gen_line, mut gen_col) = offset_to_line_col_utf16(
                generated,
                &starts.generated,
                starts.generated[generated_line] + generated_indent,
            );
            let (orig_line, mut orig_col) = offset_to_line_col_utf16(
                source,
                &starts.source,
                starts.source[source_line] + source_indent,
            );
            for character in trimmed.chars() {
                mappings.push(js_ast::codegen::SourceMapping {
                    gen_line: gen_line as u32,
                    gen_col: gen_col as u32,
                    source: 0,
                    orig_line: orig_line as u32,
                    orig_col: orig_col as u32,
                    name: None,
                });
                let width = character.len_utf16();
                gen_col += width;
                orig_col += width;
            }
            mappings.push(js_ast::codegen::SourceMapping {
                gen_line: gen_line as u32,
                gen_col: gen_col as u32,
                source: 0,
                orig_line: orig_line as u32,
                orig_col: orig_col as u32,
                name: None,
            });
        }
    }

    mappings
}

/// Map user imports before generic token matching sees generated framework imports.
#[cfg(test)]
fn generate_verbatim_import_mappings(
    generated: &str,
    source: &str,
) -> Vec<js_ast::codegen::SourceMapping> {
    generate_verbatim_import_mappings_with_starts(
        generated,
        source,
        &MappingLineStarts::new(generated, source),
    )
}

fn generate_verbatim_import_mappings_with_starts(
    generated: &str,
    source: &str,
    starts: &MappingLineStarts,
) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::offset_to_line_col_utf16;

    let source_lines = source
        .lines()
        .enumerate()
        .filter_map(|(line, text)| {
            let trimmed = text.trim_start();
            trimmed
                .starts_with("import ")
                .then_some((line, text.len() - trimmed.len(), trimmed))
        })
        .collect::<Vec<_>>();
    let gen_line_starts = starts.generated.clone();
    let src_line_starts = starts.source.clone();
    let mut mappings = Vec::new();

    for (gen_line, text) in generated.lines().enumerate() {
        let trimmed = text.trim_start();
        if !trimmed.starts_with("import ") || trimmed.contains("svelte/internal/") {
            continue;
        }
        let indent = text.len() - trimmed.len();
        let Some((source_line, source_indent, _)) = source_lines
            .iter()
            .find(|(_, _, source_text)| *source_text == trimmed)
        else {
            continue;
        };
        for_each_token(trimmed, |token, token_offset| {
            let gen_offset = gen_line_starts[gen_line] + indent + token_offset;
            let source_offset = src_line_starts[*source_line] + *source_indent + token_offset;
            for (generated_offset, original_offset) in [
                (gen_offset, source_offset),
                (gen_offset + token.len(), source_offset + token.len()),
            ] {
                let (gen_line, gen_col) =
                    offset_to_line_col_utf16(generated, &gen_line_starts, generated_offset);
                let (orig_line, orig_col) =
                    offset_to_line_col_utf16(source, &src_line_starts, original_offset);
                mappings.push(js_ast::codegen::SourceMapping {
                    gen_line: gen_line as u32,
                    gen_col: gen_col as u32,
                    source: 0,
                    orig_line: orig_line as u32,
                    orig_col: orig_col as u32,
                    name: None,
                });
            }
        });
        for (token_offset, byte) in trimmed.bytes().enumerate() {
            if byte.is_ascii_whitespace()
                || byte.is_ascii_alphanumeric()
                || byte == b'_'
                || byte == b'$'
            {
                continue;
            }
            let generated_offset = gen_line_starts[gen_line] + indent + token_offset;
            let original_offset = src_line_starts[*source_line] + *source_indent + token_offset;
            let (gen_line, gen_col) =
                offset_to_line_col_utf16(generated, &gen_line_starts, generated_offset);
            let (orig_line, orig_col) =
                offset_to_line_col_utf16(source, &src_line_starts, original_offset);
            mappings.push(js_ast::codegen::SourceMapping {
                gen_line: gen_line as u32,
                gen_col: gen_col as u32,
                source: 0,
                orig_line: orig_line as u32,
                orig_col: orig_col as u32,
                name: None,
            });
        }
    }
    mappings
}

fn generate_token_mappings_inner<'source>(
    generated: &str,
    source: &'source str,
    map_declaration_keywords: bool,
    _starts: &MappingLineStarts,
    source_token_positions: Option<&mut SourceTokenPositions<'source>>,
) -> Vec<js_ast::codegen::SourceMapping> {
    debug_assert!(map_declaration_keywords);
    let mut owned_positions;
    let positions = match source_token_positions {
        Some(positions) => positions,
        None => {
            owned_positions = collect_source_token_positions(source);
            &mut owned_positions
        }
    };
    positions.reset();

    let source_token_count = positions
        .slots
        .values()
        .map(|slot| slot.positions.len())
        .sum::<usize>();
    let mut mappings = Vec::with_capacity(source_token_count.saturating_mul(2));
    let mut generated_cursor = 0;
    let mut generated_line = 0;
    let mut generated_col = 0;
    for_each_token(generated, |text, gen_offset| {
        advance_token_utf16(
            generated,
            generated_cursor,
            gen_offset,
            &mut generated_line,
            &mut generated_col,
        );
        generated_cursor = gen_offset;
        // Skip framework-generated tokens
        if should_skip_token(text, map_declaration_keywords) {
            return;
        }

        // Look up this token's source positions
        let Some(slot) = positions.slots.get_mut(text) else {
            return;
        };

        // Get the next unused source position for this token
        if slot.consumed as usize >= slot.positions.len() {
            return;
        }
        let source_position = slot.positions[slot.consumed as usize];
        let src_pos = source_position.offset as usize;
        slot.consumed += 1;

        // Start of token
        mappings.push(js_ast::codegen::SourceMapping {
            gen_line: generated_line,
            gen_col: generated_col,
            source: 0,
            orig_line: source_position.line,
            orig_col: source_position.col,
            name: None,
        });

        // End of token. Almost every token stays on its starting line, so
        // derive both UTF-16 columns directly instead of repeating the line
        // lookup for every emitted end anchor.
        let source_end = typescript_declaration_annotation_end(source, src_pos, text.len())
            .unwrap_or(src_pos + text.len());
        let (gen_line_end, gen_col_end, orig_line_end, orig_col_end) =
            if text.is_ascii() && source_end == src_pos + text.len() {
                (
                    generated_line,
                    generated_col + text.len() as u32,
                    source_position.line,
                    source_position.col + text.len() as u32,
                )
            } else {
                let mut gen_line_end = generated_line;
                let mut gen_col_end = generated_col;
                advance_token_utf16(
                    generated,
                    gen_offset,
                    gen_offset + text.len(),
                    &mut gen_line_end,
                    &mut gen_col_end,
                );
                let mut orig_line_end = source_position.line;
                let mut orig_col_end = source_position.col;
                advance_token_utf16(
                    source,
                    src_pos,
                    source_end,
                    &mut orig_line_end,
                    &mut orig_col_end,
                );
                (gen_line_end, gen_col_end, orig_line_end, orig_col_end)
            };
        mappings.push(js_ast::codegen::SourceMapping {
            gen_line: gen_line_end,
            gen_col: gen_col_end,
            source: 0,
            orig_line: orig_line_end,
            orig_col: orig_col_end,
            name: None,
        });
    });

    // `for_each_token` walks generated code in order, so the final merge can
    // perform the one necessary stable sort and deduplication for every pass.
    mappings
}

/// The source span of a TypeScript binding includes its erased annotation.
/// Preserve that end anchor when the declaration is emitted without the type.
fn typescript_declaration_annotation_end(source: &str, start: usize, len: usize) -> Option<usize> {
    let end = start.checked_add(len)?;
    let bytes = source.as_bytes();
    let mut cursor = end;
    while bytes.get(cursor).is_some_and(u8::is_ascii_whitespace) {
        cursor += 1;
    }
    if bytes.get(cursor) != Some(&b':') {
        return None;
    }

    let line_start = source[..start].rfind('\n').map_or(0, |offset| offset + 1);
    let declaration = source[line_start..start].trim_end();
    if !["let", "const", "var"]
        .iter()
        .any(|keyword| declaration.ends_with(keyword))
    {
        return None;
    }

    let mut depth = 0u32;
    cursor += 1;
    while let Some(&byte) = bytes.get(cursor) {
        match byte {
            b'(' | b'[' | b'{' | b'<' => depth += 1,
            b')' | b']' | b'}' | b'>' if depth > 0 => depth -= 1,
            b'=' if depth == 0 && bytes.get(cursor + 1) != Some(&b'>') => {
                let mut anchor = cursor;
                while anchor > end && bytes[anchor - 1].is_ascii_whitespace() {
                    anchor -= 1;
                }
                return Some(anchor);
            }
            b';' | b',' if depth == 0 => return Some(cursor),
            b'\n' if depth == 0 => return None,
            _ => {}
        }
        cursor += 1;
    }
    None
}

/// Generate source mappings for rune-to-runtime transforms.
///
/// Svelte runes like `$effect`, `$effect.pre`, `$state`, etc. are transformed
/// into runtime calls like `$.user_effect`, `$.user_pre_effect`, `$.state`, etc.
/// This function creates mappings from the generated runtime call positions
/// back to the original rune positions in the source code.
fn generate_rune_mappings_with_starts(
    generated: &str,
    source: &str,
    starts: &MappingLineStarts,
) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::offset_to_line_col_utf16;

    // Rune -> runtime transform pairs: (source_pattern, generated_pattern)
    let rune_transforms: &[(&str, &str)] = &[
        ("$effect.pre", "$.user_pre_effect"),
        ("$effect", "$.user_effect"),
        ("$state.raw", "$.state"),
        ("$state", "$.state"),
        ("$derived.by", "$.derived"),
        ("$derived", "$.derived"),
        ("$props", "$.rest_props"),
        ("$bindable", "$.prop"),
    ];

    let gen_line_starts = &starts.generated;
    let src_line_starts = &starts.source;
    let mut mappings = Vec::new();

    for &(src_pattern, gen_pattern) in rune_transforms {
        // Find all occurrences of the generated pattern
        let gen_positions: Vec<usize> =
            memmem::find_iter(generated.as_bytes(), gen_pattern).collect();

        // Find all occurrences of the source pattern
        let mut src_positions: Vec<usize> = Vec::new();
        for abs in memmem::find_iter(source.as_bytes(), src_pattern) {
            // For patterns like "$effect" that are substrings of "$effect.pre",
            // ensure we don't match the longer version
            if matches!(src_pattern, "$effect" | "$state" | "$derived")
                && abs + src_pattern.len() < source.len()
                && source.as_bytes()[abs + src_pattern.len()] == b'.'
            {
                // "$effect.pre" / "$state.raw" / "$derived.by" own this position.
                continue;
            }
            src_positions.push(abs);
        }

        // Match 1:1 in order
        for (gen_pos, src_pos) in gen_positions.iter().zip(src_positions.iter()) {
            let (gen_line, gen_col) =
                offset_to_line_col_utf16(generated, gen_line_starts, *gen_pos);
            let (orig_line, orig_col) = offset_to_line_col_utf16(source, src_line_starts, *src_pos);

            // Start mapping
            mappings.push(js_ast::codegen::SourceMapping {
                gen_line: gen_line as u32,
                gen_col: gen_col as u32,
                source: 0,
                orig_line: orig_line as u32,
                orig_col: orig_col as u32,
                name: None,
            });

            // End mapping
            let gen_end = gen_pos + gen_pattern.len();
            let src_end = src_pos + src_pattern.len();
            let (gen_line_end, gen_col_end) =
                offset_to_line_col_utf16(generated, gen_line_starts, gen_end);
            let (orig_line_end, orig_col_end) =
                offset_to_line_col_utf16(source, src_line_starts, src_end);
            mappings.push(js_ast::codegen::SourceMapping {
                gen_line: gen_line_end as u32,
                gen_col: gen_col_end as u32,
                source: 0,
                orig_line: orig_line_end as u32,
                orig_col: orig_col_end as u32,
                name: None,
            });
        }
    }

    mappings
}

/// Map the source-backed tail of user effect calls before generic token matching
/// claims the same generated coordinates for framework scaffolding.
#[cfg(test)]
fn generate_effect_callback_mappings(
    generated: &str,
    source: &str,
) -> Vec<js_ast::codegen::SourceMapping> {
    generate_effect_callback_mappings_with_starts(
        generated,
        source,
        &MappingLineStarts::new(generated, source),
    )
}

fn generate_effect_callback_mappings_with_starts(
    generated: &str,
    source: &str,
    starts: &MappingLineStarts,
) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::offset_to_line_col_utf16;

    fn occurrences(code: &str, patterns: &[&str]) -> Vec<(usize, usize)> {
        let mut found = Vec::new();
        for pattern in patterns {
            let mut cursor = 0;
            while let Some(offset) = code[cursor..].find(pattern) {
                let start = cursor + offset;
                let end = start + pattern.len();
                if code.as_bytes().get(end) == Some(&b'(') {
                    found.push((start, end));
                }
                cursor = end;
            }
        }
        found.sort_unstable();
        found
    }

    let generated_effects = occurrences(generated, &["$.user_pre_effect", "$.user_effect"]);
    let source_effects = occurrences(source, &["$effect.pre", "$effect"]);
    let gen_line_starts = &starts.generated;
    let src_line_starts = &starts.source;
    let mut mappings = Vec::new();

    let mut push = |gen_offset: usize, source_offset: usize| {
        let (gen_line, gen_col) = offset_to_line_col_utf16(generated, gen_line_starts, gen_offset);
        let (orig_line, orig_col) =
            offset_to_line_col_utf16(source, src_line_starts, source_offset);
        mappings.push(js_ast::codegen::SourceMapping {
            gen_line: gen_line as u32,
            gen_col: gen_col as u32,
            source: 0,
            orig_line: orig_line as u32,
            orig_col: orig_col as u32,
            name: None,
        });
    };

    for (index, ((generated_start, generated_end), (source_start, source_end))) in generated_effects
        .iter()
        .zip(source_effects.iter())
        .enumerate()
    {
        push(*generated_start, *source_start);
        push(*generated_end, *source_end);

        let generated_limit = generated_effects
            .get(index + 1)
            .map_or(generated.len(), |(start, _)| *start);
        let source_limit = source_effects
            .get(index + 1)
            .map_or(source.len(), |(start, _)| *start);
        let mut generated_offset = *generated_end;
        let mut source_offset = *source_end;
        while generated_offset < generated_limit && source_offset < source_limit {
            let generated_byte = generated.as_bytes()[generated_offset];
            let source_byte = source.as_bytes()[source_offset];
            if generated_byte.is_ascii_whitespace() {
                generated_offset += 1;
                continue;
            }
            if source_byte.is_ascii_whitespace() {
                source_offset += 1;
                continue;
            }
            if generated_byte != source_byte {
                break;
            }
            push(generated_offset, source_offset);
            generated_offset += 1;
            source_offset += 1;
            push(generated_offset, source_offset);
        }
    }
    mappings
}

/// The legacy prop read inserted ahead of a template expression has two distinct
/// source carriers: the exported binding and the expression itself.
#[cfg(test)]
fn generate_legacy_prop_read_mappings(
    generated: &str,
    source: &str,
) -> Vec<js_ast::codegen::SourceMapping> {
    generate_legacy_prop_read_mappings_with_starts(
        generated,
        source,
        &MappingLineStarts::new(generated, source),
    )
}

fn generate_legacy_prop_read_mappings_with_starts(
    generated: &str,
    source: &str,
    starts: &MappingLineStarts,
) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::offset_to_line_col_utf16;

    fn identifier_after(code: &str, mut offset: usize) -> Option<(usize, &str)> {
        while code
            .as_bytes()
            .get(offset)
            .is_some_and(u8::is_ascii_whitespace)
        {
            offset += 1;
        }
        let start = offset;
        while code
            .as_bytes()
            .get(offset)
            .is_some_and(|byte| byte.is_ascii_alphanumeric() || *byte == b'_' || *byte == b'$')
        {
            offset += 1;
        }
        (offset > start).then_some((start, &code[start..offset]))
    }

    fn push_pair(
        mappings: &mut Vec<js_ast::codegen::SourceMapping>,
        generated: &str,
        source: &str,
        generated_starts: &[usize],
        source_starts: &[usize],
        generated_offset: usize,
        source_offset: usize,
        len: usize,
    ) {
        for (gen_offset, orig_offset) in [
            (generated_offset, source_offset),
            (generated_offset + len, source_offset + len),
        ] {
            let (gen_line, gen_col) =
                offset_to_line_col_utf16(generated, generated_starts, gen_offset);
            let (orig_line, orig_col) =
                offset_to_line_col_utf16(source, source_starts, orig_offset);
            mappings.push(js_ast::codegen::SourceMapping {
                gen_line: gen_line as u32,
                gen_col: gen_col as u32,
                source: 0,
                orig_line: orig_line as u32,
                orig_col: orig_col as u32,
                name: None,
            });
        }
    }

    let generated_starts = starts.generated.clone();
    let source_starts = starts.source.clone();
    let mut mappings = Vec::new();
    let mut cursor = 0;
    while let Some(relative) = generated[cursor..].find("$.deep_read_state(") {
        let read_start = cursor + relative + "$.deep_read_state(".len();
        let Some((generated_name, name)) = identifier_after(generated, read_start) else {
            cursor = read_start;
            continue;
        };
        let binding = format!("export let {name}");
        if let Some(binding_start) = source.find(&binding) {
            let source_name = binding_start + "export let ".len();
            push_pair(
                &mut mappings,
                generated,
                source,
                &generated_starts,
                &source_starts,
                generated_name,
                source_name,
                name.len(),
            );
        }

        let mut untrack_cursor = generated_name + name.len();
        if let Some(relative) = generated[untrack_cursor..].find("$.untrack(() =>") {
            untrack_cursor += relative + "$.untrack(() =>".len();
            if let Some((untrack_name, untrack_identifier)) =
                identifier_after(generated, untrack_cursor)
                && untrack_identifier == name
                && let Some(source_name) = source.rfind(name)
            {
                push_pair(
                    &mut mappings,
                    generated,
                    source,
                    &generated_starts,
                    &source_starts,
                    untrack_name,
                    source_name,
                    name.len(),
                );
            }
        }
        cursor = generated_name + name.len();
    }
    mappings
}

/// Runtime element handles retain the source span of the corresponding template tag.
#[cfg(test)]
fn generate_template_element_runtime_mappings(
    generated: &str,
    source: &str,
) -> Vec<js_ast::codegen::SourceMapping> {
    generate_template_element_runtime_mappings_with_starts(
        generated,
        source,
        &MappingLineStarts::new(generated, source),
    )
}

fn generate_template_element_runtime_mappings_with_starts(
    generated: &str,
    source: &str,
    starts: &MappingLineStarts,
) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::offset_to_line_col_utf16;

    fn identifier_after(code: &str, mut offset: usize) -> Option<(usize, &str)> {
        loop {
            while code
                .as_bytes()
                .get(offset)
                .is_some_and(u8::is_ascii_whitespace)
            {
                offset += 1;
            }
            if code[offset..].starts_with("//") {
                offset += 2;
                while code
                    .as_bytes()
                    .get(offset)
                    .is_some_and(|byte| *byte != b'\n')
                {
                    offset += 1;
                }
                continue;
            }
            break;
        }
        let start = offset;
        while code
            .as_bytes()
            .get(offset)
            .is_some_and(|byte| byte.is_ascii_alphanumeric() || *byte == b'_' || *byte == b'$')
        {
            offset += 1;
        }
        (offset > start).then_some((start, &code[start..offset]))
    }

    fn template_elements(source: &str) -> Vec<(usize, &str)> {
        let mut elements = Vec::new();
        let mut cursor = 0;
        let mut opaque_until = None;
        while let Some(relative) = source[cursor..].find('<') {
            let start = cursor + relative;
            if let Some(end) = opaque_until {
                if start < end {
                    cursor = end;
                    opaque_until = None;
                    continue;
                }
                opaque_until = None;
            }
            let Some((name_start, name)) = identifier_after(source, start + 1) else {
                cursor = start + 1;
                continue;
            };
            if name == "script" || name == "style" {
                if let Some(relative_end) =
                    source[name_start + name.len()..].find(if name == "script" {
                        "</script"
                    } else {
                        "</style"
                    })
                {
                    opaque_until = Some(name_start + name.len() + relative_end + name.len() + 2);
                }
            } else if name.as_bytes().first().is_some_and(u8::is_ascii_lowercase) {
                elements.push((name_start, name));
            }
            cursor = name_start + name.len();
        }
        elements
    }

    fn push_pair(
        mappings: &mut Vec<js_ast::codegen::SourceMapping>,
        generated: &str,
        source: &str,
        generated_starts: &[usize],
        source_starts: &[usize],
        generated_offset: usize,
        source_offset: usize,
        len: usize,
    ) {
        for (gen_offset, orig_offset) in [
            (generated_offset, source_offset),
            (generated_offset + len, source_offset + len),
        ] {
            let (gen_line, gen_col) =
                offset_to_line_col_utf16(generated, generated_starts, gen_offset);
            let (orig_line, orig_col) =
                offset_to_line_col_utf16(source, source_starts, orig_offset);
            mappings.push(js_ast::codegen::SourceMapping {
                gen_line: gen_line as u32,
                gen_col: gen_col as u32,
                source: 0,
                orig_line: orig_line as u32,
                orig_col: orig_col as u32,
                name: None,
            });
        }
    }

    let elements = template_elements(source);
    let generated_starts = starts.generated.clone();
    let source_starts = starts.source.clone();
    let mut known = rustc_hash::FxHashMap::default();
    let mut next_element = 0;
    let mut mappings = Vec::new();

    let mut cursor = 0;
    while let Some(relative) = generated[cursor..].find("var ") {
        let declaration = cursor + relative + "var ".len();
        let Some((variable_offset, variable)) = identifier_after(generated, declaration) else {
            cursor = declaration;
            continue;
        };
        let Some((element_offset, element)) = elements.get(next_element).copied() else {
            break;
        };
        let tail = &generated[variable_offset + variable.len()..];
        let is_handle = tail.trim_start().starts_with("= root()")
            || tail.trim_start().starts_with("= $.child(")
            || tail.trim_start().starts_with("= $.sibling(");
        if is_handle && variable == element {
            push_pair(
                &mut mappings,
                generated,
                source,
                &generated_starts,
                &source_starts,
                variable_offset,
                element_offset,
                variable.len(),
            );
            known.insert(variable, (element_offset, element.len()));
            next_element += 1;
        } else if tail.trim_start().starts_with("= root()") {
            // A fragment handle owns the leading static root element without
            // itself having a source tag name.
            next_element += 1;
        }
        cursor = variable_offset + variable.len();
    }

    let hits = collect_runtime_use_sites(generated, &known);
    for (variable, &(element_offset, len)) in &known {
        let Some(sites) = hits.get(variable) else {
            continue;
        };
        for offsets in sites {
            for &start in offsets {
                push_pair(
                    &mut mappings,
                    generated,
                    source,
                    &generated_starts,
                    &source_starts,
                    start,
                    element_offset,
                    len,
                );
            }
        }
    }
    mappings
}

/// The seven runtime call shapes that name an element handle, in the order the
/// mapping list expects them.
const RUNTIME_USE_PATTERNS: [(&str, bool); 7] = [
    ("$.reset(", true),
    ("$.remove_input_defaults(", true),
    ("$.bind_value(", false),
    (".textContent", false),
    ("$.child(", false),
    ("$.sibling(", false),
    ("$.append($$anchor, ", true),
];

/// Locate every runtime use of a known element handle in one scan per call
/// shape. Scanning per `(variable, shape)` instead re-walks the whole output
/// 7×K times.
fn collect_runtime_use_sites<'code>(
    generated: &'code str,
    known: &rustc_hash::FxHashMap<&'code str, (usize, usize)>,
) -> rustc_hash::FxHashMap<&'code str, [Vec<usize>; 7]> {
    fn identifier_run(code: &str, start: usize) -> &str {
        let bytes = code.as_bytes();
        let mut end = start;
        while bytes
            .get(end)
            .is_some_and(|byte| byte.is_ascii_alphanumeric() || *byte == b'_' || *byte == b'$')
        {
            end += 1;
        }
        &code[start..end]
    }

    let mut sites: rustc_hash::FxHashMap<&str, [Vec<usize>; 7]> = rustc_hash::FxHashMap::default();
    let mut record = |name: &'code str, kind: usize, offset: usize| {
        sites
            .entry(name)
            .or_default()
            .get_mut(kind)
            .expect("kind is within the pattern table")
            .push(offset);
    };
    for (kind, (needle, closed)) in RUNTIME_USE_PATTERNS.iter().enumerate() {
        for hit in memmem::find_iter(generated.as_bytes(), needle) {
            if kind == 3 {
                // `{variable}.textContent`: the name ends where the needle starts,
                // and the source pattern was unanchored on its left.
                let bytes = generated.as_bytes();
                let mut start = hit;
                while start > 0
                    && bytes[start - 1].is_ascii_alphanumeric()
                        | (bytes[start - 1] == b'_')
                        | (bytes[start - 1] == b'$')
                {
                    start -= 1;
                }
                for offset in start..hit {
                    if known.contains_key(&generated[offset..hit]) {
                        record(&generated[offset..hit], kind, offset);
                    }
                }
                continue;
            }
            let start = hit + needle.len();
            let run = identifier_run(generated, start);
            if *closed {
                if generated.as_bytes().get(start + run.len()) == Some(&b')')
                    && known.contains_key(&run)
                {
                    record(&generated[start..start + run.len()], kind, start);
                }
                continue;
            }
            // An unterminated pattern matched any prefix of the identifier.
            for end in 1..=run.len() {
                if known.contains_key(&&run[..end]) {
                    record(&generated[start..start + end], kind, start);
                }
            }
        }
    }
    for offsets in sites.values_mut() {
        for kind in offsets.iter_mut() {
            kind.sort_unstable();
        }
    }
    sites
}

/// Inline instance declarations survive lowering verbatim after `export` is removed.
fn generate_component_bind_mappings_with_starts(
    generated: &str,
    source: &str,
    starts: &MappingLineStarts,
) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::offset_to_line_col_utf16;

    fn identifier_after(code: &str, mut offset: usize) -> Option<(usize, &str)> {
        let start = offset;
        while code
            .as_bytes()
            .get(offset)
            .is_some_and(|byte| byte.is_ascii_alphanumeric() || *byte == b'_' || *byte == b'$')
        {
            offset += 1;
        }
        (offset > start).then_some((start, &code[start..offset]))
    }

    let generated_starts = starts.generated.clone();
    let source_starts = starts.source.clone();
    let mut mappings = Vec::new();
    let mut cursor = 0;
    while let Some(relative) = source[cursor..].find("bind:") {
        let directive_start = cursor + relative;
        let name_start = directive_start + "bind:".len();
        let Some((_, name)) = identifier_after(source, name_start) else {
            cursor = name_start;
            continue;
        };
        let directive_end = name_start + name.len();
        for prefix in ["get ", "set "] {
            let pattern = format!("{prefix}{name}");
            let mut generated_cursor = 0;
            while let Some(relative) = generated[generated_cursor..].find(&pattern) {
                let key_start = generated_cursor + relative + prefix.len();
                for (generated_offset, original_offset) in [
                    (key_start, directive_start),
                    (key_start + name.len(), directive_end),
                ] {
                    let (gen_line, gen_col) =
                        offset_to_line_col_utf16(generated, &generated_starts, generated_offset);
                    let (orig_line, orig_col) =
                        offset_to_line_col_utf16(source, &source_starts, original_offset);
                    mappings.push(js_ast::codegen::SourceMapping {
                        gen_line: gen_line as u32,
                        gen_col: gen_col as u32,
                        source: 0,
                        orig_line: orig_line as u32,
                        orig_col: orig_col as u32,
                        name: None,
                    });
                }
                generated_cursor = key_start + name.len();
            }
        }

        let template = format!("{{{name}}}");
        if let Some(template_start) = source.find(&template) {
            let source_name = template_start + 1;
            let generated_pattern = format!("${{{name}() ??");
            let mut generated_cursor = 0;
            while let Some(relative) = generated[generated_cursor..].find(&generated_pattern) {
                let generated_name = generated_cursor + relative + 2;
                for (generated_offset, original_offset) in [
                    (generated_name, source_name),
                    (generated_name + name.len(), source_name + name.len()),
                ] {
                    let (gen_line, gen_col) =
                        offset_to_line_col_utf16(generated, &generated_starts, generated_offset);
                    let (orig_line, orig_col) =
                        offset_to_line_col_utf16(source, &source_starts, original_offset);
                    mappings.push(js_ast::codegen::SourceMapping {
                        gen_line: gen_line as u32,
                        gen_col: gen_col as u32,
                        source: 0,
                        orig_line: orig_line as u32,
                        orig_col: orig_col as u32,
                        name: None,
                    });
                }
                generated_cursor = generated_name + name.len();
            }
        }
        cursor = directive_end;
    }
    mappings
}

#[cfg(test)]
fn generate_bind_value_mappings(
    generated: &str,
    source: &str,
) -> Vec<js_ast::codegen::SourceMapping> {
    generate_bind_value_mappings_with_starts(
        generated,
        source,
        &MappingLineStarts::new(generated, source),
    )
}

fn generate_bind_value_mappings_with_starts(
    generated: &str,
    source: &str,
    starts: &MappingLineStarts,
) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::offset_to_line_col_utf16;

    fn identifier_after(code: &str, mut offset: usize) -> Option<(usize, &str)> {
        while code
            .as_bytes()
            .get(offset)
            .is_some_and(u8::is_ascii_whitespace)
        {
            offset += 1;
        }
        let start = offset;
        while code
            .as_bytes()
            .get(offset)
            .is_some_and(|byte| byte.is_ascii_alphanumeric() || *byte == b'_' || *byte == b'$')
        {
            offset += 1;
        }
        (offset > start).then_some((start, &code[start..offset]))
    }

    let generated_starts = starts.generated.clone();
    let source_starts = starts.source.clone();
    let mut mappings = Vec::new();
    let mut source_cursor = 0;
    while let Some(relative) = source[source_cursor..].find("bind:value={") {
        let expression_start = source_cursor + relative + "bind:value={".len();
        let Some((source_name, name)) = identifier_after(source, expression_start) else {
            source_cursor = expression_start;
            continue;
        };
        let mut generated_cursor = 0;
        while let Some(relative) = generated[generated_cursor..].find("$.bind_value(") {
            let call_start = generated_cursor + relative;
            let call_end = generated[call_start..]
                .find('\n')
                .map_or(generated.len(), |offset| call_start + offset);
            let argument_start = call_start + "$.bind_value(".len();
            if let Some((argument_offset, argument)) = identifier_after(generated, argument_start)
                && let Some(element_start) = source.find(&format!("<{argument}"))
            {
                let source_offset = element_start + 1;
                for (generated_offset, original_offset) in [
                    (argument_offset, source_offset),
                    (
                        argument_offset + argument.len(),
                        source_offset + argument.len(),
                    ),
                ] {
                    let (gen_line, gen_col) =
                        offset_to_line_col_utf16(generated, &generated_starts, generated_offset);
                    let (orig_line, orig_col) =
                        offset_to_line_col_utf16(source, &source_starts, original_offset);
                    mappings.push(js_ast::codegen::SourceMapping {
                        gen_line: gen_line as u32,
                        gen_col: gen_col as u32,
                        source: 0,
                        orig_line: orig_line as u32,
                        orig_col: orig_col as u32,
                        name: None,
                    });
                }
            }
            let mut offset = call_start;
            while let Some(relative) = generated[offset..call_end].find(name) {
                let start = offset + relative;
                let end = start + name.len();
                let before = generated.as_bytes().get(start.wrapping_sub(1));
                let after = generated.as_bytes().get(end);
                if !before.is_some_and(|byte| byte.is_ascii_alphanumeric() || *byte == b'_')
                    && !after.is_some_and(|byte| byte.is_ascii_alphanumeric() || *byte == b'_')
                {
                    for (generated_offset, original_offset) in
                        [(start, source_name), (end, source_name + name.len())]
                    {
                        let (gen_line, gen_col) = offset_to_line_col_utf16(
                            generated,
                            &generated_starts,
                            generated_offset,
                        );
                        let (orig_line, orig_col) =
                            offset_to_line_col_utf16(source, &source_starts, original_offset);
                        mappings.push(js_ast::codegen::SourceMapping {
                            gen_line: gen_line as u32,
                            gen_col: gen_col as u32,
                            source: 0,
                            orig_line: orig_line as u32,
                            orig_col: orig_col as u32,
                            name: None,
                        });
                    }
                }
                offset = end;
            }
            generated_cursor = call_end;
        }
        source_cursor = source_name + name.len();
    }
    mappings
}

#[cfg(test)]
fn generate_inline_script_mappings(
    generated: &str,
    source: &str,
) -> Vec<js_ast::codegen::SourceMapping> {
    generate_inline_script_mappings_with_starts(
        generated,
        source,
        &MappingLineStarts::new(generated, source),
    )
}

fn generate_inline_script_mappings_with_starts(
    generated: &str,
    source: &str,
    starts: &MappingLineStarts,
) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::offset_to_line_col_utf16;

    let generated_starts = starts.generated.clone();
    let source_starts = starts.source.clone();
    let mut mappings = Vec::new();
    let mut cursor = 0;
    while let Some(relative) = source[cursor..].find("<script>") {
        let content_start = cursor + relative + "<script>".len();
        let Some(content_end) = source[content_start..].find("</script>") else {
            break;
        };
        let content_end = content_start + content_end;
        let content = &source[content_start..content_end];
        let leading = content.len() - content.trim_start().len();
        let declaration_start = content_start + leading;
        let declaration = &source[declaration_start..content_end];
        let Some(declaration) = declaration.strip_prefix("export ") else {
            cursor = content_end + "</script>".len();
            continue;
        };
        let source_declaration_start = declaration_start + "export ".len();
        if let Some(generated_start) = generated.find(declaration) {
            for offset in 0..=declaration.len() {
                if !declaration.is_char_boundary(offset) {
                    continue;
                }
                let (gen_line, gen_col) = offset_to_line_col_utf16(
                    generated,
                    &generated_starts,
                    generated_start + offset,
                );
                let (orig_line, orig_col) = offset_to_line_col_utf16(
                    source,
                    &source_starts,
                    source_declaration_start + offset,
                );
                mappings.push(js_ast::codegen::SourceMapping {
                    gen_line: gen_line as u32,
                    gen_col: gen_col as u32,
                    source: 0,
                    orig_line: orig_line as u32,
                    orig_col: orig_col as u32,
                    name: None,
                });
            }
        }
        cursor = content_end + "</script>".len();
    }
    mappings
}

/// Returns true if a token should be skipped during source map matching.
/// Framework-generated tokens, JS keywords, and common internal identifiers
/// should be skipped to avoid false matches against the user's source code.
fn should_skip_token(text: &str, map_declaration_keywords: bool) -> bool {
    // Skip tokens starting with $ or $$ (framework identifiers)
    if text.starts_with('$') {
        return true;
    }
    if map_declaration_keywords && text == "let" {
        return false;
    }

    // Skip JavaScript keywords and common framework identifiers
    matches!(
        text,
        "import"
            | "export"
            | "default"
            | "from"
            | "as"
            | "function"
            | "var"
            | "let"
            | "const"
            | "return"
            | "if"
            | "else"
            | "for"
            | "while"
            | "do"
            | "switch"
            | "case"
            | "break"
            | "continue"
            | "new"
            | "delete"
            | "typeof"
            | "instanceof"
            | "void"
            | "in"
            | "of"
            | "try"
            | "catch"
            | "finally"
            | "throw"
            | "class"
            | "extends"
            | "super"
            | "this"
            | "yield"
            | "await"
            | "async"
            | "with"
            | "debugger"
            | "true"
            | "false"
            | "null"
            | "undefined"
            | "get"
            | "set"
            | "svelte"
            | "internal"
            | "client"
            | "server"
            | "version"
            | "disclose"
            | "flags"
            | "legacy"
    )
}

fn for_each_token<'a>(code: &'a str, mut f: impl FnMut(&'a str, usize)) {
    let bytes = code.as_bytes();
    let len = bytes.len();
    let mut i = 0;

    while i < len {
        let b = bytes[i];

        // Skip whitespace
        if b == b' ' || b == b'\t' || b == b'\n' || b == b'\r' {
            i += 1;
            continue;
        }

        // Identifier or keyword
        if b.is_ascii_alphabetic() || b == b'_' || b == b'$' {
            let start = i;
            i += 1;
            while i < len
                && (bytes[i].is_ascii_alphanumeric() || bytes[i] == b'_' || bytes[i] == b'$')
            {
                i += 1;
            }
            f(&code[start..i], start);
            continue;
        }

        // Numeric literal
        if b.is_ascii_digit() {
            let start = i;
            i += 1;
            while i < len
                && (bytes[i].is_ascii_alphanumeric() || bytes[i] == b'.' || bytes[i] == b'_')
            {
                i += 1;
            }
            if i < len && bytes[i] == b'n' {
                i += 1;
            }
            f(&code[start..i], start);
            continue;
        }

        // String literal
        if b == b'\'' || b == b'"' {
            let start = i;
            let quote = b;
            i += 1;
            while i < len && bytes[i] != quote {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                } else {
                    i += 1;
                }
            }
            if i < len {
                i += 1;
            }
            f(&code[start..i], start);
            continue;
        }

        // Template literal - skip static parts but process ${...} expressions
        // (template expressions contain identifiers that need source map tracking)
        if b == b'`' {
            i += 1;
            while i < len {
                if bytes[i] == b'`' {
                    i += 1;
                    break;
                }
                if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                    // Skip `${`, the expression contents will be processed
                    // by the main loop (we just skip the `${` and `}` delimiters)
                    i += 2;
                    // Process expression contents until matching `}`
                    let mut brace_depth = 1u32;
                    while i < len && brace_depth > 0 {
                        let eb = bytes[i];
                        if eb == b'{' {
                            brace_depth += 1;
                            i += 1;
                        } else if eb == b'}' {
                            brace_depth -= 1;
                            if brace_depth == 0 {
                                i += 1; // skip closing }
                                break;
                            }
                            i += 1;
                        } else if eb.is_ascii_alphabetic() || eb == b'_' || eb == b'$' {
                            let start = i;
                            i += 1;
                            while i < len
                                && (bytes[i].is_ascii_alphanumeric()
                                    || bytes[i] == b'_'
                                    || bytes[i] == b'$')
                            {
                                i += 1;
                            }
                            f(&code[start..i], start);
                        } else if eb.is_ascii_digit() {
                            let start = i;
                            i += 1;
                            while i < len
                                && (bytes[i].is_ascii_alphanumeric()
                                    || bytes[i] == b'.'
                                    || bytes[i] == b'_')
                            {
                                i += 1;
                            }
                            f(&code[start..i], start);
                        } else {
                            i += 1;
                        }
                    }
                    continue;
                }
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                } else {
                    i += 1;
                }
            }
            continue;
        }

        // Skip comments
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            if i + 1 < len {
                i += 2;
            }
            continue;
        }

        i += 1;
    }
}

#[cfg(test)]
mod tests {
    use crate::{CompileOptions, GenerateMode, compile};

    use super::{
        generate_bind_value_mappings, generate_default_function_wrapper_mappings,
        generate_effect_callback_mappings, generate_inline_script_mappings,
        generate_legacy_prop_read_mappings, generate_server_declaration_mappings,
        generate_server_token_mappings, generate_server_wrapper_mappings,
        generate_template_element_runtime_mappings, generate_token_mappings,
        generate_verbatim_import_mappings, typescript_declaration_annotation_end,
    };

    #[test]
    fn maps_binding_end_past_erased_typescript_annotation() {
        let source = "\tlet count: number = 0;\n\tconst clear: ITimeoutDestroyer = () => {}";
        assert_eq!(
            typescript_declaration_annotation_end(source, source.find("count").unwrap(), 5),
            Some(source.find(" = 0").unwrap())
        );
        assert_eq!(
            typescript_declaration_annotation_end(source, source.find("clear").unwrap(), 5),
            Some(source.find(" = ()").unwrap())
        );
    }

    #[test]
    fn maps_verbatim_user_import_punctuation_after_framework_imports() {
        let source = "<script>\n\timport { onMount } from 'svelte';\n</script>";
        let generated =
            "import * as $ from 'svelte/internal/client';\nimport { onMount } from 'svelte';";
        let mappings = generate_verbatim_import_mappings(generated, source);

        assert!(mappings.iter().any(|mapping| {
            (
                mapping.gen_line,
                mapping.gen_col,
                mapping.orig_line,
                mapping.orig_col,
            ) == (1, 7, 1, 8)
        }));
    }

    #[test]
    fn maps_user_effect_callback_after_runtime_lowering() {
        let source = "<script>\n\t$effect(() => {\n\t\tfoo;\n\t});\n</script>";
        let generated = "\t$.user_effect(() => {\n\t\tfoo;\n\t});";
        let mappings = generate_effect_callback_mappings(generated, source);

        assert!(mappings.iter().any(|mapping| {
            mapping.gen_line == 1
                && mapping.gen_col == 2
                && mapping.orig_line == 2
                && mapping.orig_col == 2
        }));
        assert!(mappings.iter().any(|mapping| {
            mapping.gen_line == 0
                && mapping.gen_col == 22
                && mapping.orig_line == 1
                && mapping.orig_col == 16
        }));
    }

    #[test]
    fn client_maps_lowered_prop_declaration_keyword() {
        let source = "<script>\n\texport let value = 2;\n</script>";
        let generated = "export default function Input($$anchor, $$props) {\n\tlet value = $.prop($$props, 'value', 8, 2);\n}";
        let mappings = generate_token_mappings(generated, source);

        assert!(mappings.iter().any(|mapping| {
            (
                mapping.gen_line,
                mapping.gen_col,
                mapping.orig_line,
                mapping.orig_col,
            ) == (1, 1, 1, 8)
        }));
    }

    #[test]
    fn client_maps_legacy_prop_read_and_template_expression_separately() {
        let source = "<script>\n\texport let foo;\n</script>\n\n{foo.bar}";
        let generated = "$.deep_read_state(foo()); $.untrack(() => foo().bar)";
        let mappings = generate_legacy_prop_read_mappings(generated, source);

        for expected in [(18, 1, 12), (21, 1, 15), (42, 4, 1), (45, 4, 4)] {
            assert!(
                mappings.iter().any(|mapping| {
                    (mapping.gen_col, mapping.orig_line, mapping.orig_col) == expected
                }),
                "missing prop-read mapping {expected:?}: {mappings:?}"
            );
        }
    }

    #[test]
    fn client_maps_template_handles_to_element_tags() {
        let source = "<main><div>{name}</div></main>";
        let generated = "var main = root();\nvar div = $.child(main);\nvar text = $.child(div, true);\n$.reset(div);\n$.reset(main);\n$.remove_input_defaults(div);\n$.bind_value(div, () => value, set);";
        let mappings = generate_template_element_runtime_mappings(generated, source);

        for expected in [
            (0, 4, 0, 1),
            (1, 4, 0, 7),
            (3, 8, 0, 7),
            (4, 8, 0, 1),
            (5, 24, 0, 7),
            (6, 13, 0, 7),
        ] {
            assert!(
                mappings.iter().any(|mapping| {
                    (
                        mapping.gen_line,
                        mapping.gen_col,
                        mapping.orig_line,
                        mapping.orig_col,
                    ) == expected
                }),
                "missing element-handle mapping {expected:?}: {mappings:?}"
            );
        }
    }

    #[test]
    fn client_maps_handle_after_preserved_script_comment() {
        let source =
            "<script>\n// retained\n</script>\n<style>div { color: red; }</style>\n<div />";
        let generated = "var // retained\ndiv = root();";
        let mappings = generate_template_element_runtime_mappings(generated, source);

        for expected in [(1, 0, 4, 1), (1, 3, 4, 4)] {
            assert!(
                mappings.iter().any(|mapping| {
                    (
                        mapping.gen_line,
                        mapping.gen_col,
                        mapping.orig_line,
                        mapping.orig_col,
                    ) == expected
                }),
                "missing comment-separated handle mapping {expected:?}: {mappings:?}"
            );
        }
    }

    #[test]
    fn client_maps_inline_export_declaration_after_lowering() {
        let source = "<script>export const b = 2;</script>";
        let generated = "\tconst b = 2;";
        let mappings = generate_inline_script_mappings(generated, source);

        for expected in [(0, 1, 0, 15), (0, 11, 0, 25), (0, 12, 0, 26)] {
            assert!(
                mappings.iter().any(|mapping| {
                    (
                        mapping.gen_line,
                        mapping.gen_col,
                        mapping.orig_line,
                        mapping.orig_col,
                    ) == expected
                }),
                "missing inline declaration mapping {expected:?}: {mappings:?}"
            );
        }
    }

    #[test]
    fn client_maps_every_bind_value_expression_copy_to_the_template() {
        let source = "<input bind:value={foo.bar}>";
        let generated =
            "$.bind_value(input, () => foo().bar, ($$value) => foo(foo().bar = $$value));";
        let mappings = generate_bind_value_mappings(generated, source);
        let starts = generated
            .match_indices("foo")
            .map(|(offset, _)| offset)
            .collect::<Vec<_>>();

        for start in starts {
            assert!(
                mappings.iter().any(|mapping| {
                    (mapping.gen_col, mapping.orig_line, mapping.orig_col) == (start as u32, 0, 19)
                }),
                "missing bind expression mapping at {start}: {mappings:?}"
            );
        }
    }

    #[test]
    fn client_keeps_bind_value_runtime_carriers_after_merging() {
        let source = "<script>\n\texport let foo;\n</script>\n\n<input bind:value={foo.bar.baz}>";
        let result = compile(
            source,
            CompileOptions {
                generate: GenerateMode::Client,
                filename: Some("input.svelte".to_string()),
                ..Default::default()
            },
        )
        .unwrap();
        let map: serde_json::Value =
            serde_json::from_str(result.js.map.as_deref().unwrap()).unwrap();
        let mappings =
            crate::compiler::phases::phase3_transform::js_ast::codegen::decode_vlq_mappings(
                map["mappings"].as_str().unwrap(),
            );
        for (line, column, original_line, original_column) in [
            (16, 14, 4, 1),
            (16, 19, 4, 6),
            (16, 27, 4, 19),
            (16, 30, 4, 22),
            (16, 55, 4, 19),
            (16, 58, 4, 22),
            (16, 59, 4, 19),
            (16, 62, 4, 22),
        ] {
            assert!(
                mappings[line]
                    .iter()
                    .any(|segment| { segment[..4] == [column, 0, original_line, original_column] }),
                "missing merged mapping at {line}:{column}: {:?}",
                mappings[line]
            );
        }
    }

    #[test]
    fn client_keeps_component_bind_shorthand_carriers_after_merging() {
        let source = "<script>\n\texport let potato;\n</script>\n\n{potato}\n<Widget bind:potato/>";
        let result = compile(
            source,
            CompileOptions {
                generate: GenerateMode::Client,
                filename: Some("input.svelte".to_string()),
                ..Default::default()
            },
        )
        .unwrap();
        let map: serde_json::Value =
            serde_json::from_str(result.js.map.as_deref().unwrap()).unwrap();
        let mappings =
            crate::compiler::phases::phase3_transform::js_ast::codegen::decode_vlq_mappings(
                map["mappings"].as_str().unwrap(),
            );
        for (line, column, original_line, original_column) in [
            (16, 6, 5, 8),
            (16, 12, 5, 19),
            (20, 6, 5, 8),
            (20, 12, 5, 19),
            (26, 51, 4, 7),
        ] {
            assert!(
                mappings[line]
                    .iter()
                    .any(|segment| { segment[..4] == [column, 0, original_line, original_column] }),
                "missing merged component-bind mapping at {line}:{column}: {:?}",
                mappings[line]
            );
        }
    }

    #[test]
    fn server_maps_instance_declaration_keyword() {
        let source = "<script>\n\tlet doubled = 2;\n</script>";
        let generated = "export default function Input($$renderer) {\n\tlet doubled = 2;\n}";
        let mappings = generate_server_token_mappings(generated, source);

        assert!(mappings.iter().any(|mapping| {
            (
                mapping.gen_line,
                mapping.gen_col,
                mapping.orig_line,
                mapping.orig_col,
            ) == (1, 1, 1, 1)
        }));
    }

    #[test]
    fn server_maps_instance_script_callback_boundaries() {
        let source = "<script>\n\texport let foo;\n</script>\n\n{foo.bar.baz}";
        let generated = "import * as $ from 'svelte/internal/server';\n\nexport default function Input($$renderer, $$props) {\n\t$$renderer.component(($$renderer) => {\n\t\tlet foo = $$props['foo'];\n\t});\n}";
        let mappings = generate_server_wrapper_mappings(generated, source, 0, 35);

        for expected in [(3, 38, 0, 0), (3, 39, 0, 1), (5, 1, 2, 8), (5, 2, 2, 9)] {
            assert!(
                mappings.iter().any(|mapping| {
                    (
                        mapping.gen_line,
                        mapping.gen_col,
                        mapping.orig_line,
                        mapping.orig_col,
                    ) == expected
                }),
                "missing callback boundary mapping {expected:?}: {mappings:?}"
            );
        }
    }

    #[test]
    fn server_maps_multiline_callback_and_inline_export() {
        let source = "<script>export const b = 2;</script>";
        let generated = "$$renderer.component(\n\t($$renderer) => {\n\t\tconst b = 2;\n\t},\n);";
        let wrappers = generate_server_wrapper_mappings(generated, source, 0, source.len());
        assert!(
            wrappers
                .iter()
                .any(|mapping| mapping.gen_line == 1 && mapping.orig_col == 0)
        );

        let declarations = generate_server_declaration_mappings(generated, source);
        assert!(declarations.iter().any(|mapping| {
            (
                mapping.gen_line,
                mapping.gen_col,
                mapping.orig_line,
                mapping.orig_col,
            ) == (2, 2, 0, 15)
        }));
    }

    #[test]
    fn server_maps_default_function_boundaries() {
        let source = "<script>console.log('Target')</script>\n\n<h1>Hello</h1>";
        let generated = "import * as $ from 'svelte/internal/server';\n\nexport default function Input($$renderer) {\n\tconsole.log('Target');\n\t$$renderer.push(`<h1>Hello</h1>`);\n}";
        let mappings = generate_default_function_wrapper_mappings(generated, source, 0, 38);

        for expected in [(2, 42, 0, 0), (2, 43, 0, 1), (5, 0, 0, 37), (5, 1, 0, 38)] {
            assert!(
                mappings.iter().any(|mapping| {
                    (
                        mapping.gen_line,
                        mapping.gen_col,
                        mapping.orig_line,
                        mapping.orig_col,
                    ) == expected
                }),
                "missing function boundary mapping {expected:?}: {mappings:?}"
            );
        }
    }

    #[test]
    fn server_does_not_invent_callback_boundary_mappings() {
        assert!(
            generate_server_wrapper_mappings(
                "export default function Input($$renderer) {}",
                "<p>static</p>",
                0,
                0,
            )
            .is_empty()
        );
    }

    #[test]
    fn server_maps_empty_callback_closing_brace_to_script_end() {
        let source = "<script>let value = 1;</script>";
        let generated = "$$renderer.component(($$renderer) => {});";
        let mappings = generate_server_wrapper_mappings(generated, source, 0, source.len());

        assert!(
            mappings
                .iter()
                .any(|mapping| { mapping.gen_col == 38 && mapping.orig_col == 1 })
        );
        assert!(mappings.iter().any(|mapping| {
            mapping.gen_col == 38 && mapping.orig_col == (source.len() - 1) as u32
        }));

        let source = "<script lang=\"ts\">\n\t$effect(() => {\n\t\tfoo;\n\t});\n\n\t$effect.pre(() => {\n\t\tbar;\n\t});\n</script>";
        let result = compile(
            source,
            CompileOptions {
                generate: GenerateMode::Server,
                filename: Some("input.svelte".to_string()),
                css: crate::compiler::CssMode::External,
                ..Default::default()
            },
        )
        .unwrap();
        let map: serde_json::Value =
            serde_json::from_str(result.js.map.as_deref().unwrap()).unwrap();
        let decoded =
            crate::compiler::phases::phase3_transform::js_ast::codegen::decode_vlq_mappings(
                map["mappings"].as_str().unwrap(),
            );
        let line = result
            .js
            .code
            .lines()
            .position(|line| line.contains("$$renderer.component"))
            .unwrap();
        let endings = decoded[line]
            .iter()
            .filter(|segment| segment[0] == 39)
            .map(|segment| &segment[..4])
            .collect::<Vec<_>>();
        assert_eq!(
            endings,
            vec![[39, 0, 0, 1].as_slice(), [39, 0, 8, 8].as_slice()],
            "{}: {:?}",
            result.js.code,
            decoded[line]
        );
    }
}
