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

pub mod client;
pub mod css;
pub mod js_ast;
pub mod profile;
pub mod server;
pub mod shared;
pub mod types;
pub mod utils;

// Re-export commonly used types
pub use js_ast::{JsExpr, JsProgram, JsStatement};

use super::phase2_analyze::ComponentAnalysis;
use crate::ast::template::Root;
use crate::compiler::{CompileOptions, GenerateMode};

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
    use js_ast::codegen::{
        SourceMapping, encode_vlq_mappings, generate_sourcemap_json, get_source_name,
        remap_through_sourcemap,
    };

    let (js, mut js_mappings) = match options.generate {
        GenerateMode::Client => {
            let mut result = client::transform_client(analysis, ast, source, options)?;
            // Strip unnecessary parens around arrow functions (e.g., (() => { ... }) → () => { ... })
            // matching the official Svelte compiler's AST printer behavior.
            result.code = server::transform_script::strip_arrow_function_parens(result.code);

            if options.enable_sourcemap {
                // Merge codegen-tracked mappings with full token-level mappings.
                // When a preprocessor map is present, token-level mappings (by name) are
                // more reliable than sequential-scan codegen mappings because the
                // transformed script content contains framework tokens (e.g., $.prop,
                // $$props) that confuse the sequential source scanner in emit_raw_mapped,
                // causing it to advance past user code and produce wrong source positions.
                // Token-level mappings match by token name and handle this correctly.
                //
                // When NO preprocessor is present, codegen-tracked mappings are already
                // precise. Generating token+rune scanners here only adds mappings at
                // positions codegen didn't cover; the bulk are deduped away against
                // existing codegen mappings (~44ms of token+rune scan + sort + dedup
                // per 3637-file workload, measured 2026-05-16). Skip the scanners
                // entirely in this branch.
                let mappings = if options.sourcemap.is_some() {
                    // Preprocessor present: token mappings take priority
                    let token_mappings = generate_token_mappings(&result.code, source);
                    let rune_mappings = generate_rune_mappings(&result.code, source);
                    let mut m = token_mappings;
                    m.extend(rune_mappings);
                    m.extend(result.mappings);
                    m.sort_by(|a, b| a.gen_line.cmp(&b.gen_line).then(a.gen_col.cmp(&b.gen_col)));
                    m.dedup_by(|a, b| a.gen_line == b.gen_line && a.gen_col == b.gen_col);
                    m
                } else {
                    // No preprocessor: codegen mappings are produced in emit order.
                    // Run a sort + dedup defensively — Rust's TimSort is O(n) on
                    // already-sorted input, so the cost is negligible vs. the
                    // safety against any future sub-emitter that produces
                    // out-of-order mappings.
                    let mut m = result.mappings;
                    m.sort_by(|a, b| a.gen_line.cmp(&b.gen_line).then(a.gen_col.cmp(&b.gen_col)));
                    m.dedup_by(|a, b| a.gen_line == b.gen_line && a.gen_col == b.gen_col);
                    m
                };
                (result.code, mappings)
            } else {
                (result.code, Vec::new())
            }
        }
        GenerateMode::Server => {
            let code = server::transform_server(analysis, ast, source, options)?;
            // Template-expression interpolations in the SSR output are spliced
            // straight from source positions, so for a TypeScript component
            // (`<script lang="ts">`) bits of TS-only syntax — `as T` casts,
            // `<T>` generics, `! ` non-null assertions, `: T` annotations on
            // inline destructures — can leak into the emitted JS inside
            // `$.escape(...)`, `$.stringify(...)`, `$.attr_style(...)`, etc.
            // rolldown then rejects the result with
            // `Type assertion expressions can only be used in TypeScript files`.
            // Run the same TypeScript strip the analyzer uses over the final
            // output to catch every leak in one pass, rather than threading
            // a per-expression strip through every visitor source-slice site.
            // Real-world surface: shadcn-svelte's `base-color-picker.svelte`
            // → `style="--color: {map?.[mode.current as 'light' | 'dark']?.[…]}"`.
            let code = if analysis.is_typescript {
                crate::compiler::phases::phase2_analyze::types::strip_typescript(&code)
            } else {
                code
            };
            if options.enable_sourcemap {
                // Generate token-level mappings by matching tokens in the server
                // output to tokens in the original source
                let mappings = generate_token_mappings(&code, source);
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
        let mut css_output = css::render_stylesheet(analysis, ast.css.as_deref(), source, options)?;
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
            let css_warnings = css::collect_css_unused_warnings(analysis, source);
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

            // Determine the output file basename for the "file" field
            let file_name = output_filename
                .map(|f| {
                    f.split(['/', '\\'])
                        .next_back()
                        .unwrap_or("input.svelte.js")
                        .to_string()
                })
                .unwrap_or_else(|| "input.svelte.js".to_string());

            let mut mappings_str = encode_vlq_mappings(&js_mappings);

            // Ensure the mappings string covers all lines of the generated output.
            // The VLQ encoding uses ';' to separate lines. If the last mapping is on
            // line N but the output has M>N lines, we need trailing semicolons so
            // that decode() produces an array of length M+1.
            let output_line_count = js.chars().filter(|&c| c == '\n').count();
            let mapped_lines = mappings_str.chars().filter(|&c| c == ';').count();
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
                            &file_name,
                            &multi_sources[0],
                            content,
                            &mappings_str,
                            &names_refs,
                        ))
                    } else {
                        let sources_refs: Vec<&str> =
                            multi_sources.iter().map(|s| s.as_str()).collect();
                        let contents_refs: Vec<&str> =
                            multi_contents.iter().map(|s| s.as_str()).collect();
                        Some(js_ast::codegen::generate_sourcemap_json_multi(
                            &file_name,
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
                    Some(generate_sourcemap_json(
                        &file_name,
                        &source_name,
                        content,
                        &mappings_str,
                        &names_refs,
                    ))
                }
            } else {
                Some(generate_sourcemap_json(
                    &file_name,
                    &source_name,
                    source,
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
                let file_name = output_filename
                    .map(|f| {
                        f.split(['/', '\\'])
                            .next_back()
                            .unwrap_or("input.svelte.js")
                            .to_string()
                    })
                    .unwrap_or_else(|| "input.svelte.js".to_string());

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
                    &file_name,
                    &source_name,
                    source,
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
        file_name,
        &source_name,
        if original_content.is_empty() {
            ""
        } else {
            original_content
        },
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

/// Generate token-level source mappings by matching tokens in generated code
/// against tokens in the original source.
///
/// For each unique token name (identifier or numeric literal), we collect all
/// positions in the source and all positions in the generated output. Then we
/// match them 1:1 in order. This avoids the problem of sequential scanning
/// where framework code tokens (appearing early in the generated output) can
/// consume source positions intended for user-code tokens that appear later.
fn generate_token_mappings(generated: &str, source: &str) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::{build_line_starts, offset_to_line_col};

    let gen_tokens = extract_tokens_simple(generated);
    let src_tokens = extract_tokens_simple(source);
    let gen_line_starts = build_line_starts(generated);
    let src_line_starts = build_line_starts(source);

    // Build a map: token_text -> list of source positions (byte offsets)
    let mut src_positions: rustc_hash::FxHashMap<&str, Vec<usize>> =
        rustc_hash::FxHashMap::default();
    for token in &src_tokens {
        src_positions
            .entry(token.text)
            .or_default()
            .push(token.output_offset);
    }

    // For each token name, track how many generated occurrences we've consumed
    let mut src_consumed: rustc_hash::FxHashMap<&str, usize> = rustc_hash::FxHashMap::default();

    let mut mappings = Vec::new();

    for gen_token in &gen_tokens {
        // Skip framework-generated tokens
        if should_skip_token(gen_token.text) {
            continue;
        }

        // Look up this token's source positions
        let positions = match src_positions.get(gen_token.text) {
            Some(p) => p,
            None => continue,
        };

        // Get the next unused source position for this token
        let consumed = src_consumed.entry(gen_token.text).or_insert(0);
        if *consumed >= positions.len() {
            continue;
        }

        let src_pos = positions[*consumed];
        *consumed += 1;

        let (gen_line, gen_col) = offset_to_line_col(&gen_line_starts, gen_token.output_offset);
        let (orig_line, orig_col) = offset_to_line_col(&src_line_starts, src_pos);

        // Start of token
        mappings.push(js_ast::codegen::SourceMapping {
            gen_line: gen_line as u32,
            gen_col: gen_col as u32,
            source: 0,
            orig_line: orig_line as u32,
            orig_col: orig_col as u32,
            name: None,
        });

        // End of token
        let end_gen = gen_token.output_offset + gen_token.text.len();
        let end_src = src_pos + gen_token.text.len();
        let (gen_line_end, gen_col_end) = offset_to_line_col(&gen_line_starts, end_gen);
        let (orig_line_end, orig_col_end) = offset_to_line_col(&src_line_starts, end_src);
        mappings.push(js_ast::codegen::SourceMapping {
            gen_line: gen_line_end as u32,
            gen_col: gen_col_end as u32,
            source: 0,
            orig_line: orig_line_end as u32,
            orig_col: orig_col_end as u32,
            name: None,
        });
    }

    // Sort and dedup
    mappings.sort_by(|a, b| a.gen_line.cmp(&b.gen_line).then(a.gen_col.cmp(&b.gen_col)));
    mappings.dedup_by(|a, b| a.gen_line == b.gen_line && a.gen_col == b.gen_col);
    mappings
}

/// Generate source mappings for rune-to-runtime transforms.
///
/// Svelte runes like `$effect`, `$effect.pre`, `$state`, etc. are transformed
/// into runtime calls like `$.user_effect`, `$.user_pre_effect`, `$.state`, etc.
/// This function creates mappings from the generated runtime call positions
/// back to the original rune positions in the source code.
fn generate_rune_mappings(generated: &str, source: &str) -> Vec<js_ast::codegen::SourceMapping> {
    use js_ast::codegen::{build_line_starts, offset_to_line_col};

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

    let gen_line_starts = build_line_starts(generated);
    let src_line_starts = build_line_starts(source);
    let mut mappings = Vec::new();

    for &(src_pattern, gen_pattern) in rune_transforms {
        // Find all occurrences of the generated pattern
        let mut gen_positions = Vec::new();
        let mut gen_search = 0;
        while let Some(pos) = generated[gen_search..].find(gen_pattern) {
            let abs = gen_search + pos;
            gen_positions.push(abs);
            gen_search = abs + gen_pattern.len();
        }

        // Find all occurrences of the source pattern
        let mut src_positions = Vec::new();
        let mut src_search = 0;
        while let Some(pos) = source[src_search..].find(src_pattern) {
            let abs = src_search + pos;
            // For patterns like "$effect" that are substrings of "$effect.pre",
            // ensure we don't match the longer version
            if src_pattern == "$effect" && abs + src_pattern.len() < source.len() {
                let next_char = source.as_bytes()[abs + src_pattern.len()];
                if next_char == b'.' {
                    // This is "$effect.pre" or "$effect.root" etc., skip
                    src_search = abs + src_pattern.len();
                    continue;
                }
            }
            if src_pattern == "$state" && abs + src_pattern.len() < source.len() {
                let next_char = source.as_bytes()[abs + src_pattern.len()];
                if next_char == b'.' {
                    src_search = abs + src_pattern.len();
                    continue;
                }
            }
            if src_pattern == "$derived" && abs + src_pattern.len() < source.len() {
                let next_char = source.as_bytes()[abs + src_pattern.len()];
                if next_char == b'.' {
                    src_search = abs + src_pattern.len();
                    continue;
                }
            }
            src_positions.push(abs);
            src_search = abs + src_pattern.len();
        }

        // Match 1:1 in order
        for (gen_pos, src_pos) in gen_positions.iter().zip(src_positions.iter()) {
            let (gen_line, gen_col) = offset_to_line_col(&gen_line_starts, *gen_pos);
            let (orig_line, orig_col) = offset_to_line_col(&src_line_starts, *src_pos);

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
            let (gen_line_end, gen_col_end) = offset_to_line_col(&gen_line_starts, gen_end);
            let (orig_line_end, orig_col_end) = offset_to_line_col(&src_line_starts, src_end);
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

/// Simple token extraction from generated code. Returns identifier and
/// numeric literal tokens with their byte offsets.
struct SimpleToken<'a> {
    text: &'a str,
    output_offset: usize,
}

/// Returns true if a token should be skipped during source map matching.
/// Framework-generated tokens, JS keywords, and common internal identifiers
/// should be skipped to avoid false matches against the user's source code.
fn should_skip_token(text: &str) -> bool {
    // Skip tokens starting with $ or $$ (framework identifiers)
    if text.starts_with('$') {
        return true;
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

fn extract_tokens_simple(code: &str) -> Vec<SimpleToken<'_>> {
    let bytes = code.as_bytes();
    let len = bytes.len();
    let mut tokens = Vec::new();
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
            tokens.push(SimpleToken {
                text: &code[start..i],
                output_offset: start,
            });
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
            tokens.push(SimpleToken {
                text: &code[start..i],
                output_offset: start,
            });
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
            tokens.push(SimpleToken {
                text: &code[start..i],
                output_offset: start,
            });
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
                            tokens.push(SimpleToken {
                                text: &code[start..i],
                                output_offset: start,
                            });
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
                            tokens.push(SimpleToken {
                                text: &code[start..i],
                                output_offset: start,
                            });
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

    tokens
}
