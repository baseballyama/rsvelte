//! Main entry point for svelte2tsx conversion.
//!
//! Converts Svelte component source files into TypeScript/TSX for type checking.
//! This is a Rust port of the `svelte2tsx` package used by the Svelte language server.

use std::fmt;
use std::fmt::Write as _;

use crate::ast::template::Root;
use crate::compiler::phases::phase1_parse::{self, ParseOptions};

use super::magic_string::{GenerateMapOptions, MagicString};
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
    /// When set, rewrites relative import specifiers that escape the workspace
    /// so they remain valid from the generated `.tsx` location. Mirrors
    /// `helpers/rewriteExternalImports.ts` in the JS reference.
    pub rewrite_external_imports: Option<RewriteExternalImportsOptions>,
}

/// Inputs for the optional external-import rewrite pass — mirrors the JS
/// reference's `RewriteExternalImportsOptions`.
#[derive(Debug, Clone)]
pub struct RewriteExternalImportsOptions {
    /// Absolute path of the `.svelte` source file we are converting.
    pub source_path: String,
    /// Absolute path the generated `.tsx` will live at.
    pub generated_path: String,
    /// Workspace root — `../` specifiers that resolve *inside* this directory
    /// stay unchanged.
    pub workspace_path: String,
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
            rewrite_external_imports: None,
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

impl Svelte2TsxError {
    /// Return the `(start, end)` byte-offset span if the error has one.
    ///
    /// Currently only `Svelte2TsxError::Parse` carries position info — the
    /// `Template` / `Script` / `Other` variants are message-only so this
    /// returns `None` for them.
    pub fn span(&self) -> Option<(usize, usize)> {
        match self {
            Svelte2TsxError::Parse(e) => Some(e.span()),
            _ => None,
        }
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
/// use rsvelte_core::svelte2tsx::{svelte2tsx, Svelte2TsxOptions};
///
/// let source = "<h1>Hello</h1>";
/// let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
/// println!("{}", result.code);
/// ```
/// Replace the content of every `<style …>…</style>` with spaces (newlines and
/// carriage returns preserved) so the parser never CSS-parses it. Works at the
/// BYTE level so the result is exactly the same length as `source` — every AST
/// offset still indexes the original source. Case-insensitive on the tag name.
fn blank_style_content(source: &str) -> String {
    let mut bytes = source.as_bytes().to_vec();
    let lower = source.to_ascii_lowercase();
    let lb = lower.as_bytes();
    let mut search = 0usize;
    while let Some(rel) = lower[search..].find("<style") {
        let tag_start = search + rel;
        // Must be the `<style` element, not e.g. `<styled`.
        let after = lb.get(tag_start + 6).copied();
        if !matches!(
            after,
            Some(b'>') | Some(b' ') | Some(b'\t') | Some(b'\n') | Some(b'\r') | Some(b'/') | None
        ) {
            search = tag_start + 6;
            continue;
        }
        let Some(gt_rel) = lower[tag_start..].find('>') else {
            break;
        };
        let content_start = tag_start + gt_rel + 1;
        // Self-closing `<style/>` → no content to blank.
        if content_start >= 2 && lb[content_start - 2] == b'/' {
            search = content_start;
            continue;
        }
        let Some(close_rel) = lower[content_start..].find("</style") else {
            break;
        };
        let content_end = content_start + close_rel;
        for b in &mut bytes[content_start..content_end] {
            if *b != b'\n' && *b != b'\r' {
                *b = b' ';
            }
        }
        search = content_end;
    }
    String::from_utf8(bytes).unwrap_or_else(|_| source.to_string())
}

/// Validate that every `{@debug …}` argument is a plain identifier, returning a
/// template error otherwise — mirrors svelte's parse-time check (rsvelte's lives
/// in the analyze DebugTag visitor, which svelte2tsx doesn't run).
fn validate_debug_tag_arguments(ast: &Root, source: &str) -> Result<(), Svelte2TsxError> {
    use crate::ast::template::{Fragment, TemplateNode as N};

    fn arg_is_identifier(expr: &crate::ast::js::Expression, source: &str) -> bool {
        match expr.node_type() {
            Some("Identifier") => true,
            Some(_) => false,
            // Lazy/unresolved expression: accept only a bare identifier token.
            None => match (expr.start(), expr.end()) {
                (Some(s), Some(e))
                    if (s as usize) < (e as usize) && (e as usize) <= source.len() =>
                {
                    let t = source[s as usize..e as usize].trim();
                    let mut chars = t.chars();
                    match chars.next() {
                        Some(c0) if c0.is_alphabetic() || c0 == '_' || c0 == '$' => {
                            chars.all(|c| c.is_alphanumeric() || c == '_' || c == '$')
                        }
                        _ => false,
                    }
                }
                _ => false,
            },
        }
    }

    fn check_fragment(frag: &Fragment, source: &str) -> Result<(), Svelte2TsxError> {
        for node in &frag.nodes {
            check_node(node, source)?;
        }
        Ok(())
    }

    fn check_node(node: &N, source: &str) -> Result<(), Svelte2TsxError> {
        match node {
            N::DebugTag(tag) => {
                for id in &tag.identifiers {
                    if !arg_is_identifier(id, source) {
                        return Err(Svelte2TsxError::Template(
                            "{@debug ...} arguments must be identifiers, not arbitrary expressions"
                                .to_string(),
                        ));
                    }
                }
            }
            N::RegularElement(e) => check_fragment(&e.fragment, source)?,
            N::Component(c) => check_fragment(&c.fragment, source)?,
            N::SvelteComponent(c) => check_fragment(&c.fragment, source)?,
            N::SvelteElement(e) => check_fragment(&e.fragment, source)?,
            N::SvelteHead(e)
            | N::SvelteFragment(e)
            | N::SvelteBody(e)
            | N::SvelteWindow(e)
            | N::SvelteDocument(e)
            | N::SvelteBoundary(e)
            | N::SvelteOptions(e)
            | N::SvelteSelf(e) => check_fragment(&e.fragment, source)?,
            N::TitleElement(e) => check_fragment(&e.fragment, source)?,
            N::SlotElement(e) => check_fragment(&e.fragment, source)?,
            N::IfBlock(b) => {
                check_fragment(&b.consequent, source)?;
                if let Some(alt) = &b.alternate {
                    check_fragment(alt, source)?;
                }
            }
            N::EachBlock(b) => {
                check_fragment(&b.body, source)?;
                if let Some(fb) = &b.fallback {
                    check_fragment(fb, source)?;
                }
            }
            N::KeyBlock(b) => check_fragment(&b.fragment, source)?,
            N::SnippetBlock(b) => check_fragment(&b.body, source)?,
            N::AwaitBlock(b) => {
                if let Some(f) = &b.pending {
                    check_fragment(f, source)?;
                }
                if let Some(f) = &b.then {
                    check_fragment(f, source)?;
                }
                if let Some(f) = &b.catch {
                    check_fragment(f, source)?;
                }
            }
            _ => {}
        }
        Ok(())
    }

    check_fragment(&ast.fragment, source)
}

/// Validate `<svelte:window/body/document/head/options>` placement and
/// uniqueness, mirroring svelte's PARSE-time `svelte_meta_duplicate` /
/// `svelte_meta_invalid_placement` checks (1-parse/state/element.js). rsvelte's
/// compiler defers these to phase-2 analysis, which svelte2tsx skips — but
/// official svelte2tsx parses with svelte and so rejects these at parse. Each
/// of these five "root-only meta tags" must appear at most once and only as a
/// direct child of the component root (not inside any element or block).
fn validate_meta_element_placement(ast: &Root, source: &str) -> Result<(), Svelte2TsxError> {
    use crate::ast::template::{Fragment, TemplateNode as N};
    use std::collections::HashSet;

    // `<svelte:element>` requires a `this` attribute with a value. svelte's
    // parser stores it as the element's `tag` expression; a missing / valueless
    // `this` leaves an empty span. Official svelte2tsx rejects it.
    fn dynamic_element_tag_is_empty(tag: &crate::ast::js::Expression, source: &str) -> bool {
        match (tag.start(), tag.end()) {
            (Some(s), Some(e)) if (s as usize) < (e as usize) && (e as usize) <= source.len() => {
                source[s as usize..e as usize].trim().is_empty()
            }
            _ => true,
        }
    }

    fn meta_name(node: &N) -> Option<&str> {
        match node {
            N::SvelteWindow(e)
            | N::SvelteBody(e)
            | N::SvelteDocument(e)
            | N::SvelteHead(e)
            | N::SvelteOptions(e) => Some(e.name.as_str()),
            _ => None,
        }
    }

    fn check_fragment(
        frag: &Fragment,
        at_root: bool,
        seen: &mut HashSet<String>,
        source: &str,
    ) -> Result<(), Svelte2TsxError> {
        for node in &frag.nodes {
            check_node(node, at_root, seen, source)?;
        }
        Ok(())
    }

    fn check_node(
        node: &N,
        at_root: bool,
        seen: &mut HashSet<String>,
        source: &str,
    ) -> Result<(), Svelte2TsxError> {
        if let N::SvelteElement(e) = node
            && dynamic_element_tag_is_empty(&e.tag, source)
        {
            return Err(Svelte2TsxError::Template(
                "`<svelte:element>` must have a 'this' attribute with a value".to_string(),
            ));
        }
        if let Some(name) = meta_name(node) {
            if !at_root {
                return Err(Svelte2TsxError::Template(format!(
                    "`<{}>` tags cannot be inside elements or blocks",
                    name
                )));
            }
            if !seen.insert(name.to_string()) {
                return Err(Svelte2TsxError::Template(format!(
                    "A component can only have one `<{}>` element",
                    name
                )));
            }
        }
        // Recurse into children — anything nested below this node is no longer
        // at root level.
        match node {
            N::RegularElement(e) => check_fragment(&e.fragment, false, seen, source)?,
            N::Component(c) => check_fragment(&c.fragment, false, seen, source)?,
            N::SvelteComponent(c) => check_fragment(&c.fragment, false, seen, source)?,
            N::SvelteElement(e) => check_fragment(&e.fragment, false, seen, source)?,
            N::SvelteHead(e)
            | N::SvelteFragment(e)
            | N::SvelteBody(e)
            | N::SvelteWindow(e)
            | N::SvelteDocument(e)
            | N::SvelteBoundary(e)
            | N::SvelteOptions(e)
            | N::SvelteSelf(e) => check_fragment(&e.fragment, false, seen, source)?,
            N::TitleElement(e) => check_fragment(&e.fragment, false, seen, source)?,
            N::SlotElement(e) => check_fragment(&e.fragment, false, seen, source)?,
            N::IfBlock(b) => {
                check_fragment(&b.consequent, false, seen, source)?;
                if let Some(alt) = &b.alternate {
                    check_fragment(alt, false, seen, source)?;
                }
            }
            N::EachBlock(b) => {
                check_fragment(&b.body, false, seen, source)?;
                if let Some(fb) = &b.fallback {
                    check_fragment(fb, false, seen, source)?;
                }
            }
            N::KeyBlock(b) => check_fragment(&b.fragment, false, seen, source)?,
            N::SnippetBlock(b) => check_fragment(&b.body, false, seen, source)?,
            N::AwaitBlock(b) => {
                if let Some(f) = &b.pending {
                    check_fragment(f, false, seen, source)?;
                }
                if let Some(f) = &b.then {
                    check_fragment(f, false, seen, source)?;
                }
                if let Some(f) = &b.catch {
                    check_fragment(f, false, seen, source)?;
                }
            }
            _ => {}
        }
        Ok(())
    }

    let mut seen = HashSet::new();
    check_fragment(&ast.fragment, true, &mut seen, source)
}

pub fn svelte2tsx(
    source: &str,
    options: Svelte2TsxOptions,
) -> Result<Svelte2TsxResult, Svelte2TsxError> {
    // Step 1: Parse the Svelte source using the existing parser.
    //
    // Blank out `<style>` CONTENT before parsing (equal-length, newlines kept,
    // so every AST offset still lines up with the original `source`). svelte2tsx
    // does the same (utils/htmlxparser.ts: "Svelte tries to parse style/script
    // tags which doesn't play well with typescript, so we blank them out") — the
    // CSS is irrelevant to the TSX output (it's dropped anyway), and parsing it
    // would surface CSS-only errors (e.g. doc placeholders like `div { ... }`)
    // that the official tool never sees, breaking error-parity. The `<script>`
    // is NOT blanked — rsvelte needs it (it processes the instance script from
    // the parsed AST, unlike svelte2tsx which re-parses scripts separately).
    let parse_source = blank_style_content(source);
    let parse_options = ParseOptions {
        modern: true,
        loose: false,
        skip_expression_loc: false,
        defer_script_parse: false,
        force_typescript: false,
    };
    let ast = phase1_parse::parse(&parse_source, parse_options)?;

    // svelte rejects `{@debug expr}` whose arguments are not plain identifiers
    // (`{@debug user.firstname}` / `{@debug a[0]}`) at PARSE time. rsvelte does
    // this in the analyze DebugTag visitor, which svelte2tsx never runs — so
    // replicate it here to preserve error-parity with official svelte2tsx.
    validate_debug_tag_arguments(&ast, source)?;
    validate_meta_element_placement(&ast, source)?;

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

    // Step 7.4: Detect `{await expr}` in template expression tags.
    // Await-in-template forces runes mode (async template expressions are
    // Svelte 5 runes-only).
    // Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts
    //   `isRunes` doc: "True if uses runes or top level await or await in template expressions"
    if detect_await_in_template(&ast, source) {
        exported_names.set_uses_runes(true);
    }

    // Step 7.45: Detect `$state`/`$derived`/`$effect` rune-globals in TEMPLATE expressions.
    //
    // Official rule (index.ts): `exportedNames.checkGlobalsForRunes(implicitStoreValues.getGlobals())`
    // — `implicitStoreValues` collects ALL accessed undeclared globals across the entire
    // component INCLUDING template expressions.  `checkGlobalsForRunes` (ExportedNames.ts
    // ~line 878–881) sets `hasRunesGlobals = isSvelte5Plus && globals.some(g =>
    // ['$state','$derived','$effect'].includes(g))`.
    //
    // A component with NO `<script>` but with e.g. `aria-current={$state.eager(pathname) === '/'
    // ? 'page' : null}` is therefore RUNES (because `$state` is an undeclared global
    // referenced in the template).  rsvelte's instance-script scanner never runs for
    // template-only components, so we need to walk the template AST here.
    //
    // Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/index.ts
    //   `exportedNames.checkGlobalsForRunes(implicitStoreValues.getGlobals())`
    // Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts
    //   `hasRunesGlobals = isSvelte5Plus && globals.some(g => ['$state','$derived','$effect'].includes(g))`
    if detect_rune_global_in_template(&ast, source) {
        exported_names.set_uses_runes(true);
    }

    // Step 7.5: Slot detection from the AST (NOT a source substring scan — a
    // naive `source.contains("<slot")` matches `<slot>` inside string literals
    // such as a custom element's `shadowRoot.innerHTML = '…<slot>…'`, which are
    // not real template slots). Official emits the `__sveltets_createSlot`
    // helper / treats the component as slotted only for real `<slot>` elements.
    let has_slot_elements = fragment_has_slot_element(&ast.fragment);

    // Step 7.6: Process <svelte:options> tag as a createElement call
    // The parser stores svelte:options in ast.options (not in fragment.nodes),
    // so we need to handle it separately.
    if let Some(ref options_node) = ast.options
        && options_node.start < options_node.end
    {
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
                // String / mixed attribute, e.g. `<svelte:options customElement="my-el">`
                // or `namespace="svg"`. Mirror the element-attribute Sequence path
                // (template/mod.rs::format_attribute_node_segments): a lone expression
                // stays a bare expression, everything else becomes a template literal.
                // Reference: language-tools .../htmlxtojsx_v2/nodes/Attribute.ts.
                crate::ast::template::AttributeValue::Sequence(parts) => {
                    use crate::ast::template::AttributeValuePart;
                    if parts.len() == 1
                        && let AttributeValuePart::ExpressionTag(expr) = &parts[0]
                    {
                        has_expression_attr = true;
                        let expr_text = &source[expr.expression.start().unwrap_or(0) as usize
                            ..expr.expression.end().unwrap_or(0) as usize];
                        attrs_parts.push(format!("\"{}\":{},", node.name, expr_text));
                    } else {
                        let mut value = String::from("`");
                        for part in parts {
                            match part {
                                AttributeValuePart::Text(text) => {
                                    value.push_str(
                                        &text
                                            .raw
                                            .replace('\\', "\\\\")
                                            .replace('`', "\\`")
                                            .replace('$', "\\$"),
                                    );
                                }
                                AttributeValuePart::ExpressionTag(expr) => {
                                    has_expression_attr = true;
                                    if let (Some(s), Some(e)) =
                                        (expr.expression.start(), expr.expression.end())
                                    {
                                        value.push_str("${");
                                        value.push_str(&source[s as usize..e as usize]);
                                        value.push('}');
                                    }
                                }
                            }
                        }
                        value.push('`');
                        attrs_parts.push(format!("\"{}\":{},", node.name, value));
                    }
                }
            }
        }
        let attrs_str = if attrs_parts.is_empty() {
            String::new()
        } else if has_expression_attr {
            // Expression attributes: preserve source spacing
            let extra_spaces =
                count_tag_to_attr_spaces_in_source("svelte:options", options_node.start, source);
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

    // Step 8: Blank out <style> tag (CSS is not relevant for TSX type checking)
    //
    //
    // First blank any style tag the parser captured in ast.css.
    // Then ALWAYS run the fallback scanner to catch style tags the parser
    // did not capture (e.g., <style global>, custom attributes).
    let mut blanked_style_ranges: Vec<(usize, usize)> = Vec::new();
    if let Some(ref css) = ast.css
        && css.start < css.end
    {
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

        // Direct case-sensitive substring search over the original source.
        // The previous implementation called `source.to_lowercase()` once
        // per call, allocating a full copy of the source for case-
        // insensitive matching. Svelte HTML is lowercase in practice
        // (the parser only recognises lowercase tags), so the lowercase
        // copy is unnecessary overhead.
        let bytes = source.as_bytes();
        let mut search_from = 0;
        while let Some(rel) = source[search_from..].find("<style") {
            let abs_start = search_from + rel;
            if is_inside_script(abs_start) {
                search_from = abs_start + 1;
                continue;
            }
            if is_already_blanked(abs_start) {
                search_from = abs_start + 1;
                continue;
            }
            let after_tag = abs_start + 6;
            if after_tag < bytes.len() {
                let next_ch = bytes[after_tag];
                if (next_ch == b' '
                    || next_ch == b'>'
                    || next_ch == b'\n'
                    || next_ch == b'\r'
                    || next_ch == b'\t'
                    || next_ch == b'/')
                    && let Some(close_off) = source[abs_start..].find("</style>")
                {
                    let abs_end = abs_start + close_off + 8; // 8 = len("</style>")
                    let mut blank_end = abs_end as u32;
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

    // Tracks whether the instance script contains a top-level `await`
    // (i.e. an await expression that is not inside any function or arrow body).
    // Set inside the `if has_instance_script` block below; consulted by the
    // export-assembly section further down.
    // Reference: createRenderFunction.ts (async keyword on $$render) and
    //            addComponentExport.ts (`renderCall` / `awaitDeclaration`).
    let mut has_top_level_await = false;

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
            .map(|name| format!("'{}': ''", escape_js_single_quoted(name)))
            .collect();
        let _ = write!(
            dollar_decls,
            " let $$slots = __sveltets_2_slotsType({{{}}});",
            slots_obj.join(", ")
        );
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

        // Detect top-level `await` in the script content.
        // Top-level await in the instance script forces runes mode — async
        // components are Svelte 5 runes-only.
        // Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts
        //   `isRunes = true when component has TOP-LEVEL AWAIT in the instance script`
        let raw_content = &source[content_start as usize..content_end as usize];
        has_top_level_await = detect_top_level_await(raw_content);
        if has_top_level_await {
            exported_names.set_uses_runes(true);
        }
        let async_prefix = if has_top_level_await { "async " } else { "" };

        // Detect `generics` attribute on the script tag
        let script_tag_text = &source[script_start as usize..content_start as usize];
        let generics_param = extract_generics_from_script_tag(script_tag_text);
        let use_jsdoc_generics = options.emit_jsdoc && !options.is_ts_file;
        // For JS files emitting JSDoc, the generics live on a `/** @template T */`
        // line *before* `function $$render()`, not as `<T>` on the function.
        let template_comment = if use_jsdoc_generics {
            generics_param
                .as_ref()
                .filter(|g| !g.is_empty())
                .map(|g| format!("\n/** @template {} */\n", g))
                .unwrap_or_default()
        } else {
            String::new()
        };
        let render_generics = if !exported_names.dollar_generics.is_empty() {
            // Use $$Generic declarations (wrapped in ignore markers)
            exported_names.build_dollar_generics_str()
        } else if use_jsdoc_generics {
            // JSDoc-emit branch: keep render_generics empty; the `@template`
            // comment is emitted before the function declaration via
            // `template_comment`.
            String::new()
        } else {
            generics_param
                .as_ref()
                .map(|g| {
                    if options.is_ts_file {
                        // TS files: no ignore markers around generics
                        format!("<{}>", g)
                    } else {
                        // JS files (non-JSDoc): wrap content in ignore markers
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
            for (i, &(comments_start, import_start_rel, import_end)) in imports.iter().enumerate() {
                let abs_comments_start = comments_start + content_start;
                let abs_import_start = import_start_rel + content_start;
                let abs_end = import_end + content_start;

                // Split into the leading comment region and the import
                // statement itself so they can be processed independently.
                // The JS reference (`utils/tsAst.ts::moveNode`) moves each
                // leading comment as its own chunk and drops the trivia
                // between them; for the first import,
                // `handleFirstInstanceImport` inserts an extra `\n` either
                // before a leading multiline comment or before the `import`
                // keyword.
                let comments_raw = &source[abs_comments_start as usize..abs_import_start as usize];
                let import_raw = &source[abs_import_start as usize..abs_end as usize];

                let comment_lines: Vec<&str> = comments_raw
                    .lines()
                    .map(|line| line.trim())
                    .filter(|line| !line.is_empty())
                    .collect();

                // Was the last comment on the same line as the `import`
                // keyword? True when `comments_raw`'s final line is not
                // whitespace-only — e.g. `/*hi*/import X` keeps the comment
                // and the import on a single line.
                let last_comment_inline = !comments_raw.is_empty()
                    && comments_raw
                        .lines()
                        .last()
                        .is_some_and(|l| !l.trim().is_empty());

                let import_text_clean: String = import_raw
                    .lines()
                    .map(|line| line.trim_start())
                    .collect::<Vec<_>>()
                    .join("\n");

                // Preserve gap when this import is part of a separate group
                // (a blank line in the source between this import and the
                // previous one).
                if i > 0 {
                    let prev_end = imports[i - 1].2 + content_start;
                    let between = &source[prev_end as usize..abs_comments_start as usize];
                    let newline_count = between.chars().filter(|&c| c == '\n').count();
                    if newline_count >= 2 {
                        import_text.push('\n');
                    }
                }

                let first_comment_is_block =
                    comment_lines.first().is_some_and(|c| c.starts_with("/*"));
                let needs_leading_newline =
                    i == 0 && (comment_lines.is_empty() || first_comment_is_block);

                if needs_leading_newline {
                    import_text.push('\n');
                }
                for (idx, line) in comment_lines.iter().enumerate() {
                    import_text.push_str(line);
                    let is_last = idx + 1 == comment_lines.len();
                    if !(is_last && last_comment_inline) {
                        import_text.push('\n');
                    }
                }
                if i == 0 && !first_comment_is_block && !comment_lines.is_empty() {
                    // `appendRight(firstImport.getStart(), '\n')` —
                    // separating the trailing leading-line-comment from the
                    // import keyword with an explicit blank line.
                    import_text.push('\n');
                }

                import_text.push_str(&import_text_clean);

                // Add semicolon to the last import if it doesn't have one
                if i == imports.len() - 1 {
                    // `.last()` avoids a `len() - 1` underflow when the cleaned
                    // import text is empty (zero-length span edge case).
                    if import_text_clean.as_bytes().last() != Some(&b';') {
                        import_text.push_str(";\n");
                    } else {
                        import_text.push('\n');
                    }
                } else {
                    import_text.push('\n');
                }

                // Blank out the original [leading comments .. import] span.
                // The indentation before the comments stays because it's
                // outside the captured span.
                str.overwrite(abs_comments_start, abs_end, "");
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
            // `import_text` provides its own leading `\n` (or absorbs it
            // into a leading-line-comment) — see the new-line accounting
            // above. `part_a` only carries the `;` (which replaces the `<`)
            // plus an extra `\n` when there is also a module script (mirrors
            // `'\n' + (hasModuleScript ? '\n' : '')` in
            // `handleFirstInstanceImport`).
            let mut part_a = String::from(";");
            if has_module_script {
                part_a.push('\n');
            }
            part_a.push_str(&import_text);
            let trailing_newline = if ts_component_props_inside_render.is_empty() {
                "\n"
            } else {
                ""
            };
            // When there's a hoistable type/interface, JS reference puts a
            // newline between the moved declaration and the synthesised
            // `;type $$ComponentProps = ...;function $$render() {` (which
            // sits in `ts_component_props_before_render`). Mirror that with
            // a `\n` prefix on part_b in that case.
            let part_b_prefix = if !exported_names.hoistable_type_ranges.is_empty()
                && !ts_component_props_before_render.is_empty()
            {
                "\n"
            } else {
                ""
            };
            let part_b = format!(
                "{}{}{}{}function $$render{}() {{{}{}{}",
                part_b_prefix,
                ts_component_props_before_render,
                template_comment,
                async_prefix,
                render_generics,
                dollar_decls,
                ts_component_props_inside_render,
                trailing_newline
            );

            let has_hoistable_chunks = !hoistable_snippet_ranges.is_empty()
                || !exported_names.hoistable_type_ranges.is_empty()
                || !exported_names.dollar_generic_referenced_ranges.is_empty();
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
                // Preserve the promotion (topological) order produced by
                // `resolve_hoistable_type_decls`, which mirrors the JS
                // reference's `Map` insertion order: a dependency is moved
                // BEFORE the interface that depends on it, even when it appears
                // later in source. Sorting by start position would wrongly
                // restore source order.
                let type_ranges = exported_names.hoistable_type_ranges.clone();
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
                // Move `$$Generic<X>`-referenced types. Mirrors the JS
                // reference's `nodesToMove` path (`moveNode`) — uses
                // `node.getStart()` (no leading trivia) and ends the chunk
                // with `\n` so the following text in `part_b` (`function
                // $$render`) starts on its own line.
                let mut nodes_to_move = exported_names.dollar_generic_referenced_ranges.clone();
                nodes_to_move.sort_by_key(|(s, _)| *s);
                for (s, e) in nodes_to_move {
                    if s < e && (e as usize) <= source.len() {
                        str.prepend_right(s, "\n");
                        str.append_left(e, "\n");
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

            if inline_type_at_let
                && let (Some(let_pos), Some(type_text)) = (
                    exported_names.props_let_abs_pos,
                    exported_names.props_type_text.as_ref(),
                )
            {
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
                    // Match the imports branch: skip names that are
                    // themselves slated for hoisting — referencing them
                    // from `$$ComponentProps` is fine when the hoisted
                    // declaration sits above `$$render`.
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
            let part_b_prefix = if !exported_names.hoistable_type_ranges.is_empty()
                && !ts_component_props_before_render.is_empty()
            {
                "\n"
            } else {
                ""
            };
            let part_b = format!(
                "{}{}{}{}function $$render{}() {{{}{}{}",
                part_b_prefix,
                ts_component_props_before_render,
                template_comment,
                async_prefix,
                render_generics,
                dollar_decls,
                ts_component_props_inside_render,
                trailing_newline
            );
            let has_hoistable_chunks = !hoistable_snippet_ranges.is_empty()
                || !exported_names.hoistable_type_ranges.is_empty()
                || !exported_names.dollar_generic_referenced_ranges.is_empty();
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
                // Preserve the promotion (topological) order produced by
                // `resolve_hoistable_type_decls`, which mirrors the JS
                // reference's `Map` insertion order: a dependency is moved
                // BEFORE the interface that depends on it, even when it appears
                // later in source. Sorting by start position would wrongly
                // restore source order.
                let type_ranges = exported_names.hoistable_type_ranges.clone();
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
                // Move `$$Generic<X>`-referenced types. Mirrors the JS
                // reference's `nodesToMove` path (`moveNode`) — uses
                // `node.getStart()` (no leading trivia) and ends the chunk
                // with `\n` so the following text in `part_b` (`function
                // $$render`) starts on its own line.
                let mut nodes_to_move = exported_names.dollar_generic_referenced_ranges.clone();
                nodes_to_move.sort_by_key(|(s, _)| *s);
                for (s, e) in nodes_to_move {
                    if s < e && (e as usize) <= source.len() {
                        str.prepend_right(s, "\n");
                        str.append_left(e, "\n");
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

            if inline_type_at_let
                && let (Some(let_pos), Some(type_text)) = (
                    exported_names.props_let_abs_pos,
                    exported_names.props_type_text.as_ref(),
                )
            {
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

        // NOTE: the trailing whitespace after `</script>` is intentionally
        // left in place. Official svelte2tsx's `createRenderFunction` overwrites
        // only `</script>` itself and then `str.append('};')` + the return
        // string at the very end, leaving the source's trailing newline between
        // `async () => {` and the closing `};`. For a template-less component
        // that yields `async () => {\n};`; blanking the newline here produced
        // `async () => {};`, which diverged for the await-error fixtures whose
        // output oxfmt cannot reformat (so only blank-line stripping applies).
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
                Some(&(_, _, last_end)) => mod_content_start + last_end,
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
    // `$$props`/`$$restProps` only flattens the props type to `{}` when there
    // are NO explicitly-declared props; named `export let`s are still listed
    // (mirrors official `createPropsStr(uses$$propsOr$$restProps)`).
    let props_str = exported_names.create_props_str(options.is_ts_file, use_partial_with_any);
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
            let escaped_name = escape_js_single_quoted(name);
            if props.is_empty() {
                slot_parts.push(format!("'{}': {{}}", escaped_name));
            } else {
                // Slot prop keys (the `props` strings) may also carry hyphens /
                // spaces / quotes when they come from arbitrary `slot="…"`
                // attributes; keep them verbatim for now since they're produced
                // upstream from validated bindings and don't reach this site
                // with adversarial input in practice. (issue #455, H-092)
                slot_parts.push(format!("'{}': {{{}}}", escaped_name, props.join(", ")));
            }
        }
        format!("{{{}}}", slot_parts.join(", "))
    };

    // Scan the whole component (instance script + template handlers) for
    // `dispatch("name", …)` call sites of any untyped `createEventDispatcher()`
    // so they surface in the events return.
    events.collect_dispatched_events(source);

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
    let _ = writeln!(
        closing,
        "return {{ props: {}{}{}, slots: {}, events: {} }}}}",
        props_str, exports_str, bindings_str, slots_str, events_str,
    );

    // Add component documentation as JSDoc comment before the component export
    if let Some(ref doc) = component_doc {
        closing.push_str(doc);
        closing.push('\n');
    }

    // Build the renderCall / awaitDeclaration pair used throughout the
    // component export section below.
    //
    // Reference: `addComponentExport.ts` – `addSimpleComponentExport`:
    //   const renderCall = hasTopLevelAwait ? `$${renderName}` : `${renderName}()`;
    //   const awaitDeclaration = hasTopLevelAwait
    //       ? surroundWithIgnoreComments(`const $${renderName} = await ${renderName}();`) + '\n'
    //       : '';
    //
    // The rsvelte equivalent uses the same ignore markers (Ω = U+03A9).
    let render_call: &str = if has_top_level_await {
        "$$$render"
    } else {
        "$$render()"
    };
    let await_declaration: &str = if has_top_level_await {
        "/*\u{03A9}ignore_start\u{03A9}*/ const $$$render = await $$render(); /*\u{03A9}ignore_end\u{03A9}*/\n"
    } else {
        ""
    };

    // Helper: build the prop_def string for the component export. Mirrors the
    // official `props(isTsFile, canHaveAnyProp, …)` in addComponentExport.ts:
    //   - runes mode:        renderStr (no partial)
    //   - TS file:           canHaveAnyProp ? __sveltets_2_with_any(renderStr) : renderStr
    //   - JS file (legacy):  __sveltets_2_partial[_with_any]([optional], renderStr)
    // where renderStr = `__sveltets_2_with_any_event($$render())` (non-async) or
    //                   `__sveltets_2_with_any_event($$$render)` (async) and
    // canHaveAnyProp = uses $$props / $$restProps (`use_partial_with_any`).
    // `__sveltets_2_partial` is therefore ONLY emitted for legacy JS components.
    let build_prop_def = |exported_names: &ExportedNames| -> String {
        let render_str = format!("__sveltets_2_with_any_event({render_call})");
        if exported_names.is_runes_mode() {
            render_str
        } else if options.is_ts_file {
            if use_partial_with_any {
                format!("__sveltets_2_with_any({render_str})")
            } else {
                render_str
            }
        } else {
            let optional_props = exported_names.create_optional_props_array(options.is_ts_file);
            let partial = if use_partial_with_any {
                "__sveltets_2_partial_with_any"
            } else {
                "__sveltets_2_partial"
            };
            if optional_props.is_empty() {
                format!("{partial}({render_str})")
            } else {
                format!("{partial}([{}], {render_str})", optional_props.join(","))
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
            let _ = write!(
                closing,
                "\nexport default class {} extends __sveltets_2_createSvelte2TsxComponent({}) {{\n}}",
                safe_name, prop_def
            );
        }
        SvelteVersion::V5 => {
            let use_ts_syntax = options.is_ts_file || !options.emit_jsdoc;
            // `__sveltets_2_fn_component` is only used for a runes component with
            // NO slots and NO events; a runes component that forwards events
            // (`on:click`) or has slots falls through to the isomorphic-component
            // path, exactly like a legacy component (mirrors official
            // addComponentExport: `isRunesMode() && !usesSlots && !hasEvents`).
            // "No events" must also account for forwarded element/component
            // events (`<div on:click>` / `<Inner on:bar/>`), which live in
            // `template_info.element_events`, not `events`.
            let has_any_events = !events.is_empty() || !template_info.element_events.is_empty();
            if exported_names.is_runes_mode() && !has_any_events && !has_slot_elements {
                if !use_ts_syntax {
                    // JS files with emitJsDoc: use `export const` and JSDoc typedef.
                    // Reference: addComponentExport.ts `addSimpleComponentExport`,
                    // isSvelte5 + isRunesMode + useTypeScriptSyntax=false branch.
                    // `awaitDeclaration` is emitted first when the component has a
                    // top-level await (hasTopLevelAwait); `render_call` is `$$$render`
                    // in that case, `$$render()` otherwise.
                    closing.push_str(await_declaration);
                    let _ = writeln!(
                        closing,
                        "export const {} = __sveltets_2_fn_component({});",
                        safe_name, render_call
                    );
                    let _ = writeln!(
                        closing,
                        "/*\u{03A9}ignore_start\u{03A9}*//** @typedef {{ReturnType<typeof {}>}} {} */",
                        safe_name, safe_name
                    );
                    let _ = write!(
                        closing,
                        "/*\u{03A9}ignore_end\u{03A9}*/export default {};",
                        safe_name
                    );
                } else if has_generics {
                    // Runes + generics: `__sveltets_2_fn_component($$render())`
                    // discards `T` ($$render is called without `<T>` and the
                    // component type alias never consumes its own `<T>`), so a
                    // generic component's `T` could not be inferred at the call
                    // site and `T`-dependent sibling props (callbacks, snippet
                    // params) collapsed to `unknown` (#923). The #801 fix only
                    // made `Foo<X>` a valid *reference*. Emit the upstream
                    // `__sveltets_Render<T>` + `$$IsomorphicComponent` shape
                    // instead, which threads `T` through generic constructor /
                    // call signatures so TypeScript infers it from the props.
                    let gn = &generics_names;
                    let raw_bindings = exported_names.create_raw_bindings_str(is_svelte5);
                    let raw_exports = exported_names.create_raw_exports_str(
                        is_svelte5,
                        effective_accessors,
                        options.is_ts_file,
                    );
                    let exports_return = if raw_exports == "$$HAS_EXPORTS$$" {
                        format!("$$render<{gn}>().exports")
                    } else {
                        raw_exports.clone()
                    };
                    emit_runes_generics_component(
                        &mut closing,
                        &safe_name,
                        &generics_params,
                        gn,
                        &raw_bindings,
                        &exports_return,
                        has_slot_elements,
                        !events.is_empty(),
                    );
                } else {
                    // Runes mode, TS syntax, no generics — the most common path.
                    // Reference: addComponentExport.ts `addSimpleComponentExport`,
                    // isSvelte5 + isRunesMode + useTypeScriptSyntax=true branch.
                    // `awaitDeclaration` is emitted first when the component has a
                    // top-level await (hasTopLevelAwait); `render_call` is `$$$render`
                    // in that case, `$$render()` otherwise.
                    closing.push_str(await_declaration);
                    let _ = writeln!(
                        closing,
                        "const {} = __sveltets_2_fn_component({});",
                        safe_name, render_call
                    );
                    let _ = writeln!(
                        closing,
                        "/*\u{03A9}ignore_start\u{03A9}*/type {} = ReturnType<typeof {}>;",
                        safe_name, safe_name
                    );
                    let _ = write!(
                        closing,
                        "/*\u{03A9}ignore_end\u{03A9}*/export default {};",
                        safe_name
                    );
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
                let _ = writeln!(closing, "class __sveltets_Render<{}> {{", gp);
                let _ = writeln!(
                    closing,
                    "    props() {{\n        return $$render<{}>().props;\n    }}",
                    gn
                );
                let _ = writeln!(
                    closing,
                    "    events() {{\n        return __sveltets_2_with_any_event($$render<{}>()).events;\n    }}",
                    gn
                );
                let _ = writeln!(
                    closing,
                    "    slots() {{\n        return $$render<{}>().slots;\n    }}",
                    gn
                );
                let _ = writeln!(closing, "    bindings() {{ return {}; }}", raw_bindings);
                // exports() returns $$render().exports if there are real exports, {} otherwise
                let exports_return = if has_real_exports {
                    format!("$$render<{}>().exports", gn)
                } else {
                    raw_exports.clone()
                };
                let _ = writeln!(closing, "    exports() {{ return {}; }}", exports_return);
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
                let _ = writeln!(
                    closing,
                    "    new <{}>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<{}>['props']>{}>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<{}>['props']>, ReturnType<__sveltets_Render<{}>['events']>, ReturnType<__sveltets_Render<{}>['slots']>> & {{ $$bindings?: ReturnType<__sveltets_Render<{}>['bindings']> }} & ReturnType<__sveltets_Render<{}>['exports']>;",
                    gp, gn, children_type_suffix, gn, gn, gn, gn, gn
                );
                // Functional call signature: add $$slots and children only when component has slots
                let slots_children_suffix = if has_slot_elements {
                    format!(
                        ", $$slots?: ReturnType<__sveltets_Render<{}>['slots']>, children?: any",
                        gn
                    )
                } else {
                    String::new()
                };
                // When the component has no props (and can't take arbitrary
                // props via $$props/$$restProps), official drops the
                // `ReturnType<…['props']> &` prefix, leaving just the
                // events/slots members. Mirrors `createPropsStr`'s
                // `!canHaveAnyProp && hasNoProps()` branch.
                let props_prefix = if exported_names.has_no_props() && !uses_dollar_props {
                    String::new()
                } else {
                    format!("ReturnType<__sveltets_Render<{}>['props']> & ", gn)
                };
                let _ = writeln!(
                    closing,
                    "    <{}>(internal: unknown, props: {}{{$$events?: ReturnType<__sveltets_Render<{}>['events']>{}}}): ReturnType<__sveltets_Render<{}>['exports']>;",
                    gp, props_prefix, gn, slots_children_suffix, gn
                );
                let _ = writeln!(
                    closing,
                    "    z_$$bindings?: ReturnType<__sveltets_Render<{}>['bindings']>;",
                    any_params
                );
                closing.push_str("}\n");

                // Component export
                let _ = writeln!(
                    closing,
                    "const {}: $$IsomorphicComponent = null as any;",
                    safe_name
                );
                let _ = writeln!(
                    closing,
                    "/*\u{03A9}ignore_start\u{03A9}*/type {}<{}> = InstanceType<typeof {}<{}>>;",
                    safe_name, gp, safe_name, gn
                );
                let _ = write!(
                    closing,
                    "/*\u{03A9}ignore_end\u{03A9}*/export default {};",
                    safe_name
                );
            } else {
                // Legacy V5 non-runes non-generics: isomorphic_component path.
                // Reference: addComponentExport.ts `addSimpleComponentExport`,
                // isSvelte5 + !isRunesMode + !has_generics branch.
                // `awaitDeclaration` is emitted first; `render_call` is threaded
                // through `build_prop_def` → `__sveltets_2_with_any_event(renderCall)`.
                closing.push_str(await_declaration);
                let prop_def = build_prop_def(&exported_names);
                let has_non_empty_slots = !template_info.slots.is_empty();
                let component_fn = if has_non_empty_slots {
                    "__sveltets_2_isomorphic_component_slots"
                } else {
                    "__sveltets_2_isomorphic_component"
                };
                let _ = writeln!(
                    closing,
                    "const {} = {}({});",
                    safe_name, component_fn, prop_def
                );
                let _ = writeln!(
                    closing,
                    "/*\u{03A9}ignore_start\u{03A9}*/type {} = InstanceType<typeof {}>;",
                    safe_name, safe_name
                );
                let _ = write!(
                    closing,
                    "/*\u{03A9}ignore_end\u{03A9}*/export default {};",
                    safe_name
                );
            }
        }
    }

    str.append_str(&closing);

    // Generate the source map *before* the final import-rewrite post-pass.
    // The rewrite only swaps the contents of relative-import string
    // literals; for the type-error positions svelte-check actually
    // surfaces (identifiers, expressions, etc.), the small column drift
    // on those lines is acceptable. Doing it before keeps the map in
    // sync with the MagicString chunk graph.
    let source_map = str
        .generate_map(GenerateMapOptions {
            file: None,
            source: Some(options.filename.clone()),
            include_content: false,
        })
        .to_json();

    let mut code = str.to_string();

    // Final post-pass: rewrite `../`-relative import specifiers in the
    // assembled output. We apply this here (rather than as a pre-pass on
    // the source) because earlier overwrites — e.g. opening-tag rewrites
    // for `<button onclick={() => import('...')}>` — replace whole ranges
    // wholesale and would otherwise mask any source-level rewrite.
    // Mirrors `helpers/rewriteExternalImports.ts` semantically; the AST
    // walk is unnecessary because we only target specifiers adjacent to
    // `from`/`import(` tokens.
    if let Some(ref rewrite_opts) = options.rewrite_external_imports {
        code = rewrite_external_specifiers_in_text(&code, rewrite_opts);
    }

    Ok(Svelte2TsxResult {
        code,
        map: Some(source_map),
        exported_names,
        events,
    })
}

/// Emit the `__sveltets_Render<T>` + `$$IsomorphicComponent` component export
/// for a **runes-mode generic** component (`<script generics="T">` + runes).
///
/// Unlike a non-generic runes component (which uses
/// `__sveltets_2_fn_component($$render())`), this threads the generic params
/// through a generic constructor / call signature so TypeScript can *infer* `T`
/// from the props supplied at the call site and flow it into sibling
/// `T`-dependent prop types (callback params, `Snippet<[…T…]>` params). The
/// `fn_component` form discards `T` (`$$render()` is called without `<T>` and
/// the component type alias never uses its own `<T>`), so those prop params
/// collapsed to `unknown` (#923). The shape mirrors upstream svelte2tsx's
/// `addComponentExport` for Svelte 5 runes generics — the render-class methods
/// carry explicit `ReturnType<typeof $$render<T>>[…]` annotations.
#[allow(clippy::too_many_arguments)]
fn emit_runes_generics_component(
    closing: &mut String,
    safe_name: &str,
    gp: &str,
    gn: &str,
    raw_bindings: &str,
    exports_return: &str,
    has_slot_elements: bool,
    has_events: bool,
) {
    let _ = writeln!(closing, "class __sveltets_Render<{gp}> {{");
    let _ = writeln!(
        closing,
        "    props(): ReturnType<typeof $$render<{gn}>>['props'] {{ return null as any; }}"
    );
    let _ = writeln!(
        closing,
        "    events(): ReturnType<typeof $$render<{gn}>>['events'] {{ return null as any; }}"
    );
    let _ = writeln!(
        closing,
        "    slots(): ReturnType<typeof $$render<{gn}>>['slots'] {{ return null as any; }}"
    );
    let _ = writeln!(closing, "    bindings() {{ return {raw_bindings}; }}");
    let _ = writeln!(closing, "    exports() {{ return {exports_return}; }}");
    closing.push_str("}\n\n");

    let any_params = gn.split(',').map(|_| "any").collect::<Vec<_>>().join(",");
    let children_type_suffix = if has_slot_elements {
        "& {children?: any}"
    } else {
        ""
    };

    closing.push_str("interface $$IsomorphicComponent {\n");
    let _ = writeln!(
        closing,
        "    new <{gp}>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<{gn}>['props']>{children_type_suffix}>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<{gn}>['props']>, ReturnType<__sveltets_Render<{gn}>['events']>, ReturnType<__sveltets_Render<{gn}>['slots']>> & {{ $$bindings?: ReturnType<__sveltets_Render<{gn}>['bindings']> }} & ReturnType<__sveltets_Render<{gn}>['exports']>;"
    );
    // Mirror official addComponentExport: `$$events?` is only included when the
    // component has events (or, in legacy mode, always — but this is the runes
    // path, so just `has_events`). `$$slots?`/`children?` only when slotted.
    let mut events_slots_parts: Vec<String> = Vec::new();
    if has_events {
        events_slots_parts.push(format!(
            "$$events?: ReturnType<__sveltets_Render<{gn}>['events']>"
        ));
    }
    if has_slot_elements {
        events_slots_parts.push(format!(
            "$$slots?: ReturnType<__sveltets_Render<{gn}>['slots']>"
        ));
        events_slots_parts.push("children?: any".to_string());
    }
    let events_slots_inner = events_slots_parts.join(", ");
    let _ = writeln!(
        closing,
        "    <{gp}>(internal: unknown, props: ReturnType<__sveltets_Render<{gn}>['props']> & {{{events_slots_inner}}}): ReturnType<__sveltets_Render<{gn}>['exports']>;"
    );
    let _ = writeln!(
        closing,
        "    z_$$bindings?: ReturnType<__sveltets_Render<{any_params}>['bindings']>;"
    );
    closing.push_str("}\n");

    let _ = writeln!(
        closing,
        "const {safe_name}: $$IsomorphicComponent = null as any;"
    );
    let _ = writeln!(
        closing,
        "/*\u{03A9}ignore_start\u{03A9}*/type {safe_name}<{gp}> = InstanceType<typeof {safe_name}<{gn}>>;"
    );
    let _ = write!(
        closing,
        "/*\u{03A9}ignore_end\u{03A9}*/export default {safe_name};"
    );
}

/// Escape a string for use as the body of a single-quoted JS string literal.
/// Used to interpolate slot names / slot prop keys into the generated TS output
/// without producing invalid JS when a name carries `'`, `\\`, or control
/// characters (issue #455, H-092).
fn escape_js_single_quoted(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '\\' => out.push_str("\\\\"),
            '\'' => out.push_str("\\'"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                let _ = write!(out, "\\u{:04x}", c as u32);
            }
            c => out.push(c),
        }
    }
    out
}

/// Collect slot names from the template AST.
///
/// Walks the fragment tree looking for `<slot>` elements and collects their names.
/// A slot without a `name` attribute is the "default" slot.
fn collect_slot_names_from_ast(fragment: &crate::ast::template::Fragment) -> Vec<String> {
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
                    if let crate::ast::template::Attribute::Attribute(node) = attr
                        && node.name == "name"
                        && let crate::ast::template::AttributeValue::Sequence(parts) = &node.value
                    {
                        for part in parts {
                            if let crate::ast::template::AttributeValuePart::Text(text) = part {
                                slot_name = text.raw.to_string();
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

                // Official trims the whole doc *before* deciding single- vs
                // multi-line (`componentDocumentation = data.replace('@component',
                // '').trim()`, then `if (!doc.includes('\n'))`). So a comment
                // whose only newlines surround a single line of text (e.g.
                // `<!--@component\nText\n-->`) is emitted as a single-line
                // `/** Text */`. Check the trimmed content for newlines.
                let is_multiline = after_tag.trim().contains('\n');

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
        TemplateNode::DeclarationTag(n) => n.start,
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
        TemplateNode::DeclarationTag(n) => n.end,
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

/// Conservative whole-word substring search. Returns `true` when `needle`
/// appears in `haystack` with non-identifier bytes on either side. Used as
/// a fast pre-filter before an expensive AST parse — false positives waste
/// a few microseconds, but false negatives must be impossible, which holds
/// because any real `import` or `await` statement contains those exact
/// bytes as a word.
fn contains_word(haystack: &[u8], needle: &[u8]) -> bool {
    if needle.is_empty() || haystack.len() < needle.len() {
        return false;
    }
    let first = needle[0];
    let mut i = 0;
    while i + needle.len() <= haystack.len() {
        let off = match memchr::memchr(first, &haystack[i..]) {
            Some(o) => o,
            None => return false,
        };
        let pos = i + off;
        if pos + needle.len() > haystack.len() {
            return false;
        }
        if &haystack[pos..pos + needle.len()] == needle {
            let before_ok = pos == 0
                || !(haystack[pos - 1].is_ascii_alphanumeric()
                    || haystack[pos - 1] == b'_'
                    || haystack[pos - 1] == b'$');
            let after = pos + needle.len();
            let after_ok = after == haystack.len()
                || !(haystack[after].is_ascii_alphanumeric()
                    || haystack[after] == b'_'
                    || haystack[after] == b'$');
            if before_ok && after_ok {
                return true;
            }
        }
        i = pos + 1;
    }
    false
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
/// Returns `(comments_start, import_start, import_end)` for each top-level
/// import in `script`. `comments_start <= import_start` — the leading comment
/// span lets the caller hoist JSDoc / line comments alongside their import,
/// matching the JS reference's `moveNode` per-comment moves.
fn find_instance_imports(
    script: &crate::ast::template::Script,
    source: &str,
) -> Vec<(u32, u32, u32)> {
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

    // Fast path: an `import` substring is required for any import
    // declaration to exist. Skip the OXC parse entirely for the majority
    // of scripts that have no imports.
    if !contains_word(raw_content.as_bytes(), b"import") {
        return Vec::new();
    }

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

            imports.push((new_start as u32, start, end));
        }
    }
    imports.sort_by_key(|&(s, _, _)| s);
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

// =============================================================================
// External import rewriting (mirrors helpers/rewriteExternalImports.ts)
// =============================================================================

fn parent_dir(path: &str) -> String {
    match path.rfind('/') {
        Some(0) => "/".to_string(),
        Some(i) => path[..i].to_string(),
        None => "".to_string(),
    }
}

/// POSIX-style `path.resolve(base, rel)` — joins `base` and `rel` and
/// normalises away `.` / `..` components.
fn resolve_posix(base: &str, rel: &str) -> String {
    let abs = base.starts_with('/');
    let mut parts: Vec<&str> = base
        .split('/')
        .filter(|s| !s.is_empty() && *s != ".")
        .collect();
    for p in rel.split('/') {
        if p.is_empty() || p == "." {
            continue;
        }
        if p == ".." {
            parts.pop();
        } else {
            parts.push(p);
        }
    }
    let joined = parts.join("/");
    if abs { format!("/{}", joined) } else { joined }
}

/// POSIX-style `path.relative(from, to)`.
fn relative_posix(from: &str, to: &str) -> String {
    let from_parts: Vec<&str> = from.split('/').filter(|s| !s.is_empty()).collect();
    let to_parts: Vec<&str> = to.split('/').filter(|s| !s.is_empty()).collect();
    let common = from_parts
        .iter()
        .zip(to_parts.iter())
        .take_while(|(a, b)| a == b)
        .count();
    let mut result: Vec<String> = Vec::new();
    for _ in common..from_parts.len() {
        result.push("..".to_string());
    }
    for p in to_parts.iter().skip(common) {
        result.push((*p).to_string());
    }
    if result.is_empty() {
        ".".to_string()
    } else {
        result.join("/")
    }
}

fn is_within_dir(target: &str, dir: &str) -> bool {
    let dir = dir.trim_end_matches('/');
    target == dir || target.starts_with(&format!("{}/", dir))
}

fn split_specifier(spec: &str) -> (&str, &str) {
    let q = spec.find('?');
    let h = spec.find('#');
    let cut = match (q, h) {
        (None, None) => return (spec, ""),
        (Some(q), None) => q,
        (None, Some(h)) => h,
        (Some(q), Some(h)) => q.min(h),
    };
    (&spec[..cut], &spec[cut..])
}

fn compute_rewrite(specifier: &str, opts: &RewriteExternalImportsOptions) -> Option<String> {
    let (path_part, suffix) = split_specifier(specifier);
    if !path_part.starts_with("../") {
        return None;
    }
    let source_dir = parent_dir(&opts.source_path);
    let generated_dir = parent_dir(&opts.generated_path);
    let target = resolve_posix(&source_dir, path_part);
    if is_within_dir(&target, &opts.workspace_path) {
        return None;
    }
    let rewritten = relative_posix(&generated_dir, &target);
    let full = format!("{}{}", rewritten, suffix);
    if full == specifier {
        return None;
    }
    Some(full)
}

#[inline]
fn is_ws_byte(b: u8) -> bool {
    matches!(b, b' ' | b'\t' | b'\n' | b'\r')
}

#[inline]
fn is_ident_byte_local(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'$'
}

/// String-level version of `rewrite_external_imports` — same scanner, but
/// returns a freshly-rewritten `String` instead of mutating a MagicString.
/// Used for the synthesised `import_text` chunk that is generated from the
/// original source (not from the MagicString) and therefore needs its own
/// pass so the hoisted imports also pick up the rewrite.
fn rewrite_external_specifiers_in_text(text: &str, opts: &RewriteExternalImportsOptions) -> String {
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut out = String::with_capacity(text.len());
    let mut copied = 0usize;
    let mut i = 0;

    let try_rewrite_specifier =
        |spec_start: usize, spec_end: usize, out: &mut String, copied: &mut usize| {
            let spec = &text[spec_start..spec_end];
            if let Some(rewrite) = compute_rewrite(spec, opts) {
                out.push_str(&text[*copied..spec_start]);
                out.push_str(&rewrite);
                *copied = spec_end;
            }
        };

    while i < len {
        let b = bytes[i];

        if b == b'\'' || b == b'"' {
            let q = b;
            i += 1;
            while i < len && bytes[i] != q {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                    continue;
                }
                i += 1;
            }
            i = (i + 1).min(len);
            continue;
        }

        if b == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }

        if b == b'f' && i + 4 <= len && &bytes[i..i + 4] == b"from" {
            let prev_ok = i == 0 || !is_ident_byte_local(bytes[i - 1]);
            if prev_ok {
                let mut j = i + 4;
                while j < len && is_ws_byte(bytes[j]) {
                    j += 1;
                }
                if j < len && (bytes[j] == b'\'' || bytes[j] == b'"') {
                    let q = bytes[j];
                    let spec_start = j + 1;
                    let mut spec_end = spec_start;
                    while spec_end < len && bytes[spec_end] != q {
                        spec_end += 1;
                    }
                    try_rewrite_specifier(spec_start, spec_end, &mut out, &mut copied);
                    i = spec_end + 1;
                    continue;
                }
            }
        }

        if b == b'i' && i + 6 <= len && &bytes[i..i + 6] == b"import" {
            let prev_ok = i == 0 || !is_ident_byte_local(bytes[i - 1]);
            if prev_ok {
                let mut j = i + 6;
                while j < len && is_ws_byte(bytes[j]) {
                    j += 1;
                }
                if j < len && bytes[j] == b'(' {
                    j += 1;
                    while j < len && is_ws_byte(bytes[j]) {
                        j += 1;
                    }
                    if j < len && (bytes[j] == b'\'' || bytes[j] == b'"') {
                        let q = bytes[j];
                        let spec_start = j + 1;
                        let mut spec_end = spec_start;
                        while spec_end < len && bytes[spec_end] != q {
                            spec_end += 1;
                        }
                        try_rewrite_specifier(spec_start, spec_end, &mut out, &mut copied);
                        i = spec_end + 1;
                        continue;
                    }
                }
            }
        }

        i += 1;
    }
    if copied < text.len() {
        out.push_str(&text[copied..]);
    }
    out
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
        if let Some(stripped) = ident.strip_prefix('$')
            && !stripped.is_empty()
            && !stripped.starts_with('$')
        {
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
            '>' if depth > 0 => depth -= 1,
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

    // Fast path: an `await` substring is required for any top-level await
    // to exist. Skip the OXC parse entirely when the keyword is absent.
    if !contains_word(content.as_bytes(), b"await") {
        return false;
    }

    let allocator = Allocator::default();
    let source_type = SourceType::ts().with_module(true);
    let parser = OxcParser::new(&allocator, content, source_type);
    let result = parser.parse();

    // Mirror upstream `processInstanceScriptContent.ts` which sets
    // `hasTopLevelAwait = true` whenever an AwaitExpression is visited at the
    // root scope (i.e. not inside any Block / FunctionLike node).
    //
    // We do not have the upstream's full AST-walker machinery, but we can
    // replicate the effect for the cases that actually occur in Svelte
    // components:
    //
    //   • `VariableDeclaration` at module top-level whose initialiser
    //     *contains* an AwaitExpression (e.g. `let x = $derived(await f())`
    //     or `const user = await getUser()`).
    //   • `ExpressionStatement` at module top-level whose expression
    //     *contains* an AwaitExpression (e.g. `y = await promise`).
    //
    // For both, we use a deep recursive scan that stops at function
    // boundaries (`FunctionExpression` / `ArrowFunctionExpression`) — those
    // introduce a new scope and their inner `await` is NOT top-level.
    for stmt in result.program.body.iter() {
        match stmt {
            oxc::Statement::VariableDeclaration(decl) => {
                for declarator in decl.declarations.iter() {
                    if let Some(ref init) = declarator.init
                        && expr_contains_await_deep(init)
                    {
                        return true;
                    }
                }
            }
            oxc::Statement::ExpressionStatement(expr)
                if expr_contains_await_deep(&expr.expression) =>
            {
                return true;
            }
            _ => {}
        }
    }
    false
}

/// Deep check: returns `true` if `expr` is, or transitively contains (outside
/// any function boundary), an `AwaitExpression`.
///
/// Mirrors the upstream TypeScript walker's `scope === rootScope` predicate:
/// we recurse into all expression sub-nodes but stop when entering a
/// `FunctionExpression` or `ArrowFunctionExpression` (a new async scope
/// whose internal `await` is not "top-level" for the Svelte component).
///
/// Reference: `processInstanceScriptContent.ts` lines 246-349
///   `if (ts.isBlock(node) || ts.isFunctionLike(node)) pushScope();`
///   `if (isSvelte5Plus && ts.isAwaitExpression(node) && scope === rootScope)`
fn expr_contains_await_deep(expr: &oxc_ast::ast::Expression) -> bool {
    use oxc_ast::ast::{Argument, Expression as E};

    match expr {
        // Base case: this expression is an await.
        E::AwaitExpression(_) => true,

        // Function boundaries: do NOT recurse — their inner awaits are in a
        // new scope and are not "top-level" from the component's perspective.
        E::ArrowFunctionExpression(_) | E::FunctionExpression(_) => false,

        // Parenthesised expression: transparent wrapper.
        E::ParenthesizedExpression(p) => expr_contains_await_deep(&p.expression),

        // Assignment: `x = await y` or `x = f(await y)` — check the RHS.
        // (LHS is a pattern/identifier and cannot contain await directly.)
        E::AssignmentExpression(a) => expr_contains_await_deep(&a.right),

        // Binary / logical: check both sides.
        E::BinaryExpression(b) => {
            expr_contains_await_deep(&b.left) || expr_contains_await_deep(&b.right)
        }
        E::LogicalExpression(l) => {
            expr_contains_await_deep(&l.left) || expr_contains_await_deep(&l.right)
        }

        // Conditional: test ? consequent : alternate.
        E::ConditionalExpression(c) => {
            expr_contains_await_deep(&c.test)
                || expr_contains_await_deep(&c.consequent)
                || expr_contains_await_deep(&c.alternate)
        }

        // Unary / yield: single argument.
        E::UnaryExpression(u) => expr_contains_await_deep(&u.argument),
        E::YieldExpression(y) => y
            .argument
            .as_ref()
            .is_some_and(|a| expr_contains_await_deep(a)),

        // Sequence: any expression in the list.
        E::SequenceExpression(s) => s.expressions.iter().any(expr_contains_await_deep),

        // Call expression: callee + arguments.  This is the key case for
        // `$derived(await x)` — the callee is `$derived` and the argument
        // is an AwaitExpression.
        //
        // `Argument` inherits `Expression` variants via `@inherit Expression`;
        // `to_expression()` panics for `SpreadElement` (handled first in the
        // match), and returns the inner `&Expression` for all other variants.
        E::CallExpression(call) => {
            expr_contains_await_deep(&call.callee)
                || call.arguments.iter().any(|arg| match arg {
                    Argument::SpreadElement(sp) => expr_contains_await_deep(&sp.argument),
                    _ => expr_contains_await_deep(arg.to_expression()),
                })
        }

        // `new Foo(await x)`.
        E::NewExpression(n) => n.arguments.iter().any(|arg| match arg {
            Argument::SpreadElement(sp) => expr_contains_await_deep(&sp.argument),
            _ => expr_contains_await_deep(arg.to_expression()),
        }),

        // Member expressions: `obj[await key]` or `obj.prop`.
        E::ComputedMemberExpression(c) => {
            expr_contains_await_deep(&c.object) || expr_contains_await_deep(&c.expression)
        }
        E::StaticMemberExpression(s) => expr_contains_await_deep(&s.object),
        E::PrivateFieldExpression(p) => expr_contains_await_deep(&p.object),

        // Template literals: `${await x}`.
        E::TemplateLiteral(tl) => tl.expressions.iter().any(expr_contains_await_deep),
        E::TaggedTemplateExpression(tt) => {
            expr_contains_await_deep(&tt.tag)
                || tt.quasi.expressions.iter().any(expr_contains_await_deep)
        }

        // Everything else (literals, identifiers, `this`, …) cannot contain await.
        _ => false,
    }
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

/// Port of `classNameFromFilename` from
/// `submodules/language-tools/packages/svelte2tsx/src/svelte2tsx/addComponentExport.ts`.
///
/// Algorithm:
/// 1. Take the final path segment (after the last `/`), then everything before the
///    first `.` — this is `withoutExtensions`.
/// 2. Keep only `[A-Za-z_\d-]` characters — `withoutInvalidCharacters`.
/// 3. Find the index of the first ASCII letter (`firstValidCharIdx`).
/// 4. `withoutLeadingInvalidCharacters = withoutInvalidCharacters.substr(firstValidCharIdx)`.
///    JS `substr(-1)` (when no letter is found, idx = -1) returns the **last character**
///    of the string.
/// 5. `inPascalCase = scule_pascal_case(withoutLeadingInvalidCharacters)`.
/// 6. If no letter was found (`firstValidCharIdx == -1`), prepend `"A"`.
fn derive_component_name(filename: &str) -> String {
    // Step 1: basename up to first dot  (mirrors `path.parse(filename).name?.split('.')[0]`)
    let basename = filename.rsplit('/').next().unwrap_or(filename);
    let basename = basename.rsplit('\\').next().unwrap_or(basename);
    let without_extensions = basename.split('.').next().unwrap_or("");

    // Step 2: keep only [A-Za-z_\d-]
    let without_invalid: String = without_extensions
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '_' || *c == '-')
        .collect();

    // Step 3: find first ASCII letter
    let first_valid_char_idx: Option<usize> = without_invalid
        .chars()
        .position(|c| c.is_ascii_alphabetic());

    // Step 4: JS substr(firstValidCharIdx)
    //   - When idx == -1 (no letter), JS substr(-1) returns the LAST character.
    //   - When idx >= 0, take from that index onward.
    let without_leading: &str = match first_valid_char_idx {
        Some(idx) => {
            // idx is a char-position; since all chars are ASCII, byte == char index.
            &without_invalid[idx..]
        }
        None => {
            // No ASCII letter: mimic JS substr(-1) → last character of the string.
            // If the string is empty, this yields "" (empty slice).
            if without_invalid.is_empty() {
                ""
            } else {
                let last_char_byte = without_invalid
                    .char_indices()
                    .last()
                    .map(|(i, _)| i)
                    .unwrap_or(0);
                &without_invalid[last_char_byte..]
            }
        }
    };

    // Step 5: apply scule pascalCase
    let in_pascal_case = scule_pascal_case(without_leading);

    // Step 6: prepend "A" when no letter was present
    if first_valid_char_idx.is_none() {
        format!("A{}", in_pascal_case)
    } else {
        in_pascal_case
    }
}

/// Port of scule's `pascalCase` (no-normalize variant used by svelte2tsx).
///
/// `pascalCase(str) = splitByCase(str).map(upperFirst).join("")`
///
/// Reference: `node_modules/scule/dist/index.mjs` (used by svelte2tsx).
fn scule_pascal_case(s: &str) -> String {
    split_by_case(s)
        .into_iter()
        .map(|part| upper_first(&part))
        .collect()
}

/// Uppercase only the first character of a string (scule `upperFirst`).
fn upper_first(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(first) => {
            let mut result = String::with_capacity(s.len());
            for c in first.to_uppercase() {
                result.push(c);
            }
            result.extend(chars);
            result
        }
    }
}

/// Port of scule's `splitByCase` with default splitters `["-", "_", "/", "."]`.
///
/// Three-state `isUppercase`:
///   - digit  → `None`      (never triggers a split)
///   - upper  → `Some(true)`
///   - lower  → `Some(false)`
///
/// Splits occur:
///   - On a splitter character (push current buffer, reset).
///   - On a lower→UPPER transition (camelCase boundary).
///   - On a UPPER→lower transition when buffer length > 1 (e.g. "ABCWidget" → ["ABC","Widget"]).
///
/// `previousSplitter` starts as `None` (not-false), so the transition checks are
/// skipped for the very first character.
fn split_by_case(s: &str) -> Vec<String> {
    const SPLITTERS: [char; 4] = ['-', '_', '/', '.'];

    let mut parts: Vec<String> = Vec::new();
    let mut buff = String::new();
    // Three-state: None = unset (first char), Some(true) = was splitter, Some(false) = not splitter
    let mut previous_splitter: Option<bool> = None;
    let mut previous_upper: Option<bool> = None; // None = digit/unset, Some(true/false)

    for ch in s.chars() {
        let is_splitter = SPLITTERS.contains(&ch);

        if is_splitter {
            parts.push(buff.clone());
            buff.clear();
            previous_upper = None;
            previous_splitter = Some(true);
            continue;
        }

        // isUppercase: digit → None, else compare with lowercase
        let is_upper: Option<bool> = if ch.is_ascii_digit() {
            None
        } else if ch.is_uppercase() {
            Some(true)
        } else {
            Some(false)
        };

        // Transition checks only when previousSplitter === false (not a splitter and not unset)
        if previous_splitter == Some(false) {
            // lower → UPPER: start a new part
            if previous_upper == Some(false) && is_upper == Some(true) {
                parts.push(buff.clone());
                buff.clear();
                buff.push(ch);
                previous_upper = is_upper;
                previous_splitter = Some(false);
                continue;
            }
            // UPPER → lower when buff.len() > 1: split off all-but-last char of buffer
            if previous_upper == Some(true) && is_upper == Some(false) && buff.len() > 1 {
                let last_char = buff.chars().last().unwrap();
                let split_point = buff.len() - last_char.len_utf8();
                parts.push(buff[..split_point].to_string());
                buff = format!("{}{}", last_char, ch);
                previous_upper = is_upper;
                previous_splitter = Some(false);
                continue;
            }
        }

        buff.push(ch);
        previous_upper = is_upper;
        previous_splitter = Some(false);
    }

    parts.push(buff);
    parts
}

#[cfg(test)]
mod scule_tests {
    use super::*;

    #[test]
    fn test_split_by_case_basics() {
        assert_eq!(split_by_case("my-component"), vec!["my", "component"]);
        // "ABCWidget": UPPER→lower fires on 'i' after buff="ABCW" → ["ABC","Widget"]
        assert_eq!(split_by_case("ABCWidget"), vec!["ABC", "Widget"]);
        // "XMLHttp": UPPER→lower fires on 't' after buff="XMLH" → ["XML","Http"]
        assert_eq!(split_by_case("XMLHttp"), vec!["XML", "Http"]);
        assert_eq!(split_by_case("a1b2"), vec!["a1b2"]);
    }
}

// NOTE on runes detection: svelte2tsx deliberately uses its OWN runes heuristic
// (the `detect_*`/`ExportedNames::is_runes_mode` machinery) rather than the
// compiler's authoritative `ComponentAnalysis::runes` flag. The two genuinely
// DIVERGE: the compiler treats `$host` / `$inspect` / `$bindable` (and certain
// shadowing/scope cases) as runes — semantically correct — but official
// `svelte2tsx`'s `hasRunesGlobals` only counts `$state` / `$derived` / `$effect`
// (plus `$props` / explicit / top-level await). Since this port targets
// byte-parity with official `svelte2tsx`, it must mirror svelte2tsx's narrower
// definition; wiring in the compiler flag was measured to REGRESS the corpus
// (it over-detects runes for ~24 `$host`-only / shadowed-derived components).

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

/// Detect `await` expressions inside template expression tags, e.g. `{await t}`.
///
/// This walks the template fragment AST looking for `ExpressionTag` nodes whose
/// expression is (or begins with) an `AwaitExpression`. Await-in-template forces
/// runes mode — async template expressions are Svelte 5 runes-only.
///
/// NOTE: `{#await ...}` block syntax is NOT detected here — only bare `await`
/// inside `{...}` expression tags counts.
///
/// Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts
///   `isRunes = true when component has AWAIT INSIDE A TEMPLATE EXPRESSION`
///   ("True if uses runes or top level await or await in template expressions")
fn detect_await_in_template(ast: &Root, source: &str) -> bool {
    // Fast path: if the source doesn't contain `await` as a word, bail immediately.
    if !contains_word(source.as_bytes(), b"await") {
        return false;
    }

    fragment_has_template_await(&ast.fragment, source, &ast.arena)
}

/// Recursively walk a template fragment checking for `{await ...}` ExpressionTags.
fn fragment_has_template_await(
    fragment: &crate::ast::template::Fragment,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    for node in &fragment.nodes {
        if template_node_has_await(node, source, arena) {
            return true;
        }
    }
    false
}

/// Check a single template node for `{await ...}` patterns, recursing into children.
/// True if the template fragment contains a real `<slot>` element anywhere
/// (recursing through elements, components, control-flow blocks, and snippets).
/// AST-based replacement for a naive `source.contains("<slot")` scan.
fn fragment_has_slot_element(fragment: &crate::ast::template::Fragment) -> bool {
    fragment.nodes.iter().any(node_has_slot_element)
}

fn node_has_slot_element(node: &crate::ast::template::TemplateNode) -> bool {
    use crate::ast::template::TemplateNode as N;
    match node {
        N::SlotElement(_) => true,
        N::RegularElement(e) => fragment_has_slot_element(&e.fragment),
        N::Component(c) => fragment_has_slot_element(&c.fragment),
        N::SvelteComponent(c) => fragment_has_slot_element(&c.fragment),
        N::SvelteElement(e) => fragment_has_slot_element(&e.fragment),
        N::TitleElement(e) => fragment_has_slot_element(&e.fragment),
        N::SvelteHead(e)
        | N::SvelteFragment(e)
        | N::SvelteBody(e)
        | N::SvelteWindow(e)
        | N::SvelteDocument(e)
        | N::SvelteBoundary(e)
        | N::SvelteOptions(e)
        | N::SvelteSelf(e) => fragment_has_slot_element(&e.fragment),
        N::IfBlock(b) => {
            fragment_has_slot_element(&b.consequent)
                || b.alternate.as_ref().is_some_and(fragment_has_slot_element)
        }
        N::EachBlock(b) => {
            fragment_has_slot_element(&b.body)
                || b.fallback.as_ref().is_some_and(fragment_has_slot_element)
        }
        N::KeyBlock(b) => fragment_has_slot_element(&b.fragment),
        N::SnippetBlock(b) => fragment_has_slot_element(&b.body),
        N::AwaitBlock(b) => {
            b.pending.as_ref().is_some_and(fragment_has_slot_element)
                || b.then.as_ref().is_some_and(fragment_has_slot_element)
                || b.catch.as_ref().is_some_and(fragment_has_slot_element)
        }
        _ => false,
    }
}

fn template_node_has_await(
    node: &crate::ast::template::TemplateNode,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::template::TemplateNode;

    match node {
        // The key check: ExpressionTag with an AwaitExpression.
        TemplateNode::ExpressionTag(tag) => expression_is_await(&tag.expression, source, arena),
        // Recurse into element children and attributes
        TemplateNode::RegularElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_await(attr, source, arena))
                || fragment_has_template_await(&elem.fragment, source, arena)
        }
        TemplateNode::Component(comp) => {
            comp.attributes
                .iter()
                .any(|attr| attr_has_await(attr, source, arena))
                || fragment_has_template_await(&comp.fragment, source, arena)
        }
        TemplateNode::IfBlock(block) => {
            // Also check the `{#if await cond}` test expression — mirrors 2_analyze
            // which walks `block.test` for has_await.
            expression_is_await(&block.test, source, arena)
                || fragment_has_template_await(&block.consequent, source, arena)
                || block
                    .alternate
                    .as_ref()
                    .map(|alt| fragment_has_template_await(alt, source, arena))
                    .unwrap_or(false)
        }
        TemplateNode::EachBlock(block) => {
            expression_is_await(&block.expression, source, arena)
                || fragment_has_template_await(&block.body, source, arena)
                || block
                    .fallback
                    .as_ref()
                    .map(|fb| fragment_has_template_await(fb, source, arena))
                    .unwrap_or(false)
        }
        TemplateNode::KeyBlock(block) => {
            expression_is_await(&block.expression, source, arena)
                || fragment_has_template_await(&block.fragment, source, arena)
        }
        // SnippetBlock: official svelte2tsx's `isRunes` sets true for an
        // AwaitExpression whose ancestor path has no function-expression node —
        // a SnippetBlock is NOT such a node, so an `await` inside a snippet body
        // (e.g. `{#snippet}{@const x = await …}{/snippet}`) DOES force runes.
        // (This is svelte2tsx-specific; the compiler's 2_analyze skips snippets,
        // but this detector mirrors svelte2tsx, not the compiler.)
        TemplateNode::SnippetBlock(block) => {
            fragment_has_template_await(&block.body, source, arena)
        }
        // AwaitBlock ({#await expr}) — the `expression` could itself contain an
        // await (e.g. `{#await await promise}`). Also recurse into the pending /
        // then / catch sub-fragments since they can contain nested {await ...}
        // ExpressionTags. Mirrors 2_analyze AwaitBlock fragment_check_features walk.
        TemplateNode::AwaitBlock(block) => {
            expression_is_await(&block.expression, source, arena)
                || block
                    .pending
                    .as_ref()
                    .map(|f| fragment_has_template_await(f, source, arena))
                    .unwrap_or(false)
                || block
                    .then
                    .as_ref()
                    .map(|f| fragment_has_template_await(f, source, arena))
                    .unwrap_or(false)
                || block
                    .catch
                    .as_ref()
                    .map(|f| fragment_has_template_await(f, source, arena))
                    .unwrap_or(false)
        }
        // SvelteHead, SvelteFragment, SvelteBody, SvelteWindow, SvelteDocument,
        // SvelteBoundary, SvelteOptions, SvelteSelf — all use the SvelteElement struct.
        TemplateNode::SvelteHead(elem)
        | TemplateNode::SvelteFragment(elem)
        | TemplateNode::SvelteBody(elem)
        | TemplateNode::SvelteWindow(elem)
        | TemplateNode::SvelteDocument(elem)
        | TemplateNode::SvelteBoundary(elem)
        | TemplateNode::SvelteOptions(elem)
        | TemplateNode::SvelteSelf(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_await(attr, source, arena))
                || fragment_has_template_await(&elem.fragment, source, arena)
        }
        TemplateNode::SvelteComponent(comp) => {
            comp.attributes
                .iter()
                .any(|attr| attr_has_await(attr, source, arena))
                || fragment_has_template_await(&comp.fragment, source, arena)
        }
        TemplateNode::SvelteElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_await(attr, source, arena))
                || fragment_has_template_await(&elem.fragment, source, arena)
        }
        TemplateNode::TitleElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_await(attr, source, arena))
                || fragment_has_template_await(&elem.fragment, source, arena)
        }
        TemplateNode::SlotElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_await(attr, source, arena))
                || fragment_has_template_await(&elem.fragment, source, arena)
        }
        // HtmlTag ({@html expr}) and RenderTag ({@render expr}) — if the expression
        // itself is an AwaitExpression (e.g. `{@html await t}`) trigger runes mode.
        TemplateNode::HtmlTag(tag) => expression_is_await(&tag.expression, source, arena),
        TemplateNode::RenderTag(tag) => expression_is_await(&tag.expression, source, arena),
        // `{@const x = await …}` — a top-level await in a const-tag declaration
        // makes the component async (e.g. inside `<svelte:boundary>`).
        TemplateNode::ConstTag(ct) => expression_is_await(&ct.declaration, source, arena),
        // Text, Comment, DeclarationTag, DebugTag, AttachTag — the primary
        // trigger is ExpressionTag; these are less common.
        _ => false,
    }
}

/// Check if an attribute value contains an await expression in any ExpressionTag part.
fn attr_has_await(
    attr: &crate::ast::template::Attribute,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::template::Attribute;
    use crate::ast::template::AttributeValue;
    use crate::ast::template::AttributeValuePart;

    // Mirror official's template walk, which sets `isRunes` on ANY top-level
    // `AwaitExpression` regardless of which attribute/directive it lives in
    // (e.g. `class:x={await y}`, `style:c={await z}`, `use:a={await b}`,
    // `bind:v={await w}`). Previously only plain attributes were checked, so
    // an await confined to a directive failed to flip runes mode and the
    // `bindings:` field was emitted in legacy (`""`) instead of runes
    // (`__sveltets_$$bindings('')`) form.
    let value_has_await = |value: &AttributeValue| match value {
        AttributeValue::Expression(expr_tag) => {
            expression_is_await(&expr_tag.expression, source, arena)
        }
        AttributeValue::Sequence(parts) => parts.iter().any(|part| {
            if let AttributeValuePart::ExpressionTag(tag) = part {
                expression_is_await(&tag.expression, source, arena)
            } else {
                false
            }
        }),
        AttributeValue::True(_) => false,
    };
    let opt_expr_has_await = |expr: &Option<crate::ast::js::Expression>| {
        expr.as_ref()
            .is_some_and(|e| expression_is_await(e, source, arena))
    };

    match attr {
        Attribute::Attribute(attr_node) => value_has_await(&attr_node.value),
        Attribute::SpreadAttribute(s) => expression_is_await(&s.expression, source, arena),
        Attribute::AttachTag(t) => expression_is_await(&t.expression, source, arena),
        Attribute::ClassDirective(d) => expression_is_await(&d.expression, source, arena),
        Attribute::BindDirective(d) => expression_is_await(&d.expression, source, arena),
        Attribute::StyleDirective(d) => value_has_await(&d.value),
        Attribute::OnDirective(d) => opt_expr_has_await(&d.expression),
        Attribute::TransitionDirective(d) => opt_expr_has_await(&d.expression),
        Attribute::AnimateDirective(d) => opt_expr_has_await(&d.expression),
        Attribute::UseDirective(d) => opt_expr_has_await(&d.expression),
        Attribute::LetDirective(_) => false,
    }
}

/// Check if an Expression node is (or begins with) an AwaitExpression.
///
/// For `Typed` expressions, checks the top-level JsNode variant.
/// For `Lazy` expressions (source spans), checks the source text.
/// For `Value` (JSON) expressions, checks the JSON `type` field.
fn expression_is_await(
    expr: &crate::ast::js::Expression,
    source: &str,
    _arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::js::Expression;
    use crate::ast::typed_expr::JsNode;

    // A top-level `await` ANYWHERE inside the expression makes the component
    // async (→ runes), not only when the whole expression IS an await — e.g.
    // `{(await user).name}`, `{foo(await x)}`, `{cond ? await a : b}`. Fast-path
    // the direct `{await x}` form, then scan the expression's source span for
    // `await` as a word, which covers every nesting depth. (A literal "await"
    // string is a rare false positive; svelte itself treats such components as
    // async too once a template `await` is present.)
    let direct = match expr {
        Expression::Typed(te) => matches!(&te.node, JsNode::AwaitExpression { .. }),
        Expression::Value(v) => v.get("type").and_then(|t| t.as_str()) == Some("AwaitExpression"),
        Expression::Lazy { .. } => false,
    };
    if direct {
        return true;
    }
    // Non-direct: a `await` nested in e.g. `(await user).name` / `foo(await x)`
    // still makes the component async — BUT an `await` inside a nested function
    // (`() => await x`) is a different scope and must NOT count (mirrors the
    // upstream `scope === rootScope` rule). Approximate the function-boundary
    // check on the source span: count the `await` only when the expression
    // contains no function boundary (`=>` / `function`), which keeps the common
    // member/call/conditional cases without over-triggering on callbacks.
    if let (Some(s), Some(e)) = (expr.start(), expr.end()) {
        let (s, e) = (s as usize, e as usize);
        if s < e && e <= source.len() {
            let span = &source.as_bytes()[s..e];
            return contains_word(span, b"await")
                && !span.windows(2).any(|w| w == b"=>")
                && !contains_word(span, b"function");
        }
    }
    false
}

// =============================================================================
// Rune-global-in-template detection
//
// Mirrors the official `checkGlobalsForRunes` pass which treats every undeclared
// `$state` / `$derived` / `$effect` identifier anywhere in the component (script
// OR template) as evidence of runes mode.  The instance-script scanner handles
// the `<script>` side; these helpers cover the template side so that components
// with NO `<script>` but with e.g. `{$state.eager(x)}` are correctly classified.
//
// Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/index.ts
//   `exportedNames.checkGlobalsForRunes(implicitStoreValues.getGlobals())`
// Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts
//   `hasRunesGlobals = isSvelte5Plus && globals.some(g => ['$state','$derived','$effect'].includes(g))`
// =============================================================================

/// Detect any `$state`/`$derived`/`$effect` rune-global reference inside the
/// template fragment.
///
/// Fast-path: returns `false` immediately when none of the three magic words
/// appear as a word boundary in the raw source.  The AST walk is only done when
/// a quick substring match succeeds.
fn detect_rune_global_in_template(ast: &Root, source: &str) -> bool {
    // Fast path: if neither $state, $derived, nor $effect appears in the source
    // as a word start, bail immediately.  These identifiers always start with `$`
    // so a simple substring check is conservative (won't false-positive on
    // e.g. `some_$state_like_string` since we still walk the AST after this).
    if !source.contains("$state") && !source.contains("$derived") && !source.contains("$effect") {
        return false;
    }

    fragment_has_template_rune_global(&ast.fragment, source, &ast.arena)
}

/// Recursively walk a template fragment checking for rune-global references.
fn fragment_has_template_rune_global(
    fragment: &crate::ast::template::Fragment,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    for node in &fragment.nodes {
        if template_node_has_rune_global(node, source, arena) {
            return true;
        }
    }
    false
}

/// Check a single template node for rune-global references, recursing into children.
fn template_node_has_rune_global(
    node: &crate::ast::template::TemplateNode,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::template::TemplateNode;

    match node {
        // The primary check: ExpressionTag { expr } — check if the expression
        // references a $state/$derived/$effect global.
        TemplateNode::ExpressionTag(tag) => {
            expression_references_rune_global(&tag.expression, source, arena)
        }
        // Recurse into element children and attributes
        TemplateNode::RegularElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_rune_global(attr, source, arena))
                || fragment_has_template_rune_global(&elem.fragment, source, arena)
        }
        TemplateNode::Component(comp) => {
            comp.attributes
                .iter()
                .any(|attr| attr_has_rune_global(attr, source, arena))
                || fragment_has_template_rune_global(&comp.fragment, source, arena)
        }
        TemplateNode::IfBlock(block) => {
            expression_references_rune_global(&block.test, source, arena)
                || fragment_has_template_rune_global(&block.consequent, source, arena)
                || block
                    .alternate
                    .as_ref()
                    .map(|alt| fragment_has_template_rune_global(alt, source, arena))
                    .unwrap_or(false)
        }
        TemplateNode::EachBlock(block) => {
            expression_references_rune_global(&block.expression, source, arena)
                || fragment_has_template_rune_global(&block.body, source, arena)
                || block
                    .fallback
                    .as_ref()
                    .map(|fb| fragment_has_template_rune_global(fb, source, arena))
                    .unwrap_or(false)
        }
        TemplateNode::KeyBlock(block) => {
            expression_references_rune_global(&block.expression, source, arena)
                || fragment_has_template_rune_global(&block.fragment, source, arena)
        }
        // SnippetBlock: official's global collection (checkGlobalsForRunes via
        // implicitStoreValues) walks the whole component including snippet
        // bodies, so a rune call inside a snippet (`{#snippet}{@const x =
        // $derived(…)}{/snippet}`) forces runes mode. Recurse into the body.
        TemplateNode::SnippetBlock(block) => {
            fragment_has_template_rune_global(&block.body, source, arena)
        }
        TemplateNode::AwaitBlock(block) => {
            expression_references_rune_global(&block.expression, source, arena)
                || block
                    .pending
                    .as_ref()
                    .map(|f| fragment_has_template_rune_global(f, source, arena))
                    .unwrap_or(false)
                || block
                    .then
                    .as_ref()
                    .map(|f| fragment_has_template_rune_global(f, source, arena))
                    .unwrap_or(false)
                || block
                    .catch
                    .as_ref()
                    .map(|f| fragment_has_template_rune_global(f, source, arena))
                    .unwrap_or(false)
        }
        // SvelteHead, SvelteFragment, SvelteBody, SvelteWindow, SvelteDocument,
        // SvelteBoundary, SvelteOptions, SvelteSelf — all use the SvelteElement struct.
        TemplateNode::SvelteHead(elem)
        | TemplateNode::SvelteFragment(elem)
        | TemplateNode::SvelteBody(elem)
        | TemplateNode::SvelteWindow(elem)
        | TemplateNode::SvelteDocument(elem)
        | TemplateNode::SvelteBoundary(elem)
        | TemplateNode::SvelteOptions(elem)
        | TemplateNode::SvelteSelf(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_rune_global(attr, source, arena))
                || fragment_has_template_rune_global(&elem.fragment, source, arena)
        }
        TemplateNode::SvelteComponent(comp) => {
            comp.attributes
                .iter()
                .any(|attr| attr_has_rune_global(attr, source, arena))
                || fragment_has_template_rune_global(&comp.fragment, source, arena)
        }
        TemplateNode::SvelteElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_rune_global(attr, source, arena))
                || fragment_has_template_rune_global(&elem.fragment, source, arena)
        }
        TemplateNode::TitleElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_rune_global(attr, source, arena))
                || fragment_has_template_rune_global(&elem.fragment, source, arena)
        }
        TemplateNode::SlotElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_rune_global(attr, source, arena))
                || fragment_has_template_rune_global(&elem.fragment, source, arena)
        }
        // HtmlTag ({@html expr}) and RenderTag ({@render expr})
        TemplateNode::HtmlTag(tag) => {
            expression_references_rune_global(&tag.expression, source, arena)
        }
        TemplateNode::RenderTag(tag) => {
            expression_references_rune_global(&tag.expression, source, arena)
        }
        // AttachTag ({@attach expr}) — the expression may contain nested
        // rune calls, e.g. `{@attach $effect(() => { ... })}`.
        // Reference: official svelte2tsx collects `@attach` expression globals
        // via `implicitStoreValues` just like any other template expression.
        TemplateNode::AttachTag(tag) => {
            expression_references_rune_global(&tag.expression, source, arena)
        }
        // `{@const x = $derived(…)}` and `{let x = $state(0), …}` carry rune
        // calls in their declaration; official collects their globals like any
        // other template expression, so a runes-only component with no script
        // (only template declaration tags) still enters runes mode. The
        // declaration is a `VariableDeclaration` (which the typed/JSON rune
        // walkers don't descend into), so scan the tag's source slice directly.
        TemplateNode::ConstTag(tag) => {
            let (s, e) = (tag.start as usize, tag.end as usize);
            s < e && e <= source.len() && lazy_slice_references_rune_global(&source[s..e])
        }
        TemplateNode::DeclarationTag(tag) => {
            let (s, e) = (tag.start as usize, tag.end as usize);
            s < e && e <= source.len() && lazy_slice_references_rune_global(&source[s..e])
        }
        _ => false,
    }
}

/// Check if an attribute (of any kind) contains a rune-global reference.
///
/// Covers all `Attribute` variants:
/// - `Attribute` (plain attribute with expression/sequence value)
/// - `SpreadAttribute` (spread expression)
/// - `AttachTag` (`{@attach expr}` used inside element attribute position)
/// - All directives: `bind:`, `on:`, `class:`, `style:`, `transition:`,
///   `animate:`, `use:`, `let:` — each may carry an expression value.
///
/// Reference: official svelte2tsx passes ALL template expressions through
/// `implicitStoreValues` (which collects globals), not just plain attributes.
/// Mirrors the comprehensive directive coverage in `attr_has_await`.
fn attr_has_rune_global(
    attr: &crate::ast::template::Attribute,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::template::Attribute;
    use crate::ast::template::AttributeValue;
    use crate::ast::template::AttributeValuePart;

    match attr {
        // Plain attribute: check expression / sequence values.
        Attribute::Attribute(attr_node) => match &attr_node.value {
            AttributeValue::Expression(expr_tag) => {
                expression_references_rune_global(&expr_tag.expression, source, arena)
            }
            AttributeValue::Sequence(parts) => parts.iter().any(|part| {
                if let AttributeValuePart::ExpressionTag(tag) = part {
                    expression_references_rune_global(&tag.expression, source, arena)
                } else {
                    false
                }
            }),
            AttributeValue::True(_) => false,
        },

        // Spread attribute: `{...expr}` — check the spread expression.
        Attribute::SpreadAttribute(spread) => {
            expression_references_rune_global(&spread.expression, source, arena)
        }

        // AttachTag in attribute position: `{@attach expr}`.
        Attribute::AttachTag(attach) => {
            expression_references_rune_global(&attach.expression, source, arena)
        }

        // bind:name={expr} — expression is always present.
        Attribute::BindDirective(bind) => {
            expression_references_rune_global(&bind.expression, source, arena)
        }

        // on:event={handler} — expression is Optional<Expression>.
        Attribute::OnDirective(on) => on
            .expression
            .as_ref()
            .is_some_and(|e| expression_references_rune_global(e, source, arena)),

        // class:name={expr} — expression is always present.
        Attribute::ClassDirective(class) => {
            expression_references_rune_global(&class.expression, source, arena)
        }

        // style:property={value} — value is AttributeValue (same shape as plain attr).
        Attribute::StyleDirective(style) => match &style.value {
            AttributeValue::Expression(expr_tag) => {
                expression_references_rune_global(&expr_tag.expression, source, arena)
            }
            AttributeValue::Sequence(parts) => parts.iter().any(|part| {
                if let AttributeValuePart::ExpressionTag(tag) = part {
                    expression_references_rune_global(&tag.expression, source, arena)
                } else {
                    false
                }
            }),
            AttributeValue::True(_) => false,
        },

        // transition:name={params} / in: / out: — expression is Optional.
        Attribute::TransitionDirective(t) => t
            .expression
            .as_ref()
            .is_some_and(|e| expression_references_rune_global(e, source, arena)),

        // animate:name={params} — expression is Optional.
        Attribute::AnimateDirective(a) => a
            .expression
            .as_ref()
            .is_some_and(|e| expression_references_rune_global(e, source, arena)),

        // use:action={params} — expression is Optional.
        Attribute::UseDirective(u) => u
            .expression
            .as_ref()
            .is_some_and(|e| expression_references_rune_global(e, source, arena)),

        // let:item — rarely carries a rune call, but check for completeness.
        Attribute::LetDirective(l) => l
            .expression
            .as_ref()
            .is_some_and(|e| expression_references_rune_global(e, source, arena)),
    }
}

/// Returns `true` if `name` is one of the three rune-global identifiers.
#[inline]
fn is_rune_global_name(name: &str) -> bool {
    matches!(name, "$state" | "$derived" | "$effect")
}

/// Check whether an Expression node references a `$state`/`$derived`/`$effect` global.
///
/// For `Typed` expressions, walks the JsNode tree stored in the parse arena.
/// For `Lazy` expressions (raw source spans), scans the source text.
/// For `Value` (JSON) expressions, inspects the JSON AST.
///
/// The walk is deliberately shallow-but-sufficient: it recurses into the callee
/// of a CallExpression and the object of a MemberExpression (the two patterns
/// that can reference a rune global — `$state(x)` and `$state.eager(x)`) but
/// does NOT recurse into every sub-expression.  Template expressions that use
/// rune globals almost always have the global as the outermost callee or
/// member-expression object, so this covers all real-world cases while keeping
/// the implementation simple and fast.
///
/// Reference: ExportedNames.ts `checkGlobalsForRunes` which sets
///   `hasRunesGlobals` when any of `$state`/`$derived`/`$effect` appear as an
///   undeclared identifier anywhere in the component globals set.
fn expression_references_rune_global(
    expr: &crate::ast::js::Expression,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::js::Expression;

    match expr {
        Expression::Typed(te) => js_node_references_rune_global(&te.node, arena),
        Expression::Value(v) => json_references_rune_global(v, 0),
        Expression::Lazy { start, end, .. } => {
            // Raw source slice — scan for `$state`, `$derived`, `$effect` as
            // identifier-like occurrences.  We already know the full source
            // contains one of these strings (fast-path in
            // `detect_rune_global_in_template`), so this walk is uncommon.
            let s = *start as usize;
            let e = *end as usize;
            if s < e && e <= source.len() {
                let slice = &source[s..e];
                lazy_slice_references_rune_global(slice)
            } else {
                false
            }
        }
    }
}

/// Check whether a callee `JsNode` directly IS a rune-global call target.
///
/// A callee is a rune-global target when it is:
///   - An `Identifier` named `$state`/`$derived`/`$effect`  (direct call: `$state(x)`)
///   - A `MemberExpression` whose object is such an identifier  (`$state.eager(x)`)
///
/// This intentionally does NOT recurse further — if the callee is something more
/// complex, it is not a rune call pattern.
#[inline]
fn js_callee_is_rune_global(
    callee: &crate::ast::typed_expr::JsNode,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::typed_expr::JsNode;
    match callee {
        JsNode::Identifier { name, .. } => is_rune_global_name(name.as_str()),
        JsNode::MemberExpression { object, .. } => {
            let obj = arena.get_js_node(*object);
            matches!(obj, JsNode::Identifier { name, .. } if is_rune_global_name(name.as_str()))
        }
        _ => false,
    }
}

/// Walk a `JsNode` (typed AST node stored in the parse arena) looking for a
/// `$state`/`$derived`/`$effect` rune call anywhere in the expression tree.
///
/// A RUNE CALL means the global is used as a call callee or as the object of a
/// member-expression that is itself used as a call callee.  A bare `$state`
/// identifier that is just a store auto-subscription (`{$state}`) does NOT match.
///
/// Handles patterns like:
///   - `$state(x)`                     → CallExpression callee = Identifier "$state"
///   - `$state.eager(x)`               → CallExpression callee = MemberExpression { object = Identifier "$state" }
///   - `$effect.pre(() => …)`          → same
///   - `foo($state(x))`                → arguments contain a rune CallExpression
///   - `a === '/' ? $state(x) : null`  → ConditionalExpression branches
///   - `() => $effect(() => {})`       → ArrowFunctionExpression body
///   - `{@attach $effect(() => {})}`   → ArrowFunctionExpression body in AttachTag
///   - `[..., $state(x)]`              → ArrayExpression element
///   - `{ k: $derived(v) }`            → ObjectExpression property value
///
/// Does NOT match:
///   - `{$state}` (bare store auto-subscription; no call)
///   - `$state + 1` (store ref in arithmetic; no call)
///
/// Reference: official `implicitStoreValues` collects ALL undeclared globals,
/// including those inside nested function bodies passed to directives.
fn js_node_references_rune_global(
    node: &crate::ast::typed_expr::JsNode,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::typed_expr::JsNode;
    match node {
        // CallExpression: the callee must be a rune-global target (direct call
        // `$state(...)` or member-call `$state.eager(...)`).  Also recurse into
        // arguments so nested rune calls like `foo($state(x))` are caught.
        JsNode::CallExpression {
            callee, arguments, ..
        } => {
            let callee_node = arena.get_js_node(*callee);
            if js_callee_is_rune_global(callee_node, arena) {
                return true;
            }
            // Recurse into arguments to catch `foo($state(x))`.
            let args = arena.get_js_children(*arguments);
            args.iter()
                .any(|arg| js_node_references_rune_global(arg, arena))
        }

        // ConditionalExpression: check test, consequent, alternate.
        // E.g. `$state.eager(x) === '/' ? 'page' : null` — the test is the
        // BinaryExpression; we recurse into it and then into the call.
        JsNode::ConditionalExpression {
            test,
            consequent,
            alternate,
            ..
        } => {
            js_node_references_rune_global(arena.get_js_node(*test), arena)
                || js_node_references_rune_global(arena.get_js_node(*consequent), arena)
                || js_node_references_rune_global(arena.get_js_node(*alternate), arena)
        }

        // BinaryExpression / LogicalExpression: check both sides.
        // E.g. `$state.eager(pathname) === '/'` — the left side is the call.
        JsNode::BinaryExpression { left, right, .. }
        | JsNode::LogicalExpression { left, right, .. } => {
            js_node_references_rune_global(arena.get_js_node(*left), arena)
                || js_node_references_rune_global(arena.get_js_node(*right), arena)
        }

        // ArrowFunctionExpression: recurse into the body.
        // Covers `{@attach $effect(() => { ... })}` and
        // `use:action={() => $state(x)}` patterns.
        // The body is a JsNodeId pointing to either a BlockStatement or an
        // expression (when `expression: true`).
        JsNode::ArrowFunctionExpression { body, .. } => {
            let body_node = arena.get_js_node(*body);
            js_node_references_rune_global(body_node, arena)
        }

        // FunctionExpression: recurse into the body (a BlockStatement or None).
        // E.g. `use:action={function() { $effect(() => {}); }}`.
        JsNode::FunctionExpression { body, .. } => body
            .map(|b| {
                let body_node = arena.get_js_node(b);
                js_node_references_rune_global(body_node, arena)
            })
            .unwrap_or(false),

        // BlockStatement: recurse into each statement.
        // Reached from FunctionExpression / ArrowFunctionExpression bodies.
        JsNode::BlockStatement { body, .. } => {
            let stmts = arena.get_js_children(*body);
            stmts
                .iter()
                .any(|s| js_node_references_rune_global(s, arena))
        }

        // ExpressionStatement: unwrap to the inner expression.
        JsNode::ExpressionStatement { expression, .. } => {
            js_node_references_rune_global(arena.get_js_node(*expression), arena)
        }

        // ObjectExpression: recurse into property values.
        // E.g. `use:action={{ key: $state(x) }}`.
        JsNode::ObjectExpression { properties, .. } => {
            let props = arena.get_js_children(*properties);
            props.iter().any(|p| {
                if let JsNode::Property { value, .. } = p {
                    js_node_references_rune_global(arena.get_js_node(*value), arena)
                } else {
                    false
                }
            })
        }

        // ArrayExpression: recurse into elements (elements are inline, not arena-indexed).
        // E.g. `{[$state(a), $derived(b)]}`.
        JsNode::ArrayExpression { elements, .. } => elements.iter().any(|elem| {
            elem.as_ref()
                .is_some_and(|e| js_node_references_rune_global(e, arena))
        }),

        // SequenceExpression: recurse into each sub-expression.
        // E.g. `{(doSomething(), $state(x))}`.
        JsNode::SequenceExpression { expressions, .. } => {
            let exprs = arena.get_js_children(*expressions);
            exprs
                .iter()
                .any(|e| js_node_references_rune_global(e, arena))
        }

        // AwaitExpression: recurse into the argument.
        // Rare in template context but possible.
        JsNode::AwaitExpression { argument, .. } => {
            js_node_references_rune_global(arena.get_js_node(*argument), arena)
        }

        // UnaryExpression: recurse into argument (e.g. `!$state(x)`).
        JsNode::UnaryExpression { argument, .. } => {
            js_node_references_rune_global(arena.get_js_node(*argument), arena)
        }

        // AssignmentExpression: check right-hand side.
        // E.g. `x = $state(0)` inside a function body.
        JsNode::AssignmentExpression { right, .. } => {
            js_node_references_rune_global(arena.get_js_node(*right), arena)
        }

        // VariableDeclaration / VariableDeclarator: recurse into each
        // declarator's initializer — e.g. `const state = $state({…})` inside an
        // event-handler arrow body (`onsubmit={e => { const s = $state(…) }}`).
        JsNode::VariableDeclaration { declarations, .. } => {
            let decls = arena.get_js_children(*declarations);
            decls
                .iter()
                .any(|d| js_node_references_rune_global(d, arena))
        }
        JsNode::VariableDeclarator { init, .. } => init
            .map(|i| js_node_references_rune_global(arena.get_js_node(i), arena))
            .unwrap_or(false),

        // ReturnStatement / IfStatement bodies can also host rune calls.
        JsNode::ReturnStatement { argument, .. } => argument
            .map(|a| js_node_references_rune_global(arena.get_js_node(a), arena))
            .unwrap_or(false),

        // Bare Identifier (e.g. `{$state}` — store auto-subscription) → NOT a rune call.
        // MemberExpression without being called (e.g. `$state.value` as a bare expr) → NOT a rune call.
        // These are legitimate store/object references, not rune invocations.
        _ => false,
    }
}

/// Check whether a JSON callee node directly IS a rune-global call target.
/// Mirrors `js_callee_is_rune_global` for the `Expression::Value` path.
fn json_callee_is_rune_global(callee: &serde_json::Value) -> bool {
    let ty = callee.get("type").and_then(|t| t.as_str()).unwrap_or("");
    match ty {
        // Direct call: `$state(x)` — callee is Identifier "$state"
        "Identifier" => callee
            .get("name")
            .and_then(|n| n.as_str())
            .is_some_and(is_rune_global_name),
        // Member call: `$state.eager(x)` — callee is MemberExpression { object: Identifier "$state" }
        "MemberExpression" => callee
            .get("object")
            .and_then(|o| {
                if o.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
                    o.get("name").and_then(|n| n.as_str())
                } else {
                    None
                }
            })
            .is_some_and(is_rune_global_name),
        _ => false,
    }
}

/// Walk a JSON-encoded expression AST looking for a rune-global CALL.
///
/// This covers the `Expression::Value` variant (legacy / fallback AST path).
/// Only matches when a rune global is actually invoked (called), not when it
/// appears as a bare store auto-subscription reference like `{$state}`.
/// Recurse up to a bounded depth to avoid unbounded recursion.
///
/// Extended (mirrors `js_node_references_rune_global`) to recurse into:
/// - ArrowFunctionExpression / FunctionExpression bodies
/// - BlockStatement statements
/// - ExpressionStatement inner expression
/// - ObjectExpression property values
/// - ArrayExpression elements
/// - SequenceExpression sub-expressions
/// - AwaitExpression / UnaryExpression arguments
/// - AssignmentExpression right-hand side
fn json_references_rune_global(v: &serde_json::Value, depth: u8) -> bool {
    if depth > 20 {
        return false;
    }
    let ty = v.get("type").and_then(|t| t.as_str()).unwrap_or("");
    match ty {
        // CallExpression: the callee must be a rune-global target.
        // Also recurse into arguments to catch `foo($state(x))`.
        "CallExpression" => {
            v.get("callee").is_some_and(json_callee_is_rune_global)
                || v.get("arguments")
                    .and_then(|a| a.as_array())
                    .is_some_and(|arr| {
                        arr.iter()
                            .any(|arg| json_references_rune_global(arg, depth + 1))
                    })
        }
        "ConditionalExpression" => ["test", "consequent", "alternate"].iter().any(|field| {
            v.get(*field)
                .is_some_and(|c| json_references_rune_global(c, depth + 1))
        }),
        "BinaryExpression" | "LogicalExpression" => {
            v.get("left")
                .is_some_and(|c| json_references_rune_global(c, depth + 1))
                || v.get("right")
                    .is_some_and(|c| json_references_rune_global(c, depth + 1))
        }
        // Arrow/function bodies: recurse into `body`.
        "ArrowFunctionExpression" | "FunctionExpression" => v
            .get("body")
            .is_some_and(|b| json_references_rune_global(b, depth + 1)),
        // BlockStatement: recurse into each statement in `body`.
        "BlockStatement" => v
            .get("body")
            .and_then(|b| b.as_array())
            .is_some_and(|stmts| {
                stmts
                    .iter()
                    .any(|s| json_references_rune_global(s, depth + 1))
            }),
        // ExpressionStatement: unwrap to expression field.
        "ExpressionStatement" => v
            .get("expression")
            .is_some_and(|e| json_references_rune_global(e, depth + 1)),
        // ObjectExpression: recurse into property values.
        "ObjectExpression" => v
            .get("properties")
            .and_then(|p| p.as_array())
            .is_some_and(|props| {
                props.iter().any(|prop| {
                    prop.get("value")
                        .is_some_and(|val| json_references_rune_global(val, depth + 1))
                })
            }),
        // ArrayExpression: recurse into elements (may contain nulls for elisions).
        "ArrayExpression" => v
            .get("elements")
            .and_then(|e| e.as_array())
            .is_some_and(|elems| {
                elems
                    .iter()
                    .filter(|e| !e.is_null())
                    .any(|e| json_references_rune_global(e, depth + 1))
            }),
        // SequenceExpression: recurse into each sub-expression.
        "SequenceExpression" => {
            v.get("expressions")
                .and_then(|e| e.as_array())
                .is_some_and(|exprs| {
                    exprs
                        .iter()
                        .any(|e| json_references_rune_global(e, depth + 1))
                })
        }
        // AwaitExpression / UnaryExpression: recurse into argument.
        "AwaitExpression" | "UnaryExpression" => v
            .get("argument")
            .is_some_and(|a| json_references_rune_global(a, depth + 1)),
        // AssignmentExpression: check right-hand side.
        "AssignmentExpression" => v
            .get("right")
            .is_some_and(|r| json_references_rune_global(r, depth + 1)),
        // Bare "Identifier" (`{$state}` store ref), "MemberExpression" without call, etc.
        // → NOT a rune invocation.
        _ => false,
    }
}

/// Scan a raw source slice (from a `Lazy` expression) for a rune-global CALL.
///
/// Only triggers when `$state`/`$derived`/`$effect` is immediately followed by
/// `(` (direct call) or `.` (member call like `$state.eager(…)`).  A bare
/// `$state` with no following `(` or `.` is a store auto-subscription reference
/// and must NOT trigger runes mode.
fn lazy_slice_references_rune_global(slice: &str) -> bool {
    for candidate in &["$state", "$derived", "$effect"] {
        let mut search_from = 0;
        while let Some(rel) = slice[search_from..].find(candidate) {
            let idx = search_from + rel;
            let after = idx + candidate.len();
            if after < slice.len() {
                let next = slice.as_bytes()[after];
                // Require `(` (direct call) or `.` (member call).
                // Also ensure the match is not inside a longer identifier
                // (e.g. `$state_machine` — `$` is a valid JS identifier char).
                if next == b'(' || next == b'.' {
                    return true;
                }
            }
            search_from = idx + 1;
        }
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_derive_component_name() {
        // Ground-truth cases verified against the official svelte2tsx classNameFromFilename.
        assert_eq!(derive_component_name("App.svelte"), "App");
        assert_eq!(derive_component_name("my-component.svelte"), "MyComponent");
        assert_eq!(derive_component_name("my_component.svelte"), "MyComponent");
        assert_eq!(derive_component_name("path/to/Input.svelte"), "Input");
        assert_eq!(derive_component_name("123.svelte"), "A3");
        assert_eq!(derive_component_name("1.svelte"), "A1");
        assert_eq!(derive_component_name("foo.bar.svelte"), "Foo");
        assert_eq!(derive_component_name("ABCWidget.svelte"), "ABCWidget");
        assert_eq!(derive_component_name("XMLHttp.svelte"), "XMLHttp");
        assert_eq!(derive_component_name("a1b2.svelte"), "A1b2");
        assert_eq!(derive_component_name("_x.svelte"), "X");
        assert_eq!(derive_component_name("two words.svelte"), "Twowords");
        assert_eq!(derive_component_name(".svelte"), "A");
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

    // =============================================================================
    // Runes-mode detection tests
    //
    // Ground truth: empirically verified against the official svelte2tsx tool.
    // RUNES components emit `__sveltets_2_fn_component`.
    // LEGACY components emit `__sveltets_2_isomorphic_component`.
    // Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts
    //   `isRunesMode() { return this.hasRunesGlobals || this.hasPropsRune() || this.isRunes; }`
    // =============================================================================

    fn run_svelte2tsx_v5(source: &str) -> String {
        let opts = Svelte2TsxOptions {
            filename: "Test.svelte".to_string(),
            ..Default::default()
        };
        svelte2tsx(source, opts)
            .unwrap_or_else(|e| panic!("svelte2tsx failed: {e:?}"))
            .code
    }

    // --- RUNES cases (must emit fn_component) ---

    /// `$state(0)` in a variable declaration → hasRunesGlobals ($state is undeclared).
    #[test]
    fn test_runes_state_var_decl() {
        let code = run_svelte2tsx_v5("<script>let x=$state(0)</script>{x}");
        assert!(
            code.contains("__sveltets_2_fn_component"),
            "$state() var-decl should be runes mode; got:\n{code}"
        );
    }

    /// `$props()` usage → hasPropsRune.
    #[test]
    fn test_runes_props_rune() {
        let code = run_svelte2tsx_v5("<script>let {a}=$props()</script>{a}");
        assert!(
            code.contains("__sveltets_2_fn_component"),
            "$props() should be runes mode; got:\n{code}"
        );
    }

    /// `$derived(1)` in a variable declaration → hasRunesGlobals.
    #[test]
    fn test_runes_derived_var_decl() {
        let code = run_svelte2tsx_v5("<script>let x=$derived(1)</script>{x}");
        assert!(
            code.contains("__sveltets_2_fn_component"),
            "$derived() var-decl should be runes mode; got:\n{code}"
        );
    }

    /// `$effect(() => {})` as a standalone ExpressionStatement → hasRunesGlobals.
    /// This was previously missed (only VariableDeclarations were checked).
    #[test]
    fn test_runes_effect_expr_stmt() {
        let code = run_svelte2tsx_v5("<script>$effect(()=>{})</script>x");
        assert!(
            code.contains("__sveltets_2_fn_component"),
            "$effect() expr-stmt should be runes mode; got:\n{code}"
        );
    }

    /// Top-level `await` in the instance script → isRunes (async components are runes-only).
    #[test]
    fn test_runes_top_level_await_script() {
        let code = run_svelte2tsx_v5("<script>const x=await fetch(1)</script>{x}");
        assert!(
            code.contains("__sveltets_2_fn_component"),
            "top-level await in script should be runes mode; got:\n{code}"
        );
    }

    /// `await` inside a template expression tag → isRunes.
    #[test]
    fn test_runes_await_in_template_expr() {
        let code = run_svelte2tsx_v5("<script>const t=getTime()</script>{await t}");
        assert!(
            code.contains("__sveltets_2_fn_component"),
            "await in template expression should be runes mode; got:\n{code}"
        );
    }

    // --- LEGACY cases (must emit isomorphic_component) ---

    /// No script at all → legacy.
    #[test]
    fn test_legacy_no_script() {
        let code = run_svelte2tsx_v5("<p>hi</p>");
        assert!(
            code.contains("__sveltets_2_isomorphic_component"),
            "no-script should be legacy mode; got:\n{code}"
        );
    }

    /// `export let` props → legacy.
    #[test]
    fn test_legacy_export_let() {
        let code = run_svelte2tsx_v5("<script>export let a</script>{a}");
        assert!(
            code.contains("__sveltets_2_isomorphic_component"),
            "export-let should be legacy mode; got:\n{code}"
        );
    }

    /// Plain `let a = 1` (no rune) → legacy.
    #[test]
    fn test_legacy_plain_let() {
        let code = run_svelte2tsx_v5("<script>let a=1</script>{a}");
        assert!(
            code.contains("__sveltets_2_isomorphic_component"),
            "plain let should be legacy mode; got:\n{code}"
        );
    }

    // =============================================================================
    // Rune-global-in-template detection tests
    //
    // A component with NO `<script>` but with `$state.eager(x)` / `$derived(...)` /
    // `$effect(...)` in a template expression must be treated as RUNES because
    // `implicitStoreValues.getGlobals()` collects those identifiers and
    // `checkGlobalsForRunes` fires.
    //
    // Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/index.ts
    //   `exportedNames.checkGlobalsForRunes(implicitStoreValues.getGlobals())`
    // =============================================================================

    /// `$state.eager(pathname)` referenced in a template attribute expression and
    /// NO `<script>` → must be runes mode (fn_component), not legacy.
    ///
    /// Ground truth: official svelte2tsx classifies this as RUNES because
    /// `$state` is an undeclared global collected by `implicitStoreValues`.
    ///
    /// Concrete example from corpus: `…/02-$state.md/12.svelte`
    ///   `<nav><a href="/" aria-current={$state.eager(pathname)==='/'?'page':null}>home</a></nav>`
    #[test]
    fn test_runes_state_eager_in_template_attr() {
        let code = run_svelte2tsx_v5(
            "<nav><a href=\"/\" aria-current={$state.eager(pathname) === '/' ? 'page' : null}>home</a></nav>",
        );
        assert!(
            code.contains("__sveltets_2_fn_component"),
            "$state.eager() in template attribute must be runes mode; got:\n{code}"
        );
        assert!(
            !code.contains("__sveltets_2_isomorphic_component"),
            "$state.eager() in template attribute must NOT be legacy mode; got:\n{code}"
        );
    }

    /// `$state(x)` as a direct call in a template expression tag → runes.
    #[test]
    fn test_runes_state_direct_in_template_expr() {
        let code = run_svelte2tsx_v5("<p>{$state(0)}</p>");
        assert!(
            code.contains("__sveltets_2_fn_component"),
            "$state() in template expression must be runes mode; got:\n{code}"
        );
    }

    /// `$derived(a + b)` in a template expression tag and NO `<script>` → runes.
    #[test]
    fn test_runes_derived_in_template_expr() {
        let code = run_svelte2tsx_v5("<p>{$derived(a + b)}</p>");
        assert!(
            code.contains("__sveltets_2_fn_component"),
            "$derived() in template expression must be runes mode; got:\n{code}"
        );
    }

    /// `$effect.pre(...)` in a template expression → runes (member-call variant).
    #[test]
    fn test_runes_effect_pre_in_template_expr() {
        let code = run_svelte2tsx_v5("<p>{$effect.pre(() => {})}</p>");
        assert!(
            code.contains("__sveltets_2_fn_component"),
            "$effect.pre() in template expression must be runes mode; got:\n{code}"
        );
    }

    /// `{@attach $effect(() => {})}` — rune global nested inside an arrow function
    /// body of an AttachTag expression → must be runes mode (fn_component).
    ///
    /// Ground truth: official svelte2tsx collects `$effect` as an undeclared global
    /// via `implicitStoreValues` even when it appears inside a nested function body
    /// passed to `{@attach ...}`.
    #[test]
    fn test_runes_effect_nested_in_attach_tag() {
        let code = run_svelte2tsx_v5("<div {@attach $effect(() => {})}></div>");
        assert!(
            code.contains("__sveltets_2_fn_component"),
            "$effect() nested in {{@attach}} must be runes mode; got:\n{code}"
        );
        assert!(
            !code.contains("__sveltets_2_isomorphic_component"),
            "$effect() in {{@attach}} must NOT be legacy mode; got:\n{code}"
        );
    }

    /// `use:action={() => $state(0)}` — rune global inside arrow function body
    /// of a `use:` directive → must be runes mode.
    #[test]
    fn test_runes_state_nested_in_use_directive() {
        let code = run_svelte2tsx_v5("<div use:action={() => $state(0)}></div>");
        assert!(
            code.contains("__sveltets_2_fn_component"),
            "$state() nested in use: directive must be runes mode; got:\n{code}"
        );
    }

    /// A plain template with NO rune globals must remain legacy.
    #[test]
    fn test_legacy_template_no_rune_globals() {
        // `pathname` is just a regular identifier — not a rune global.
        let code = run_svelte2tsx_v5(
            "<nav><a href=\"/\" aria-current={pathname === '/' ? 'page' : null}>home</a></nav>",
        );
        assert!(
            code.contains("__sveltets_2_isomorphic_component"),
            "template with no rune globals must be legacy mode; got:\n{code}"
        );
    }

    // =============================================================================
    // svelte:boundary snippet-as-implicit-prop tests
    //
    // Upstream `SnippetBlock.ts::hoistSnippetBlock` returns early for
    // `SvelteBoundary`, treating it exactly like `InlineComponent`: direct
    // `{#snippet}` children become implicit properties of the element's
    // `createElement` attrs object instead of standalone `const` declarations.
    // =============================================================================

    /// `{#snippet pending()}` inside `<svelte:boundary>` must be emitted as an
    /// implicit property of the `createElement` call, not as a standalone `const`.
    ///
    /// Ground truth: upstream svelte2tsx output for
    ///   `<svelte:boundary><p>{await x}</p>{#snippet pending()}<p>loading</p>{/snippet}</svelte:boundary>`
    /// is:
    ///   `svelteHTML.createElement("svelte:boundary", { pending: () => { async () => { ... }; return __sveltets_2_any(0); }, });`
    ///   followed by the non-snippet `<p>` child OUTSIDE the createElement call.
    #[test]
    fn test_boundary_pending_snippet_as_implicit_prop() {
        // The canonical boundary/2.svelte example from the corpus.
        let source = "<svelte:boundary>\n\t<p>child</p>\n\t{#snippet pending()}\n\t\t<p>loading</p>\n\t{/snippet}\n</svelte:boundary>";
        let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
        let code = &result.code;
        eprintln!("BOUNDARY SNIPPET OUTPUT:\n{code}");

        // The snippet must appear as an implicit prop INSIDE the createElement attrs.
        // Note: rsvelte emits `pending:()` (no space); oxfmt normalizes to `pending: ()`.
        assert!(
            code.contains("pending:() => {"),
            "pending snippet must be an implicit attr prop (not a standalone const); got:\n{code}"
        );
        // There must be NO standalone `const pending = ...` declaration.
        assert!(
            !code.contains("const pending"),
            "snippet must NOT also appear as a standalone const; got:\n{code}"
        );
        // The snippet body must close with return __sveltets_2_any(0)},
        // (the trailing comma makes it an object property value).
        assert!(
            code.contains("return __sveltets_2_any(0)},"),
            "snippet body must end with `return __sveltets_2_any(0)}},`; got:\n{code}"
        );
        // The non-snippet <p>child</p> element must still appear (emitted AFTER `});`).
        assert!(
            code.contains("svelteHTML.createElement(\"p\","),
            "non-snippet child <p> must still be emitted; got:\n{code}"
        );
        // Sanity: createElement for the boundary element must be present.
        assert!(
            code.contains("svelteHTML.createElement(\"svelte:boundary\","),
            "boundary createElement call must be present; got:\n{code}"
        );
    }

    /// `{#snippet failed(error, reset)}` (with parameters) inside `<svelte:boundary>`.
    #[test]
    fn test_boundary_failed_snippet_with_params() {
        let source = "<svelte:boundary>\n\t<Component />\n\t{#snippet failed(error, reset)}\n\t\t<button onclick={reset}>retry</button>\n\t{/snippet}\n</svelte:boundary>";
        let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
        let code = &result.code;
        eprintln!("BOUNDARY FAILED SNIPPET OUTPUT:\n{code}");

        // Note: rsvelte emits `failed:(error, reset)` (no space); oxfmt normalizes spacing.
        assert!(
            code.contains("failed:(error, reset) => {"),
            "failed snippet with params must be an implicit attr prop; got:\n{code}"
        );
        assert!(
            !code.contains("const failed"),
            "snippet must NOT appear as a standalone const; got:\n{code}"
        );
        // The Component child must still be emitted after the createElement closes.
        assert!(
            code.contains("__sveltets_2_ensureComponent(Component)"),
            "non-snippet Component child must still be emitted; got:\n{code}"
        );
    }

    // =============================================================================
    // Async component (top-level await) tests
    //
    // Reference: createRenderFunction.ts (async keyword on $$render) and
    //            addComponentExport.ts (`renderCall` / `awaitDeclaration`).
    // =============================================================================

    /// Direct top-level await (`const x = await fetch(1)`) must produce:
    ///   • `async function $$render() {` (the `async` keyword)
    ///   • `/*Ωignore_startΩ*/ const $$$render = await $$render(); /*Ωignore_endΩ*/`
    ///   • `const Foo__SvelteComponent_ = __sveltets_2_fn_component($$$render);`
    #[test]
    fn test_async_component_direct_await() {
        let source = "<script>const x = await fetch('/');</script>{x}";
        let options = Svelte2TsxOptions {
            version: SvelteVersion::V5,
            filename: "Foo.svelte".to_string(),
            is_ts_file: false,
            ..Default::default()
        };
        let code = svelte2tsx(source, options).unwrap().code;
        eprintln!("ASYNC DIRECT:\n{code}");
        assert!(
            code.contains("async function $$render(") || code.contains(";async function $$render("),
            "component with direct top-level await must use `async function $$render`; got:\n{code}"
        );
        assert!(
            code.contains("const $$$render = await $$render()"),
            "component with top-level await must emit `const $$$render = await $$render()` declaration; got:\n{code}"
        );
        assert!(
            code.contains("__sveltets_2_fn_component($$$render)"),
            "component with top-level await must pass `$$$render` (not `$$render()`) to fn_component; got:\n{code}"
        );
        assert!(
            !code.contains("__sveltets_2_fn_component($$render())"),
            "fn_component must NOT use `$$render()` when top-level await is present; got:\n{code}"
        );
    }

    /// Nested top-level await inside `$derived(await x)` must also be detected.
    ///
    /// This tests the deep recursive `expr_contains_await_deep` walk that the old
    /// shallow `contains_await_expression` missed.  Ground truth: upstream
    /// `processInstanceScriptContent.ts` sets `hasTopLevelAwait` for any
    /// AwaitExpression at the root scope, including inside a CallExpression argument.
    #[test]
    fn test_async_component_nested_await_in_derived() {
        let source = "<script>let foo = $derived(await 1);</script>{foo}";
        let options = Svelte2TsxOptions {
            version: SvelteVersion::V5,
            filename: "Test.svelte".to_string(),
            is_ts_file: false,
            ..Default::default()
        };
        let code = svelte2tsx(source, options).unwrap().code;
        eprintln!("ASYNC NESTED DERIVED:\n{code}");
        assert!(
            code.contains("async function $$render(") || code.contains(";async function $$render("),
            "$derived(await x) at top level must produce `async function $$render`; got:\n{code}"
        );
        assert!(
            code.contains("const $$$render = await $$render()"),
            "$derived(await x) must emit awaitDeclaration; got:\n{code}"
        );
        assert!(
            code.contains("__sveltets_2_fn_component($$$render)"),
            "$derived(await x) must pass `$$$render` to fn_component; got:\n{code}"
        );
    }

    /// A normal (non-async) component must keep `function $$render` (no `async`)
    /// and use `$$render()` (not `$$$render`) in the export.
    #[test]
    fn test_non_async_component_no_await_declaration() {
        let source = "<script>let x = 1;</script>{x}";
        let options = Svelte2TsxOptions {
            version: SvelteVersion::V5,
            filename: "Normal.svelte".to_string(),
            is_ts_file: false,
            ..Default::default()
        };
        let code = svelte2tsx(source, options).unwrap().code;
        eprintln!("NON-ASYNC:\n{code}");
        // The function header should NOT be async for a plain component
        assert!(
            !code.contains("async function $$render("),
            "non-async component must NOT use `async function $$render`; got:\n{code}"
        );
        // No awaitDeclaration
        assert!(
            !code.contains("$$$render"),
            "non-async component must NOT emit `$$$render`; got:\n{code}"
        );
    }

    /// `await` inside a function body at the top level must NOT trigger async.
    /// Only awaits at the *component* scope (not inside an inner function) count.
    #[test]
    fn test_async_only_in_inner_function_is_not_top_level() {
        // The `await` is inside `async function c(a) { ... }` — its scope is
        // NOT the component root scope, so `hasTopLevelAwait` must stay false.
        let source =
            "<script>async function c(a) { return await Promise.resolve(a); }</script>{c(1)}";
        let options = Svelte2TsxOptions {
            version: SvelteVersion::V5,
            filename: "Inner.svelte".to_string(),
            is_ts_file: false,
            ..Default::default()
        };
        let code = svelte2tsx(source, options).unwrap().code;
        eprintln!("INNER ASYNC:\n{code}");
        assert!(
            !code.contains("async function $$render("),
            "await inside inner async function must NOT make $$render async; got:\n{code}"
        );
        assert!(
            !code.contains("$$$render"),
            "await inside inner async function must NOT emit $$$render; got:\n{code}"
        );
    }
}
