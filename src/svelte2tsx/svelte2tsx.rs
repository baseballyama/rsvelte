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
    if let Some(ref instance) = ast.instance {
        super::script::process_instance_script(
            instance,
            source,
            &mut str,
            &mut exported_names,
            &mut events,
            false,
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
            for node in &options_node.attributes {
                match &node.value {
                    crate::ast::template::AttributeValue::True(_) => {
                        attrs_parts.push(format!("\"{}\":true,", node.name));
                    }
                    crate::ast::template::AttributeValue::Expression(expr) => {
                        let expr_text = &source[expr.expression.start().unwrap_or(0) as usize
                            ..expr.expression.end().unwrap_or(0) as usize];
                        attrs_parts.push(format!("\"{}\":{},", node.name, expr_text));
                    }
                    _ => {}
                }
            }
            let attrs_str = if attrs_parts.is_empty() {
                String::new()
            } else {
                let extra_spaces = count_tag_to_attr_spaces_in_source(
                    "svelte:options",
                    options_node.start,
                    source,
                );
                format!("{}{}", " ".repeat(extra_spaces + 1), attrs_parts.join(""))
            };
            let replacement = format!(
                " {{ svelteHTML.createElement(\"svelte:options\", {{{}}});}}",
                attrs_str
            );
            str.overwrite(options_node.start, options_node.end, &replacement);
        }
    }

    // Step 8: Blank out <style> tag (CSS is not relevant for TSX type checking)
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
        }
    }

    // Step 8.5: Detect $$props, $$restProps usage in source (before wrapping)
    let uses_dollar_props = source.contains("$$props");
    let uses_dollar_rest_props = source.contains("$$restProps");

    // Step 9: Process template nodes in-place via MagicString
    template::process_template_inplace(&ast.fragment, source, &options, &mut str);

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

    // Build $$props/$$restProps declaration text for injection into $$render() header
    let mut dollar_decls = String::new();
    if uses_dollar_props {
        dollar_decls.push_str(" let $$props = __sveltets_2_allPropsType();");
    }
    if uses_dollar_rest_props {
        dollar_decls.push_str(" let $$restProps = __sveltets_2_restPropsType();");
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

        // Detect `generics` attribute on the script tag
        let script_tag_text = &source[script_start as usize..content_start as usize];
        let generics_param = extract_generics_from_script_tag(script_tag_text);
        let render_generics = generics_param
            .as_ref()
            .map(|g| format!("<{}>", g))
            .unwrap_or_default();

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
                let text = &source[abs_start as usize..abs_end as usize];

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

                import_text.push_str(text);

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
            let ts_component_props_decl = if exported_names.has_component_props_typedef
                && exported_names.props_type_text.is_some()
            {
                let type_text = exported_names.props_type_text.as_ref().unwrap();
                format!(";type $$ComponentProps =  {};", type_text)
            } else {
                String::new()
            };

            // Build the <script> replacement:
            //   `<script...>` → `;\nimports\nfunction $$render() {\n`
            let mut script_replacement = String::from(";\n");
            if has_module_script {
                script_replacement.push('\n');
            }
            script_replacement.push_str(&import_text);
            if !ts_component_props_decl.is_empty() {
                script_replacement.push_str(&ts_component_props_decl);
            }
            script_replacement.push_str(&format!(
                "function $$render{}() {{{}\n",
                render_generics, dollar_decls
            ));

            if script_start < content_start {
                str.overwrite(script_start, content_start, &script_replacement);
            }
        } else {
            // No imports: overwrite the entire <script> tag at once
            let ts_component_props_decl = if exported_names.has_component_props_typedef
                && exported_names.props_type_text.is_some()
            {
                let type_text = exported_names.props_type_text.as_ref().unwrap();
                format!("\n;type $$ComponentProps =  {};", type_text)
            } else {
                String::new()
            };
            if script_start < content_start {
                str.overwrite(
                    script_start,
                    content_start,
                    &format!(
                        ";{}function $$render{}() {{{}\n",
                        ts_component_props_decl, render_generics, dollar_decls
                    ),
                );
            }
        }

        // Overwrite `</script>` with slot declaration + `async () => {`
        if content_end < script_end {
            if has_slot_elements {
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
    if has_instance_script {
        // Prepend the reference types
        str.prepend_str("///<reference types=\"svelte\" />\n");
    } else if has_module_script {
        // Module script but no instance script
        let module = ast.module.as_ref().unwrap();
        let mod_end = module.end;

        // For module-script-only components, inject store subscriptions for
        // module-level imports at the start of the $$render async wrapper.
        let store_decls = super::script::collect_module_import_store_declarations(source);
        let slot_decl_mod = if has_slot_elements {
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

        str.prepend_str("///<reference types=\"svelte\" />\n");
    } else {
        // No script tags at all: prepend the full wrapper
        let slot_decl_tmpl = if has_slot_elements {
            "\n/*\u{03A9}ignore_start\u{03A9}*/;const __sveltets_createSlot = __sveltets_2_createCreateSlot();/*\u{03A9}ignore_end\u{03A9}*/"
        } else {
            ""
        };
        let wrapper = format!(
            "///<reference types=\"svelte\" />\n;function $$render() {{{}{}\nasync () => {{",
            dollar_decls, slot_decl_tmpl
        );
        str.prepend_str(&wrapper);
    }

    // Append the closing of async wrapper, return statement, and component export
    let use_partial_with_any = uses_dollar_props || uses_dollar_rest_props;
    let props_str = if use_partial_with_any {
        // When $$props or $$restProps is used, props is just an empty object
        "{}".to_string()
    } else {
        exported_names.create_props_str()
    };
    let is_svelte5 = matches!(options.version, SvelteVersion::V5);
    let exports_str = exported_names.create_exports_str(is_svelte5);
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
                slot_parts.push(format!("'{}': {{{}}}", name, props.join(",")));
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
            let optional_props = exported_names.create_optional_props_array();
            if optional_props.is_empty() {
                "__sveltets_2_partial(__sveltets_2_with_any_event($$render()))".to_string()
            } else {
                format!(
                    "__sveltets_2_partial([{}], __sveltets_2_with_any_event($$render()))",
                    optional_props.join(",")
                )
            }
        }
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
            if exported_names.is_runes_mode() {
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
            } else {
                let prop_def = build_prop_def(&exported_names);
                closing.push_str(&format!(
                    "const {} = __sveltets_2_isomorphic_component({});\n",
                    safe_name, prop_def
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
            // Include any leading whitespace/newlines that are part of the
            // import's "full text" in the source.
            let start = import.span.start;
            let end = import.span.end;
            imports.push((start, end));
        }
    }
    imports.sort_by_key(|&(s, _)| s);
    imports
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
