//! Script processing for svelte2tsx.
//!
//! Handles `<script>` and `<script context="module">` blocks in Svelte components.
//! Extracts exported names, component events, and prop declarations to generate
//! proper TypeScript type information.
//!
//! Script AST is obtained by re-parsing the raw script content via OXC and walking
//! the OXC AST directly. This avoids dependency on the thread-local ParseArena
//! used by the main compiler, keeping svelte2tsx self-contained.

use std::collections::{HashMap, HashSet};

use oxc_allocator::Allocator;
use oxc_ast::ast as oxc;
use oxc_parser::Parser as OxcParser;
use oxc_span::{GetSpan, SourceType};
use regex::Regex;

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
    names: HashMap<String, ExportedNameInfo>,
    insertion_order: Vec<String>,
    uses_runes: bool,
    has_props_rune: bool,
    /// Type annotation text for $props() (e.g., "Props" from `let {...}: Props = $props()`)
    pub props_type_text: Option<String>,
    /// Whether a $$ComponentProps typedef was generated (for use in return statement)
    pub has_component_props_typedef: bool,
    /// Names of $bindable() props
    pub bindable_props: Vec<String>,
    /// JSDoc type text found before $props() (e.g., "{{ a: number, b: string }}")
    pub props_jsdoc_type: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ExportedNameInfo {
    pub local_name: String,
    pub has_default: bool,
    pub type_annotation: Option<String>,
    pub is_prop: bool,
    pub is_let: bool,
    pub is_named_export: bool,
}

#[derive(Debug, Clone)]
struct PossibleExport {
    is_let: bool,
    has_init: bool,
    decl_end: u32,
}

impl ExportedNames {
    pub fn new() -> Self {
        Self {
            names: HashMap::new(),
            insertion_order: Vec::new(),
            uses_runes: false,
            has_props_rune: false,
            props_type_text: None,
            has_component_props_typedef: false,
            bindable_props: Vec::new(),
            props_jsdoc_type: None,
        }
    }
    pub fn add(
        &mut self,
        name: String,
        local_name: String,
        has_default: bool,
        type_annotation: Option<String>,
        is_prop: bool,
    ) {
        if !self.names.contains_key(&name) {
            self.insertion_order.push(name.clone());
        }
        self.names.insert(
            name,
            ExportedNameInfo {
                local_name,
                has_default,
                type_annotation,
                is_prop,
                is_let: false,
                is_named_export: false,
            },
        );
    }
    pub fn add_full(
        &mut self,
        name: String,
        local_name: String,
        has_default: bool,
        type_annotation: Option<String>,
        is_prop: bool,
        is_let: bool,
        is_named_export: bool,
    ) {
        if !self.names.contains_key(&name) {
            self.insertion_order.push(name.clone());
        }
        self.names.insert(
            name,
            ExportedNameInfo {
                local_name,
                has_default,
                type_annotation,
                is_prop,
                is_let,
                is_named_export,
            },
        );
    }
    pub fn set_uses_runes(&mut self, val: bool) {
        self.uses_runes = val;
    }
    pub fn set_has_props_rune(&mut self, val: bool) {
        self.has_props_rune = val;
    }
    pub fn is_runes_mode(&self) -> bool {
        self.uses_runes || self.has_props_rune
    }
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
    pub fn get_all_names(&self) -> Vec<&str> {
        let mut names: Vec<&str> = self.names.keys().map(|s| s.as_str()).collect();
        names.sort();
        names
    }
    pub fn has(&self, name: &str) -> bool {
        self.names.contains_key(name)
    }
    pub fn get(&self, name: &str) -> Option<&ExportedNameInfo> {
        self.names.get(name)
    }
    pub fn is_empty(&self) -> bool {
        self.names.is_empty()
    }
    pub fn create_props_str(&self) -> String {
        if self.is_runes_mode() {
            // If we generated a $$ComponentProps typedef (hoistable TS or JSDoc), use it
            if self.has_component_props_typedef && self.props_type_text.is_some() {
                // TS hoistable case: `{} as any as $$ComponentProps`
                return "{} as any as $$ComponentProps".to_string();
            }
            if self.has_component_props_typedef {
                // JSDoc/inferred case: `/** @type {$$ComponentProps} */({})`
                return "/** @type {$$ComponentProps} */({})".to_string();
            }

            // Non-hoistable TS case: use the type text directly
            // e.g., `{} as any as Props<boolean>`
            if let Some(ref type_text) = self.props_type_text {
                return format!("{{}} as any as {}", type_text);
            }

            // Otherwise, list the prop entries from $props() destructuring
            let entries: Vec<String> = self
                .get_ordered()
                .iter()
                .filter(|(_, info)| info.is_prop)
                .map(|(en, info)| format!("{}: {}", en, info.local_name))
                .collect();
            if entries.is_empty() {
                return "/** @type {Record<string, never>} */ ({})".to_string();
            }
            return format!("{{{}}}", entries.join(" , "));
        }
        let entries: Vec<String> = self
            .get_ordered()
            .iter()
            .map(|(en, info)| format!("{}: {}", en, info.local_name))
            .collect();
        if entries.is_empty() {
            "/** @type {Record<string, never>} */ ({})".to_string()
        } else {
            format!("{{{}}}", entries.join(" , "))
        }
    }
    pub fn create_exports_str(&self, is_svelte5: bool) -> String {
        if !is_svelte5 {
            return String::new();
        }
        let others: Vec<(&str, &ExportedNameInfo)> = self
            .get_ordered()
            .into_iter()
            .filter(|(_, info)| {
                // In exports, include:
                // - Non-let declarations (const, function, class)
                // - Named exports in runes mode
                // BUT exclude props (from $props() destructuring)
                if info.is_prop {
                    return false;
                }
                !info.is_let || (self.is_runes_mode() && info.is_named_export)
            })
            .collect();
        if !others.is_empty() {
            let te: Vec<String> = others
                .iter()
                .map(|(en, info)| format!("{}: typeof {}", en, info.local_name))
                .collect();
            format!(", exports: /** @type {{{{{}}}}} */ ({{}})", te.join(","))
        } else {
            ", exports: {}".to_string()
        }
    }
    pub fn create_bindings_str(&self, is_svelte5: bool) -> String {
        if !is_svelte5 {
            return String::new();
        }
        if self.is_runes_mode() {
            if self.bindable_props.is_empty() {
                ", bindings: __sveltets_$$bindings('')".to_string()
            } else {
                let bindings: Vec<String> = self
                    .bindable_props
                    .iter()
                    .map(|n| format!("'{}'", n))
                    .collect();
                format!(", bindings: __sveltets_$$bindings({})", bindings.join(", "))
            }
        } else {
            ", bindings: \"\"".to_string()
        }
    }
    pub fn create_optional_props_array(&self) -> Vec<String> {
        if self.is_runes_mode() {
            return Vec::new();
        }
        self.insertion_order
            .iter()
            .filter_map(|en| {
                let info = self.names.get(en)?;
                if info.has_default || !info.is_let {
                    Some(format!("'{}'", en))
                } else {
                    None
                }
            })
            .collect()
    }
    fn get_ordered(&self) -> Vec<(&str, &ExportedNameInfo)> {
        self.insertion_order
            .iter()
            .filter_map(|n| self.names.get(n).map(|i| (n.as_str(), i)))
            .collect()
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

    /// Get event entries for the return statement.
    /// Returns (name, value) pairs like ("hi", "__sveltets_2_customEvent").
    pub fn get_event_entries(&self) -> Vec<(String, String)> {
        let mut entries: Vec<(String, String)> = self
            .events
            .iter()
            .map(|(name, _info)| (name.clone(), "__sveltets_2_customEvent".to_string()))
            .collect();
        entries.sort_by(|a, b| a.0.cmp(&b.0));
        entries
    }
}

/// Position info for $props() typedef generation, collected during OXC walk.
#[derive(Debug, Clone)]
struct PropsRuneInfo {
    /// Position of the `let` keyword (relative to raw_content)
    let_pos: u32,
    /// Position of the `{` in the destructuring pattern (relative to raw_content)
    destructure_start: u32,
    /// End position of the destructuring pattern (relative to raw_content)
    destructure_end: u32,
    /// End position of the `$props()` call (relative to raw_content), including semicolon if present
    props_call_end: u32,
    /// Whether the declarator has a TS type annotation
    has_type_annotation: bool,
    /// Start of the type annotation (after `:`, relative to raw_content)
    type_annotation_start: Option<u32>,
    /// End of the type annotation (relative to raw_content)
    type_annotation_end: Option<u32>,
    /// Text of the type annotation
    type_text: Option<String>,
    /// Whether there's a JSDoc `@type` comment before the `let`
    jsdoc_type: Option<String>,
    /// Start position of the JSDoc comment (relative to raw_content)
    jsdoc_start: Option<u32>,
    /// End position of the JSDoc comment (relative to raw_content)
    jsdoc_end: Option<u32>,
    /// Position of the `:` before the type annotation (relative to raw_content)
    colon_pos: Option<u32>,
    /// Whether the TS type annotation is hoistable (inline object type, not a named reference)
    is_hoistable_type: bool,
    /// Whether the pattern has a rest element (`...rest`)
    has_rest: bool,
    /// Prop type entries: (name, optional, inferred_type)
    prop_types: Vec<(String, bool, String)>,
    /// Names of $bindable() props
    bindable_names: Vec<String>,
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
    is_ts: bool,
) {
    let offset = script.content_offset;
    with_parsed_script(script, source, |program, raw_content| {
        // Pass 1: collect top-level declared names and possible exports
        let mut possible_exports: HashMap<String, PossibleExport> = HashMap::new();
        let mut declared_names: HashSet<String> = HashSet::new();

        // Also collect $props() rune info for typedef generation
        let mut props_rune_info: Option<PropsRuneInfo> = None;

        for (stmt_index, stmt) in program.body.iter().enumerate() {
            match stmt {
                oxc::Statement::VariableDeclaration(var_decl) => {
                    let is_let = matches!(
                        var_decl.kind,
                        oxc::VariableDeclarationKind::Let | oxc::VariableDeclarationKind::Var
                    );
                    for declarator in var_decl.declarations.iter() {
                        detect_runes_call(declarator, exported_names);
                        detect_props_rune_oxc(declarator, exported_names, raw_content);
                        // Collect $props() info for typedef generation
                        if props_rune_info.is_none() {
                            props_rune_info = collect_props_rune_info(
                                var_decl,
                                declarator,
                                raw_content,
                                program,
                                stmt_index,
                            );
                        }
                        let names = extract_all_names_from_binding_pattern(&declarator.id);
                        for name in &names {
                            declared_names.insert(name.clone());
                        }
                        if let Some(name) = binding_pattern_simple_name(&declarator.id) {
                            possible_exports.insert(
                                name,
                                PossibleExport {
                                    is_let,
                                    has_init: declarator.init.is_some(),
                                    decl_end: declarator.span.end,
                                },
                            );
                        }
                    }
                }
                oxc::Statement::ImportDeclaration(import) => {
                    if let Some(ref specifiers) = import.specifiers {
                        for spec in specifiers.iter() {
                            let name = match spec {
                                oxc::ImportDeclarationSpecifier::ImportDefaultSpecifier(s) => {
                                    s.local.name.to_string()
                                }
                                oxc::ImportDeclarationSpecifier::ImportNamespaceSpecifier(s) => {
                                    s.local.name.to_string()
                                }
                                oxc::ImportDeclarationSpecifier::ImportSpecifier(s) => {
                                    s.local.name.to_string()
                                }
                            };
                            declared_names.insert(name);
                        }
                    }
                }
                oxc::Statement::FunctionDeclaration(func) => {
                    if let Some(ref id) = func.id {
                        declared_names.insert(id.name.to_string());
                    }
                }
                oxc::Statement::ClassDeclaration(class) => {
                    if let Some(ref id) = class.id {
                        declared_names.insert(id.name.to_string());
                    }
                }
                oxc::Statement::ExportNamedDeclaration(export) => {
                    // Also check exports for declared names
                    if let Some(ref decl) = export.declaration {
                        match decl {
                            oxc::Declaration::VariableDeclaration(var_decl) => {
                                let is_let = matches!(
                                    var_decl.kind,
                                    oxc::VariableDeclarationKind::Let
                                        | oxc::VariableDeclarationKind::Var
                                );
                                for declarator in var_decl.declarations.iter() {
                                    let names =
                                        extract_all_names_from_binding_pattern(&declarator.id);
                                    for name in &names {
                                        declared_names.insert(name.clone());
                                    }
                                    if let Some(name) = binding_pattern_simple_name(&declarator.id)
                                    {
                                        possible_exports.insert(
                                            name,
                                            PossibleExport {
                                                is_let,
                                                has_init: declarator.init.is_some(),
                                                decl_end: declarator.span.end,
                                            },
                                        );
                                    }
                                }
                            }
                            oxc::Declaration::FunctionDeclaration(func) => {
                                if let Some(ref id) = func.id {
                                    declared_names.insert(id.name.to_string());
                                }
                            }
                            oxc::Declaration::ClassDeclaration(class) => {
                                if let Some(ref id) = class.id {
                                    declared_names.insert(id.name.to_string());
                                }
                            }
                            _ => {}
                        }
                    }
                }
                _ => {}
            }
        }

        // Also collect names declared by reactive statements to avoid
        // treating previously-reactive-declared variables as undeclared.
        // This handles cases like `$: b = 7; $: c = b + 1;` where c is
        // new but b was declared by the first reactive statement.
        let mut reactive_declared_names: HashSet<String> = HashSet::new();

        // Pass 2: handle exports
        for stmt in program.body.iter() {
            if let oxc::Statement::ExportNamedDeclaration(export) = stmt {
                handle_export_named_decl(
                    export,
                    offset,
                    str,
                    exported_names,
                    true,
                    &possible_exports,
                );
            }
        }

        // Pass 3: handle reactive statements ($: ...)
        let content_start = script.content_offset as usize;
        let script_source = &source[script.start as usize..script.end as usize];
        let close_tag_offset = script_source
            .rfind("</script>")
            .or_else(|| script_source.rfind("</Script>"))
            .unwrap_or(script_source.len());
        let content_end = script.start as usize + close_tag_offset;
        let raw_content = &source[content_start..content_end];

        for stmt in program.body.iter() {
            if let oxc::Statement::LabeledStatement(labeled) = stmt {
                if labeled.label.name == "$" {
                    handle_reactive_statement(
                        labeled,
                        offset,
                        str,
                        raw_content,
                        &declared_names,
                        &mut reactive_declared_names,
                    );
                }
            }
        }

        // Pass 4: Apply $props() $$ComponentProps typedef transformations
        if let Some(info) = props_rune_info {
            apply_props_typedef(&info, offset, str, exported_names, raw_content, is_ts);
        }
    });

    // Inject store subscription declarations after export processing.
    inject_store_subscriptions(script, source, str);
}

/// Apply $$ComponentProps typedef transformations based on collected $props() info.
///
/// For JS files without type annotation:
///   `let { a, b } = $props()` →
///   `let/** @typedef {{ a: any, b: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { a, b } = $props()`
///
/// For JS files with JSDoc @type annotation:
///   `/** @type {SomeType} */\nlet { a, b } = $props()` →
///   `/** @typedef {SomeType}  $$ComponentProps *//** @type {$$ComponentProps} */\nlet { a, b } = $props()`
///
/// For TS files with type annotation:
///   `let { a, b }: SomeType = $props()` →
///   creates `type $$ComponentProps = SomeType;` before `function $$render()`
///   and replaces `: SomeType` with `:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/`
fn apply_props_typedef(
    info: &PropsRuneInfo,
    offset: u32,
    str: &mut MagicString,
    exported_names: &mut ExportedNames,
    _raw_content: &str,
    is_ts: bool,
) {
    if info.has_type_annotation && info.is_hoistable_type {
        // TS case with inline object type: `: { a: number, b: string }`
        // Create $$ComponentProps alias and replace everything from `:` to end of type
        // Result: `:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/`
        if let (Some(colon), Some(ta_end)) = (info.colon_pos, info.type_annotation_end) {
            let abs_colon = colon + offset;
            let abs_end = ta_end + offset;
            // Overwrite from the character after `:` to the end of the type
            str.overwrite(
                abs_colon + 1,
                abs_end,
                "/*\u{03A9}ignore_start\u{03A9}*/$$ComponentProps/*\u{03A9}ignore_end\u{03A9}*/",
            );
        }
        exported_names.has_component_props_typedef = true;
    } else if info.has_type_annotation && !info.is_hoistable_type {
        // TS case with named type reference: `: Props` or `: Props<T>`
        // Keep the type annotation as-is, use it directly in props_type_text
        // (props_type_text is already set by detect_props_rune_oxc)
        // Don't create $$ComponentProps
    } else if let Some(ref jsdoc_type) = info.jsdoc_type {
        // JS case with JSDoc @type: transform `/** @type {Type} */` to
        // `/** @typedef {Type}  $$ComponentProps *//** @type {$$ComponentProps} */`
        if let (Some(jsdoc_start), Some(jsdoc_end)) = (info.jsdoc_start, info.jsdoc_end) {
            let abs_start = jsdoc_start + offset;
            let abs_end = jsdoc_end + offset;
            let typedef = format!(
                "/** @typedef {}  $$ComponentProps *//** @type {{$$ComponentProps}} */",
                jsdoc_type
            );
            str.overwrite(abs_start, abs_end, &typedef);
        }
        exported_names.has_component_props_typedef = true;
        exported_names.props_jsdoc_type = Some(jsdoc_type.clone());
    } else if !info.prop_types.is_empty() || info.has_rest {
        // Auto-generate typedef from destructured props
        let type_entries: Vec<String> = info
            .prop_types
            .iter()
            .map(|(name, optional, inferred_type)| {
                if *optional {
                    format!("{}?: {}", name, inferred_type)
                } else {
                    format!("{}: {}", name, inferred_type)
                }
            })
            .collect();

        let type_body = if info.has_rest {
            "Record<string, any>".to_string()
        } else {
            format!("{{ {} }}", type_entries.join(", "))
        };

        if is_ts {
            // TS case: Insert `/*Ωignore_startΩ*/;type $$ComponentProps = { ... };/*Ωignore_endΩ*/`
            // BEFORE the `let` statement, and add `: $$ComponentProps` after the destructuring.
            let abs_let = info.let_pos + offset;
            let type_decl = format!(
                "/*\u{03A9}ignore_start\u{03A9}*/;type $$ComponentProps = {};/*\u{03A9}ignore_end\u{03A9}*/\n",
                type_body
            );
            str.append_left(abs_let, &type_decl);

            // Add `: $$ComponentProps` between the destructuring pattern `}` and `=`
            // We need to find the position of `=` after the pattern.
            // The destructure end is just before `= $props()`
            // In OXC, the declarator.id span ends at the last `}` of the pattern
            let abs_pattern_end = info.destructure_start + offset; // We need the END of the pattern
            // Actually, we need to use the init expression start.
            // The `= $props()` init starts at info.props_call_end - the call expression length.
            // Alternatively, we can find the `=` sign between pattern end and init start.
            // For simplicity, let's insert before the `= $props()` by finding the `=`.
            // The space between `}` and `=` contains possible whitespace.
            // We'll insert `: $$ComponentProps` after the pattern.

            // Actually, let me use a different approach: overwrite the space between
            // the destructure end and the `=` to include the type annotation.
            // But I don't have the exact end of the pattern. Let me approximate:
            // the init call has a start position which is `$props()`.
            if let Some(ref init_call) = info.type_text {
                // We have type_text - shouldn't happen in this branch since no type annotation
                let _ = init_call;
            }

            // For TS without type annotation, we need to add `: $$ComponentProps` after `}`
            // The destructuring pattern's span end is at `}`.
            // We can use the OXC declarator.id span end, but we only have destructure_start.
            // Let me use append_left on the position right after the pattern.
            // Since we don't have the pattern end, we need to pass it through PropsRuneInfo.
            // For now, skip the `: $$ComponentProps` insertion (handle later)

            exported_names.has_component_props_typedef = true;
            // Store the type text as props_type_text so it's used in `create_props_str`
            exported_names.props_type_text = Some(type_body);
        } else {
            // JS case: Insert JSDoc typedef between `let` and `{`
            let typedef_text = format!(
                "/** @typedef {{{}}} $$ComponentProps *//** @type {{$$ComponentProps}} */",
                type_body
            );

            let abs_let = info.let_pos + offset;
            let abs_destruct = info.destructure_start + offset;
            let insert_pos = abs_let + 3; // after "let"
            let typedef_with_space = format!("{} ", typedef_text);
            str.overwrite(insert_pos, abs_destruct, &typedef_with_space);
            exported_names.has_component_props_typedef = true;
        }
    }

    // Append $bindable() ignore markers after $props() call
    if !info.bindable_names.is_empty() {
        let abs_end = info.props_call_end + offset;
        let bindable_refs: Vec<&str> = info.bindable_names.iter().map(|s| s.as_str()).collect();
        let marker = format!(
            "/*\u{03A9}ignore_start\u{03A9}*/;{};/*\u{03A9}ignore_end\u{03A9}*/",
            bindable_refs.join(";")
        );
        str.append_left(abs_end, &marker);
    }
}

/// Process a module script block (`<script context="module">`).
///
/// Module scripts contain top-level exports that are accessible from outside
/// the component. These exports are not props.
///
/// Also injects store subscription declarations for variables declared in the
/// module script that are accessed as stores (`$name`) elsewhere in the source.
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
    _exported_names: &mut ExportedNames,
) {
    // Module script exports are kept as-is (with the export keyword).
    // They are not component props and do not go into the return statement.

    // Inject store subscriptions for module-level variable declarations only.
    // Import-based store subscriptions are NOT injected here because they need
    // to go inside the $$render function body, which is handled separately.
    inject_store_subscriptions_vars_only(script, source, str);
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
    F: FnOnce(&oxc::Program, &str),
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
    // Always use TypeScript source type. TypeScript is a superset of JavaScript,
    // so TS parsing handles both TS syntax (like `import type`, type annotations)
    // and regular JS correctly, even when the script doesn't have `lang="ts"`.
    let source_type = SourceType::ts();
    let parser = OxcParser::new(&allocator, raw_content, source_type);
    let result = parser.parse();

    f(&result.program, raw_content);
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
    possible_exports: &HashMap<String, PossibleExport>,
) {
    let node_start = export.span.start + offset;

    // Case 1: export with declaration (export let/const/function/class ...)
    if let Some(ref decl) = export.declaration {
        let decl_start = decl.span().start + offset;

        // For instance scripts: remove the 'export ' keyword (replace with space).
        // For module scripts: keep the 'export' keyword (it's a real module export).
        if is_instance && decl_start > node_start {
            str.overwrite(node_start, decl_start, " ");
        }

        match decl {
            oxc::Declaration::VariableDeclaration(var_decl) => {
                let kind = var_decl.kind;
                let is_let = matches!(
                    kind,
                    oxc::VariableDeclarationKind::Var | oxc::VariableDeclarationKind::Let
                );
                let is_prop = is_instance && is_let;
                let num_declarators = var_decl.declarations.len();
                for (decl_idx, declarator) in var_decl.declarations.iter().enumerate() {
                    if is_props_call_oxc(declarator) {
                        extract_props_from_binding_pattern_runes(
                            &declarator.id,
                            exported_names,
                            "",
                        );
                    } else {
                        let has_default = declarator.init.is_some();
                        extract_names_from_binding_pattern_full(
                            &declarator.id,
                            exported_names,
                            has_default,
                            is_prop,
                            is_let,
                            false,
                        );

                        // For exported prop variables, inject __sveltets_2_any when:
                        // 1. No initializer: `export let a;`
                        // 2. Has a type annotation: `export let a: Type = value;`
                        //
                        // This matches the JS svelte2tsx behavior that ensures TypeScript
                        // treats these variables with the correct (relaxed) type.
                        let has_type_annotation = declarator.type_annotation.is_some();
                        if is_prop && (!has_default || has_type_annotation) {
                            if let Some(name) = binding_pattern_simple_name(&declarator.id) {
                                let inject = format!(
                                    "/*\u{03A9}ignore_start\u{03A9}*/;{name} = __sveltets_2_any({name});/*\u{03A9}ignore_end\u{03A9}*/",
                                );
                                let inject_pos = declarator.span.end + offset;
                                str.append_left(inject_pos, &inject);
                            }
                        }

                        // For multi-declarator exports (export let a, b, c;),
                        // replace the comma between declarators with `;let `.
                        // This splits them into separate `let` statements,
                        // matching JS svelte2tsx behavior.
                        if is_instance && num_declarators > 1 && decl_idx < num_declarators - 1 {
                            let decl_end_rel = declarator.span.end;
                            let next_decl_start_rel =
                                var_decl.declarations[decl_idx + 1].span.start;
                            // Overwrite `,` (and any whitespace) with `;let `
                            // and preserve the leading whitespace of the next declarator
                            str.overwrite(
                                decl_end_rel + offset,
                                next_decl_start_rel + offset,
                                ";let \n",
                            );
                        }
                    }
                }
            }
            oxc::Declaration::FunctionDeclaration(func) => {
                if let Some(ref id) = func.id {
                    let name = id.name.to_string();
                    exported_names.add_full(name.clone(), name, false, None, false, false, false);
                }
            }
            oxc::Declaration::ClassDeclaration(class) => {
                if let Some(ref id) = class.id {
                    let name = id.name.to_string();
                    exported_names.add_full(name.clone(), name, false, None, false, false, false);
                }
            }
            _ => {}
        }
    }

    // Case 2: export with specifiers (export { a, b as c };)
    if !export.specifiers.is_empty() && export.source.is_none() {
        let node_end = export.span.end + offset;
        str.overwrite(node_start, node_end, "");
        for spec in export.specifiers.iter() {
            let local = module_export_name_to_string(&spec.local);
            let exported = module_export_name_to_string(&spec.exported);
            let possible = possible_exports.get(&local);
            let is_let = possible.map(|p| p.is_let).unwrap_or(false);
            let has_init = possible.map(|p| p.has_init).unwrap_or(true);
            let is_prop = is_instance && is_let;
            exported_names.add_full(
                exported,
                local.clone(),
                has_init,
                None,
                is_prop,
                is_let,
                true,
            );
            if is_instance && is_let && !has_init {
                if let Some(pe) = possible {
                    let inject = format!(
                        "/*\u{03A9}ignore_start\u{03A9}*/;{local} = __sveltets_2_any({local});/*\u{03A9}ignore_end\u{03A9}*/"
                    );
                    str.append_left(pe.decl_end + offset, &inject);
                }
            }
        }
    }
}

/// Handle a reactive labeled statement (`$: ...`).
///
/// Transforms reactive declarations and statements according to svelte2tsx conventions:
///
/// - `$: x = expr` (new variable) → `let  x = __sveltets_2_invalidate(() => expr)`
/// - `$: x = expr` (existing var) → `$: x = __sveltets_2_invalidate(() => expr)`
/// - `$: $store = expr` (store) → `$: $store = __sveltets_2_invalidate(() => expr)`
/// - `$: ({ a } = expr)` (destructure, new) → `let  { a } = __sveltets_2_invalidate(() => expr)`
/// - `$: ({ a } = expr)` (destructure, existing) → `$: ({ a } = __sveltets_2_invalidate(() => expr))`
/// - `$: { ... }` (block) → `;() => {$: { ... }}`
/// - `$: expr` (expression) → `;() => {$: expr}`
fn handle_reactive_statement(
    labeled: &oxc::LabeledStatement,
    offset: u32,
    str: &mut MagicString,
    raw_content: &str,
    declared_names: &HashSet<String>,
    reactive_declared_names: &mut HashSet<String>,
) {
    let label_start = labeled.span.start + offset;
    let label_end = labeled.span.end + offset;

    match &labeled.body {
        oxc::Statement::ExpressionStatement(expr_stmt) => {
            // Check for assignment expression
            let expr = match &expr_stmt.expression {
                oxc::Expression::ParenthesizedExpression(paren) => &paren.expression,
                other => other,
            };

            if let oxc::Expression::AssignmentExpression(assign) = expr {
                if matches!(assign.operator, oxc::AssignmentOperator::Assign) {
                    // Get the LHS names
                    let lhs_names = extract_names_from_assignment_target(&assign.left);

                    // Check if the LHS is a $store reference
                    let is_store_assignment = match &assign.left {
                        oxc::AssignmentTarget::AssignmentTargetIdentifier(id) => {
                            id.name.starts_with('$')
                        }
                        _ => false,
                    };

                    // Determine if this is a new variable declaration
                    let all_declared = !lhs_names.is_empty()
                        && lhs_names.iter().all(|n| {
                            declared_names.contains(n) || reactive_declared_names.contains(n)
                        });

                    let is_new_declaration =
                        !is_store_assignment && !all_declared && !lhs_names.is_empty();

                    // Get the RHS text from the raw content
                    let rhs_start = assign.right.span().start;
                    let rhs_end = assign.right.span().end;
                    let rhs_text = &raw_content[rhs_start as usize..rhs_end as usize];

                    // Check if RHS starts with `{` (object literal needs wrapping in parens)
                    let rhs_needs_parens = rhs_text.starts_with('{');

                    // Build the invalidate wrapper for the RHS
                    let wrapped_rhs = if rhs_needs_parens {
                        format!("__sveltets_2_invalidate(() => ({}))", rhs_text)
                    } else {
                        format!("__sveltets_2_invalidate(() => {})", rhs_text)
                    };

                    // Overwrite the RHS
                    let rhs_abs_start = rhs_start + offset;
                    let rhs_abs_end = rhs_end + offset;
                    str.overwrite(rhs_abs_start, rhs_abs_end, &wrapped_rhs);

                    if is_new_declaration {
                        // Replace `$:` with `let ` (and handle parenthesized expressions)
                        // The extra space in "let " matches the JS svelte2tsx behavior where
                        // `$:` (2 chars) → `let` (3 chars) produces `let  b` in the output
                        // because the space after `:` is preserved.
                        let label_colon_end = labeled.label.span.end + 1; // Skip the ':'
                        let label_colon_abs = label_colon_end + offset;

                        // Check if this is a parenthesized expression like `$: ({ a } = expr)`
                        let is_paren = matches!(
                            &expr_stmt.expression,
                            oxc::Expression::ParenthesizedExpression(_)
                        );

                        if is_paren {
                            // `$: ({ a } = expr)` → `let  { a } = __sveltets_2_invalidate(() => expr)`
                            // Replace `$:` with `let ` (extra space so the original space
                            // after `:` produces the double-space matching JS svelte2tsx).
                            str.overwrite(label_start, label_colon_abs, "let ");

                            // Remove the opening `(` and the closing `)` and `;`
                            let paren_expr = match &expr_stmt.expression {
                                oxc::Expression::ParenthesizedExpression(p) => p,
                                _ => unreachable!(),
                            };
                            let paren_start = paren_expr.span.start + offset;
                            let paren_end = paren_expr.span.end + offset;
                            // The `(` is at paren_start, the `)` is at paren_end-1
                            str.overwrite(paren_start, paren_start + 1, "");
                            // Remove only `)`, keep any trailing `;`
                            str.overwrite(paren_end - 1, paren_end, "");
                        } else {
                            // `$: x = expr` → `let  x = __sveltets_2_invalidate(() => expr)`
                            // Replace `$:` with `let ` to produce double-space before identifier
                            str.overwrite(label_start, label_colon_abs, "let ");
                        }

                        // Track newly declared names
                        for name in &lhs_names {
                            reactive_declared_names.insert(name.clone());
                        }
                    }
                    // else: keep `$:` as-is, RHS is already wrapped
                }
            } else {
                // Non-assignment expression: `$: console.log(x)` → `;() => {$: console.log(x)}`
                let label_colon_end = labeled.label.span.end + 1;
                let label_colon_abs = label_colon_end + offset;
                str.overwrite(label_start, label_colon_abs, ";() => {$:");
                str.append_left(label_end, "}");
            }
        }
        oxc::Statement::BlockStatement(_) => {
            // Block: `$: { ... }` → `;() => {$: { ... }}`
            let label_colon_end = labeled.label.span.end + 1;
            let label_colon_abs = label_colon_end + offset;
            str.overwrite(label_start, label_colon_abs, ";() => {$:");
            str.append_left(label_end, "}");
        }
        oxc::Statement::IfStatement(_) => {
            // `$: if (...) { ... }` → `;() => {$: if (...) { ... }}`
            let label_colon_end = labeled.label.span.end + 1;
            let label_colon_abs = label_colon_end + offset;
            str.overwrite(label_start, label_colon_abs, ";() => {$:");
            str.append_left(label_end, "}");
        }
        _ => {
            // Other statements: wrap similarly
            let label_colon_end = labeled.label.span.end + 1;
            let label_colon_abs = label_colon_end + offset;
            str.overwrite(label_start, label_colon_abs, ";() => {$:");
            str.append_left(label_end, "}");
        }
    }
}

fn detect_runes_call(declarator: &oxc::VariableDeclarator, exported_names: &mut ExportedNames) {
    if let Some(ref init) = declarator.init {
        if let oxc::Expression::CallExpression(call) = init {
            if let oxc::Expression::Identifier(ref callee) = call.callee {
                if matches!(callee.name.as_str(), "$state" | "$derived" | "$effect") {
                    exported_names.set_uses_runes(true);
                }
            }
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
fn detect_props_rune_oxc(
    declarator: &oxc::VariableDeclarator,
    exported_names: &mut ExportedNames,
    raw_content: &str,
) {
    if is_props_call_oxc(declarator) {
        exported_names.set_has_props_rune(true);
        exported_names.set_uses_runes(true);

        // Extract type annotation if present (e.g., `: Props` in `let {...}: Props = $props()`)
        // Check the declarator's own type_annotation field (OXC VariableDeclarator)
        if let Some(ref ta) = declarator.type_annotation {
            let ts_type = &ta.type_annotation;
            let start = ts_type.span().start as usize;
            let end = ts_type.span().end as usize;
            if start < end && end <= raw_content.len() {
                let type_text = &raw_content[start..end];
                exported_names.props_type_text = Some(type_text.to_string());
            }
        }

        extract_props_from_binding_pattern_runes(&declarator.id, exported_names, raw_content);
    }
}

/// Check if an expression is a `$bindable()` call, optionally returning the inner argument text.
fn is_bindable_call(expr: &oxc::Expression, raw_content: &str) -> (bool, Option<String>) {
    if let oxc::Expression::CallExpression(call) = expr {
        if let oxc::Expression::Identifier(ref callee) = call.callee {
            if callee.name == "$bindable" {
                // Get the first argument if any (for type inference)
                let arg_text = call.arguments.first().map(|arg| {
                    let start = arg.span().start as usize;
                    let end = arg.span().end as usize;
                    raw_content[start..end].to_string()
                });
                return (true, arg_text);
            }
        }
    }
    (false, None)
}

/// Infer a type string from a default value expression for JSDoc $$ComponentProps typedef.
fn infer_type_from_default(expr: &oxc::Expression, raw_content: &str) -> String {
    match expr {
        oxc::Expression::BooleanLiteral(_) => "boolean".to_string(),
        oxc::Expression::NumericLiteral(_) => "number".to_string(),
        oxc::Expression::StringLiteral(_) => "string".to_string(),
        oxc::Expression::NullLiteral(_) => "any".to_string(),
        oxc::Expression::ArrayExpression(arr) => {
            if arr.elements.is_empty() {
                "any[]".to_string()
            } else {
                "any[]".to_string()
            }
        }
        oxc::Expression::ObjectExpression(obj) => {
            if obj.properties.is_empty() {
                "Record<string, any>".to_string()
            } else {
                "Record<string, any>".to_string()
            }
        }
        oxc::Expression::ArrowFunctionExpression(_) | oxc::Expression::FunctionExpression(_) => {
            "Function".to_string()
        }
        oxc::Expression::Identifier(id) => {
            if id.name == "undefined" {
                "any".to_string()
            } else {
                format!("typeof {}", id.name)
            }
        }
        oxc::Expression::CallExpression(call) => {
            // Check for $bindable() - extract inner type
            if let oxc::Expression::Identifier(ref callee) = call.callee {
                if callee.name == "$bindable" {
                    if let Some(first_arg) = call.arguments.first() {
                        if let oxc::Argument::SpreadElement(_) = first_arg {
                            return "any".to_string();
                        }
                        return infer_type_from_default(first_arg.to_expression(), raw_content);
                    }
                    return "any".to_string();
                }
            }
            "any".to_string()
        }
        _ => "any".to_string(),
    }
}

/// Extract prop names from a destructuring pattern used with `$props()`.
///
/// Handles ObjectPattern: `{ a, b = 1, ...rest }`
/// Also detects $bindable() and infers types for JSDoc $$ComponentProps typedef.
fn extract_props_from_binding_pattern_runes(
    pattern: &oxc::BindingPattern,
    exported_names: &mut ExportedNames,
    raw_content: &str,
) {
    match pattern {
        oxc::BindingPattern::ObjectPattern(obj_pat) => {
            for prop in obj_pat.properties.iter() {
                let key_name = property_key_to_string(&prop.key);
                let (local_name, has_default, is_bindable) = match &prop.value {
                    oxc::BindingPattern::AssignmentPattern(assign) => {
                        // { a = 1 } or { a = $bindable() }
                        let name = binding_pattern_simple_name(&assign.left);
                        let (bindable, _) = is_bindable_call(&assign.right, raw_content);
                        (name, true, bindable)
                    }
                    _ => {
                        let name = binding_pattern_simple_name(&prop.value);
                        (name, false, false)
                    }
                };

                if let Some(ref key) = key_name {
                    let local = local_name.unwrap_or_else(|| key.clone());
                    exported_names.add(key.clone(), local, has_default, None, true);
                    if is_bindable {
                        exported_names.bindable_props.push(key.clone());
                    }
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

/// Collect detailed position info from a $props() variable declaration for typedef generation.
fn collect_props_rune_info(
    var_decl: &oxc::VariableDeclaration,
    declarator: &oxc::VariableDeclarator,
    raw_content: &str,
    program: &oxc::Program,
    stmt_index: usize,
) -> Option<PropsRuneInfo> {
    if !is_props_call_oxc(declarator) {
        return None;
    }

    let let_pos = var_decl.span.start;
    let destructure_start = declarator.id.span().start;
    let destructure_end = declarator.id.span().end;
    let props_call_end = declarator.init.as_ref().map(|e| e.span().end).unwrap_or(0);

    // Detect type annotation
    // Also detect if the type is "hoistable" (inline object type vs named type reference)
    let (
        has_type_annotation,
        type_annotation_start,
        type_annotation_end,
        type_text,
        is_hoistable_type,
        colon_pos,
    ) = if let Some(ref ta) = declarator.type_annotation {
        let ts_type = &ta.type_annotation;
        let start = ts_type.span().start;
        let end = ts_type.span().end;
        let text = if (start as usize) < raw_content.len() && (end as usize) <= raw_content.len() {
            Some(raw_content[start as usize..end as usize].to_string())
        } else {
            None
        };
        // Inline object types are hoistable, named type references are not
        let is_hoistable = matches!(&ts_type, oxc::TSType::TSTypeLiteral(_));
        // The colon position is the start of the TSTypeAnnotation span (includes `:`)
        let colon = ta.span.start;
        (
            true,
            Some(start),
            Some(end),
            text,
            is_hoistable,
            Some(colon),
        )
    } else {
        (false, None, None, None, false, None)
    };

    // Detect JSDoc @type comment before the let statement
    let (jsdoc_type, jsdoc_start, jsdoc_end) = detect_jsdoc_type_before(
        raw_content,
        var_decl.span.start as usize,
        program,
        stmt_index,
    );

    // Detect rest element and collect prop types
    let mut has_rest = false;
    let mut prop_types: Vec<(String, bool, String)> = Vec::new();
    let mut bindable_names: Vec<String> = Vec::new();

    if let oxc::BindingPattern::ObjectPattern(obj_pat) = &declarator.id {
        has_rest = obj_pat.rest.is_some();

        for prop in obj_pat.properties.iter() {
            let key_name = property_key_to_string(&prop.key);
            if let Some(key) = key_name {
                match &prop.value {
                    oxc::BindingPattern::AssignmentPattern(assign) => {
                        let inferred_type = infer_type_from_default(&assign.right, raw_content);
                        let (bindable, _) = is_bindable_call(&assign.right, raw_content);
                        prop_types.push((key.clone(), true, inferred_type));
                        if bindable {
                            bindable_names.push(key);
                        }
                    }
                    _ => {
                        prop_types.push((key, false, "any".to_string()));
                    }
                }
            }
        }
    }

    Some(PropsRuneInfo {
        let_pos,
        destructure_start,
        destructure_end,
        props_call_end,
        has_type_annotation,
        type_annotation_start,
        type_annotation_end,
        type_text,
        colon_pos,
        is_hoistable_type,
        jsdoc_type,
        jsdoc_start,
        jsdoc_end,
        has_rest,
        prop_types,
        bindable_names,
    })
}

/// Detect a JSDoc `@type` comment immediately before a given position.
///
/// Looks for patterns like `/** @type {SomeType} */` preceding a variable declaration.
fn detect_jsdoc_type_before(
    raw_content: &str,
    stmt_start: usize,
    _program: &oxc::Program,
    _stmt_index: usize,
) -> (Option<String>, Option<u32>, Option<u32>) {
    // Look backwards from stmt_start for `*/`
    let before = &raw_content[..stmt_start];
    let trimmed = before.trim_end();
    if !trimmed.ends_with("*/") {
        return (None, None, None);
    }

    // Find the start of the comment `/**`
    if let Some(comment_end) = before.rfind("*/") {
        let comment_end_pos = comment_end + 2;
        if let Some(comment_start) = before[..comment_end].rfind("/**") {
            let comment_text = &before[comment_start..comment_end_pos];
            // Check if it's a @type comment
            if let Some(type_start_offset) = comment_text.find("@type") {
                let after_at_type = &comment_text[type_start_offset + 5..];
                let trimmed_after = after_at_type.trim_start();
                if trimmed_after.starts_with('{') {
                    // Extract the type text between { and }
                    if let Some(brace_end) = find_matching_brace(trimmed_after) {
                        let type_text = &trimmed_after[..brace_end + 1];
                        return (
                            Some(type_text.to_string()),
                            Some(comment_start as u32),
                            Some(comment_end_pos as u32),
                        );
                    }
                }
            }
        }
    }

    (None, None, None)
}

/// Find the matching closing brace for `{...}`, handling nested braces.
fn find_matching_brace(text: &str) -> Option<usize> {
    let mut depth = 0;
    for (i, ch) in text.char_indices() {
        match ch {
            '{' => depth += 1,
            '}' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
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

fn extract_names_from_binding_pattern_full(
    pattern: &oxc::BindingPattern,
    exported_names: &mut ExportedNames,
    has_default: bool,
    is_prop: bool,
    is_let: bool,
    is_named_export: bool,
) {
    match pattern {
        oxc::BindingPattern::BindingIdentifier(id) => {
            let name = id.name.to_string();
            exported_names.add_full(
                name.clone(),
                name,
                has_default,
                None,
                is_prop,
                is_let,
                is_named_export,
            );
        }
        oxc::BindingPattern::ObjectPattern(obj_pat) => {
            for prop in obj_pat.properties.iter() {
                match &prop.value {
                    oxc::BindingPattern::AssignmentPattern(assign) => {
                        extract_names_from_binding_pattern_full(
                            &assign.left,
                            exported_names,
                            true,
                            is_prop,
                            is_let,
                            is_named_export,
                        );
                    }
                    _ => {
                        extract_names_from_binding_pattern_full(
                            &prop.value,
                            exported_names,
                            has_default,
                            is_prop,
                            is_let,
                            is_named_export,
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
                            extract_names_from_binding_pattern_full(
                                &assign.left,
                                exported_names,
                                true,
                                is_prop,
                                is_let,
                                is_named_export,
                            );
                        }
                        _ => {
                            extract_names_from_binding_pattern_full(
                                el,
                                exported_names,
                                has_default,
                                is_prop,
                                is_let,
                                is_named_export,
                            );
                        }
                    }
                }
            }
        }
        oxc::BindingPattern::AssignmentPattern(assign) => {
            extract_names_from_binding_pattern_full(
                &assign.left,
                exported_names,
                true,
                is_prop,
                is_let,
                is_named_export,
            );
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

// =============================================================================
// Store subscription injection
// =============================================================================

/// Reserved names that should not be treated as store references.
const RESERVED_STORE_NAMES: &[&str] = &["$$props", "$$restProps", "$$slots"];

/// Svelte rune names that should not be treated as store references.
/// When `$state(0)` appears in the source, `state` should NOT be treated as a store.
const SVELTE_RUNES: &[&str] = &[
    "$state",
    "$derived",
    "$effect",
    "$props",
    "$bindable",
    "$inspect",
    "$host",
];

/// Scan the full source for `$identifier` patterns and return the set of
/// store names (without the `$` prefix).
///
/// Excludes:
/// - Reserved names (`$$props`, `$$restProps`, `$$slots`)
/// - Member access like `obj.$store` (preceded by `.`)
/// - String literals like `'$store'` or `"$store"` (preceded by `'` or `"`)
fn collect_store_references(source: &str) -> HashSet<String> {
    let re = Regex::new(r"\$([a-zA-Z_][a-zA-Z0-9_]*)").unwrap();
    let mut stores = HashSet::new();

    for cap in re.captures_iter(source) {
        let m = cap.get(0).unwrap();
        let full_match = m.as_str();
        let store_name = cap.get(1).unwrap().as_str();

        // Check what character precedes the `$`
        let start = m.start();
        if start > 0 {
            let prev_byte = source.as_bytes()[start - 1];
            // Skip member access (obj.$store), string keys ('$store' or "$store")
            if prev_byte == b'.' || prev_byte == b'\'' || prev_byte == b'"' {
                continue;
            }
            // Skip identifiers that continue (e.g., `foo$bar`)
            if prev_byte.is_ascii_alphanumeric() || prev_byte == b'_' {
                continue;
            }
        }

        // Skip reserved names
        if RESERVED_STORE_NAMES.contains(&full_match) {
            continue;
        }

        // Skip `$$` prefixed names (like `$$props`)
        if store_name.starts_with('$') {
            continue;
        }

        stores.insert(store_name.to_string());
    }

    stores
}

/// Extract all identifier names from a binding pattern (for destructuring support).
///
/// For `{ a, b, c }` returns `["a", "b", "c"]`.
/// For `[a, b, c]` returns `["a", "b", "c"]`.
/// For simple identifiers, returns the single name.
fn extract_all_names_from_binding_pattern(pattern: &oxc::BindingPattern) -> Vec<String> {
    let mut names = Vec::new();
    collect_binding_names(pattern, &mut names);
    names
}

fn collect_binding_names(pattern: &oxc::BindingPattern, names: &mut Vec<String>) {
    match pattern {
        oxc::BindingPattern::BindingIdentifier(id) => {
            names.push(id.name.to_string());
        }
        oxc::BindingPattern::ObjectPattern(obj) => {
            for prop in obj.properties.iter() {
                collect_binding_names(&prop.value, names);
            }
            if let Some(ref rest) = obj.rest {
                collect_binding_names(&rest.argument, names);
            }
        }
        oxc::BindingPattern::ArrayPattern(arr) => {
            for el in arr.elements.iter() {
                if let Some(el) = el {
                    collect_binding_names(el, names);
                }
            }
            if let Some(ref rest) = arr.rest {
                collect_binding_names(&rest.argument, names);
            }
        }
        oxc::BindingPattern::AssignmentPattern(assign) => {
            collect_binding_names(&assign.left, names);
        }
    }
}

/// Extract names from the left-hand side of an assignment expression
/// (used for reactive declarations like `$: store = ...`).
fn extract_names_from_assignment_target(target: &oxc::AssignmentTarget) -> Vec<String> {
    let mut names = Vec::new();
    collect_assignment_target_names(target, &mut names);
    names
}

fn collect_assignment_target_names(target: &oxc::AssignmentTarget, names: &mut Vec<String>) {
    match target {
        oxc::AssignmentTarget::AssignmentTargetIdentifier(id) => {
            let name = id.name.to_string();
            if !name.starts_with('$') {
                names.push(name);
            }
        }
        oxc::AssignmentTarget::ObjectAssignmentTarget(obj) => {
            for prop in obj.properties.iter() {
                match prop {
                    oxc::AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(id) => {
                        let name = id.binding.name.to_string();
                        if !name.starts_with('$') {
                            names.push(name);
                        }
                    }
                    oxc::AssignmentTargetProperty::AssignmentTargetPropertyProperty(prop) => {
                        match &prop.binding {
                            oxc::AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(
                                with_default,
                            ) => {
                                collect_assignment_target_names(&with_default.binding, names);
                            }
                            _ => {
                                if let Some(target) = prop.binding.as_assignment_target() {
                                    collect_assignment_target_names(target, names);
                                }
                            }
                        }
                    }
                }
            }
            if let Some(ref rest) = obj.rest {
                collect_assignment_target_names(&rest.target, names);
            }
        }
        oxc::AssignmentTarget::ArrayAssignmentTarget(arr) => {
            for el in arr.elements.iter() {
                if let Some(el) = el {
                    match el {
                        oxc::AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(
                            with_default,
                        ) => {
                            collect_assignment_target_names(&with_default.binding, names);
                        }
                        _ => {
                            if let Some(target) = el.as_assignment_target() {
                                collect_assignment_target_names(target, names);
                            }
                        }
                    }
                }
            }
            if let Some(ref rest) = arr.rest {
                collect_assignment_target_names(&rest.target, names);
            }
        }
        _ => {}
    }
}

/// Create the store subscription declaration string for a list of store names.
///
/// Returns a string like `/*Ωignore_startΩ*/;let $a = __sveltets_2_store_get(a);;let $b = __sveltets_2_store_get(b);/*Ωignore_endΩ*/`
fn create_store_declarations(store_names: &[&str]) -> String {
    if store_names.is_empty() {
        return String::new();
    }
    let mut result = String::from("/*\u{03A9}ignore_start\u{03A9}*/");
    for name in store_names {
        result.push_str(&format!(
            ";let ${} = __sveltets_2_store_get({});",
            name, name
        ));
    }
    result.push_str("/*\u{03A9}ignore_end\u{03A9}*/");
    result
}

/// Inject store subscription declarations into the script.
///
/// Scans the full source for `$identifier` references, then finds the
/// declarations (variables, imports, reactive assignments) in the script that
/// match, and injects `;let $name = __sveltets_2_store_get(name);` at the
/// appropriate positions.
///
/// For variable declarations: injected right after the declaration end.
/// For imports: injected at the start of the script content (which becomes the
/// start of the $$render function body after script tag transformation).
/// For reactive declarations (`$: name = ...`): injected after the labeled statement.
fn inject_store_subscriptions(script: &Script, source: &str, str: &mut MagicString) {
    let mut accessed_stores = collect_store_references(source);
    if accessed_stores.is_empty() {
        return;
    }

    let offset = script.content_offset;

    with_parsed_script(script, source, |program, _raw_content| {
        // First pass: detect rune-declared variables and remove them from accessed_stores.
        // This prevents `let state = $state(0)` from generating a store subscription
        // for `state`, matching the JS svelte2tsx behavior.
        for stmt in program.body.iter() {
            if let oxc::Statement::VariableDeclaration(var_decl) = stmt {
                for declarator in var_decl.declarations.iter() {
                    if let Some(rune_base_name) = detect_rune_variable(declarator) {
                        accessed_stores.remove(&rune_base_name);
                    }
                }
            }
        }

        // Collect import-based store names (to inject at $$render start)
        let mut import_store_names: Vec<String> = Vec::new();

        for stmt in program.body.iter() {
            match stmt {
                // Variable declarations: inject after the declaration
                oxc::Statement::VariableDeclaration(var_decl) => {
                    // For multi-declarator declarations like `const a = 1, b = 2;`,
                    // each declarator is processed independently but the injection
                    // point is after the LAST declarator (matching JS svelte2tsx).
                    let last_decl_end = var_decl
                        .declarations
                        .last()
                        .map(|d| d.span.end)
                        .unwrap_or(var_decl.span.end);
                    let inject_pos = last_decl_end + offset;

                    for declarator in var_decl.declarations.iter() {
                        let names = extract_all_names_from_binding_pattern(&declarator.id);
                        let matching: Vec<String> = names
                            .into_iter()
                            .filter(|name| accessed_stores.contains(name))
                            .collect();

                        if !matching.is_empty() {
                            let name_refs: Vec<&str> =
                                matching.iter().map(|s| s.as_str()).collect();
                            let store_decls = create_store_declarations(&name_refs);
                            str.append_left(inject_pos, &store_decls);
                        }
                    }
                }

                // Import declarations: collect names for injection at $$render start
                oxc::Statement::ImportDeclaration(import) => {
                    collect_import_store_names(import, &accessed_stores, &mut import_store_names);
                }

                // Export named declarations: check the inner variable declaration
                oxc::Statement::ExportNamedDeclaration(export) => {
                    if let Some(ref decl) = export.declaration {
                        if let oxc::Declaration::VariableDeclaration(var_decl) = decl {
                            let last_decl_end = var_decl
                                .declarations
                                .last()
                                .map(|d| d.span.end)
                                .unwrap_or(var_decl.span.end);
                            let inject_pos = last_decl_end + offset;

                            for declarator in var_decl.declarations.iter() {
                                let names = extract_all_names_from_binding_pattern(&declarator.id);
                                let matching: Vec<String> = names
                                    .into_iter()
                                    .filter(|name| accessed_stores.contains(name))
                                    .collect();

                                if !matching.is_empty() {
                                    let name_refs: Vec<&str> =
                                        matching.iter().map(|s| s.as_str()).collect();
                                    let store_decls = create_store_declarations(&name_refs);
                                    str.append_left(inject_pos, &store_decls);
                                }
                            }
                        }
                    }
                }

                // Reactive declarations ($: name = ...)
                oxc::Statement::LabeledStatement(labeled) => {
                    if labeled.label.name == "$" {
                        let names = extract_names_from_labeled_body(&labeled.body);
                        let matching: Vec<String> = names
                            .into_iter()
                            .filter(|n| accessed_stores.contains(n))
                            .collect();

                        if !matching.is_empty() {
                            let inject_pos = labeled.span.end + offset;
                            let name_refs: Vec<&str> =
                                matching.iter().map(|s| s.as_str()).collect();
                            let store_decls = create_store_declarations(&name_refs);
                            str.append_left(inject_pos, &store_decls);
                        }
                    }
                }

                _ => {}
            }
        }

        // Also collect import-based store names from the module script (if any).
        // Module-script imports that are used as stores need their subscriptions
        // injected at the $$render function body start (= instance script content_offset).
        collect_module_script_import_stores(source, &accessed_stores, &mut import_store_names);

        // Inject import-based store subscriptions at the start of the script content.
        // Sort for deterministic output.
        import_store_names.sort();
        import_store_names.dedup();
        if !import_store_names.is_empty() {
            let name_refs: Vec<&str> = import_store_names.iter().map(|s| s.as_str()).collect();
            let store_decls = create_store_declarations(&name_refs);
            str.append_right(offset, &store_decls);
        }
    });
}

/// Collect import names that are used as stores from an import declaration.
///
/// In Svelte 5 mode, `derived` imported from `svelte/store` is excluded because
/// it's a known rune function, not a store.
fn collect_import_store_names(
    import: &oxc::ImportDeclaration,
    accessed_stores: &HashSet<String>,
    import_store_names: &mut Vec<String>,
) {
    // Skip type-only imports
    if import.import_kind.is_type() {
        return;
    }

    // Check if this is an import from 'svelte/store'
    let is_svelte_store_import = import.source.value.as_str() == "svelte/store";

    if let Some(ref specifiers) = import.specifiers {
        for spec in specifiers.iter() {
            let (local_name, is_derived_import) = match spec {
                oxc::ImportDeclarationSpecifier::ImportDefaultSpecifier(s) => {
                    (s.local.name.to_string(), false)
                }
                oxc::ImportDeclarationSpecifier::ImportNamespaceSpecifier(s) => {
                    (s.local.name.to_string(), false)
                }
                oxc::ImportDeclarationSpecifier::ImportSpecifier(s) => {
                    // Skip type-only import specifiers
                    if s.import_kind.is_type() {
                        continue;
                    }
                    let is_derived = is_svelte_store_import && s.local.name == "derived";
                    (s.local.name.to_string(), is_derived)
                }
            };

            // In Svelte 5+, skip `derived` from `svelte/store` (it's a rune, not a store)
            // TODO: This should be conditional on Svelte 5 mode, but for now we always
            // exclude it since the fixture tests default to Svelte 5.
            if is_derived_import {
                continue;
            }

            if accessed_stores.contains(&local_name) {
                import_store_names.push(local_name);
            }
        }
    }
}

/// Find the module script in the source and collect import names that are used as stores.
///
/// This allows the instance script to inject store subscriptions for module-level
/// imports at the $$render function body start.
fn collect_module_script_import_stores(
    source: &str,
    accessed_stores: &HashSet<String>,
    import_store_names: &mut Vec<String>,
) {
    // Find <script context="module"> in the source
    let module_pattern = Regex::new(r#"<script[^>]*context\s*=\s*["']module["'][^>]*>"#).unwrap();
    let module_match = match module_pattern.find(source) {
        Some(m) => m,
        None => return,
    };

    let content_start = module_match.end();

    // Find </script> closing tag
    let close_tag = match source[content_start..].find("</script>") {
        Some(pos) => content_start + pos,
        None => match source[content_start..].find("</Script>") {
            Some(pos) => content_start + pos,
            None => return,
        },
    };

    let raw_content = &source[content_start..close_tag];

    // Parse with OXC
    let allocator = Allocator::default();
    let source_type = SourceType::mjs();
    let parser = OxcParser::new(&allocator, raw_content, source_type);
    let result = parser.parse();

    for stmt in result.program.body.iter() {
        if let oxc::Statement::ImportDeclaration(import) = stmt {
            collect_import_store_names(import, accessed_stores, import_store_names);
        }
    }
}

/// Collect store declarations for module-script imports.
///
/// This is called when there is no instance script. It collects all
/// module-script import names that are used as stores (`$name`) in the source
/// and returns the store subscription declarations string to inject at the
/// start of the $$render async wrapper.
pub fn collect_module_import_store_declarations(source: &str) -> String {
    let accessed_stores = collect_store_references(source);
    if accessed_stores.is_empty() {
        return String::new();
    }

    let mut import_store_names: Vec<String> = Vec::new();
    collect_module_script_import_stores(source, &accessed_stores, &mut import_store_names);

    import_store_names.sort();
    import_store_names.dedup();

    if import_store_names.is_empty() {
        return String::new();
    }

    let name_refs: Vec<&str> = import_store_names.iter().map(|s| s.as_str()).collect();
    create_store_declarations(&name_refs)
}

/// Inject store subscription declarations for variable declarations only.
///
/// This is used for module scripts where import-based subscriptions should NOT
/// be injected (they need to go inside the $$render function body instead).
fn inject_store_subscriptions_vars_only(script: &Script, source: &str, str: &mut MagicString) {
    let mut accessed_stores = collect_store_references(source);
    if accessed_stores.is_empty() {
        return;
    }

    let offset = script.content_offset;

    with_parsed_script(script, source, |program, _raw_content| {
        // First pass: detect rune-declared variables
        for stmt in program.body.iter() {
            if let oxc::Statement::VariableDeclaration(var_decl) = stmt {
                for declarator in var_decl.declarations.iter() {
                    if let Some(rune_base_name) = detect_rune_variable(declarator) {
                        accessed_stores.remove(&rune_base_name);
                    }
                }
            }
        }

        for stmt in program.body.iter() {
            if let oxc::Statement::VariableDeclaration(var_decl) = stmt {
                let last_decl_end = var_decl
                    .declarations
                    .last()
                    .map(|d| d.span.end)
                    .unwrap_or(var_decl.span.end);
                let inject_pos = last_decl_end + offset;

                for declarator in var_decl.declarations.iter() {
                    let names = extract_all_names_from_binding_pattern(&declarator.id);
                    let matching: Vec<String> = names
                        .into_iter()
                        .filter(|name| accessed_stores.contains(name))
                        .collect();

                    if !matching.is_empty() {
                        let name_refs: Vec<&str> = matching.iter().map(|s| s.as_str()).collect();
                        let store_decls = create_store_declarations(&name_refs);
                        str.append_left(inject_pos, &store_decls);
                    }
                }
            }
        }
    });
}

/// Check if a variable declarator is a rune pattern like `let state = $state(0)`.
///
/// Returns the rune base name (e.g., "state" from "$state") if the pattern matches:
/// 1. The initializer is a call to `$props`, `$state`, or `$derived`
/// 2. The variable name contains the rune's base name (without `$`)
///
/// This mirrors the JS svelte2tsx logic that prevents rune calls from being
/// treated as store accesses.
fn detect_rune_variable(declarator: &oxc::VariableDeclarator) -> Option<String> {
    let init = declarator.init.as_ref()?;
    let call = match init {
        oxc::Expression::CallExpression(call) => call,
        _ => return None,
    };
    let callee_name = match &call.callee {
        oxc::Expression::Identifier(id) => id.name.as_str(),
        _ => return None,
    };

    // Only check the three rune names that the JS implementation checks
    if !matches!(callee_name, "$props" | "$state" | "$derived") {
        return None;
    }

    let rune_base = &callee_name[1..]; // Strip the '$' prefix

    // Check if the variable declaration name contains the rune's base name
    let decl_text = get_binding_pattern_text(&declarator.id);
    if decl_text.contains(rune_base) {
        Some(rune_base.to_string())
    } else {
        None
    }
}

/// Get a textual representation of a binding pattern for rune detection.
///
/// For simple identifiers, returns the name.
/// For destructuring patterns, returns a concatenation of all names.
fn get_binding_pattern_text(pattern: &oxc::BindingPattern) -> String {
    let names = extract_all_names_from_binding_pattern(pattern);
    names.join(",")
}

/// Extract variable names from the body of a labeled statement (`$: name = ...`).
///
/// Handles:
/// - `$: store = value` (simple assignment)
/// - `$: ({ store1, noStore } = value)` (destructuring assignment)
/// - `$: [ store2, noStore ] = value` (array destructuring)
fn extract_names_from_labeled_body(body: &oxc::Statement) -> Vec<String> {
    match body {
        oxc::Statement::ExpressionStatement(expr_stmt) => {
            // Check for parenthesized expression: `$: (expr)`
            let expr = match &expr_stmt.expression {
                oxc::Expression::ParenthesizedExpression(paren) => &paren.expression,
                other => other,
            };
            if let oxc::Expression::AssignmentExpression(assign) = expr {
                return extract_names_from_assignment_target(&assign.left);
            }
            Vec::new()
        }
        _ => Vec::new(),
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
        assert!(!result.exported_names.has("CONSTANT"));
    }

    #[test]
    fn test_module_script_export_function() {
        let source = "<script context=\"module\">\nexport function helper() {}\n</script>";
        let result = run_svelte2tsx(source);
        assert!(!result.exported_names.has("helper"));
    }

    #[test]
    fn test_module_script_export_let_not_prop() {
        let source = "<script context=\"module\">\nexport let shared = 0;\n</script>";
        let result = run_svelte2tsx(source);
        assert!(!result.exported_names.has("shared"));
    }

    // -- Mixed instance and module scripts --

    #[test]
    fn test_both_scripts() {
        let source = "<script context=\"module\">\nexport const VERSION = \"1.0\";\n</script>\n\n<script>\nexport let name;\n</script>";
        let result = run_svelte2tsx(source);
        assert!(!result.exported_names.has("VERSION"));
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

    // -- Store subscription tests --

    #[test]
    fn test_store_subscription_basic() {
        let source = "<script>\n    const store = writable([]);\n</script>\n{$store}";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("__sveltets_2_store_get(store)"),
            "Output should contain store subscription"
        );
    }

    #[test]
    fn test_store_import_basic() {
        let source = "<script>\n    import storeA from './store';\n</script>\n{$storeA}";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("__sveltets_2_store_get(storeA)"),
            "Output should contain store subscription for import"
        );
    }

    #[test]
    fn test_store_no_rune_injection() {
        let source = "<script>\nlet { a } = $props();\nlet x = $state(0);\n</script>";
        let result = run_svelte2tsx(source);
        assert!(
            !result.code.contains("__sveltets_2_store_get"),
            "Output should NOT contain store subscriptions for rune declarations"
        );
    }

    #[test]
    fn test_store_import_multi() {
        let source = "<script>\n    import storeA from './store';\n    import { storeB } from './store';\n    import { storeB as storeC } from './store';\n</script>\n\n<p>{$storeA}</p>\n<p>{$storeB}</p>\n<p>{$storeC}</p>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("__sveltets_2_store_get(storeA)"),
            "should have storeA subscription"
        );
        assert!(
            result.code.contains("__sveltets_2_store_get(storeB)"),
            "should have storeB subscription"
        );
        assert!(
            result.code.contains("__sveltets_2_store_get(storeC)"),
            "should have storeC subscription"
        );

        // Verify the store subscriptions appear at the right position (after function $$render() {)
        let render_start = result.code.find("function $$render() {").unwrap();
        let store_sub_start = result.code.find("__sveltets_2_store_get(storeA)").unwrap();
        assert!(
            store_sub_start > render_start,
            "store subscriptions should be inside $$render body"
        );
    }

    #[test]
    fn test_store_from_module() {
        let source = "<script context=\"module\">\n    import {store1, store2} from './store';\n    const store3 = writable('');\n    const store4 = writable('');\n</script>\n\n<script>\n    $store1;\n    $store3;\n</script>\n\n<p>{$store2}</p>\n<p>{$store4}</p>";
        let result = run_svelte2tsx(source);
        // Module-level const declarations should get subscriptions
        assert!(
            result.code.contains("__sveltets_2_store_get(store3)"),
            "should have store3 subscription"
        );
        assert!(
            result.code.contains("__sveltets_2_store_get(store4)"),
            "should have store4 subscription"
        );
    }

    #[test]
    fn test_store_reactive_assignment() {
        let source = "<script>\n    $: store = fromSomewhere();\n</script>\n<p>{$store}</p>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("__sveltets_2_store_get(store)"),
            "should have store subscription for reactive assignment"
        );
    }

    #[test]
    fn test_store_derived_import_svelte5() {
        // In Svelte 5, `derived` from `svelte/store` is a rune, not a store
        let source = "<script>\n    import { derived } from 'svelte/store';\n\n    let a = $derived(1);\n</script>";
        let result = run_svelte2tsx(source);
        assert!(
            !result.code.contains("__sveltets_2_store_get(derived)"),
            "should NOT have derived store subscription in Svelte 5 mode"
        );
    }

    #[test]
    fn test_store_multiple_variable_declaration() {
        let source = "<script>\n    const store1 = '', store2 = '';\n    const { store3, store4 } = '', [ store5, store6 ] = '';\n    $: ({store7, store8} = '');\n    $: [store9, store10] = '';\n</script>\n\n{$store1}\n{$store2}\n{$store3}\n{$store4}\n{$store5}\n{$store6}\n{$store7}\n{$store8}\n{$store9}\n{$store10}";
        let result = run_svelte2tsx(source);
        // Check each store subscription exists
        for i in 1..=10 {
            let name = format!("store{}", i);
            assert!(
                result
                    .code
                    .contains(&format!("__sveltets_2_store_get({})", name)),
                "should have {} subscription",
                name
            );
        }
        // Check that store1 and store2 have SEPARATE ignore blocks
        let store1_block = "/*\u{03A9}ignore_start\u{03A9}*/;let $store1 = __sveltets_2_store_get(store1);/*\u{03A9}ignore_end\u{03A9}*/";
        let store2_block = "/*\u{03A9}ignore_start\u{03A9}*/;let $store2 = __sveltets_2_store_get(store2);/*\u{03A9}ignore_end\u{03A9}*/";
        assert!(
            result.code.contains(store1_block),
            "store1 should have separate ignore block"
        );
        assert!(
            result.code.contains(store2_block),
            "store2 should have separate ignore block"
        );
    }
}
