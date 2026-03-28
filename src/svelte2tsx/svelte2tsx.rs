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

    // Step 3: Detect runes mode
    let _uses_runes = options.runes.unwrap_or_else(|| detect_runes_mode(&ast));

    // Step 4: Create the MagicString for in-place source manipulation
    let mut str = MagicString::new(source);

    // Step 5: Initialize tracking structures
    let mut exported_names = ExportedNames::new();
    let mut events = ComponentEvents::new();

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
        );
    }

    // Step 8: Process template nodes in-place via MagicString
    template::process_template_inplace(&ast.fragment, source, &options, &mut str);

    // Step 9: Wrap in $$render() and add component export
    //
    // The key insight from the JS svelte2tsx is that it modifies the source
    // in-place. For components WITH a script tag, the <script> opening tag
    // becomes the function declaration and the </script> closing tag becomes
    // the async wrapper start. The script CONTENT stays in place.
    //
    // For template-only components (no script), we prepend/append the wrapper.
    //
    // For now, we use the simpler approach of prepend/append for all cases,
    // since script processing (Step 7) is still a TODO.

    let has_instance_script = ast.instance.is_some();
    let _has_module_script = ast.module.is_some();

    if has_instance_script {
        let instance = ast.instance.as_ref().unwrap();

        // Find the <script> opening tag end and </script> closing tag start
        let script_start = instance.start;
        let script_end = instance.end;

        // The raw_content_offset tells us where the script content starts
        let content_start = instance.content_offset;

        // Find the end of the script content (start of </script>)
        // We need to find `</script>` before script_end
        let content_end = find_script_close_tag_start(source, script_end);

        // Overwrite `<script...>` with `;function $$render() {\n`
        // The script content stays in place
        if script_start < content_start {
            str.overwrite(script_start, content_start, ";function $$render() {\n");
        }

        // Overwrite `</script>` with `;\nasync () => {`
        if content_end < script_end {
            str.overwrite(content_end, script_end, ";\nasync () => {");
        }

        // Prepend the reference types before everything
        str.prepend_str("///<reference types=\"svelte\" />\n");
    } else {
        // No script tag: prepend the full wrapper
        str.prepend_str("///<reference types=\"svelte\" />\n;function $$render() {\nasync () => {");
    }

    // Append the closing of async wrapper, return statement, and component export
    let props_str = build_props_return(&exported_names, &options);
    let safe_name = format!("{}__SvelteComponent_", component_name);

    let mut closing = String::new();
    closing.push_str("};\n");
    closing.push_str(&format!(
        "return {{ props: {}, slots: {{}}, events: {{}} }}}}\n",
        props_str
    ));
    closing.push('\n');

    match options.version {
        SvelteVersion::V4 => {
            closing.push_str(&format!(
                "export default class {} extends __sveltets_2_createSvelte2TsxComponent(__sveltets_2_partial(__sveltets_2_with_any_event($$render()))) {{\n}}\n",
                safe_name
            ));
        }
        SvelteVersion::V5 => {
            let prop_names = exported_names.get_prop_names();
            let props_array = if prop_names.is_empty() {
                String::new()
            } else {
                let names: Vec<String> = prop_names.iter().map(|n| format!("'{}'", n)).collect();
                format!("[{}], ", names.join(","))
            };

            closing.push_str(&format!(
                "const {} = __sveltets_2_isomorphic_component({});\n",
                safe_name,
                format!(
                    "__sveltets_2_partial({}__sveltets_2_with_any_event($$render()))",
                    props_array
                )
            ));
            closing.push_str(&format!(
                "/*\u{03A9}ignore_start\u{03A9}*/type {} = InstanceType<typeof {}>;\n",
                safe_name, safe_name
            ));
            closing.push_str(&format!(
                "/*\u{03A9}ignore_end\u{03A9}*/export default {};\n",
                safe_name
            ));
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

// =============================================================================
// Internal helpers
// =============================================================================

/// Derive a safe component name from the filename.
///
/// Converts "App.svelte" -> "App", "my-component.svelte" -> "My_component",
/// handles path separators and special characters.
fn derive_component_name(filename: &str) -> String {
    // Extract the file stem (without directory and extension)
    let stem = filename.rsplit(['/', '\\']).next().unwrap_or(filename);
    let stem = stem.strip_suffix(".svelte").unwrap_or(stem);

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

    // TODO: Check for rune usage in script content ($props, $state, $derived, etc.)
    // For now, default to Svelte 5 runes mode
    true
}

/// Build the props return expression.
///
/// For components with no props: `/** @type {Record<string, never>} */ ({})`
/// For components with props: `{ prop1: prop1, prop2: prop2 }`
fn build_props_return(exported_names: &ExportedNames, _options: &Svelte2TsxOptions) -> String {
    let prop_names = exported_names.get_prop_names();
    if prop_names.is_empty() {
        "/** @type {Record<string, never>} */ ({})".to_string()
    } else {
        let entries: Vec<String> = prop_names
            .iter()
            .map(|name| format!("{}: {}", name, name))
            .collect();
        format!("{{ {} }}", entries.join(", "))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_derive_component_name() {
        assert_eq!(derive_component_name("App.svelte"), "App");
        assert_eq!(derive_component_name("my-component.svelte"), "my_component");
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
