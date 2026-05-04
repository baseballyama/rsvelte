//! Main entry point for svelte2tsx conversion.
//!
//! Converts Svelte component source files into TypeScript/TSX for type checking.
//! This is a Rust port of the `svelte2tsx` package used by the Svelte language server.

use std::fmt;

use crate::ast::template::Root;
use crate::compiler::phases::phase1_parse::{self, ParseOptions};

use super::magic_string::MagicString;
use super::script::{ComponentEvents, ExportedNames};
use super::template;

// =============================================================================
// Options
// =============================================================================

/// The output mode for svelte2tsx.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum Svelte2TsxMode {
    /// Full TypeScript output (for type checking `.svelte` files).
    #[default]
    Ts,
    /// Declaration output (for generating `.d.ts` files).
    Dts,
}

/// Namespace for elements (mirrors the compiler's Namespace).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum Svelte2TsxNamespace {
    #[default]
    Html,
    Svg,
    Mathml,
}

/// Svelte version target.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum SvelteVersion {
    /// Svelte 4 (legacy class-based component export).
    V4,
    /// Svelte 5 (runes, isomorphic component export).
    #[default]
    V5,
}

/// Options for the svelte2tsx conversion.
#[derive(Debug, Clone)]
pub struct Svelte2TsxOptions {
    /// The filename of the Svelte component (e.g., "App.svelte").
    pub filename: String,
    /// Whether the file uses TypeScript (`lang="ts"` on script tag).
    /// Auto-detected from filename if not set.
    pub is_ts_file: bool,
    /// Output mode: full TypeScript or declaration file.
    pub mode: Svelte2TsxMode,
    /// Whether to generate accessors for props.
    pub accessors: bool,
    /// The namespace for elements.
    pub namespace: Svelte2TsxNamespace,
    /// Svelte version target (affects component export format).
    pub version: SvelteVersion,
    /// Whether to use the new Svelte 5 runes mode.
    /// When None, auto-detected from source.
    pub runes: Option<bool>,
    /// Whether to emit JSDoc format for component export instead of TypeScript syntax.
    /// When true and not a TS file, uses `export const` + `/** @typedef */` format.
    pub emit_jsdoc: bool,
}

impl Default for Svelte2TsxOptions {
    fn default() -> Self {
        Self {
            filename: "Input.svelte".to_string(),
            is_ts_file: false,
            mode: Svelte2TsxMode::Ts,
            accessors: false,
            namespace: Svelte2TsxNamespace::Html,
            version: SvelteVersion::V5,
            runes: None,
            emit_jsdoc: false,
        }
    }
}

// =============================================================================
// Result
// =============================================================================

/// The result of a svelte2tsx conversion.
#[derive(Debug, Clone)]
pub struct Svelte2TsxResult {
    /// The generated TypeScript/TSX code.
    pub code: String,
    /// Source map (JSON string), if requested.
    pub map: Option<String>,
    /// Names exported from the component (for tooling integration).
    pub exported_names: ExportedNames,
    /// Events declared by the component.
    pub events: ComponentEvents,
}

// =============================================================================
// Error
// =============================================================================

/// Error type for svelte2tsx conversion failures.
#[derive(Debug)]
pub enum Svelte2TsxError {
    /// Failed to parse the Svelte source.
    Parse(crate::error::ParseError),
    /// Failed during template processing.
    Template(String),
    /// Failed during script processing.
    Script(String),
    /// Generic error.
    Other(String),
}

impl fmt::Display for Svelte2TsxError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Svelte2TsxError::Parse(e) => write!(f, "Parse error: {:?}", e),
            Svelte2TsxError::Template(msg) => write!(f, "Template error: {}", msg),
            Svelte2TsxError::Script(msg) => write!(f, "Script error: {}", msg),
            Svelte2TsxError::Other(msg) => write!(f, "svelte2tsx error: {}", msg),
        }
    }
}

impl std::error::Error for Svelte2TsxError {}

impl From<crate::error::ParseError> for Svelte2TsxError {
    fn from(err: crate::error::ParseError) -> Self {
        Svelte2TsxError::Parse(err)
    }
}

// =============================================================================
// Main entry point
// =============================================================================

/// Convert a Svelte component source to TypeScript/TSX for type checking.
///
/// This is the main entry point for the svelte2tsx module. It:
/// 1. Parses the Svelte source using the existing parser
/// 2. Processes the template nodes to generate TSX element expressions
/// 3. Processes script blocks to extract exports, props, and events
/// 4. Wraps everything in a `$$render()` function and component class/const export
///
/// # Arguments
///
/// * `source` - The Svelte component source code
/// * `options` - Conversion options (filename, mode, version, etc.)
///
/// # Returns
///
/// A `Svelte2TsxResult` containing the generated TypeScript code and metadata.
///
/// # Example
///
/// ```rust,ignore
/// use svelte_compiler_rust::svelte2tsx::{svelte2tsx, Svelte2TsxOptions};
///
/// let source = "<h1>Hello</h1>";
/// let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
/// println!("{}", result.code);
/// ```
pub fn svelte2tsx(
    source: &str,
    options: Svelte2TsxOptions,
) -> Result<Svelte2TsxResult, Svelte2TsxError> {
    // Step 1: Parse the Svelte source using the existing parser
    let parse_options = ParseOptions {
        modern: true,
        loose: false,
        skip_expression_loc: false,
        defer_script_parse: false,
    };
    let ast = phase1_parse::parse(source, parse_options)?;

    // Step 2: Determine component name from filename
    let component_name = derive_component_name(&options.filename);

    // Step 3: Detect runes mode (preliminary check from svelte:options)
    let explicit_runes = options.runes.unwrap_or_else(|| detect_runes_mode(&ast));

    // Step 4: Create the MagicString for in-place source manipulation
    let mut str = MagicString::new(source);

    // Step 5: Initialize tracking structures
    let mut exported_names = ExportedNames::new();
    let mut events = ComponentEvents::new();

    if explicit_runes {
        exported_names.set_uses_runes(true);
    }

    // Step 6: Process module script (<script context="module">)
    if let Some(ref module) = ast.module {
        super::script::process_module_script(module, source, &mut str, &mut exported_names);
    }

    // Step 7: Process instance script (<script>)
    let basename = std::path::Path::new(&options.filename)
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_string();
    let script_generic_names: std::collections::HashSet<String> = ast
        .instance
        .as_ref()
        .map(|instance| {
            let tag_text = &source[instance.start as usize..instance.content_offset as usize];
            extract_generics_from_script_tag(tag_text)
        })
        .unwrap_or_default()
        .map(|raw| {
            split_generic_param_names(&raw)
                .into_iter()
                .collect::<std::collections::HashSet<String>>()
        })
        .unwrap_or_default();
    if let Some(ref instance) = ast.instance {
        super::script::process_instance_script(
            instance,
            source,
            &mut str,
            &mut exported_names,
            &mut events,
            options.is_ts_file,
            &basename,
            options.emit_jsdoc,
            matches!(options.mode, Svelte2TsxMode::Dts),
            &script_generic_names,
        );
    }

    // Step 7.5: Early slot detection (before script tag overwrites)
    let has_slot_elements = source.contains("<slot") || source.contains("<slot>");

    // Step 7.6: Process <svelte:options> tag as a createElement call
    // The parser stores svelte:options in ast.options (not in fragment.nodes),
    // so we need to handle it separately.
    if let Some(ref options_node) = ast.options {
        if options_node.start < options_node.end {
            // Build attribute string from options attributes
            let mut attrs_parts = Vec::new();
            let mut has_expression_attr = false;
            for node in &options_node.attributes {
                match &node.value {
                    crate::ast::template::AttributeValue::True(_) => {
                        attrs_parts.push(format!("\"{}\":true,", node.name));
                    }
                    crate::ast::template::AttributeValue::Expression(expr) => {
                        has_expression_attr = true;
                        let expr_text = &source[expr.expression.start().unwrap_or(0) as usize
                            ..expr.expression.end().unwrap_or(0) as usize];
                        attrs_parts.push(format!("\"{}\":{},", node.name, expr_text));
                    }
                    _ => {}
                }
            }
            let attrs_str = if attrs_parts.is_empty() {
                String::new()
            } else if has_expression_attr {
                // Expression attributes: preserve source spacing
                let extra_spaces = count_tag_to_attr_spaces_in_source(
                    "svelte:options",
                    options_node.start,
                    source,
                );
                format!("{}{}", " ".repeat(extra_spaces + 1), attrs_parts.join(""))
            } else {
                // Bare boolean attributes only: no extra spacing
                attrs_parts.join("")
            };
            let replacement = format!(
                " {{ svelteHTML.createElement(\"svelte:options\", {{{}}});}}",
                attrs_str
            );
            str.overwrite(options_node.start, options_node.end, &replacement);
        }
    }

    // Step 8: Blank out <style> tag (CSS is not relevant for TSX type checking)
    //
    //
    // First blank any style tag the parser captured in ast.css.
    // Then ALWAYS run the fallback scanner to catch style tags the parser
    // did not capture (e.g., <style global>, custom attributes).
    let mut blanked_style_ranges: Vec<(usize, usize)> = Vec::new();
    if let Some(ref css) = ast.css {
        if css.start < css.end {
            // Also blank any trailing whitespace after the style tag
            let mut blank_end = css.end;
            let bytes = source.as_bytes();
            while (blank_end as usize) < bytes.len() {
                let b = bytes[blank_end as usize];
                if b == b' ' || b == b'\t' || b == b'\n' || b == b'\r' {
                    blank_end += 1;
                } else {
                    break;
                }
            }
            str.overwrite(css.start, blank_end, "");
            blanked_style_ranges.push((css.start as usize, blank_end as usize));
        }
    }
    {
        // Fallback: scan source for <style tags that the parser didn't
        // capture in ast.css (e.g., <style global>, <style lang="...">).
        // Blank them out by finding the matching </style>.
        // Exclude positions inside script tags to avoid matching <style>
        // inside template literals or string content.
        let script_ranges: Vec<(usize, usize)> = {
            let mut ranges = Vec::new();
            if let Some(ref inst) = ast.instance {
                ranges.push((inst.start as usize, inst.end as usize));
            }
            if let Some(ref module) = ast.module {
                ranges.push((module.start as usize, module.end as usize));
            }
            ranges
        };
        let is_inside_script =
            |pos: usize| -> bool { script_ranges.iter().any(|&(s, e)| pos >= s && pos < e) };
        let is_already_blanked = |pos: usize| -> bool {
            blanked_style_ranges
                .iter()
                .any(|&(s, e)| pos >= s && pos < e)
        };

        let src_lower = source.to_lowercase();
        let mut search_from = 0;
        while let Some(style_start) = src_lower[search_from..].find("<style") {
            let abs_start = search_from + style_start;
            // Skip if inside a script tag
            if is_inside_script(abs_start) {
                search_from = abs_start + 1;
                continue;
            }
            // Skip if already blanked by the primary handler
            if is_already_blanked(abs_start) {
                search_from = abs_start + 1;
                continue;
            }
            // Make sure it's a tag (next char is space, >, /, or newline)
            let after_tag = abs_start + 6;
            if after_tag < source.len() {
                let next_ch = source.as_bytes()[after_tag];
                if next_ch == b' '
                    || next_ch == b'>'
                    || next_ch == b'\n'
                    || next_ch == b'\r'
                    || next_ch == b'\t'
                    || next_ch == b'/'
                {
                    // Find the </style> closing tag
                    if let Some(close_pos) = src_lower[abs_start..].find("</style>") {
                        let abs_end = abs_start + close_pos + 8; // 8 = len("</style>")
                        let mut blank_end = abs_end as u32;
                        let bytes = source.as_bytes();
                        while (blank_end as usize) < bytes.len() {
                            let b = bytes[blank_end as usize];
                            if b == b' ' || b == b'\t' || b == b'\n' || b == b'\r' {
                                blank_end += 1;
                            } else {
                                break;
                            }
                        }
                        str.overwrite(abs_start as u32, blank_end, "");
                        search_from = abs_end;
                        continue;
                    }
                }
            }
            search_from = abs_start + 1;
        }
    }

    // Step 8.5: Detect $$props, $$restProps, $$slots usage in source (before wrapping)
    let uses_dollar_props = source.contains("$$props");
    let uses_dollar_rest_props = source.contains("$$restProps");
    let uses_dollar_slots = source.contains("$$slots");

    // Step 9: Process template nodes in-place via MagicString
    template::process_template_inplace(&ast.fragment, source, &options, &mut str);

    // Step 9.1: Hoist top-level `{#snippet}` blocks.
    //
    // Two destinations:
    // - **Outside `$$render` (module-level)** — when the source has a
    //   `<script context="module">` AND the snippet body's free variables only
    //   reference module-script bindings, imports, params, or globals. Matches
    //   the JS reference's `hoist_to_module` branch in `index.ts`.
    // - **Inside `$$render` (top of body)** — the default for snippets that
    //   close over instance-script values, or when there's no module script.
    //
    // The "outside" target is `script_tag_close_pos = instance.content_offset - 1`,
    // i.e. the byte position of the `>` of `<script>`. The script-tag overwrite
    // in Step 10 is split there so the moved snippet chunks land between the
    // imports / `;type` block and the `function $$render() {` declaration.
    let mut hoistable_snippet_ranges: Vec<(u32, u32)> = Vec::new();
    let mut nonhoistable_snippet_ranges: Vec<(u32, u32)> = Vec::new();
    {
        let module_script_present = ast.module.is_some();
        let has_instance = ast.instance.is_some();

        // Collect every top-level snippet first so we can run a fixed-point
        // pass over their inter-dependencies (a snippet that references the
        // name of a non-hoistable snippet is itself non-hoistable).
        let snippets: Vec<&crate::ast::template::SnippetBlock> = ast
            .fragment
            .nodes
            .iter()
            .filter_map(|n| {
                if let crate::ast::template::TemplateNode::SnippetBlock(s) = n {
                    if s.start < s.end {
                        Some(s.as_ref())
                    } else {
                        None
                    }
                } else {
                    None
                }
            })
            .collect();

        let snippet_names: Vec<String> = snippets
            .iter()
            .filter_map(|s| {
                let exp_s = s.expression.start()? as usize;
                let exp_e = s.expression.end()? as usize;
                source.get(exp_s..exp_e).map(|s| s.to_string())
            })
            .collect();
        let snippet_name_set: std::collections::HashSet<String> =
            snippet_names.iter().cloned().collect();

        // Initial blocked set: snippets that directly reference an
        // instance-script value (or a $store of one).
        let mut blocked = vec![false; snippets.len()];
        if module_script_present {
            for (i, snippet) in snippets.iter().enumerate() {
                if !is_snippet_module_hoistable(snippet, source, &exported_names) {
                    blocked[i] = true;
                }
            }

            // Fixed-point: a snippet that references the name of a blocked
            // snippet is itself blocked. Matches the JS reference's `while`
            // loop in `analyzeSnippets` that grows `disallowed_values`.
            let mut changed = true;
            while changed {
                changed = false;
                for i in 0..snippets.len() {
                    if blocked[i] {
                        continue;
                    }
                    let body_start = snippets[i].start as usize;
                    let body_end = snippets[i].end as usize;
                    if body_start >= source.len() || body_end > source.len() {
                        continue;
                    }
                    for ident in lexical_identifiers(&source[body_start..body_end]) {
                        if ident == snippet_names[i] {
                            continue; // self-reference
                        }
                        if snippet_name_set.contains(&ident) {
                            for (j, name) in snippet_names.iter().enumerate() {
                                if name == &ident && blocked[j] {
                                    blocked[i] = true;
                                    changed = true;
                                    break;
                                }
                            }
                            if blocked[i] {
                                break;
                            }
                        }
                    }
                }
            }
        } else {
            // No module script => everything stays inside $$render (or stays
            // put if no instance script exists either).
            for b in blocked.iter_mut() {
                *b = true;
            }
        }

        for (i, snippet) in snippets.iter().enumerate() {
            if blocked[i] {
                nonhoistable_snippet_ranges.push((snippet.start, snippet.end));
            } else {
                hoistable_snippet_ranges.push((snippet.start, snippet.end));
            }
        }

        // Inside-target moves require an instance script to anchor against.
        if let Some(instance) = ast.instance.as_ref() {
            let inside_target = instance.content_offset;
            for (s, e) in nonhoistable_snippet_ranges.iter() {
                str.move_range(*s, *e, inside_target);
            }
        }
        let _ = has_instance;
    }

    // Step 9.5: Collect slot and event information from the template
    let template_info = template::collect_template_info(&ast.fragment, source);

    // Step 10: Wrap in $$render() and add component export
    //
    // The JS svelte2tsx moves the script tag to position 0 (or after module script),
    // then overwrites <script> and </script> with the function wrapper.
    // We replicate this by:
    //   - Moving the script to position 0 if needed
    //   - Overwriting the <script> opening tag with `;function $$render() {\n`
    //   - Overwriting </script> with `;\nasync () => {`
    //   - For template-only components, prepending the wrapper

    let has_instance_script = ast.instance.is_some();
    let has_module_script = ast.module.is_some();

    // Determine the target position for the instance script.
    // If there's a module script, the instance script goes after it.
    let mut instance_script_target: u32 = 0;

    // IMPORTANT: All overwrites on script tag chunks must happen BEFORE any
    // move_range calls. MagicString.overwrite walks the linked list and after
    // a move, chunks from other parts of the source can appear between the
    // start and end positions, causing them to be blanked out.

    // Phase 1: Overwrite module script tags with `;` (before any moves)
    if has_module_script {
        let module = ast.module.as_ref().unwrap();
        let mod_start = module.start;
        let mod_end = module.end;
        let mod_content_start = module.content_offset;
        let mod_content_end = find_script_close_tag_start(source, mod_end);

        // Overwrite <script context="module"> with `;`
        if mod_start < mod_content_start {
            str.overwrite(mod_start, mod_content_start, ";");
        }

        // Overwrite </script> with `;`
        if mod_content_end < mod_end {
            str.overwrite(mod_content_end, mod_end, ";");
        }

        // When module is already at 0, instance goes right after it.
        // When module will be moved to 0, instance also goes to 0 (module
        // will be moved after instance, ending up before it).
        if mod_start == 0 {
            instance_script_target = mod_end;
        }
    }

    // Build $$props/$$restProps/$$slots declaration text for injection into $$render() header
    let mut dollar_decls = String::new();
    if uses_dollar_props {
        dollar_decls.push_str(" let $$props = __sveltets_2_allPropsType();");
    }
    if uses_dollar_rest_props {
        dollar_decls.push_str(" let $$restProps = __sveltets_2_restPropsType();");
    }
    if uses_dollar_slots {
        // Collect slot names from the template AST for $$slots declaration
        let slot_names = collect_slot_names_from_ast(&ast.fragment);
        let slots_obj: Vec<String> = slot_names
            .iter()
            .map(|name| format!("'{}': ''", name))
            .collect();
        dollar_decls.push_str(&format!(
            " let $$slots = __sveltets_2_slotsType({{{}}});",
            slots_obj.join(", ")
        ));
    }

    // Detect generics attribute from the script tag (available for component export)
    let mut generics_attribute: Option<String> = None;
    if has_instance_script {
        let instance = ast.instance.as_ref().unwrap();
        let script_tag_text = &source[instance.start as usize..instance.content_offset as usize];
        generics_attribute = extract_generics_from_script_tag(script_tag_text);
    }

    // Phase 2: Overwrite instance script tags and lift imports (before any moves)
    //
    // Import declarations inside the instance script are lifted above the
    // $$render() function so they appear at module scope in the output.
    // This matches the JS svelte2tsx behavior.
    if has_instance_script {
        let instance = ast.instance.as_ref().unwrap();
        let script_start = instance.start;
        let script_end = instance.end;
        let content_start = instance.content_offset;
        let content_end = find_script_close_tag_start(source, script_end);

        // Detect top-level `await` in the script content
        let raw_content = &source[content_start as usize..content_end as usize];
        let has_top_level_await = detect_top_level_await(raw_content);
        let async_prefix = if has_top_level_await { "async " } else { "" };

        // Detect `generics` attribute on the script tag
        let script_tag_text = &source[script_start as usize..content_start as usize];
        let generics_param = extract_generics_from_script_tag(script_tag_text);
        let render_generics = if !exported_names.dollar_generics.is_empty() {
            // Use $$Generic declarations (wrapped in ignore markers)
            exported_names.build_dollar_generics_str()
        } else {
            generics_param
                .as_ref()
                .map(|g| {
                    if options.is_ts_file {
                        // TS files: no ignore markers around generics
                        format!("<{}>", g)
                    } else {
                        // JS files: wrap generics content in ignore markers
                        format!(
                            "</*\u{03A9}ignore_start\u{03A9}*/{}>/*\u{03A9}ignore_end\u{03A9}*/",
                            g
                        )
                    }
                })
                .unwrap_or_default()
        };

        // Find import declarations in the instance script content
        let imports = find_instance_imports(instance, source);

        if !imports.is_empty() {
            // Lift imports above $$render(). Each import is collected
            // individually (without leading whitespace), then inserted
            // into the <script> tag replacement. The original import
            // positions are blanked with whitespace-preserving content.

            let mut import_text = String::new();
            for (i, &(import_start, import_end)) in imports.iter().enumerate() {
                let abs_start = import_start + content_start;
                let abs_end = import_end + content_start;
                let raw_text = &source[abs_start as usize..abs_end as usize];
                // Strip leading indentation from each line of lifted imports
                let text: String = raw_text
                    .lines()
                    .map(|line| line.trim_start())
                    .collect::<Vec<_>>()
                    .join("\n");

                // Check if there's a blank line before this import
                // (indicates an import group boundary)
                if i > 0 {
                    let prev_end = imports[i - 1].1 + content_start;
                    let between = &source[prev_end as usize..abs_start as usize];
                    let newline_count = between.chars().filter(|&c| c == '\n').count();
                    if newline_count >= 2 {
                        // Preserve blank line between import groups
                        import_text.push('\n');
                    }
                }

                import_text.push_str(&text);

                // Add semicolon to the last import if it doesn't have one
                if i == imports.len() - 1 {
                    let last_char = text.as_bytes()[text.len() - 1];
                    if last_char != b';' {
                        import_text.push_str(";\n");
                    } else {
                        import_text.push('\n');
                    }
                } else {
                    import_text.push('\n');
                }

                // Blank out the import in its original position.
                // The indentation before the import stays because it's
                // outside the import span.
                str.overwrite(abs_start, abs_end, "");
            }

            // Build $$ComponentProps type declaration for TS files
            //
            // Determine if the $$ComponentProps type must go INSIDE $$render
            // rather than before it. This is needed when the type references:
            // - `typeof x` (runtime value dependency on instance variables)
            // - generic type parameters from the `generics` attribute on <script>
            // - types that shadow module-level types
            let force_inside_render = exported_names.has_component_props_typedef
                && exported_names.props_type_text.is_some()
                && !exported_names.type_already_inserted
                && {
                    let type_text = exported_names.props_type_text.as_ref().unwrap();
                    // Check if type references runtime values via `typeof`
                    let has_typeof = type_text.contains("typeof ");
                    // Check if type references generics from $$render
                    let has_generic_dep = !render_generics.is_empty()
                        && generics_param
                            .as_ref()
                            .map(|g| {
                                // Extract generic param names and check if any appear in the type
                                split_generic_param_names(g)
                                    .iter()
                                    .any(|name| type_text.contains(name.as_str()))
                            })
                            .unwrap_or(false);
                    // Check if type references a type/interface name that is
                    // declared at the top level of the instance script AND
                    // *isn't* also slated for hoisting. References to a
                    // hoisted type are fine — the hoisted declaration sits
                    // above `function $$render()`, so referring to it from
                    // a hoisted `$$ComponentProps` resolves correctly.
                    let non_hoistable_instance_types: std::collections::HashSet<String> =
                        exported_names
                            .instance_type_names
                            .difference(&exported_names.hoistable_instance_type_names)
                            .cloned()
                            .collect();
                    let has_shadowed_type =
                        type_text_references_any(type_text, &non_hoistable_instance_types);
                    has_typeof || has_generic_dep || has_shadowed_type
                };

            let ts_component_props_before_render = if exported_names.has_component_props_typedef
                && exported_names.props_type_text.is_some()
                && !exported_names.type_already_inserted
                && !force_inside_render
            {
                let type_text = exported_names.props_type_text.as_ref().unwrap();
                format!(";type $$ComponentProps =  {};", type_text)
            } else {
                String::new()
            };

            // For best-effort auto-generated types, insert INSIDE $$render.
            //
            // If we have an explicit `props_let_abs_pos`, defer the insertion to
            // a `str.append_left` after the overwrite so the
            // `;type $$ComponentProps = ...;` lands right before the
            // `let { ... } = $props()` statement, matching the JS reference's
            // `preprendStr(node.parent.pos + astOffset, ...)` /
            // `move(generic_arg.pos, generic_arg.end, node.parent.pos)`.
            let inline_type_at_let = (force_inside_render || exported_names.type_already_inserted)
                && exported_names.props_let_abs_pos.is_some()
                && exported_names.props_type_text.is_some();
            let ts_component_props_inside_render = if (exported_names.type_already_inserted
                || force_inside_render)
                && exported_names.props_type_text.is_some()
                && !inline_type_at_let
            {
                let type_text = exported_names.props_type_text.as_ref().unwrap();
                if force_inside_render {
                    format!("\n;type $$ComponentProps =  {};", type_text)
                } else {
                    format!(
                        "\n/*\u{03A9}ignore_start\u{03A9}*/;type $$ComponentProps = {};/*\u{03A9}ignore_end\u{03A9}*/",
                        type_text
                    )
                }
            } else {
                String::new()
            };

            // Build the <script> replacement, split into two parts so that
            // module-hoistable snippets and types can be moved into the gap:
            //   Part A: `;\n[\n if module]<imports>`
            //   Part B: `<before_render_type><async_prefix>function $$render(){...`
            //
            // The synthesised `;type $$ComponentProps = ...;` lives in part_b
            // (not part_a) so it lands AFTER any hoisted type/interface
            // declarations — `$$ComponentProps` may reference them, so it has
            // to appear after them in the output.
            let mut part_a = String::from(";\n");
            if has_module_script {
                part_a.push('\n');
            }
            part_a.push_str(&import_text);
            let trailing_newline = if ts_component_props_inside_render.is_empty() {
                "\n"
            } else {
                ""
            };
            let part_b = format!(
                "{}{}function $$render{}() {{{}{}{}",
                ts_component_props_before_render,
                async_prefix,
                render_generics,
                dollar_decls,
                ts_component_props_inside_render,
                trailing_newline
            );

            let has_hoistable_chunks = !hoistable_snippet_ranges.is_empty()
                || !exported_names.hoistable_type_ranges.is_empty();
            // Split position: right after the `<` of `<script>`. This matches
            // the JS reference's `scriptTag.start + 1`, so moved chunks land
            // between the `;` (from the `<` overwrite) and the function
            // declaration that replaces the rest of the script tag.
            let split_pos = if has_hoistable_chunks && content_start > script_start + 1 {
                Some(script_start + 1)
            } else {
                None
            };
            if let Some(sp) = split_pos {
                if script_start < sp {
                    str.overwrite(script_start, sp, &part_a);
                }
                // Move hoistable type/interface declarations first so they
                // sit BEFORE the snippets in the chunk list, matching the JS
                // reference's `scriptTag.start + 1` ordering.
                //
                // Each chunk already extends backward through the original
                // leading whitespace (see `resolve_hoistable_type_decls`),
                // so a single `;` prepend is enough — the chunk supplies
                // its own newline + indent, and the trailing `;` mirrors
                // `appendLeft(node.end, ';')` from the JS reference so the
                // declaration is statement-terminated.
                let mut type_ranges = exported_names.hoistable_type_ranges.clone();
                type_ranges.sort_by_key(|(s, _)| *s);
                for (s, e) in type_ranges {
                    if s < e && (e as usize) <= source.len() {
                        // `prepend_right` / `append_left` add to the moved
                        // chunk itself (intro / outro of the [s..e] chunk),
                        // so the `;` markers travel with the chunk to its
                        // hoist target — `prepend_left` would leave the
                        // semicolon stranded at the original location.
                        str.prepend_right(s, ";");
                        str.append_left(e, ";");
                        str.move_range(s, e, sp);
                    }
                }
                for (s, e) in hoistable_snippet_ranges.iter() {
                    str.move_range(*s, *e, sp);
                }
                str.overwrite(sp, content_start, &part_b);
            } else if script_start < content_start {
                str.overwrite(
                    script_start,
                    content_start,
                    &format!("{}{}", part_a, part_b),
                );
            }

            if inline_type_at_let {
                if let (Some(let_pos), Some(type_text)) = (
                    exported_names.props_let_abs_pos,
                    exported_names.props_type_text.as_ref(),
                ) {
                    let snippet = if force_inside_render {
                        format!(";type $$ComponentProps =  {};", type_text)
                    } else {
                        // type_already_inserted (auto-generated SvelteKit / fallback type).
                        // JS reference wraps in surroundWithIgnoreComments.
                        format!(
                            "/*\u{03A9}ignore_start\u{03A9}*/;type $$ComponentProps = {};/*\u{03A9}ignore_end\u{03A9}*/",
                            type_text
                        )
                    };
                    str.append_left(let_pos, &snippet);
                }
            }
        } else {
            // No imports: overwrite the entire <script> tag at once
            let force_inside_render_no_imports = exported_names.has_component_props_typedef
                && exported_names.props_type_text.is_some()
                && !exported_names.type_already_inserted
                && {
                    let type_text = exported_names.props_type_text.as_ref().unwrap();
                    let has_typeof = type_text.contains("typeof ");
                    let has_generic_dep = !render_generics.is_empty()
                        && generics_param
                            .as_ref()
                            .map(|g| {
                                split_generic_param_names(g)
                                    .iter()
                                    .any(|name| type_text.contains(name.as_str()))
                            })
                            .unwrap_or(false);
                    let has_shadowed_type =
                        type_text_references_any(type_text, &exported_names.instance_type_names);
                    has_typeof || has_generic_dep || has_shadowed_type
                };

            let ts_component_props_before_render = if exported_names.has_component_props_typedef
                && exported_names.props_type_text.is_some()
                && !exported_names.type_already_inserted
                && !force_inside_render_no_imports
            {
                let type_text = exported_names.props_type_text.as_ref().unwrap();
                format!("\n;type $$ComponentProps =  {};", type_text)
            } else {
                String::new()
            };

            // For best-effort auto-generated types, insert INSIDE $$render.
            // See the imports branch above for the `inline_type_at_let` rationale.
            let inline_type_at_let = (force_inside_render_no_imports
                || exported_names.type_already_inserted)
                && exported_names.props_let_abs_pos.is_some()
                && exported_names.props_type_text.is_some();
            let ts_component_props_inside_render = if (exported_names.type_already_inserted
                || force_inside_render_no_imports)
                && exported_names.props_type_text.is_some()
                && !inline_type_at_let
            {
                let type_text = exported_names.props_type_text.as_ref().unwrap();
                if force_inside_render_no_imports {
                    format!("\n;type $$ComponentProps =  {};", type_text)
                } else {
                    format!(
                        "\n/*\u{03A9}ignore_start\u{03A9}*/;type $$ComponentProps = {};/*\u{03A9}ignore_end\u{03A9}*/",
                        type_text
                    )
                }
            } else {
                String::new()
            };

            let trailing_newline = if ts_component_props_inside_render.is_empty() {
                "\n"
            } else {
                ""
            };
            // No-imports branch: same split rationale as the imports branch
            // above — keep the synthesised `;type $$ComponentProps = ...;` in
            // part_b so it follows any hoisted type/interface declarations.
            let part_a = String::from(";");
            let part_b = format!(
                "{}{}function $$render{}() {{{}{}{}",
                ts_component_props_before_render,
                async_prefix,
                render_generics,
                dollar_decls,
                ts_component_props_inside_render,
                trailing_newline
            );
            let has_hoistable_chunks = !hoistable_snippet_ranges.is_empty()
                || !exported_names.hoistable_type_ranges.is_empty();
            // Split position: right after the `<` of `<script>`. This matches
            // the JS reference's `scriptTag.start + 1`, so moved chunks land
            // between the `;` (from the `<` overwrite) and the function
            // declaration that replaces the rest of the script tag.
            let split_pos = if has_hoistable_chunks && content_start > script_start + 1 {
                Some(script_start + 1)
            } else {
                None
            };
            if let Some(sp) = split_pos {
                if script_start < sp {
                    str.overwrite(script_start, sp, &part_a);
                }
                // Move hoistable type/interface declarations first so they
                // sit BEFORE the snippets in the chunk list, matching the JS
                // reference's `scriptTag.start + 1` ordering.
                //
                // Each chunk already extends backward through the original
                // leading whitespace (see `resolve_hoistable_type_decls`),
                // so a single `;` prepend is enough — the chunk supplies
                // its own newline + indent, and the trailing `;` mirrors
                // `appendLeft(node.end, ';')` from the JS reference so the
                // declaration is statement-terminated.
                let mut type_ranges = exported_names.hoistable_type_ranges.clone();
                type_ranges.sort_by_key(|(s, _)| *s);
                for (s, e) in type_ranges {
                    if s < e && (e as usize) <= source.len() {
                        // `prepend_right` / `append_left` add to the moved
                        // chunk itself (intro / outro of the [s..e] chunk),
                        // so the `;` markers travel with the chunk to its
                        // hoist target — `prepend_left` would leave the
                        // semicolon stranded at the original location.
                        str.prepend_right(s, ";");
                        str.append_left(e, ";");
                        str.move_range(s, e, sp);
                    }
                }
                for (s, e) in hoistable_snippet_ranges.iter() {
                    str.move_range(*s, *e, sp);
                }
                str.overwrite(sp, content_start, &part_b);
            } else if script_start < content_start {
                str.overwrite(
                    script_start,
                    content_start,
                    &format!("{}{}", part_a, part_b),
                );
            }

            if inline_type_at_let {
                if let (Some(let_pos), Some(type_text)) = (
                    exported_names.props_let_abs_pos,
                    exported_names.props_type_text.as_ref(),
                ) {
                    let snippet = if force_inside_render_no_imports {
                        format!(";type $$ComponentProps =  {};", type_text)
                    } else {
                        format!(
                            "/*\u{03A9}ignore_start\u{03A9}*/;type $$ComponentProps = {};/*\u{03A9}ignore_end\u{03A9}*/",
                            type_text
                        )
                    };
                    str.append_left(let_pos, &snippet);
                }
            }
        }

        // Overwrite `</script>` with slot declaration + `async () => {`.
        //
        // In DTS mode the JS reference skips `slotsDeclaration` entirely
        // (`slots.size > 0 && mode !== 'dts' ? ... : ''`) — the .d.ts output
        // doesn't need runtime slot helpers, so the createSlot binding would
        // just be dead code.
        if content_end < script_end {
            let emit_slot_decl = has_slot_elements && !matches!(options.mode, Svelte2TsxMode::Dts);
            if emit_slot_decl {
                let slot_generic = if exported_names.has_slots_type {
                    "<$$Slots>"
                } else {
                    ""
                };
                let slot_decl = format!(
                    "\n/*\u{03A9}ignore_start\u{03A9}*/;const __sveltets_createSlot = __sveltets_2_createCreateSlot{}();/*\u{03A9}ignore_end\u{03A9}*/;",
                    slot_generic
                );
                str.overwrite(
                    content_end,
                    script_end,
                    &format!("{}\nasync () => {{", slot_decl),
                );
            } else {
                str.overwrite(content_end, script_end, ";\nasync () => {");
            }
        }

        // Blank out trailing whitespace after </script> that is not part
        // of any template content. Must be done BEFORE moves, since the
        // overwrite walks the linked list.
        if (script_end as usize) < source.len() {
            let bytes = source.as_bytes();
            let mut trailing_end = script_end;
            while (trailing_end as usize) < bytes.len() {
                let b = bytes[trailing_end as usize];
                if b == b' ' || b == b'\t' || b == b'\n' || b == b'\r' {
                    trailing_end += 1;
                } else {
                    break;
                }
            }
            let has_template_node_after_script = ast.fragment.nodes.iter().any(|node| {
                let ns = node_start_pos(node);
                ns >= script_end && ns < trailing_end
            });
            if !has_template_node_after_script && trailing_end > script_end {
                str.overwrite(script_end, trailing_end, "");
            }
        }
    }

    // Phase 3: Move scripts to their target positions (after all overwrites)
    //
    // The target layout is: module script → instance script → template
    //
    // We must move instance FIRST, then module. When both move to position 0,
    // the second move (module) goes before the first (instance), giving the
    // correct ordering: module → instance → rest.
    if has_instance_script {
        let instance = ast.instance.as_ref().unwrap();
        let script_start = instance.start;
        let script_end = instance.end;

        if script_start != instance_script_target {
            str.move_range(script_start, script_end, instance_script_target);
        }
    }

    if has_module_script {
        let module = ast.module.as_ref().unwrap();
        let mod_start = module.start;
        let mod_end = module.end;

        if mod_start > 0 {
            str.move_range(mod_start, mod_end, 0);
        }
    }

    // Phase 4: Add reference types and component wrapper
    let is_dts_mode = matches!(options.mode, Svelte2TsxMode::Dts);
    let header_str = if is_dts_mode {
        "import { SvelteComponentTyped } from \"svelte\"\n\n"
    } else {
        "///<reference types=\"svelte\" />\n"
    };
    if has_instance_script {
        // Prepend the reference types
        str.prepend_str(header_str);
    } else if has_module_script {
        // Module script but no instance script
        let module = ast.module.as_ref().unwrap();
        let mod_content_start = module.content_offset;
        let mod_end = module.end;

        // Module-hoistable snippets land either:
        // - right after the last top-level import in the module script, or
        // - at `mod_content_start` (right after `<script module ...>`'s `>`)
        //   if the module has no imports.
        //
        // Mirrors the JS reference's `snippetHoistTargetForModule = lastImport
        // ? lastImport.end + moduleAst.astOffset : moduleAst.astOffset` and the
        // accompanying `appendLeft(target, '\n')` for the no-imports case.
        if !hoistable_snippet_ranges.is_empty() {
            let module_imports = find_instance_imports(module, source);
            let module_hoist_target = match module_imports.last() {
                Some(&(_, last_end)) => mod_content_start + last_end,
                None => mod_content_start,
            };
            // JS reference: `str.appendLeft(snippetHoistTargetForModule, '\n')`
            // for both the imports-present and no-imports branches.
            str.append_left(module_hoist_target, "\n");
            for (s, e) in hoistable_snippet_ranges.iter() {
                str.move_range(*s, *e, module_hoist_target);
            }
        }

        // For module-script-only components, inject store subscriptions for
        // module-level imports at the start of the $$render async wrapper.
        let store_decls = super::script::collect_module_import_store_declarations(source);
        // Suppress the `__sveltets_createSlot` binding in dts mode; matches
        // `createRenderFunction.ts`'s `slots.size > 0 && mode !== 'dts'` gate.
        let slot_decl_mod = if has_slot_elements && !is_dts_mode {
            "\n/*\u{03A9}ignore_start\u{03A9}*/;const __sveltets_createSlot = __sveltets_2_createCreateSlot();/*\u{03A9}ignore_end\u{03A9}*/"
        } else {
            ""
        };
        let render_open = format!(
            ";function $$render() {{{}\nasync () => {{{}{}",
            dollar_decls, store_decls, slot_decl_mod
        );
        str.append_left(mod_end, &render_open);

        // Blank out trailing whitespace after the module script ONLY when
        // there's no template content following. This ensures the async
        // wrapper closes immediately for module-script-only components.
        let has_non_whitespace_template = ast.fragment.nodes.iter().any(|node| {
            !matches!(node, crate::ast::template::TemplateNode::Text(t)
                if source[t.start as usize..t.end as usize].chars().all(|c| c.is_whitespace()))
        });
        if !has_non_whitespace_template && (mod_end as usize) < source.len() {
            let bytes = source.as_bytes();
            let mut trailing_end = mod_end;
            while (trailing_end as usize) < bytes.len() {
                let b = bytes[trailing_end as usize];
                if b == b' ' || b == b'\t' || b == b'\n' || b == b'\r' {
                    trailing_end += 1;
                } else {
                    break;
                }
            }
            if trailing_end > mod_end {
                str.overwrite(mod_end, trailing_end, "");
            }
        }

        str.prepend_str(header_str);
    } else {
        // No script tags at all: prepend the full wrapper
        let slot_decl_tmpl = if has_slot_elements && !is_dts_mode {
            "\n/*\u{03A9}ignore_start\u{03A9}*/;const __sveltets_createSlot = __sveltets_2_createCreateSlot();/*\u{03A9}ignore_end\u{03A9}*/"
        } else {
            ""
        };
        let wrapper = format!(
            "{};function $$render() {{{}{}\nasync () => {{",
            header_str, dollar_decls, slot_decl_tmpl
        );
        str.prepend_str(&wrapper);
    }

    // Append the closing of async wrapper, return statement, and component export
    let use_partial_with_any = uses_dollar_props || uses_dollar_rest_props;
    let props_str = if use_partial_with_any {
        // When $$props or $$restProps is used, props is just an empty object
        "{}".to_string()
    } else {
        exported_names.create_props_str(options.is_ts_file)
    };
    let is_svelte5 = matches!(options.version, SvelteVersion::V5);
    // Determine effective accessors setting: from options OR <svelte:options accessors>
    let effective_accessors = options.accessors
        || ast
            .options
            .as_ref()
            .and_then(|o| o.accessors)
            .unwrap_or(false);
    let exports_str = exported_names.create_exports_str_with_accessors(
        is_svelte5,
        effective_accessors,
        options.is_ts_file,
    );
    let bindings_str = exported_names.create_bindings_str(is_svelte5);
    let safe_name = format!("{}__SvelteComponent_", component_name);

    // Extract @component documentation from HTML comments
    let component_doc = extract_component_documentation(&ast.fragment);

    // Build slots string from template info
    let slots_str = if template_info.slots.is_empty() {
        "{}".to_string()
    } else {
        let mut slot_parts = Vec::new();
        for (name, props) in &template_info.slots {
            if props.is_empty() {
                slot_parts.push(format!("'{}': {{}}", name));
            } else {
                slot_parts.push(format!("'{}': {{{}}}", name, props.join(", ")));
            }
        }
        format!("{{{}}}", slot_parts.join(", "))
    };

    // Build events string from template info and component events
    let events_str = {
        let mut event_parts = Vec::new();
        // Add element events (forwarded)
        for (name, value) in &template_info.element_events {
            event_parts.push(format!("'{}':{}", name, value));
        }
        // Add custom events from dispatchers (detected during script processing)
        for (name, value) in events.get_event_entries() {
            event_parts.push(format!("'{}': {}", name, value));
        }
        // Add generic event typing from createEventDispatcher<Type>()
        if let Some(ref generic_type) = events.dispatcher_generic_type {
            event_parts.push(format!(
                "...__sveltets_2_toEventTypings<{}>()",
                generic_type
            ));
        }
        if event_parts.is_empty() {
            "{}".to_string()
        } else {
            format!("{{{}}}", event_parts.join(", "))
        }
    };

    let mut closing = String::new();
    closing.push_str("};\n");
    closing.push_str(&format!(
        "return {{ props: {}{}{}, slots: {}, events: {} }}}}\n",
        props_str, exports_str, bindings_str, slots_str, events_str,
    ));

    // Add component documentation as JSDoc comment before the component export
    if let Some(ref doc) = component_doc {
        closing.push_str(doc);
        closing.push('\n');
    }

    // Helper: build the prop_def string for the component export.
    // When $$props or $$restProps is used, use __sveltets_2_partial_with_any.
    let build_prop_def = |exported_names: &ExportedNames| -> String {
        if use_partial_with_any {
            "__sveltets_2_partial_with_any(__sveltets_2_with_any_event($$render()))".to_string()
        } else {
            let optional_props = exported_names.create_optional_props_array(options.is_ts_file);
            if optional_props.is_empty() {
                if options.is_ts_file && !exported_names.is_empty() {
                    // For TS files with `as {...}` type assertions on props,
                    // don't wrap with __sveltets_2_partial
                    "__sveltets_2_with_any_event($$render())".to_string()
                } else {
                    "__sveltets_2_partial(__sveltets_2_with_any_event($$render()))".to_string()
                }
            } else {
                format!(
                    "__sveltets_2_partial([{}], __sveltets_2_with_any_event($$render()))",
                    optional_props.join(",")
                )
            }
        }
    };

    // Determine if this component has generics (either from generics= attribute or $$Generic)
    let has_generics = !exported_names.dollar_generics.is_empty() || generics_attribute.is_some();

    // Build generics strings for component export
    let (generics_params, generics_names) = if !exported_names.dollar_generics.is_empty() {
        let params: Vec<String> = exported_names
            .dollar_generics
            .iter()
            .map(|(name, constraint)| {
                if let Some(c) = constraint {
                    format!("{} extends {}", name, c)
                } else {
                    name.clone()
                }
            })
            .collect();
        let names: Vec<String> = exported_names
            .dollar_generics
            .iter()
            .map(|(name, _)| name.clone())
            .collect();
        (params.join(","), names.join(","))
    } else if let Some(ref g) = generics_attribute {
        // Create compact params string (strip leading spaces from each param)
        let params_str = compact_generic_params(g);
        // Split generic params at top-level commas (not inside angle brackets)
        let names = split_generic_param_names(g);
        (params_str, names.join(","))
    } else {
        (String::new(), String::new())
    };

    match options.version {
        SvelteVersion::V4 => {
            let prop_def = build_prop_def(&exported_names);
            closing.push_str(&format!(
                "\nexport default class {} extends __sveltets_2_createSvelte2TsxComponent({}) {{\n}}",
                safe_name, prop_def
            ));
        }
        SvelteVersion::V5 => {
            let use_ts_syntax = options.is_ts_file || !options.emit_jsdoc;
            if exported_names.is_runes_mode() {
                if !use_ts_syntax {
                    // JS files with emitJsDoc: use `export const` and JSDoc typedef
                    closing.push_str(&format!(
                        "export const {} = __sveltets_2_fn_component($$render());\n",
                        safe_name
                    ));
                    closing.push_str(&format!(
                        "/*\u{03A9}ignore_start\u{03A9}*//** @typedef {{ReturnType<typeof {}>}} {} */\n",
                        safe_name, safe_name
                    ));
                    closing.push_str(&format!(
                        "/*\u{03A9}ignore_end\u{03A9}*/export default {};",
                        safe_name
                    ));
                } else {
                    closing.push_str(&format!(
                        "const {} = __sveltets_2_fn_component($$render());\n",
                        safe_name
                    ));
                    closing.push_str(&format!(
                        "/*\u{03A9}ignore_start\u{03A9}*/type {} = ReturnType<typeof {}>;\n",
                        safe_name, safe_name
                    ));
                    closing.push_str(&format!(
                        "/*\u{03A9}ignore_end\u{03A9}*/export default {};",
                        safe_name
                    ));
                }
            } else if has_generics {
                // Generics component export: __sveltets_Render + $$IsomorphicComponent
                let gp = &generics_params;
                let gn = &generics_names;
                let raw_bindings = exported_names.create_raw_bindings_str(is_svelte5);
                let raw_exports = exported_names.create_raw_exports_str(
                    is_svelte5,
                    effective_accessors,
                    options.is_ts_file,
                );

                // Determine if the component has exports (exported functions/consts)
                let has_real_exports = raw_exports == "$$HAS_EXPORTS$$";

                // Build __sveltets_Render class
                closing.push_str(&format!("class __sveltets_Render<{}> {{\n", gp));
                closing.push_str(&format!(
                    "    props() {{\n        return $$render<{}>().props;\n    }}\n",
                    gn
                ));
                closing.push_str(&format!("    events() {{\n        return __sveltets_2_with_any_event($$render<{}>()).events;\n    }}\n", gn));
                closing.push_str(&format!(
                    "    slots() {{\n        return $$render<{}>().slots;\n    }}\n",
                    gn
                ));
                closing.push_str(&format!("    bindings() {{ return {}; }}\n", raw_bindings));
                // exports() returns $$render().exports if there are real exports, {} otherwise
                let exports_return = if has_real_exports {
                    format!("$$render<{}>().exports", gn)
                } else {
                    raw_exports.clone()
                };
                closing.push_str(&format!("    exports() {{ return {}; }}\n", exports_return));
                closing.push_str("}\n\n");

                // Build `any` type params string: one `any` per generic param
                let any_params = generics_names
                    .split(',')
                    .map(|_| "any")
                    .collect::<Vec<_>>()
                    .join(",");

                // Determine if component has slot elements (for {children?: any} in constructor)
                let children_type_suffix = if has_slot_elements {
                    "& {children?: any}"
                } else {
                    ""
                };

                // Build $$IsomorphicComponent interface
                closing.push_str("interface $$IsomorphicComponent {\n");
                closing.push_str(&format!(
                    "    new <{}>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<{}>['props']>{}>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<{}>['props']>, ReturnType<__sveltets_Render<{}>['events']>, ReturnType<__sveltets_Render<{}>['slots']>> & {{ $$bindings?: ReturnType<__sveltets_Render<{}>['bindings']> }} & ReturnType<__sveltets_Render<{}>['exports']>;\n",
                    gp, gn, children_type_suffix, gn, gn, gn, gn, gn
                ));
                // Functional call signature: add $$slots and children only when component has slots
                let slots_children_suffix = if has_slot_elements {
                    format!(
                        ", $$slots?: ReturnType<__sveltets_Render<{}>['slots']>, children?: any",
                        gn
                    )
                } else {
                    String::new()
                };
                closing.push_str(&format!(
                    "    <{}>(internal: unknown, props: ReturnType<__sveltets_Render<{}>['props']> & {{$$events?: ReturnType<__sveltets_Render<{}>['events']>{}}}): ReturnType<__sveltets_Render<{}>['exports']>;\n",
                    gp, gn, gn, slots_children_suffix, gn
                ));
                closing.push_str(&format!(
                    "    z_$$bindings?: ReturnType<__sveltets_Render<{}>['bindings']>;\n",
                    any_params
                ));
                closing.push_str("}\n");

                // Component export
                closing.push_str(&format!(
                    "const {}: $$IsomorphicComponent = null as any;\n",
                    safe_name
                ));
                closing.push_str(&format!(
                    "/*\u{03A9}ignore_start\u{03A9}*/type {}<{}> = InstanceType<typeof {}<{}>>;\n",
                    safe_name, gp, safe_name, gn
                ));
                closing.push_str(&format!(
                    "/*\u{03A9}ignore_end\u{03A9}*/export default {};",
                    safe_name
                ));
            } else {
                let prop_def = build_prop_def(&exported_names);
                let has_non_empty_slots = !template_info.slots.is_empty();
                let component_fn = if has_non_empty_slots {
                    "__sveltets_2_isomorphic_component_slots"
                } else {
                    "__sveltets_2_isomorphic_component"
                };
                closing.push_str(&format!(
                    "const {} = {}({});\n",
                    safe_name, component_fn, prop_def
                ));
                closing.push_str(&format!(
                    "/*\u{03A9}ignore_start\u{03A9}*/type {} = InstanceType<typeof {}>;\n",
                    safe_name, safe_name
                ));
                closing.push_str(&format!(
                    "/*\u{03A9}ignore_end\u{03A9}*/export default {};",
                    safe_name
                ));
            }
        }
    }

    str.append_str(&closing);

    let code = str.to_string();

    Ok(Svelte2TsxResult {
        code,
        map: None, // TODO: Generate source map from MagicString
        exported_names,
        events,
    })
}

/// Collect slot names from the template AST.
///
/// Walks the fragment tree looking for `<slot>` elements and collects their names.
/// A slot without a `name` attribute is the "default" slot.
fn collect_slot_names_from_ast(fragment: &crate::ast::template::Fragment) -> Vec<String> {
    use crate::ast::template::TemplateNode;
    let mut names = Vec::new();
    collect_slot_names_recursive(&fragment.nodes, &mut names);
    // Deduplicate while preserving order
    let mut seen = std::collections::HashSet::new();
    names.retain(|n| seen.insert(n.clone()));
    names
}

fn collect_slot_names_recursive(
    nodes: &[crate::ast::template::TemplateNode],
    names: &mut Vec<String>,
) {
    use crate::ast::template::TemplateNode;
    for node in nodes {
        match node {
            TemplateNode::SlotElement(el) => {
                // Get slot name from the `name` attribute
                let mut slot_name = "default".to_string();
                for attr in &el.attributes {
                    if let crate::ast::template::Attribute::Attribute(node) = attr {
                        if node.name == "name" {
                            if let crate::ast::template::AttributeValue::Sequence(parts) =
                                &node.value
                            {
                                for part in parts {
                                    if let crate::ast::template::AttributeValuePart::Text(text) =
                                        part
                                    {
                                        slot_name = text.raw.to_string();
                                    }
                                }
                            }
                        }
                    }
                }
                names.push(slot_name);
                collect_slot_names_recursive(&el.fragment.nodes, names);
            }
            TemplateNode::RegularElement(el) => {
                collect_slot_names_recursive(&el.fragment.nodes, names);
            }
            TemplateNode::Component(comp) => {
                collect_slot_names_recursive(&comp.fragment.nodes, names);
            }
            TemplateNode::IfBlock(block) => {
                collect_slot_names_recursive(&block.consequent.nodes, names);
                if let Some(ref alt) = block.alternate {
                    collect_slot_names_recursive(&alt.nodes, names);
                }
            }
            TemplateNode::EachBlock(block) => {
                collect_slot_names_recursive(&block.body.nodes, names);
                if let Some(ref fallback) = block.fallback {
                    collect_slot_names_recursive(&fallback.nodes, names);
                }
            }
            TemplateNode::AwaitBlock(block) => {
                if let Some(ref pending) = block.pending {
                    collect_slot_names_recursive(&pending.nodes, names);
                }
                if let Some(ref then) = block.then {
                    collect_slot_names_recursive(&then.nodes, names);
                }
                if let Some(ref catch) = block.catch {
                    collect_slot_names_recursive(&catch.nodes, names);
                }
            }
            TemplateNode::KeyBlock(block) => {
                collect_slot_names_recursive(&block.fragment.nodes, names);
            }
            TemplateNode::SnippetBlock(block) => {
                collect_slot_names_recursive(&block.body.nodes, names);
            }
            TemplateNode::SvelteBody(el)
            | TemplateNode::SvelteDocument(el)
            | TemplateNode::SvelteFragment(el)
            | TemplateNode::SvelteBoundary(el)
            | TemplateNode::SvelteHead(el)
            | TemplateNode::SvelteOptions(el)
            | TemplateNode::SvelteSelf(el)
            | TemplateNode::SvelteWindow(el) => {
                collect_slot_names_recursive(&el.fragment.nodes, names);
            }
            TemplateNode::TitleElement(el) => {
                collect_slot_names_recursive(&el.fragment.nodes, names);
            }
            TemplateNode::SvelteComponent(comp) => {
                collect_slot_names_recursive(&comp.fragment.nodes, names);
            }
            TemplateNode::SvelteElement(el) => {
                collect_slot_names_recursive(&el.fragment.nodes, names);
            }
            _ => {}
        }
    }
}

/// Extract `@component` documentation from HTML comments in the template.
///
/// Looks for comments like `<!-- @component This is documentation -->` and
/// converts them to JSDoc format: `/** This is documentation */`.
///
/// Also handles multiline comments:
/// ```html
/// <!--
///   @component
///   Multi-line documentation
/// -->
/// ```
fn extract_component_documentation(fragment: &crate::ast::template::Fragment) -> Option<String> {
    use crate::ast::template::TemplateNode;

    for node in &fragment.nodes {
        if let TemplateNode::Comment(comment) = node {
            let data = comment.data.as_str().trim();
            if data.starts_with("@component") {
                // Extract the documentation text after @component
                let after_tag = data.strip_prefix("@component").unwrap();

                // If the text after @component starts with a newline, it's multiline
                let is_multiline = after_tag.contains('\n');

                if is_multiline {
                    // Collect all lines after @component
                    let mut lines: Vec<&str> = after_tag.lines().collect();

                    // Remove leading empty line (from the newline right after @component)
                    if !lines.is_empty() && lines[0].trim().is_empty() {
                        lines.remove(0);
                    }
                    // Remove trailing empty lines
                    while !lines.is_empty() && lines.last().unwrap().trim().is_empty() {
                        lines.pop();
                    }

                    if lines.is_empty() {
                        return Some("/** */".to_string());
                    }

                    // Detect base indentation from the first non-empty line
                    let base_indent = lines
                        .iter()
                        .filter(|l| !l.trim().is_empty())
                        .map(|l| l.len() - l.trim_start().len())
                        .min()
                        .unwrap_or(0);

                    let mut result = String::from("/**\n");
                    for line in &lines {
                        if line.trim().is_empty() {
                            result.push_str(" *\n");
                        } else {
                            let stripped = if line.len() > base_indent {
                                &line[base_indent..]
                            } else {
                                line.trim_start()
                            };
                            result.push_str(" * ");
                            result.push_str(stripped);
                            result.push('\n');
                        }
                    }
                    result.push_str(" */");
                    return Some(result);
                } else {
                    let doc_text = after_tag.trim();
                    if doc_text.is_empty() {
                        return Some("/** */".to_string());
                    }
                    return Some(format!("/** {} */", doc_text));
                }
            }
        }
    }

    None
}

/// Get the start position of a template node.
fn node_start_pos(node: &crate::ast::template::TemplateNode) -> u32 {
    use crate::ast::template::TemplateNode;
    match node {
        TemplateNode::Text(n) => n.start,
        TemplateNode::Comment(n) => n.start,
        TemplateNode::RegularElement(n) => n.start,
        TemplateNode::Component(n) => n.start,
        TemplateNode::ExpressionTag(n) => n.start,
        TemplateNode::IfBlock(n) => n.start,
        TemplateNode::EachBlock(n) => n.start,
        TemplateNode::AwaitBlock(n) => n.start,
        TemplateNode::KeyBlock(n) => n.start,
        TemplateNode::SnippetBlock(n) => n.start,
        TemplateNode::HtmlTag(n) => n.start,
        TemplateNode::ConstTag(n) => n.start,
        TemplateNode::DebugTag(n) => n.start,
        TemplateNode::RenderTag(n) => n.start,
        TemplateNode::AttachTag(n) => n.start,
        TemplateNode::TitleElement(n) => n.start,
        TemplateNode::SlotElement(n) => n.start,
        TemplateNode::SvelteComponent(n) => n.start,
        TemplateNode::SvelteElement(n) => n.start,
        TemplateNode::SvelteBody(n)
        | TemplateNode::SvelteDocument(n)
        | TemplateNode::SvelteFragment(n)
        | TemplateNode::SvelteBoundary(n)
        | TemplateNode::SvelteHead(n)
        | TemplateNode::SvelteOptions(n)
        | TemplateNode::SvelteSelf(n)
        | TemplateNode::SvelteWindow(n) => n.start,
    }
}

/// Get the end position of a template node.
fn node_end_pos(node: &crate::ast::template::TemplateNode) -> u32 {
    use crate::ast::template::TemplateNode;
    match node {
        TemplateNode::Text(n) => n.end,
        TemplateNode::Comment(n) => n.end,
        TemplateNode::RegularElement(n) => n.end,
        TemplateNode::Component(n) => n.end,
        TemplateNode::ExpressionTag(n) => n.end,
        TemplateNode::IfBlock(n) => n.end,
        TemplateNode::EachBlock(n) => n.end,
        TemplateNode::AwaitBlock(n) => n.end,
        TemplateNode::KeyBlock(n) => n.end,
        TemplateNode::SnippetBlock(n) => n.end,
        TemplateNode::HtmlTag(n) => n.end,
        TemplateNode::ConstTag(n) => n.end,
        TemplateNode::DebugTag(n) => n.end,
        TemplateNode::RenderTag(n) => n.end,
        TemplateNode::AttachTag(n) => n.end,
        TemplateNode::TitleElement(n) => n.end,
        TemplateNode::SlotElement(n) => n.end,
        TemplateNode::SvelteComponent(n) => n.end,
        TemplateNode::SvelteElement(n) => n.end,
        TemplateNode::SvelteBody(n)
        | TemplateNode::SvelteDocument(n)
        | TemplateNode::SvelteFragment(n)
        | TemplateNode::SvelteBoundary(n)
        | TemplateNode::SvelteHead(n)
        | TemplateNode::SvelteOptions(n)
        | TemplateNode::SvelteSelf(n)
        | TemplateNode::SvelteWindow(n) => n.end,
    }
}

/// Find the start of `</script>` tag by scanning backwards from the script end position.
fn find_script_close_tag_start(source: &str, script_end: u32) -> u32 {
    let bytes = source.as_bytes();
    let end = script_end as usize;
    let needle = b"</script>";
    let needle_len = needle.len();

    if end < needle_len {
        return script_end;
    }

    let mut i = end;
    while i >= needle_len {
        i -= 1;
        if i + needle_len <= end
            && bytes[i..i + needle_len]
                .iter()
                .zip(needle.iter())
                .all(|(a, b)| a.to_ascii_lowercase() == *b)
        {
            return i as u32;
        }
    }

    script_end
}

/// Find top-level import declarations in an instance script.
///
/// Returns a sorted list of (start, end) positions relative to the script
/// content (i.e., relative to `script.content_offset`).
fn find_instance_imports(script: &crate::ast::template::Script, source: &str) -> Vec<(u32, u32)> {
    use oxc_allocator::Allocator;
    use oxc_ast::ast as oxc;
    use oxc_parser::Parser as OxcParser;
    use oxc_span::SourceType;

    let content_start = script.content_offset as usize;
    let script_source = &source[script.start as usize..script.end as usize];
    let close_tag_offset = script_source
        .rfind("</script>")
        .or_else(|| script_source.rfind("</Script>"))
        .unwrap_or(script_source.len());
    let content_end = script.start as usize + close_tag_offset;
    let raw_content = &source[content_start..content_end];

    let allocator = Allocator::default();
    // Always use TypeScript source type for import detection.
    // TypeScript is a superset of JavaScript, so TS parsing handles
    // both `import type` (TS syntax) and regular imports correctly,
    // even when the script doesn't have `lang="ts"`.
    let source_type = SourceType::ts();
    let parser = OxcParser::new(&allocator, raw_content, source_type);
    let result = parser.parse();

    let mut imports = Vec::new();
    for stmt in result.program.body.iter() {
        if let oxc::Statement::ImportDeclaration(import) = stmt {
            // All import declarations (including side-effect imports like `import ''`)
            // should be lifted. The parser only creates ImportDeclaration nodes for
            // valid `import` statements with a source clause.
            let start = import.span.start;
            let end = import.span.end;

            // Include leading comments (e.g., `// @ts-ignore`, `/*hi*/`,
            // `/** @typedef ... */`) by scanning backwards from the import
            // start. Multiple comments separated by blank lines are all
            // pulled in — matches the JS svelte2tsx behaviour exposed by
            // `js-jsdoc-before-first-import`.
            let bytes = raw_content.as_bytes();
            let new_start = scan_back_past_leading_comments(bytes, start as usize);

            imports.push((new_start as u32, end));
        }
    }
    imports.sort_by_key(|&(s, _)| s);
    imports
}

/// Walk backwards from `pos` past whitespace, line comments (`// ...`), and
/// block comments (`/* ... */` including JSDoc), pulling each into the hoisted
/// region. Whitespace is only consumed when it precedes a comment we
/// successfully recognise — otherwise we keep the previous committed offset
/// so non-comment whitespace stays attached to the original line.
fn scan_back_past_leading_comments(bytes: &[u8], pos: usize) -> usize {
    let mut committed = pos;
    loop {
        // First try a comment immediately adjacent to `committed` (no
        // whitespace between, e.g. `/*hi*/import …`).
        if committed >= 2 && bytes[committed - 2] == b'*' && bytes[committed - 1] == b'/' {
            let prefix = &bytes[..committed - 2];
            if let Some(open) = find_last_two_byte_sequence(prefix, b'/', b'*') {
                committed = open;
                continue;
            }
        }
        // Otherwise probe past whitespace and look for a comment ending there.
        let mut p = committed;
        while p > 0 {
            let b = bytes[p - 1];
            if b == b' ' || b == b'\t' || b == b'\n' || b == b'\r' {
                p -= 1;
            } else {
                break;
            }
        }
        if p == 0 || p == committed {
            return committed;
        }
        // Block comment `*/` ending at p?
        if p >= 2 && bytes[p - 2] == b'*' && bytes[p - 1] == b'/' {
            let prefix = &bytes[..p - 2];
            if let Some(open) = find_last_two_byte_sequence(prefix, b'/', b'*') {
                committed = open;
                continue;
            } else {
                return committed;
            }
        }
        // Line comment `// ...` ending at p (just before the newline that p
        // skipped). Valid when the immediately-preceding line, after any
        // indentation, starts with `//`.
        let line_end = p;
        let mut line_start = line_end;
        while line_start > 0 && bytes[line_start - 1] != b'\n' {
            line_start -= 1;
        }
        let line = &bytes[line_start..line_end];
        let mut i = 0;
        while i < line.len() && (line[i] == b' ' || line[i] == b'\t') {
            i += 1;
        }
        if i + 1 < line.len() && line[i] == b'/' && line[i + 1] == b'/' {
            committed = line_start;
            continue;
        }
        return committed;
    }
}

fn find_last_two_byte_sequence(buf: &[u8], a: u8, b: u8) -> Option<usize> {
    if buf.len() < 2 {
        return None;
    }
    let mut i = buf.len() - 1;
    while i >= 1 {
        if buf[i - 1] == a && buf[i] == b {
            return Some(i - 1);
        }
        i -= 1;
    }
    None
}

/// Decide whether a top-level `{#snippet}` block is module-hoistable.
///
/// A snippet is module-hoistable when its body's free variables resolve only
/// to allowed references — imports, module-script values, snippet params,
/// or globals. References to instance-script values (`let`, `const`, etc.)
/// block hoisting. Matches the JS reference's
/// `hoist_to_module = (globals.size === 0 || every(isAllowedReference))`
/// in `svelte2tsx/index.ts`.
fn is_snippet_module_hoistable(
    snippet: &crate::ast::template::SnippetBlock,
    source: &str,
    exported_names: &super::script::ExportedNames,
) -> bool {
    // Param names shadow outer references inside the body.
    let mut params_set: std::collections::HashSet<String> = std::collections::HashSet::new();
    for p in snippet.parameters.iter() {
        if let (Some(s), Some(e)) = (p.start(), p.end()) {
            let s = s as usize;
            let e = e as usize;
            if s < e && e <= source.len() {
                for tok in lexical_identifiers(&source[s..e]) {
                    params_set.insert(tok);
                }
            }
        }
    }

    // Also exclude the snippet's own name from references (its declaration
    // shouldn't be considered a free var of itself).
    if let (Some(s), Some(e)) = (snippet.expression.start(), snippet.expression.end()) {
        let s = s as usize;
        let e = e as usize;
        if s < e && e <= source.len() {
            for tok in lexical_identifiers(&source[s..e]) {
                params_set.insert(tok);
            }
        }
    }

    // Use the entire snippet source range. Param identifiers are excluded
    // above; the lexical scan over the whole `{#snippet ...}` ... `{/snippet}`
    // range is conservative but adequate for fixture cases.
    let body_start = snippet.start;
    let body_end = snippet.end;
    if (body_start as usize) >= source.len() || (body_end as usize) > source.len() {
        return true;
    }
    let body_text = &source[body_start as usize..body_end as usize];

    // Lexical scan: any identifier in the body that resolves to an
    // instance-script value (and isn't an import or a snippet param) blocks
    // hoisting.
    //
    // `$name` references trigger auto-store subscription; the JS reference
    // adds the un-prefixed `name` to `disallowed_values` via
    // `addDisallowed(getAccessedStores())`, so any `$name` whose underlying
    // `name` is bound in the instance script (value OR import) also blocks.
    for ident in lexical_identifiers(body_text) {
        if params_set.contains(&ident) {
            continue;
        }
        if let Some(stripped) = ident.strip_prefix('$') {
            if !stripped.is_empty() && !stripped.starts_with('$') {
                // Auto-store subscription targets — `addDisallowed(getAccessedStores())`
                // in the JS reference is component-wide, so check both module
                // and instance scopes.
                if exported_names.instance_value_names.contains(stripped)
                    || exported_names.instance_import_names.contains(stripped)
                    || exported_names.module_value_names.contains(stripped)
                    || exported_names.module_import_names.contains(stripped)
                {
                    return false;
                }
            }
        }
        if exported_names.instance_value_names.contains(&ident)
            && !exported_names.instance_import_names.contains(&ident)
        {
            return false;
        }
    }
    true
}

/// Lex a string into ASCII-identifier tokens. Skips `//` and `/* */` comments
/// and `'`, `"`, ``\``` strings so identifiers inside literals aren't picked
/// up as references.
fn lexical_identifiers(text: &str) -> Vec<String> {
    let mut out = Vec::new();
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut i = 0usize;
    while i < len {
        let b = bytes[i];
        if b == b'/' && i + 1 < len {
            if bytes[i + 1] == b'/' {
                while i < len && bytes[i] != b'\n' {
                    i += 1;
                }
                continue;
            } else if bytes[i + 1] == b'*' {
                i += 2;
                while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i = (i + 2).min(len);
                continue;
            }
        }
        if b == b'\'' || b == b'"' || b == b'`' {
            let quote = b;
            i += 1;
            while i < len && bytes[i] != quote {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                    continue;
                }
                i += 1;
            }
            i = (i + 1).min(len);
            continue;
        }
        if is_ident_char(b) && !b.is_ascii_digit() {
            let start = i;
            i += 1;
            while i < len && is_ident_char(bytes[i]) {
                i += 1;
            }
            out.push(text[start..i].to_string());
            continue;
        }
        i += 1;
    }
    out
}

/// Return true if `type_text` mentions any of `names` as a whole identifier
/// (i.e. surrounded by non-identifier characters on both sides).
///
/// Used to detect when a `$$ComponentProps` body references a type/interface
/// or value declared at the top level of the instance script — in which case
/// the synthesised `;type $$ComponentProps = ...;` cannot be hoisted above
/// `function $$render()`.
fn type_text_references_any(type_text: &str, names: &std::collections::HashSet<String>) -> bool {
    if names.is_empty() {
        return false;
    }
    let bytes = type_text.as_bytes();
    for name in names.iter() {
        if name.is_empty() {
            continue;
        }
        let nbytes = name.as_bytes();
        let mut i = 0usize;
        while i + nbytes.len() <= bytes.len() {
            if &bytes[i..i + nbytes.len()] == nbytes {
                let before_ok = i == 0 || !is_ident_char(bytes[i - 1]);
                let after_idx = i + nbytes.len();
                let after_ok = after_idx == bytes.len() || !is_ident_char(bytes[after_idx]);
                if before_ok && after_ok {
                    return true;
                }
            }
            i += 1;
        }
    }
    false
}

#[inline]
fn is_ident_char(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'$'
}

/// Split a generics string like "T extends Record<string, any>, U" into
/// just the type parameter names: ["T", "U"].
/// Handles nested angle brackets and commas inside constraints.
fn split_generic_param_names(generics: &str) -> Vec<String> {
    let mut names = Vec::new();
    let mut depth = 0; // angle bracket depth
    let mut current_start = 0;

    for (i, ch) in generics.char_indices() {
        match ch {
            '<' => depth += 1,
            '>' => {
                if depth > 0 {
                    depth -= 1;
                }
            }
            ',' if depth == 0 => {
                let param = generics[current_start..i].trim();
                names.push(extract_param_name(param));
                current_start = i + 1;
            }
            _ => {}
        }
    }
    // Handle the last parameter
    let param = generics[current_start..].trim();
    if !param.is_empty() {
        names.push(extract_param_name(param));
    }
    names
}

/// Compact a generics string by stripping leading spaces from each top-level parameter.
/// "A, B extends keyof A, C extends boolean" → "A,B extends keyof A,C extends boolean"
fn compact_generic_params(generics: &str) -> String {
    let mut result = String::new();
    let mut depth = 0;
    let mut after_comma = false;

    for ch in generics.chars() {
        match ch {
            '<' => {
                depth += 1;
                result.push(ch);
            }
            '>' => {
                if depth > 0 {
                    depth -= 1;
                }
                result.push(ch);
            }
            ',' if depth == 0 => {
                result.push(',');
                after_comma = true;
            }
            ' ' | '\t' if after_comma => {
                // Skip leading whitespace after comma at top level
                continue;
            }
            _ => {
                after_comma = false;
                result.push(ch);
            }
        }
    }
    result
}

/// Extract the type parameter name from a parameter declaration,
/// handling the `const` modifier (e.g., `const T extends ...` → `T`).
fn extract_param_name(param: &str) -> String {
    let mut words = param.split_whitespace();
    let first = words.next().unwrap_or("");
    if first == "const" {
        // Skip `const` modifier, take the next word
        words.next().unwrap_or(first).to_string()
    } else {
        first.to_string()
    }
}

/// Detect whether a script content contains top-level `await` expressions.
///
/// Uses OXC to parse the content as a module (which allows top-level await)
/// and checks for AwaitExpression at the top level of the program body.
fn detect_top_level_await(content: &str) -> bool {
    use oxc_allocator::Allocator;
    use oxc_ast::ast as oxc;
    use oxc_parser::Parser as OxcParser;
    use oxc_span::SourceType;

    let allocator = Allocator::default();
    let source_type = SourceType::ts().with_module(true);
    let parser = OxcParser::new(&allocator, content, source_type);
    let result = parser.parse();

    // Look for top-level variable declarations with await in their init,
    // or top-level expression statements with await.
    for stmt in result.program.body.iter() {
        match stmt {
            oxc::Statement::VariableDeclaration(decl) => {
                for declarator in decl.declarations.iter() {
                    if let Some(ref init) = declarator.init {
                        if contains_await_expression(init) {
                            return true;
                        }
                    }
                }
            }
            oxc::Statement::ExpressionStatement(expr) => {
                if contains_await_expression(&expr.expression) {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}

/// Check if an expression is or contains an AwaitExpression (shallow check).
fn contains_await_expression(expr: &oxc_ast::ast::Expression) -> bool {
    matches!(expr, oxc_ast::ast::Expression::AwaitExpression(_))
}

// =============================================================================
// Internal helpers
// =============================================================================

/// Derive a safe component name from the filename.
///
/// Converts "App.svelte" -> "App", "my-component.svelte" -> "My_component",
/// handles path separators and special characters.
/// Count whitespace between tag name and first attribute in source.
fn count_tag_to_attr_spaces_in_source(tag_name: &str, el_start: u32, source: &str) -> usize {
    let name_end = el_start as usize + 1 + tag_name.len(); // +1 for '<'
    let bytes = source.as_bytes();
    let mut count = 0;
    let mut i = name_end;
    while i < source.len() {
        let ch = bytes[i];
        if ch == b' ' || ch == b'\t' || ch == b'\n' || ch == b'\r' {
            count += 1;
            i += 1;
        } else {
            break;
        }
    }
    count
}

/// Extract the `generics` attribute value from a script tag text.
fn extract_generics_from_script_tag(tag_text: &str) -> Option<String> {
    if let Some(pos) = tag_text.find("generics=") {
        let after = &tag_text[pos + 9..];
        let trimmed = after.trim_start();
        if let Some(quote_char) = trimmed.chars().next() {
            if quote_char == '"' || quote_char == '\'' {
                let content = &trimmed[1..];
                if let Some(end) = content.find(quote_char) {
                    return Some(content[..end].to_string());
                }
            } else {
                // Unquoted value: take until whitespace or `>`
                let end = trimmed
                    .find(|c: char| c.is_whitespace() || c == '>')
                    .unwrap_or(trimmed.len());
                if end > 0 {
                    return Some(trimmed[..end].to_string());
                }
            }
        }
    }
    None
}

fn derive_component_name(filename: &str) -> String {
    // Extract the file stem (without directory and extension)
    let stem = filename.rsplit(['/', '\\']).next().unwrap_or(filename);
    let stem = stem.strip_suffix(".svelte").unwrap_or(stem);
    // Strip leading `+` (SvelteKit convention: +page.svelte -> Page)
    let stem = stem.strip_prefix('+').unwrap_or(stem);

    // Replace invalid identifier characters with underscores
    let mut name = String::with_capacity(stem.len());
    for (i, ch) in stem.chars().enumerate() {
        if ch.is_alphanumeric() || ch == '_' {
            name.push(ch);
        } else if ch == '-' || ch == '.' {
            name.push('_');
        } else if i == 0 {
            name.push('_');
        } else {
            name.push('_');
        }
    }

    // Ensure the name starts with a letter or underscore
    if name.is_empty() {
        return "Component".to_string();
    }
    if name.chars().next().unwrap().is_ascii_digit() {
        name.insert(0, '_');
    }

    // Capitalize the first letter (matches JS svelte2tsx behavior)
    let mut chars = name.chars();
    if let Some(first) = chars.next() {
        let capitalized: String = first.to_uppercase().chain(chars).collect();
        return capitalized;
    }

    name
}

/// Detect whether the component uses Svelte 5 runes mode.
///
/// Checks for the presence of `$props()`, `$state()`, `$derived()`, etc. in script content,
/// or `runes: true` in `<svelte:options>`.
fn detect_runes_mode(ast: &Root) -> bool {
    // Check svelte:options for explicit runes setting
    if let Some(ref options) = ast.options
        && let Some(runes) = options.runes
    {
        return runes;
    }

    // Don't default to runes mode; let process_instance_script detect rune usage
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_derive_component_name() {
        assert_eq!(derive_component_name("App.svelte"), "App");
        assert_eq!(derive_component_name("my-component.svelte"), "My_component");
        assert_eq!(derive_component_name("my_component.svelte"), "My_component");
        assert_eq!(derive_component_name("path/to/Input.svelte"), "Input");
        assert_eq!(derive_component_name("123.svelte"), "_123");
        assert_eq!(derive_component_name(".svelte"), "Component");
    }

    #[test]
    fn test_svelte2tsx_simple_template() {
        let source = "<h1>hello</h1>";
        let result = svelte2tsx(source, Svelte2TsxOptions::default());
        assert!(
            result.is_ok(),
            "svelte2tsx should not fail: {:?}",
            result.err()
        );
        let result = result.unwrap();
        eprintln!("OUTPUT:\n{}", result.code);
        assert!(
            result.code.contains("///<reference types=\"svelte\" />"),
            "Should contain reference types"
        );
        assert!(
            result.code.contains("function $$render()"),
            "Should contain $$render function"
        );
        assert!(
            result.code.contains("svelteHTML.createElement(\"h1\","),
            "Should contain createElement(\"h1\")"
        );
        assert!(
            result.code.contains("async () => {"),
            "Should contain async wrapper"
        );
        assert!(
            result.code.contains("return { props:"),
            "Should contain return statement"
        );
        assert!(
            result.code.contains("__SvelteComponent_"),
            "Should contain component export"
        );
    }

    #[test]
    fn test_svelte2tsx_template_with_expression() {
        let source = "<p>{count}</p>";
        let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
        eprintln!("OUTPUT:\n{}", result.code);
        assert!(
            result.code.contains("svelteHTML.createElement(\"p\","),
            "Should contain createElement(\"p\")"
        );
        // The expression tag `{count}` should be transformed to `count;`
        assert!(
            result.code.contains("count;"),
            "Should contain the expression as a statement"
        );
    }

    #[test]
    fn test_svelte2tsx_element_with_attribute() {
        let source = "<div class=\"foo\">bar</div>";
        let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
        eprintln!("OUTPUT:\n{}", result.code);
        assert!(
            result.code.contains("svelteHTML.createElement(\"div\","),
            "Should contain createElement(\"div\")"
        );
        assert!(
            result.code.contains("\"class\""),
            "Should contain class attribute"
        );
    }

    #[test]
    fn test_svelte2tsx_if_block() {
        let source = "{#if show}<p>visible</p>{/if}";
        let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
        eprintln!("OUTPUT:\n{}", result.code);
        assert!(
            result.code.contains("if(show)"),
            "Should contain if(show), got: {}",
            result.code
        );
    }

    #[test]
    fn test_svelte2tsx_each_block() {
        let source = "{#each items as item}<p>{item}</p>{/each}";
        let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
        eprintln!("OUTPUT:\n{}", result.code);
        assert!(
            result.code.contains("__sveltets_2_ensureArray(items)"),
            "Should contain ensureArray, got: {}",
            result.code
        );
        assert!(
            result.code.contains("for(let item of"),
            "Should contain for loop, got: {}",
            result.code
        );
    }

    #[test]
    fn test_svelte2tsx_component() {
        let source = "<Component />";
        let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
        eprintln!("OUTPUT:\n{}", result.code);
        assert!(
            result
                .code
                .contains("__sveltets_2_ensureComponent(Component)"),
            "Should contain ensureComponent, got: {}",
            result.code
        );
        assert!(
            result.code.contains("$$_tnenopmoC0C"),
            "Should contain reversed component name, got: {}",
            result.code
        );
    }

    #[test]
    fn test_svelte2tsx_v5_export() {
        let source = "<h1>hello</h1>";
        let options = Svelte2TsxOptions {
            version: SvelteVersion::V5,
            ..Default::default()
        };
        let result = svelte2tsx(source, options).unwrap();
        assert!(
            result.code.contains("__sveltets_2_isomorphic_component"),
            "V5 should use isomorphic_component"
        );
    }

    #[test]
    fn test_svelte2tsx_v4_export() {
        let source = "<h1>hello</h1>";
        let options = Svelte2TsxOptions {
            version: SvelteVersion::V4,
            ..Default::default()
        };
        let result = svelte2tsx(source, options).unwrap();
        assert!(
            result
                .code
                .contains("__sveltets_2_createSvelte2TsxComponent"),
            "V4 should use createSvelte2TsxComponent"
        );
        assert!(
            result.code.contains("export default class"),
            "V4 should use class export"
        );
    }

    #[test]
    fn test_svelte2tsx_with_script() {
        let source = "<script>let x = 1;</script>\n<h1>{x}</h1>";
        let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
        eprintln!("OUTPUT:\n{}", result.code);
        assert!(
            result.code.contains("function $$render()"),
            "Should contain $$render function"
        );
        // Script content should be preserved in place
        assert!(
            result.code.contains("let x = 1;"),
            "Script content should be preserved"
        );
        assert!(
            result.code.contains("async () => {"),
            "Should contain async wrapper after script"
        );
    }

    #[test]
    fn test_svelte2tsx_comment_removed() {
        let source = "<!-- comment --><h1>hello</h1>";
        let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
        eprintln!("OUTPUT:\n{}", result.code);
        assert!(
            !result.code.contains("<!-- comment -->"),
            "Comments should be removed"
        );
    }

    #[test]
    fn test_svelte2tsx_module_and_script_inline() {
        let source = "<script context=\"module\">let b = 5;</script><h1>hello {world}</h1><script>export let world = \"name\"</script>\n";
        let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
        eprintln!("OUTPUT:\n{}", result.code);
        assert!(
            result.code.contains("svelteHTML.createElement(\"h1\","),
            "Should contain h1 element in output, got:\n{}",
            result.code
        );
    }

    #[test]
    fn test_svelte2tsx_nested_elements() {
        let source = "<div><span>text</span></div>";
        let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
        eprintln!("OUTPUT:\n{}", result.code);
        assert!(
            result.code.contains("svelteHTML.createElement(\"div\","),
            "Should contain outer div"
        );
        assert!(
            result.code.contains("svelteHTML.createElement(\"span\","),
            "Should contain inner span"
        );
    }
}
