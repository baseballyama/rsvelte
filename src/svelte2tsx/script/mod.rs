//! Script processing for svelte2tsx.
//!
//! Handles `<script>` and `<script context="module">` blocks in Svelte components.
//! Extracts exported names, component events, and prop declarations to generate
//! proper TypeScript type information.
//!
//! Script AST is obtained by parsing the raw script content via OXC and converting
//! to `serde_json::Value`. This avoids dependency on the thread-local ParseArena
//! used by the main compiler, keeping svelte2tsx self-contained.

use std::collections::HashMap;

use oxc_allocator::Allocator;
#[allow(unused_imports)]
use oxc_ast::ast as oxc;
use oxc_parser::Parser as OxcParser;
#[allow(unused_imports)]
use oxc_span::{GetSpan, SourceType};
use serde_json::Value;

use crate::ast::template::Script;
use crate::compiler::phases::phase1_parse::estree_compat;

use super::magic_string::MagicString;

// =============================================================================
// ExportedNames
// =============================================================================

/// Tracks names exported from a component's script block.
///
/// This includes:
/// - `export let` / `export const` declarations (Svelte 4 props)
/// - `$props()` destructured properties (Svelte 5 runes)
/// - Named exports for module consumers
#[derive(Debug, Clone, Default)]
pub struct ExportedNames {
    /// Map from exported name to its metadata.
    names: HashMap<String, ExportedNameInfo>,
}

/// Metadata about a single exported name.
#[derive(Debug, Clone)]
pub struct ExportedNameInfo {
    /// The local name (may differ from exported name if using `export { local as exported }`).
    pub local_name: String,
    /// Whether this export has a default value.
    pub has_default: bool,
    /// The TypeScript type annotation, if any.
    pub type_annotation: Option<String>,
    /// Whether this is a prop (vs a regular export).
    pub is_prop: bool,
}

impl ExportedNames {
    /// Create a new empty `ExportedNames`.
    pub fn new() -> Self {
        Self {
            names: HashMap::new(),
        }
    }

    /// Add an exported name.
    pub fn add(
        &mut self,
        name: String,
        local_name: String,
        has_default: bool,
        type_annotation: Option<String>,
        is_prop: bool,
    ) {
        self.names.insert(
            name,
            ExportedNameInfo {
                local_name,
                has_default,
                type_annotation,
                is_prop,
            },
        );
    }

    /// Get all exported prop names (names that are component props).
    pub fn get_prop_names(&self) -> Vec<&str> {
        let mut names: Vec<&str> = self
            .names
            .iter()
            .filter(|(_, info)| info.is_prop)
            .map(|(name, _)| name.as_str())
            .collect();
        names.sort();
        names
    }

    /// Get all exported names (both props and regular exports).
    pub fn get_all_names(&self) -> Vec<&str> {
        let mut names: Vec<&str> = self.names.keys().map(|s| s.as_str()).collect();
        names.sort();
        names
    }

    /// Check if a name is exported.
    pub fn has(&self, name: &str) -> bool {
        self.names.contains_key(name)
    }

    /// Get info for a specific exported name.
    pub fn get(&self, name: &str) -> Option<&ExportedNameInfo> {
        self.names.get(name)
    }

    /// Check if there are any exports.
    pub fn is_empty(&self) -> bool {
        self.names.is_empty()
    }
}

// =============================================================================
// ComponentEvents
// =============================================================================

/// Tracks events declared by a component.
///
/// Events can be declared via:
/// - `createEventDispatcher<{ eventName: DetailType }>()` (Svelte 4)
/// - `on:event` forwarding (Svelte 4)
/// - `$props()` with `on*` properties (Svelte 5)
#[derive(Debug, Clone, Default)]
pub struct ComponentEvents {
    /// Map from event name to its type information.
    events: HashMap<String, EventInfo>,
    /// Whether the component forwards all events (uses `$$restProps` with event handlers).
    pub forwards_all_events: bool,
}

/// Metadata about a single component event.
#[derive(Debug, Clone)]
pub struct EventInfo {
    /// The TypeScript type of the event detail.
    pub detail_type: Option<String>,
    /// Whether this event is forwarded from a child element.
    pub is_forwarded: bool,
}

impl ComponentEvents {
    /// Create a new empty `ComponentEvents`.
    pub fn new() -> Self {
        Self {
            events: HashMap::new(),
            forwards_all_events: false,
        }
    }

    /// Add an event declaration.
    pub fn add(&mut self, name: String, detail_type: Option<String>, is_forwarded: bool) {
        self.events.insert(
            name,
            EventInfo {
                detail_type,
                is_forwarded,
            },
        );
    }

    /// Get all event names.
    pub fn get_event_names(&self) -> Vec<&str> {
        let mut names: Vec<&str> = self.events.keys().map(|s| s.as_str()).collect();
        names.sort();
        names
    }

    /// Check if there are any events declared.
    pub fn is_empty(&self) -> bool {
        self.events.is_empty()
    }
}

// =============================================================================
// Script Processing
// =============================================================================

/// Process an instance script block (`<script>`).
///
/// Extracts:
/// - Exported variables (props in Svelte 4, or named exports)
/// - `$props()` usage (Svelte 5 runes)
/// - Event dispatcher declarations
/// - Store subscriptions
///
/// # Arguments
///
/// * `script` - The parsed Script AST node
/// * `source` - The original source code
/// * `str` - The MagicString for source manipulation
/// * `exported_names` - Accumulator for exported names
/// * `events` - Accumulator for component events
pub fn process_instance_script(
    script: &Script,
    source: &str,
    str: &mut MagicString,
    exported_names: &mut ExportedNames,
    _events: &mut ComponentEvents,
) {
    let program = parse_script_to_json(script, source);

    #[cfg(test)]
    eprintln!(
        "PROGRAM JSON: {}",
        serde_json::to_string_pretty(&program).unwrap_or_default()
    );

    if let Some(body) = program.get("body").and_then(|b| b.as_array()) {
        for statement in body {
            let stmt_type = statement.get("type").and_then(|t| t.as_str()).unwrap_or("");
            match stmt_type {
                "ExportNamedDeclaration" => {
                    handle_export_named_declaration(statement, source, str, exported_names, true);
                }
                "VariableDeclaration" => {
                    // Check for $props() usage in non-exported variable declarations
                    if let Some(declarators) =
                        statement.get("declarations").and_then(|d| d.as_array())
                    {
                        for declarator in declarators {
                            detect_props_rune(declarator, exported_names);
                        }
                    }
                }
                _ => {}
            }
        }
    }

    // TODO: Store subscriptions ($store references)
    // TODO: Event dispatchers (createEventDispatcher)
    // TODO: Reactive declarations ($: ...)
}

/// Process a module script block (`<script context="module">`).
///
/// Module scripts contain top-level exports that are accessible from outside
/// the component. These exports are not props.
///
/// # Arguments
///
/// * `script` - The parsed Script AST node
/// * `source` - The original source code
/// * `str` - The MagicString for source manipulation
/// * `exported_names` - Accumulator for exported names
pub fn process_module_script(
    script: &Script,
    source: &str,
    str: &mut MagicString,
    exported_names: &mut ExportedNames,
) {
    let program = parse_script_to_json(script, source);

    if let Some(body) = program.get("body").and_then(|b| b.as_array()) {
        for statement in body {
            let stmt_type = statement.get("type").and_then(|t| t.as_str()).unwrap_or("");
            if stmt_type == "ExportNamedDeclaration" {
                // Module-level exports are never props
                handle_export_named_declaration(statement, source, str, exported_names, false);
            }
        }
    }
}

// =============================================================================
// Script content parsing
// =============================================================================

/// Parse script content to an ESTree-compatible JSON AST using OXC.
///
/// This produces a standalone `serde_json::Value` without requiring the
/// thread-local ParseArena. Positions in the returned AST are absolute
/// (mapped to the original source) thanks to estree_compat's position handling.
fn parse_script_to_json(script: &Script, source: &str) -> Value {
    let content_start = script.content_offset as usize;
    // Find the end of script content: from content_offset to the start of </script>
    // The script.end includes the closing tag, so we search backward for it.
    let script_source = &source[script.start as usize..script.end as usize];
    let close_tag_offset = script_source
        .rfind("</script>")
        .or_else(|| script_source.rfind("</Script>"))
        .unwrap_or(script_source.len());
    let content_end = script.start as usize + close_tag_offset;
    let raw_content = &source[content_start..content_end];

    #[cfg(test)]
    eprintln!(
        "PARSE_SCRIPT: content_start={}, content_end={}, raw_content='{}'",
        content_start, content_end, raw_content
    );

    let allocator = Allocator::default();
    let source_type = if script.is_typescript {
        SourceType::ts()
    } else {
        SourceType::mjs()
    };
    let parser = OxcParser::new(&allocator, raw_content, source_type);
    let result = parser.parse();

    // Compute line offsets for ESTree position conversion
    let line_offsets = estree_compat::compute_line_offsets(raw_content);

    // Convert to ESTree-compatible JSON with proper positions
    let mut json =
        estree_compat::convert_program_to_estree(&result.program, raw_content, &line_offsets);

    // The estree_compat positions are relative to raw_content (starting at 0).
    // Adjust them to be absolute in the original source.
    adjust_positions(&mut json, content_start as u64);

    json
}

/// Recursively adjust all `start` and `end` positions in a JSON AST by an offset.
fn adjust_positions(value: &mut Value, offset: u64) {
    match value {
        Value::Object(obj) => {
            if let Some(start) = obj.get_mut("start")
                && let Some(n) = start.as_u64()
            {
                *start = Value::Number((n + offset).into());
            }
            if let Some(end) = obj.get_mut("end")
                && let Some(n) = end.as_u64()
            {
                *end = Value::Number((n + offset).into());
            }
            for (_, v) in obj.iter_mut() {
                adjust_positions(v, offset);
            }
        }
        Value::Array(arr) => {
            for v in arr.iter_mut() {
                adjust_positions(v, offset);
            }
        }
        _ => {}
    }
}

// =============================================================================
// Internal helpers
// =============================================================================

/// Handle an `ExportNamedDeclaration` AST node.
///
/// This covers:
/// - `export let count = 0;` (prop in instance, non-prop in module)
/// - `export const MAX = 10;` (non-prop)
/// - `export function fn() {}` (non-prop)
/// - `export class Foo {}` (non-prop)
/// - `export { a, b as c };` (re-exports with specifiers)
///
/// The `export` keyword is removed from the source via MagicString, and the
/// exported names are recorded in `exported_names`.
///
/// `is_instance` controls whether `export let` is treated as a prop.
fn handle_export_named_declaration(
    node: &Value,
    source: &str,
    str: &mut MagicString,
    exported_names: &mut ExportedNames,
    is_instance: bool,
) {
    let node_start = node.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as u32;

    // Case 1: export with declaration (export let/const/function/class ...)
    if let Some(decl) = node.get("declaration") {
        let decl_type = decl.get("type").and_then(|t| t.as_str()).unwrap_or("");
        let decl_start = decl.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as u32;

        // Remove the 'export ' keyword: overwrite from node start to declaration start
        // This handles varying whitespace between 'export' and the declaration.
        if decl_start > node_start {
            str.overwrite(node_start, decl_start, "");
        }

        match decl_type {
            "VariableDeclaration" => {
                let kind = decl.get("kind").and_then(|k| k.as_str()).unwrap_or("let");
                // In instance script, `export let` creates props; `export const` does not
                let is_prop = is_instance && kind == "let";

                if let Some(declarators) = decl.get("declarations").and_then(|d| d.as_array()) {
                    for declarator in declarators {
                        // First check if this is a $props() declaration
                        if is_props_call(declarator) {
                            extract_props_from_pattern(
                                declarator.get("id").unwrap_or(&Value::Null),
                                exported_names,
                            );
                        } else {
                            // Regular export: extract the name(s) from the declarator id
                            let has_default = declarator
                                .get("init")
                                .map(|v| !v.is_null())
                                .unwrap_or(false);
                            let type_annotation = extract_type_annotation(declarator);
                            extract_names_from_pattern(
                                declarator.get("id").unwrap_or(&Value::Null),
                                exported_names,
                                has_default,
                                type_annotation.as_deref(),
                                is_prop,
                            );
                        }
                    }
                }
            }
            "FunctionDeclaration" => {
                let name = get_identifier_name(decl.get("id").unwrap_or(&Value::Null));
                if let Some(name) = name {
                    exported_names.add(name.clone(), name, false, None, false);
                }
            }
            "ClassDeclaration" => {
                let name = get_identifier_name(decl.get("id").unwrap_or(&Value::Null));
                if let Some(name) = name {
                    exported_names.add(name.clone(), name, false, None, false);
                }
            }
            _ => {}
        }
    }

    // Case 2: export with specifiers (export { a, b as c };)
    if let Some(specifiers) = node.get("specifiers").and_then(|s| s.as_array())
        && !specifiers.is_empty()
    {
        // Check if there is a source (re-export from another module)
        let has_source = node.get("source").map(|s| !s.is_null()).unwrap_or(false);

        if !has_source {
            // Local re-exports: remove the entire export statement
            let node_end = node.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as u32;

            // Remove the entire `export { ... };` statement
            // We need to be careful to also eat the trailing semicolon and newline
            let end = skip_trailing_whitespace(source, node_end);
            if node_start < end {
                str.overwrite(node_start, end, "");
            }

            for spec in specifiers {
                let local_name = get_export_specifier_local(spec);
                let exported_name = get_export_specifier_exported(spec);
                if let (Some(local), Some(exported)) = (local_name, exported_name) {
                    let is_prop = is_instance && local == exported;
                    exported_names.add(exported, local, false, None, is_prop);
                }
            }
        }
        // If has_source, this is `export { x } from 'y'` - keep as-is, just record names
    }
}

/// Check if a variable declarator's init is a `$props()` call.
fn is_props_call(declarator: &Value) -> bool {
    if let Some(init) = declarator.get("init")
        && init.get("type").and_then(|t| t.as_str()) == Some("CallExpression")
        && let Some(callee) = init.get("callee")
    {
        return callee.get("type").and_then(|t| t.as_str()) == Some("Identifier")
            && callee.get("name").and_then(|n| n.as_str()) == Some("$props");
    }
    false
}

/// Detect `$props()` usage in a variable declarator and extract prop names.
///
/// Handles: `let { a, b = 1, ...rest } = $props();`
fn detect_props_rune(declarator: &Value, exported_names: &mut ExportedNames) {
    if is_props_call(declarator) {
        extract_props_from_pattern(declarator.get("id").unwrap_or(&Value::Null), exported_names);
    }
}

/// Extract prop names from a destructuring pattern used with `$props()`.
///
/// Handles ObjectPattern: `{ a, b = 1, ...rest }`
fn extract_props_from_pattern(pattern: &Value, exported_names: &mut ExportedNames) {
    let pat_type = pattern.get("type").and_then(|t| t.as_str()).unwrap_or("");

    match pat_type {
        "ObjectPattern" => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for prop in properties {
                    let prop_type = prop.get("type").and_then(|t| t.as_str()).unwrap_or("");
                    match prop_type {
                        "Property" => {
                            // { a } or { a = 1 } or { a: b } or { a: b = 1 }
                            let key_name =
                                get_identifier_name(prop.get("key").unwrap_or(&Value::Null));
                            let value = prop.get("value").unwrap_or(&Value::Null);
                            let has_default = is_assignment_pattern(value);

                            // The value can be an Identifier (simple) or AssignmentPattern (default)
                            let local_name = if is_assignment_pattern(value) {
                                // { a = 1 } -> value is AssignmentPattern, left is the local name
                                get_identifier_name(value.get("left").unwrap_or(&Value::Null))
                            } else {
                                get_identifier_name(value)
                            };

                            if let Some(name) = key_name {
                                let local = local_name.unwrap_or_else(|| name.clone());
                                exported_names.add(name, local, has_default, None, true);
                            }
                        }
                        "RestElement" => {
                            // { ...rest } - rest props, not added as individual props
                            // The rest element captures all remaining props
                        }
                        _ => {}
                    }
                }
            }
        }
        "Identifier" => {
            // `let props = $props();` - entire props object, not destructured
            // No individual prop names to extract
        }
        _ => {}
    }
}

/// Extract names from a binding pattern (Identifier, ObjectPattern, ArrayPattern).
///
/// Used for regular `export let/const` declarations (not $props).
fn extract_names_from_pattern(
    pattern: &Value,
    exported_names: &mut ExportedNames,
    has_default: bool,
    type_annotation: Option<&str>,
    is_prop: bool,
) {
    let pat_type = pattern.get("type").and_then(|t| t.as_str()).unwrap_or("");

    match pat_type {
        "Identifier" => {
            if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                exported_names.add(
                    name.to_string(),
                    name.to_string(),
                    has_default,
                    type_annotation.map(|s| s.to_string()),
                    is_prop,
                );
            }
        }
        "ObjectPattern" => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for prop in properties {
                    let prop_type = prop.get("type").and_then(|t| t.as_str()).unwrap_or("");
                    if prop_type == "Property" {
                        let value = prop.get("value").unwrap_or(&Value::Null);
                        let prop_has_default = is_assignment_pattern(value) || has_default;
                        let actual_pattern = if is_assignment_pattern(value) {
                            value.get("left").unwrap_or(&Value::Null)
                        } else {
                            value
                        };
                        extract_names_from_pattern(
                            actual_pattern,
                            exported_names,
                            prop_has_default,
                            None,
                            is_prop,
                        );
                    }
                }
            }
        }
        "ArrayPattern" => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        let el_has_default = is_assignment_pattern(element) || has_default;
                        let actual_pattern = if is_assignment_pattern(element) {
                            element.get("left").unwrap_or(&Value::Null)
                        } else {
                            element
                        };
                        extract_names_from_pattern(
                            actual_pattern,
                            exported_names,
                            el_has_default,
                            None,
                            is_prop,
                        );
                    }
                }
            }
        }
        _ => {}
    }
}

/// Get the name from an Identifier AST node.
fn get_identifier_name(node: &Value) -> Option<String> {
    if node.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
        node.get("name")
            .and_then(|n| n.as_str())
            .map(|s| s.to_string())
    } else {
        None
    }
}

/// Check if a node is an AssignmentPattern (i.e., has a default value).
fn is_assignment_pattern(node: &Value) -> bool {
    node.get("type").and_then(|t| t.as_str()) == Some("AssignmentPattern")
}

/// Extract TypeScript type annotation from a variable declarator.
///
/// Checks `id.typeAnnotation.typeAnnotation` for the type string.
fn extract_type_annotation(declarator: &Value) -> Option<String> {
    let id = declarator.get("id")?;
    let type_ann = id.get("typeAnnotation")?;
    let inner = type_ann.get("typeAnnotation")?;

    // For now, extract the raw type as a string from the source positions
    // This is a simplification; a full implementation would reconstruct the type string
    let type_name = inner.get("type").and_then(|t| t.as_str())?;

    // Map common TSTypeAnnotation types to their string representation
    match type_name {
        "TSNumberKeyword" => Some("number".to_string()),
        "TSStringKeyword" => Some("string".to_string()),
        "TSBooleanKeyword" => Some("boolean".to_string()),
        "TSAnyKeyword" => Some("any".to_string()),
        "TSVoidKeyword" => Some("void".to_string()),
        "TSNullKeyword" => Some("null".to_string()),
        "TSUndefinedKeyword" => Some("undefined".to_string()),
        "TSObjectKeyword" => Some("object".to_string()),
        "TSNeverKeyword" => Some("never".to_string()),
        "TSUnknownKeyword" => Some("unknown".to_string()),
        _ => None, // Complex types not yet handled
    }
}

/// Get the local name from an export specifier.
fn get_export_specifier_local(spec: &Value) -> Option<String> {
    let local = spec.get("local")?;
    get_identifier_name(local)
}

/// Get the exported name from an export specifier.
fn get_export_specifier_exported(spec: &Value) -> Option<String> {
    let exported = spec.get("exported")?;
    get_identifier_name(exported)
}

/// Skip trailing whitespace (spaces, tabs) after a position, but stop before newlines.
fn skip_trailing_whitespace(source: &str, pos: u32) -> u32 {
    let bytes = source.as_bytes();
    let mut i = pos as usize;
    while i < bytes.len() {
        match bytes[i] {
            b' ' | b'\t' => i += 1,
            b'\n' => {
                i += 1;
                break;
            }
            b'\r' => {
                i += 1;
                if i < bytes.len() && bytes[i] == b'\n' {
                    i += 1;
                }
                break;
            }
            _ => break,
        }
    }
    i as u32
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

    #[test]
    fn test_exported_names_empty() {
        let names = ExportedNames::new();
        assert!(names.is_empty());
        assert!(names.get_prop_names().is_empty());
        assert!(names.get_all_names().is_empty());
    }

    #[test]
    fn test_exported_names_add_prop() {
        let mut names = ExportedNames::new();
        names.add(
            "count".to_string(),
            "count".to_string(),
            true,
            Some("number".to_string()),
            true,
        );
        assert!(!names.is_empty());
        assert!(names.has("count"));
        assert_eq!(names.get_prop_names(), vec!["count"]);
    }

    #[test]
    fn test_exported_names_add_non_prop() {
        let mut names = ExportedNames::new();
        names.add(
            "helper".to_string(),
            "helper".to_string(),
            false,
            None,
            false,
        );
        assert!(names.has("helper"));
        assert!(names.get_prop_names().is_empty()); // Not a prop
        assert_eq!(names.get_all_names(), vec!["helper"]);
    }

    #[test]
    fn test_component_events_empty() {
        let events = ComponentEvents::new();
        assert!(events.is_empty());
        assert!(events.get_event_names().is_empty());
    }

    #[test]
    fn test_component_events_add() {
        let mut events = ComponentEvents::new();
        events.add("click".to_string(), Some("MouseEvent".to_string()), false);
        assert!(!events.is_empty());
        assert_eq!(events.get_event_names(), vec!["click"]);
    }

    // =========================================================================
    // Integration tests using the full svelte2tsx pipeline
    // =========================================================================

    /// Helper to run svelte2tsx and return the result
    fn run_svelte2tsx(source: &str) -> crate::svelte2tsx::svelte2tsx::Svelte2TsxResult {
        svelte2tsx(source, Svelte2TsxOptions::default()).expect("svelte2tsx should not fail")
    }

    // -- export let (Svelte 4 props) --

    #[test]
    fn test_export_let_simple() {
        let source = r#"<script>
export let count = 0;
</script>"#;
        let result = run_svelte2tsx(source);

        // `count` should be a prop
        assert!(result.exported_names.has("count"));
        assert_eq!(result.exported_names.get_prop_names(), vec!["count"]);

        // The info should record has_default = true (because of `= 0`)
        let info = result.exported_names.get("count").unwrap();
        assert!(info.is_prop);
        assert!(info.has_default);
    }

    #[test]
    fn test_export_let_no_default() {
        let source = r#"<script>
export let name;
</script>"#;
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("name"));
        let info = result.exported_names.get("name").unwrap();
        assert!(info.is_prop);
        assert!(!info.has_default);
    }

    #[test]
    fn test_export_let_multiple() {
        let source = r#"<script>
export let a = 1;
export let b;
export let c = "hello";
</script>"#;
        let result = run_svelte2tsx(source);

        assert_eq!(result.exported_names.get_prop_names(), vec!["a", "b", "c"]);

        assert!(result.exported_names.get("a").unwrap().has_default);
        assert!(!result.exported_names.get("b").unwrap().has_default);
        assert!(result.exported_names.get("c").unwrap().has_default);
    }

    // -- export const (non-prop exports) --

    #[test]
    fn test_export_const() {
        let source = r#"<script>
export const MAX = 100;
</script>"#;
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("MAX"));
        let info = result.exported_names.get("MAX").unwrap();
        assert!(!info.is_prop); // const exports are not props
    }

    // -- export function --

    #[test]
    fn test_export_function() {
        let source = r#"<script>
export function greet() { return "hello"; }
</script>"#;
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("greet"));
        let info = result.exported_names.get("greet").unwrap();
        assert!(!info.is_prop);
    }

    // -- $props() rune (Svelte 5) --

    #[test]
    fn test_props_rune_simple() {
        let source = r#"<script>
let { a, b } = $props();
</script>"#;
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("a"));
        assert!(result.exported_names.has("b"));
        assert_eq!(result.exported_names.get_prop_names(), vec!["a", "b"]);

        // No defaults
        assert!(!result.exported_names.get("a").unwrap().has_default);
        assert!(!result.exported_names.get("b").unwrap().has_default);
    }

    #[test]
    fn test_props_rune_with_defaults() {
        let source = r#"<script>
let { count = 0, name = "world" } = $props();
</script>"#;
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("count"));
        assert!(result.exported_names.has("name"));

        assert!(result.exported_names.get("count").unwrap().has_default);
        assert!(result.exported_names.get("name").unwrap().has_default);
    }

    #[test]
    fn test_props_rune_with_rest() {
        let source = r#"<script>
let { a, b, ...rest } = $props();
</script>"#;
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("a"));
        assert!(result.exported_names.has("b"));
        // rest is not added as an individual prop
        assert!(!result.exported_names.has("rest"));
        assert_eq!(result.exported_names.get_prop_names(), vec!["a", "b"]);
    }

    // -- Empty script --

    #[test]
    fn test_empty_script() {
        let source = r#"<script>
</script>"#;
        let result = run_svelte2tsx(source);
        assert!(result.exported_names.is_empty());
    }

    // -- No script --

    #[test]
    fn test_no_script() {
        let source = "<h1>Hello</h1>";
        let result = run_svelte2tsx(source);
        assert!(result.exported_names.is_empty());
    }

    // -- Module script --

    #[test]
    fn test_module_script_export_const() {
        let source = r#"<script context="module">
export const CONSTANT = 42;
</script>"#;
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("CONSTANT"));
        let info = result.exported_names.get("CONSTANT").unwrap();
        assert!(!info.is_prop); // Module exports are never props
    }

    #[test]
    fn test_module_script_export_function() {
        let source = r#"<script context="module">
export function helper() {}
</script>"#;
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("helper"));
        assert!(!result.exported_names.get("helper").unwrap().is_prop);
    }

    #[test]
    fn test_module_script_export_let_not_prop() {
        // In module script, even `export let` is NOT a prop
        let source = r#"<script context="module">
export let shared = 0;
</script>"#;
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("shared"));
        assert!(!result.exported_names.get("shared").unwrap().is_prop);
    }

    // -- Mixed instance and module scripts --

    #[test]
    fn test_both_scripts() {
        let source = r#"<script context="module">
export const VERSION = "1.0";
</script>

<script>
export let name;
</script>"#;
        let result = run_svelte2tsx(source);

        // Module export
        assert!(result.exported_names.has("VERSION"));
        assert!(!result.exported_names.get("VERSION").unwrap().is_prop);

        // Instance export (prop)
        assert!(result.exported_names.has("name"));
        assert!(result.exported_names.get("name").unwrap().is_prop);

        // Only instance `export let` is a prop
        assert_eq!(result.exported_names.get_prop_names(), vec!["name"]);
    }

    // -- Output code verification --

    #[test]
    fn test_export_let_props_in_output() {
        let source = r#"<script>
export let count = 0;
export let name;
</script>"#;
        let result = run_svelte2tsx(source);

        // The output should include the prop names in the return statement
        assert!(
            result.code.contains("count: count"),
            "Output should contain 'count: count' in props return"
        );
        assert!(
            result.code.contains("name: name"),
            "Output should contain 'name: name' in props return"
        );
    }

    #[test]
    fn test_props_rune_props_in_output() {
        let source = r#"<script>
let { x, y } = $props();
</script>"#;
        let result = run_svelte2tsx(source);

        // Props from $props() should appear in the output
        assert!(
            result.code.contains("x: x"),
            "Output should contain 'x: x' in props return"
        );
        assert!(
            result.code.contains("y: y"),
            "Output should contain 'y: y' in props return"
        );
    }

    #[test]
    fn test_no_props_empty_return() {
        let source = r#"<script>
const internal = 5;
</script>"#;
        let result = run_svelte2tsx(source);

        // No props: should use the empty record type
        assert!(
            result.code.contains("Record<string, never>"),
            "Output should contain empty record type when there are no props"
        );
    }
}
