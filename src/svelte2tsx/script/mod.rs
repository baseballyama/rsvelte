//! Script processing for svelte2tsx.
//!
//! Handles `<script>` and `<script context="module">` blocks in Svelte components.
//! Extracts exported names, component events, and prop declarations to generate
//! proper TypeScript type information.
//!
//! Script AST is obtained by re-parsing the raw script content via OXC and walking
//! the OXC AST directly. This avoids dependency on the thread-local ParseArena
//! used by the main compiler, keeping svelte2tsx self-contained.

use std::collections::HashMap;

use oxc_allocator::Allocator;
use oxc_ast::ast as oxc;
use oxc_parser::Parser as OxcParser;
use oxc_span::{GetSpan, SourceType};

use crate::ast::template::Script;

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
    let offset = script.content_offset;

    with_parsed_script(script, source, |program| {
        for stmt in program.body.iter() {
            match stmt {
                oxc::Statement::ExportNamedDeclaration(export) => {
                    handle_export_named_decl(export, offset, str, exported_names, true);
                }
                oxc::Statement::VariableDeclaration(var_decl) => {
                    // Check for $props() in non-exported variable declarations
                    for declarator in var_decl.declarations.iter() {
                        detect_props_rune_oxc(declarator, exported_names);
                    }
                }
                _ => {}
            }
        }
    });

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
    let offset = script.content_offset;

    with_parsed_script(script, source, |program| {
        for stmt in program.body.iter() {
            if let oxc::Statement::ExportNamedDeclaration(export) = stmt {
                // Module-level exports are never props
                handle_export_named_decl(export, offset, str, exported_names, false);
            }
        }
    });
}

// =============================================================================
// Script content parsing
// =============================================================================

/// Extract the raw script content from the source and parse it with OXC,
/// then invoke the callback with the parsed program.
///
/// This approach avoids lifetime issues since the OXC allocator and parsed
/// program are created and consumed within the closure scope.
fn with_parsed_script<F>(script: &Script, source: &str, f: F)
where
    F: FnOnce(&oxc::Program),
{
    let content_start = script.content_offset as usize;
    // Find the end of script content: from content_offset to the start of </script>
    let script_source = &source[script.start as usize..script.end as usize];
    let close_tag_offset = script_source
        .rfind("</script>")
        .or_else(|| script_source.rfind("</Script>"))
        .unwrap_or(script_source.len());
    let content_end = script.start as usize + close_tag_offset;
    let raw_content = &source[content_start..content_end];

    let allocator = Allocator::default();
    let source_type = if script.is_typescript {
        SourceType::ts()
    } else {
        SourceType::mjs()
    };
    let parser = OxcParser::new(&allocator, raw_content, source_type);
    let result = parser.parse();

    f(&result.program);
}

// =============================================================================
// OXC AST walkers
// =============================================================================

/// Handle an `ExportNamedDeclaration` from the OXC AST.
///
/// Covers:
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
///
/// `offset` is the content_offset that maps OXC positions (relative to script
/// content) back to the original source.
fn handle_export_named_decl(
    export: &oxc::ExportNamedDeclaration,
    offset: u32,
    str: &mut MagicString,
    exported_names: &mut ExportedNames,
    is_instance: bool,
) {
    let node_start = export.span.start + offset;

    // Case 1: export with declaration (export let/const/function/class ...)
    if let Some(ref decl) = export.declaration {
        let decl_start = decl.span().start + offset;

        // Remove the 'export ' keyword: overwrite from node start to declaration start
        if decl_start > node_start {
            str.overwrite(node_start, decl_start, "");
        }

        match decl {
            oxc::Declaration::VariableDeclaration(var_decl) => {
                let kind = var_decl.kind;
                let is_prop = is_instance
                    && matches!(
                        kind,
                        oxc::VariableDeclarationKind::Var | oxc::VariableDeclarationKind::Let
                    );

                for declarator in var_decl.declarations.iter() {
                    if is_props_call_oxc(declarator) {
                        extract_props_from_binding_pattern(&declarator.id, exported_names);
                    } else {
                        let has_default = declarator.init.is_some();
                        extract_names_from_binding_pattern(
                            &declarator.id,
                            exported_names,
                            has_default,
                            is_prop,
                        );
                    }
                }
            }
            oxc::Declaration::FunctionDeclaration(func) => {
                if let Some(ref id) = func.id {
                    let name = id.name.to_string();
                    exported_names.add(name.clone(), name, false, None, false);
                }
            }
            oxc::Declaration::ClassDeclaration(class) => {
                if let Some(ref id) = class.id {
                    let name = id.name.to_string();
                    exported_names.add(name.clone(), name, false, None, false);
                }
            }
            _ => {}
        }
    }

    // Case 2: export with specifiers (export { a, b as c };)
    if !export.specifiers.is_empty() && export.source.is_none() {
        // Local re-exports: remove the entire export statement
        let node_end = export.span.end + offset;
        str.overwrite(node_start, node_end, "");

        for spec in export.specifiers.iter() {
            let local = module_export_name_to_string(&spec.local);
            let exported = module_export_name_to_string(&spec.exported);
            let is_prop = is_instance && local == exported;
            exported_names.add(exported, local, false, None, is_prop);
        }
    }
}

/// Check if a variable declarator's init is a `$props()` call.
fn is_props_call_oxc(declarator: &oxc::VariableDeclarator) -> bool {
    if let Some(ref init) = declarator.init {
        if let oxc::Expression::CallExpression(call) = init {
            if let oxc::Expression::Identifier(ref callee) = call.callee {
                return callee.name == "$props";
            }
        }
    }
    false
}

/// Detect `$props()` usage in a variable declarator and extract prop names.
fn detect_props_rune_oxc(declarator: &oxc::VariableDeclarator, exported_names: &mut ExportedNames) {
    if is_props_call_oxc(declarator) {
        extract_props_from_binding_pattern(&declarator.id, exported_names);
    }
}

/// Extract prop names from a destructuring pattern used with `$props()`.
///
/// Handles ObjectPattern: `{ a, b = 1, ...rest }`
fn extract_props_from_binding_pattern(
    pattern: &oxc::BindingPattern,
    exported_names: &mut ExportedNames,
) {
    match pattern {
        oxc::BindingPattern::ObjectPattern(obj_pat) => {
            for prop in obj_pat.properties.iter() {
                let key_name = property_key_to_string(&prop.key);
                let (local_name, has_default) = match &prop.value {
                    oxc::BindingPattern::AssignmentPattern(assign) => {
                        // { a = 1 } -> local name is the left side
                        let name = binding_pattern_simple_name(&assign.left);
                        (name, true)
                    }
                    _ => {
                        let name = binding_pattern_simple_name(&prop.value);
                        (name, false)
                    }
                };

                if let Some(key) = key_name {
                    let local = local_name.unwrap_or_else(|| key.clone());
                    exported_names.add(key, local, has_default, None, true);
                }
            }
            // Rest element ({ ...rest }) is intentionally not added as a prop
        }
        oxc::BindingPattern::BindingIdentifier(_) => {
            // `let props = $props();` - entire props object, not destructured
            // No individual prop names to extract
        }
        _ => {}
    }
}

/// Extract names from a binding pattern for regular export declarations.
///
/// Used for `export let/const` (not $props).
fn extract_names_from_binding_pattern(
    pattern: &oxc::BindingPattern,
    exported_names: &mut ExportedNames,
    has_default: bool,
    is_prop: bool,
) {
    match pattern {
        oxc::BindingPattern::BindingIdentifier(id) => {
            let name = id.name.to_string();
            exported_names.add(name.clone(), name, has_default, None, is_prop);
        }
        oxc::BindingPattern::ObjectPattern(obj_pat) => {
            for prop in obj_pat.properties.iter() {
                match &prop.value {
                    oxc::BindingPattern::AssignmentPattern(assign) => {
                        extract_names_from_binding_pattern(
                            &assign.left,
                            exported_names,
                            true,
                            is_prop,
                        );
                    }
                    _ => {
                        extract_names_from_binding_pattern(
                            &prop.value,
                            exported_names,
                            has_default,
                            is_prop,
                        );
                    }
                }
            }
        }
        oxc::BindingPattern::ArrayPattern(arr_pat) => {
            for element in arr_pat.elements.iter() {
                if let Some(el) = element {
                    match el {
                        oxc::BindingPattern::AssignmentPattern(assign) => {
                            extract_names_from_binding_pattern(
                                &assign.left,
                                exported_names,
                                true,
                                is_prop,
                            );
                        }
                        _ => {
                            extract_names_from_binding_pattern(
                                el,
                                exported_names,
                                has_default,
                                is_prop,
                            );
                        }
                    }
                }
            }
        }
        oxc::BindingPattern::AssignmentPattern(assign) => {
            extract_names_from_binding_pattern(&assign.left, exported_names, true, is_prop);
        }
    }
}

/// Get a simple name from a binding pattern (only works for BindingIdentifier).
fn binding_pattern_simple_name(pattern: &oxc::BindingPattern) -> Option<String> {
    match pattern {
        oxc::BindingPattern::BindingIdentifier(id) => Some(id.name.to_string()),
        _ => None,
    }
}

/// Convert a PropertyKey to a string name.
fn property_key_to_string(key: &oxc::PropertyKey) -> Option<String> {
    match key {
        oxc::PropertyKey::StaticIdentifier(id) => Some(id.name.to_string()),
        oxc::PropertyKey::StringLiteral(lit) => Some(lit.value.to_string()),
        oxc::PropertyKey::NumericLiteral(lit) => Some(lit.value.to_string()),
        _ => None,
    }
}

/// Convert a ModuleExportName to a string.
fn module_export_name_to_string(name: &oxc::ModuleExportName) -> String {
    match name {
        oxc::ModuleExportName::IdentifierName(id) => id.name.to_string(),
        oxc::ModuleExportName::IdentifierReference(id) => id.name.to_string(),
        oxc::ModuleExportName::StringLiteral(lit) => lit.value.to_string(),
    }
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
        let source = "<script>\nexport let count = 0;\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("count"));
        assert_eq!(result.exported_names.get_prop_names(), vec!["count"]);

        let info = result.exported_names.get("count").unwrap();
        assert!(info.is_prop);
        assert!(info.has_default);
    }

    #[test]
    fn test_export_let_no_default() {
        let source = "<script>\nexport let name;\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("name"));
        let info = result.exported_names.get("name").unwrap();
        assert!(info.is_prop);
        assert!(!info.has_default);
    }

    #[test]
    fn test_export_let_multiple() {
        let source =
            "<script>\nexport let a = 1;\nexport let b;\nexport let c = \"hello\";\n</script>";
        let result = run_svelte2tsx(source);

        assert_eq!(result.exported_names.get_prop_names(), vec!["a", "b", "c"]);
        assert!(result.exported_names.get("a").unwrap().has_default);
        assert!(!result.exported_names.get("b").unwrap().has_default);
        assert!(result.exported_names.get("c").unwrap().has_default);
    }

    // -- export const (non-prop exports) --

    #[test]
    fn test_export_const() {
        let source = "<script>\nexport const MAX = 100;\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("MAX"));
        assert!(!result.exported_names.get("MAX").unwrap().is_prop);
    }

    // -- export function --

    #[test]
    fn test_export_function() {
        let source = "<script>\nexport function greet() { return \"hello\"; }\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("greet"));
        assert!(!result.exported_names.get("greet").unwrap().is_prop);
    }

    // -- $props() rune (Svelte 5) --

    #[test]
    fn test_props_rune_simple() {
        let source = "<script>\nlet { a, b } = $props();\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("a"));
        assert!(result.exported_names.has("b"));
        assert_eq!(result.exported_names.get_prop_names(), vec!["a", "b"]);
        assert!(!result.exported_names.get("a").unwrap().has_default);
        assert!(!result.exported_names.get("b").unwrap().has_default);
    }

    #[test]
    fn test_props_rune_with_defaults() {
        let source = "<script>\nlet { count = 0, name = \"world\" } = $props();\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("count"));
        assert!(result.exported_names.has("name"));
        assert!(result.exported_names.get("count").unwrap().has_default);
        assert!(result.exported_names.get("name").unwrap().has_default);
    }

    #[test]
    fn test_props_rune_with_rest() {
        let source = "<script>\nlet { a, b, ...rest } = $props();\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("a"));
        assert!(result.exported_names.has("b"));
        assert!(!result.exported_names.has("rest"));
        assert_eq!(result.exported_names.get_prop_names(), vec!["a", "b"]);
    }

    // -- Empty / no script --

    #[test]
    fn test_empty_script() {
        let source = "<script>\n</script>";
        let result = run_svelte2tsx(source);
        assert!(result.exported_names.is_empty());
    }

    #[test]
    fn test_no_script() {
        let source = "<h1>Hello</h1>";
        let result = run_svelte2tsx(source);
        assert!(result.exported_names.is_empty());
    }

    // -- Module script --

    #[test]
    fn test_module_script_export_const() {
        let source = "<script context=\"module\">\nexport const CONSTANT = 42;\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("CONSTANT"));
        assert!(!result.exported_names.get("CONSTANT").unwrap().is_prop);
    }

    #[test]
    fn test_module_script_export_function() {
        let source = "<script context=\"module\">\nexport function helper() {}\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("helper"));
        assert!(!result.exported_names.get("helper").unwrap().is_prop);
    }

    #[test]
    fn test_module_script_export_let_not_prop() {
        let source = "<script context=\"module\">\nexport let shared = 0;\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("shared"));
        assert!(!result.exported_names.get("shared").unwrap().is_prop);
    }

    // -- Mixed instance and module scripts --

    #[test]
    fn test_both_scripts() {
        let source = "<script context=\"module\">\nexport const VERSION = \"1.0\";\n</script>\n\n<script>\nexport let name;\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("VERSION"));
        assert!(!result.exported_names.get("VERSION").unwrap().is_prop);

        assert!(result.exported_names.has("name"));
        assert!(result.exported_names.get("name").unwrap().is_prop);

        assert_eq!(result.exported_names.get_prop_names(), vec!["name"]);
    }

    // -- Output code verification --

    #[test]
    fn test_export_let_props_in_output() {
        let source = "<script>\nexport let count = 0;\nexport let name;\n</script>";
        let result = run_svelte2tsx(source);

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
        let source = "<script>\nlet { x, y } = $props();\n</script>";
        let result = run_svelte2tsx(source);

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
        let source = "<script>\nconst internal = 5;\n</script>";
        let result = run_svelte2tsx(source);

        assert!(
            result.code.contains("Record<string, never>"),
            "Output should contain empty record type when there are no props"
        );
    }
}
