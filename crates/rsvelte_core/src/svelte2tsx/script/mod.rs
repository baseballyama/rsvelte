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
use std::fmt::Write as _;

use oxc_allocator::Allocator;
use oxc_ast::ast as oxc;
use oxc_ast_visit::Visit;
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
    /// Whether `$$Slots` type/interface is declared in the script
    pub has_slots_type: bool,
    /// Whether `$$Events` type/interface is declared in the script
    pub has_events_type: bool,
    /// Whether the $$ComponentProps type was already inserted by apply_props_typedef
    /// (for best-effort auto-generated types that go inside $$render, not before it)
    pub type_already_inserted: bool,
    /// Generics collected from `type X = $$Generic<T>` declarations.
    /// Each entry is (name, constraint) e.g., ("A", None), ("B", Some("keyof A")).
    pub dollar_generics: Vec<(String, Option<String>)>,
    /// Source positions of `type X = $$Generic...` statements to blank out.
    pub dollar_generic_positions: Vec<(u32, u32)>,
    /// Type/interface declarations from instance script that should be hoisted
    /// before $$render(). Each entry is (start, end) relative to source (absolute positions).
    pub hoistable_type_ranges: Vec<(u32, u32)>,
    /// Type/interface declarations referenced by `$$Generic<X>` constraints that
    /// must be moved before $$render() so the generic constraint sees the type.
    /// Mirrors `nodesToMove` in the JS reference (`processInstanceScriptContent`).
    /// Each entry is `(start, end)` in absolute source positions; processing
    /// differs from `hoistable_type_ranges` (no `;` markers, no leading-trivia
    /// walk-back, append `\n` after the chunk to mirror `moveNode`'s
    /// `originalEndChar + '\n'` overwrite).
    pub dollar_generic_referenced_ranges: Vec<(u32, u32)>,
    /// Absolute source position of the `let` keyword in `let { ... } = $props()`.
    /// Used to insert `;type $$ComponentProps = ...;` right before the `$props()`
    /// statement when the type can't be hoisted out of $$render (matches JS reference's
    /// `move(generic_arg.pos, generic_arg.end, node.parent.pos)`).
    pub props_let_abs_pos: Option<u32>,
    /// Names of top-level `type X = ...` and `interface X { ... }` declarations
    /// in the instance script. Used to detect "shadowed" type references in the
    /// `$props()` type annotation: if `let { ... }: { x: T } = $props()` mentions
    /// any name in this set, the synthesised `$$ComponentProps` cannot be hoisted
    /// out of `$$render` because the name resolves to an instance-scope binding.
    pub instance_type_names: HashSet<String>,
    /// Names of top-level value declarations (let/const/var/function/class) from
    /// the instance script. Used to detect runtime-value dependencies in the
    /// `$props()` type annotation (in addition to the `typeof ...` heuristic).
    pub instance_value_names: HashSet<String>,
    /// Names imported into the instance script (default, named, namespace).
    /// Imports are "allowed references" for hoistability analysis — a snippet
    /// or interface that references an imported binding is still hoistable
    /// because the imported value resolves to a stable, module-scoped binding.
    pub instance_import_names: HashSet<String>,
    /// Names declared at the top level of the module (`<script context="module">`)
    /// script. Used by the snippet hoist analyser: a reference to `$X` in a
    /// snippet body must block hoisting whenever `X` is bound anywhere in the
    /// component (module or instance), because the JS reference's
    /// `addDisallowed(getAccessedStores())` is component-wide.
    pub module_value_names: HashSet<String>,
    /// Names imported into the module script.
    pub module_import_names: HashSet<String>,
    /// Names of top-level `type X = ...` / `interface X { ... }` declarations
    /// in the module script. Used by the hoist analyser to detect a candidate
    /// instance-script type that would shadow a module-scope name once
    /// hoisted.
    pub module_type_names: HashSet<String>,
    /// Subset of `instance_type_names` that have been determined hoistable.
    /// References to these from `$$ComponentProps` do NOT trigger
    /// force-inside-render, because the hoisted declaration is still in scope
    /// when the synthesised type is read.
    pub hoistable_instance_type_names: HashSet<String>,
}

#[derive(Debug, Clone)]
pub struct ExportedNameInfo {
    pub local_name: String,
    pub has_default: bool,
    pub type_annotation: Option<String>,
    pub is_prop: bool,
    pub is_let: bool,
    pub is_named_export: bool,
    /// Leading JSDoc `/** @type {…} */` comment on the export declaration,
    /// preserved in the legacy `props: { … }` return (mirrors official's
    /// `value.doc`).
    pub doc: Option<String>,
}

#[derive(Debug, Clone)]
struct PossibleExport {
    is_let: bool,
    has_init: bool,
    has_type_annotation: bool,
    decl_end: u32,
    type_annotation_text: Option<String>,
    /// Leading JSDoc `/** @type {…} */` on the declaration, for
    /// `export { x as y }` (the doc lives on the `let x` declaration).
    doc: Option<String>,
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
            has_slots_type: false,
            has_events_type: false,
            type_already_inserted: false,
            dollar_generics: Vec::new(),
            dollar_generic_positions: Vec::new(),
            hoistable_type_ranges: Vec::new(),
            dollar_generic_referenced_ranges: Vec::new(),
            props_let_abs_pos: None,
            instance_type_names: HashSet::new(),
            instance_value_names: HashSet::new(),
            instance_import_names: HashSet::new(),
            module_value_names: HashSet::new(),
            module_import_names: HashSet::new(),
            module_type_names: HashSet::new(),
            hoistable_instance_type_names: HashSet::new(),
        }
    }
    /// Build the generics string for `$$render` from `$$Generic` declarations.
    /// Returns something like `/*Ωignore_startΩ*/<A,B extends keyof A,C extends boolean>/*Ωignore_endΩ*/`
    /// or empty string if no $$Generic declarations.
    pub fn build_dollar_generics_str(&self) -> String {
        if self.dollar_generics.is_empty() {
            return String::new();
        }
        let parts: Vec<String> = self
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
        format!(
            "/*\u{03A9}ignore_start\u{03A9}*/<{}>/*\u{03A9}ignore_end\u{03A9}*/",
            parts.join(",")
        )
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
                doc: None,
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
                doc: None,
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
    /// True if `local` is the *local* (source-declared) name of any export.
    /// Unlike `has`, this matches through aliases: `export { v1 as a1 }`
    /// is keyed by `a1`, but its local name is `v1`.
    pub fn has_local(&self, local: &str) -> bool {
        self.names.values().any(|info| info.local_name == local)
    }
    /// Mirror official `hasNoProps()`: runes mode → no `$props` type/comment;
    /// legacy → no exports.
    pub fn has_no_props(&self) -> bool {
        if self.is_runes_mode() {
            self.props_type_text.is_none()
                && !self.has_component_props_typedef
                && self.props_jsdoc_type.is_none()
        } else {
            self.names.is_empty()
        }
    }
    /// Attach the leading JSDoc comment to an exported name (by export key).
    pub fn set_doc(&mut self, name: &str, doc: String) {
        if let Some(info) = self.names.get_mut(name) {
            info.doc = Some(doc);
        }
    }
    pub fn get(&self, name: &str) -> Option<&ExportedNameInfo> {
        self.names.get(name)
    }
    pub fn get_mut(&mut self, name: &str) -> Option<&mut ExportedNameInfo> {
        self.names.get_mut(name)
    }
    pub fn is_empty(&self) -> bool {
        self.names.is_empty()
    }
    pub fn create_props_str(&self, is_ts: bool, uses_dollar_props: bool) -> String {
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

            // JSDoc named type case: `/** @type {SomeType} */` → `/** @type {SomeType} */({})`
            if let Some(ref jsdoc_type) = self.props_jsdoc_type
                && !self.has_component_props_typedef
            {
                return format!("/** @type {} */({{}})", jsdoc_type);
            }

            // Otherwise, list the prop entries from $props() destructuring.
            // In runes mode, props ONLY come from a `$props()` call; a stray
            // `export let foo` is not a prop (it's a runes-mode error), so
            // without a `$props()` call there are no props. Named exports
            // (`export { x as y }`) are likewise not props.
            let entries: Vec<String> = if self.has_props_rune {
                self.get_ordered()
                    .iter()
                    .filter(|(_, info)| info.is_prop && !info.is_named_export)
                    .map(|(en, info)| format!("{}: {}", en, info.local_name))
                    .collect()
            } else {
                Vec::new()
            };
            if entries.is_empty() {
                // Reference: addComponentExport.ts `props()` function —
                // runes mode with no props: TS uses `{} as Record<string, never>`,
                // JS uses `/** @type {Record<string, never>} */ ({})`.
                return if is_ts {
                    "{} as Record<string, never>".to_string()
                } else {
                    "/** @type {Record<string, never>} */ ({})".to_string()
                };
            }
            return format!("{{{}}}", entries.join(" , "));
        }
        // In JS (non-TS) files the props object omits the `as {…}` type assert
        // (`dontAddTypeDef`), so a captured leading JSDoc `/** @type {…} */` is
        // emitted before the prop — mirrors official `createReturnElements`.
        let entries: Vec<String> = self
            .get_ordered()
            .iter()
            .map(|(en, info)| match (&info.doc, is_ts) {
                (Some(doc), false) => format!("{} {}: {}", doc, en, info.local_name),
                _ => format!("{}: {}", en, info.local_name),
            })
            .collect();
        if entries.is_empty() {
            // Reference: ExportedNames.ts createPropsStr — non-runes mode with
            // no props. When `$$props`/`$$restProps` is used, props flattens to
            // a bare `{}`; otherwise TS uses `{} as Record<string, never>` and
            // JS uses `/** @type {Record<string, never>} */ ({})`.
            if uses_dollar_props {
                "{}".to_string()
            } else if is_ts {
                "{} as Record<string, never>".to_string()
            } else {
                "/** @type {Record<string, never>} */ ({})".to_string()
            }
        } else {
            let base = format!("{{{}}}", entries.join(" , "));
            if is_ts {
                // For TS files, add `as {name1?: type, ...}` type assertion
                let type_entries: Vec<String> = self
                    .get_ordered()
                    .iter()
                    .map(|(en, info)| {
                        let optional = if info.has_default || !info.is_let {
                            "?"
                        } else {
                            ""
                        };
                        if let Some(ref ta) = info.type_annotation {
                            format!("{}{}: {}", en, optional, ta)
                        } else {
                            format!("{}{}: typeof {}", en, optional, info.local_name)
                        }
                    })
                    .collect();
                format!("{} as {{{}}}", base, type_entries.join(", "))
            } else {
                base
            }
        }
    }
    pub fn create_exports_str(&self, is_svelte5: bool, is_ts: bool) -> String {
        self.create_exports_str_with_accessors(is_svelte5, false, is_ts)
    }

    pub fn create_exports_str_with_accessors(
        &self,
        is_svelte5: bool,
        accessors: bool,
        is_ts: bool,
    ) -> String {
        if !is_svelte5 {
            return String::new();
        }
        let others: Vec<(&str, &ExportedNameInfo)> = self
            .get_ordered()
            .into_iter()
            .filter(|(_, info)| {
                // In exports, include:
                // - Non-let declarations (const, function, class)
                // - Named exports in runes mode (even if marked as prop from export specifiers)
                // - When accessors is true, also include `export let` props
                // BUT exclude props from $props() destructuring (is_prop && !is_named_export)

                // When accessors is true, include all exported let props
                if accessors && info.is_let {
                    return true;
                }
                if info.is_prop && !info.is_named_export {
                    return false;
                }
                !info.is_let || (self.is_runes_mode() && info.is_named_export)
            })
            .collect();
        if !others.is_empty() {
            let te: Vec<String> = others
                .iter()
                .map(|(en, info)| {
                    if let Some(ref ta) = info.type_annotation {
                        format!("{}: {}", en, ta)
                    } else {
                        format!("{}: typeof {}", en, info.local_name)
                    }
                })
                .collect();
            // In runes mode, include values in the exports object — but ONLY for
            // exports that carry an explicit type annotation. Official's value
            // call is `createReturnElements(others, false, /*onlyTyped*/ true)`,
            // which skips any entry without `value.type`. Untyped exports
            // (`let count = $state(0)`) therefore yield an empty value object,
            // with the names appearing only in the `as any as { … }` cast.
            let val_str = if self.is_runes_mode() {
                let val_entries: Vec<String> = others
                    .iter()
                    .filter(|(_, info)| info.type_annotation.is_some())
                    .map(|(en, info)| format!("{}: {}", en, info.local_name))
                    .collect();
                val_entries.join(",")
            } else {
                String::new()
            };
            if is_ts {
                format!(
                    ", exports: {{{}}} as any as {{ {} }}",
                    val_str,
                    te.join(",")
                )
            } else {
                format!(", exports: /** @type {{{{{}}}}} */ ({{}})", te.join(","))
            }
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
    /// Return just the raw bindings value (for __sveltets_Render class)
    pub fn create_raw_bindings_str(&self, is_svelte5: bool) -> String {
        if !is_svelte5 {
            return "\"\"".to_string();
        }
        if self.is_runes_mode() {
            if self.bindable_props.is_empty() {
                "__sveltets_$$bindings('')".to_string()
            } else {
                let bindings: Vec<String> = self
                    .bindable_props
                    .iter()
                    .map(|n| format!("'{}'", n))
                    .collect();
                format!("__sveltets_$$bindings({})", bindings.join(", "))
            }
        } else {
            "\"\"".to_string()
        }
    }

    /// Return just the raw exports value (for __sveltets_Render class)
    pub fn create_raw_exports_str(
        &self,
        is_svelte5: bool,
        accessors: bool,
        _is_ts: bool,
    ) -> String {
        if !is_svelte5 {
            return "{}".to_string();
        }
        // Check if there are actual exports (non-prop declarations)
        let has_exports = self.get_ordered().iter().any(|(_, info)| {
            if accessors && info.is_let {
                return true;
            }
            if info.is_prop && !info.is_named_export {
                return false;
            }
            !info.is_let || (self.is_runes_mode() && info.is_named_export)
        });
        if has_exports {
            // Return a sentinel that signals "has exports" - the caller
            // will use $$render<gn>().exports instead of {}
            "$$HAS_EXPORTS$$".to_string()
        } else {
            "{}".to_string()
        }
    }

    pub fn create_optional_props_array(&self, is_ts: bool) -> Vec<String> {
        if self.is_runes_mode() {
            return Vec::new();
        }
        // For TS files, the `as {...}` type assertion on props handles optionality,
        // so __sveltets_2_partial is not needed
        if is_ts {
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
    /// Generic type text from `createEventDispatcher<Type>()`, if any.
    /// Used to generate `{...__sveltets_2_toEventTypings<Type>()}` in the events return.
    pub dispatcher_generic_type: Option<String>,
    /// Names of locally-created, *untyped* event dispatchers
    /// (`const dispatch = createEventDispatcher()`). Their `dispatch("name")`
    /// call sites are scanned across the whole component to populate the
    /// `events: { name: __sveltets_2_customEvent }` return.
    pub dispatcher_names: Vec<String>,
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
            dispatcher_generic_type: None,
            dispatcher_names: Vec::new(),
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

    /// Scan `source` for `<dispatcher>("eventName", …)` call sites of every
    /// recorded untyped dispatcher and add each event name. Mirrors official
    /// `ComponentEventsFromEventsMap`, which walks the component for dispatcher
    /// calls and records the first string-literal argument. A lightweight
    /// lexical scan suffices here: find the dispatcher identifier as a word,
    /// require the next non-space char to be `(`, then read a single quoted
    /// string-literal first argument.
    pub fn collect_dispatched_events(&mut self, source: &str) {
        let names = self.dispatcher_names.clone();
        let bytes = source.as_bytes();
        let is_ident = |b: u8| b.is_ascii_alphanumeric() || b == b'_' || b == b'$';
        for disp in &names {
            let dn = disp.as_bytes();
            let mut from = 0usize;
            while let Some(rel) = source[from..].find(disp.as_str()) {
                let idx = from + rel;
                from = idx + 1;
                // Word boundary: not part of a longer identifier / member access.
                if idx > 0 && (is_ident(bytes[idx - 1]) || bytes[idx - 1] == b'.') {
                    continue;
                }
                let mut p = idx + dn.len();
                if p < bytes.len() && is_ident(bytes[p]) {
                    continue;
                }
                while p < bytes.len() && (bytes[p] == b' ' || bytes[p] == b'\t') {
                    p += 1;
                }
                if p >= bytes.len() || bytes[p] != b'(' {
                    continue;
                }
                p += 1;
                while p < bytes.len() && bytes[p].is_ascii_whitespace() {
                    p += 1;
                }
                if p >= bytes.len() || (bytes[p] != b'"' && bytes[p] != b'\'' && bytes[p] != b'`') {
                    continue;
                }
                let quote = bytes[p];
                p += 1;
                let name_start = p;
                while p < bytes.len() && bytes[p] != quote {
                    p += 1;
                }
                if p < bytes.len() {
                    let evt = &source[name_start..p];
                    // Only simple identifier-ish names (skip interpolated/dynamic).
                    if !evt.is_empty() && !self.events.contains_key(evt) {
                        self.add(evt.to_string(), None, false);
                    }
                }
            }
        }
    }

    /// Get event entries for the return statement.
    /// Returns (name, value) pairs like ("hi", "__sveltets_2_customEvent").
    pub fn get_event_entries(&self) -> Vec<(String, String)> {
        let mut entries: Vec<(String, String)> = self
            .events
            .keys()
            .map(|name| (name.clone(), "__sveltets_2_customEvent".to_string()))
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
    /// Whether the TS type annotation is a simple named type reference (TSTypeReference).
    /// Only `TSTypeReference` nodes (e.g. `Props`, `Props<T>`) are used directly;
    /// all other annotated types (TSIndexedAccessType, TSUnionType, etc.) get wrapped
    /// in `$$ComponentProps` — mirrors the official `ts.isTypeReferenceNode` check.
    is_named_type_reference: bool,
    /// Whether the $props() binding pattern is an identifier (whole-object form),
    /// e.g. `let props = $props()` rather than a destructuring `let { a } = $props()`.
    is_identifier_pattern: bool,
    /// Whether the pattern has a rest element (`...rest`)
    has_rest: bool,
    /// Whether the pattern has any non-identifier property keys (mirrors official `withUnknown`).
    /// Set when a prop uses a string literal, numeric, or computed key (e.g. `'kebab-case': x`).
    /// When true, contributes `& Record<string, any>` to the generated type.
    has_unknown_props: bool,
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
/// Classify a Svelte component basename for SvelteKit autotype injection.
///
/// Returns:
/// - `Some(true)` if the file is a SvelteKit `+layout.svelte` (uses
///   `LayoutData` / `LayoutProps`).
/// - `Some(false)` if it's `+page.svelte` (uses `PageData` / `ActionData` /
///   `PageProps`).
/// - `None` otherwise.
pub fn classify_kit_route_file(basename: &str) -> Option<bool> {
    // Strip `@anchor` then strip extension. `kitPageFiles` are:
    // `+page`, `+layout`, `+page.server`, `+layout.server`, `+server`.
    // Only `+page` and `+layout` produce `.svelte` route files in practice.
    let trimmed = if let Some(at_pos) = basename.find('@') {
        &basename[..at_pos]
    } else if let Some(dot_pos) = basename.rfind('.') {
        &basename[..dot_pos]
    } else {
        basename
    };
    match trimmed {
        "+page" => Some(false),
        "+layout" => Some(true),
        _ => None,
    }
}

pub fn process_instance_script(
    script: &Script,
    source: &str,
    str: &mut MagicString,
    exported_names: &mut ExportedNames,
    _events: &mut ComponentEvents,
    is_ts: bool,
    basename: &str,
    emit_jsdoc: bool,
    is_dts_mode: bool,
    script_generic_names: &HashSet<String>,
) {
    let offset = script.content_offset;
    with_parsed_script(script, source, |program, raw_content| {
        // Pass 1: collect top-level declared names and possible exports
        let mut possible_exports: HashMap<String, PossibleExport> = HashMap::new();
        // Pre-populate with ALL top-level declared names so rune-vs-store
        // disambiguation (`$state` rune vs `$`-prefixed store of a declared
        // `state`) sees the complete scope — incl. a name declared by the very
        // statement whose initializer we're checking. See
        // collect_top_level_declared_names.
        let mut declared_names: HashSet<String> = collect_top_level_declared_names(&program.body);
        // Top-level `type` / `interface` declarations that may be hoistable
        // out of `function $$render()`. Resolved (with `instance_value_names`
        // and `module_*_names`) into `hoistable_type_ranges` after Pass 1.
        let mut candidates: Vec<HoistCandidate> = Vec::new();

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
                        detect_runes_call(declarator, exported_names, &declared_names);
                        detect_props_rune_oxc(declarator, exported_names, raw_content);
                        // Detect createEventDispatcher<Type>() calls
                        detect_create_event_dispatcher(declarator, raw_content, _events);
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
                            let ta_text = declarator.type_annotation.as_ref().and_then(|ta| {
                                let ts_type = &ta.type_annotation;
                                let start = ts_type.span().start as usize;
                                let end = ts_type.span().end as usize;
                                if start < end && end <= raw_content.len() {
                                    Some(raw_content[start..end].to_string())
                                } else {
                                    None
                                }
                            });
                            possible_exports.insert(
                                name,
                                PossibleExport {
                                    is_let,
                                    has_init: declarator.init.is_some(),
                                    has_type_annotation: declarator.type_annotation.is_some(),
                                    decl_end: declarator.span.end,
                                    type_annotation_text: ta_text,
                                    doc: leading_jsdoc_comment(
                                        raw_content,
                                        var_decl.span.start as usize,
                                    ),
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
                            declared_names.insert(name.clone());
                            exported_names.instance_import_names.insert(name);
                        }
                    }
                }
                oxc::Statement::FunctionDeclaration(func) => {
                    if let Some(ref id) = func.id {
                        declared_names.insert(id.name.to_string());
                    }
                    // Detect rune calls nested inside the function body.
                    // The official svelte2tsx `checkGlobalsForRunes` walks the
                    // entire TypeScript AST (including function bodies) and flags
                    // any undeclared `$state`/`$derived`/`$effect` reference.
                    // Mirror that here by recursively scanning the body.
                    // Reference: ExportedNames.ts `checkGlobalsForRunes`.
                    if let Some(ref body) = func.body {
                        // Add the function's params to the scope so a rune name
                        // shadowed by a param (`function bar($derived){ … }`) is
                        // treated as that param, not a rune.
                        let scope = scope_with_params(&declared_names, &func.params);
                        if detect_rune_in_nested_body(&body.statements, &scope) {
                            exported_names.set_uses_runes(true);
                        }
                    }
                }
                oxc::Statement::ClassDeclaration(class) => {
                    if let Some(ref id) = class.id {
                        declared_names.insert(id.name.to_string());
                    }
                    // Detect rune calls nested inside class method bodies.
                    if class.body.body.iter().any(|member| match member {
                        oxc::ClassElement::MethodDefinition(method) => {
                            method.value.body.as_ref().is_some_and(|body| {
                                detect_rune_in_nested_body(&body.statements, &declared_names)
                            })
                        }
                        oxc::ClassElement::PropertyDefinition(prop) => prop
                            .value
                            .as_ref()
                            .is_some_and(|e| detect_rune_in_expr(e, &declared_names)),
                        _ => false,
                    }) {
                        exported_names.set_uses_runes(true);
                    }
                }
                // Track instance-script namespace and enum names so the
                // hoist analyser treats `A.Abc` references as blocking when
                // `A` is bound in the instance script. Mirrors the JS
                // reference's `disallowed_types.add(...)` for namespaces.
                oxc::Statement::TSModuleDeclaration(module) => {
                    if let oxc_ast::ast::TSModuleDeclarationName::Identifier(id) = &module.id {
                        declared_names.insert(id.name.to_string());
                    }
                }
                oxc::Statement::TSEnumDeclaration(enum_decl) => {
                    declared_names.insert(enum_decl.id.name.to_string());
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
                                        let ta_text =
                                            declarator.type_annotation.as_ref().and_then(|ta| {
                                                let ts_type = &ta.type_annotation;
                                                let start = ts_type.span().start as usize;
                                                let end = ts_type.span().end as usize;
                                                if start < end && end <= raw_content.len() {
                                                    Some(raw_content[start..end].to_string())
                                                } else {
                                                    None
                                                }
                                            });
                                        possible_exports.insert(
                                            name,
                                            PossibleExport {
                                                is_let,
                                                has_init: declarator.init.is_some(),
                                                has_type_annotation: declarator
                                                    .type_annotation
                                                    .is_some(),
                                                decl_end: declarator.span.end,
                                                type_annotation_text: ta_text,
                                                doc: leading_jsdoc_comment(
                                                    raw_content,
                                                    var_decl.span.start as usize,
                                                ),
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
                // Detect $$Slots and $$Events type/interface declarations
                oxc::Statement::TSInterfaceDeclaration(iface) => {
                    let name = iface.id.name.to_string();
                    if name == "$$Slots" {
                        exported_names.has_slots_type = true;
                    } else if name == "$$Events" {
                        exported_names.has_events_type = true;
                    }
                    exported_names.instance_type_names.insert(name.clone());
                    if !is_special_type_name(&name) {
                        candidates.push(HoistCandidate {
                            name,
                            rel_start: iface.span.start,
                            rel_end: iface.span.end,
                        });
                    }

                    // dts mode: rewrite `interface X { ... }` (and any `extends`
                    // clauses) into `type X = ... & { ... }` because indirectly
                    // using interfaces inside the return type of a function
                    // breaks .d.ts generation. Mirrors
                    // `processInstanceScriptContent.ts::transformInterfacesToTypes`.
                    if is_dts_mode {
                        rewrite_interface_to_type_dts(iface, raw_content, offset, str);
                    }
                }
                oxc::Statement::TSTypeAliasDeclaration(type_alias) => {
                    let name = type_alias.id.name.to_string();
                    if name == "$$Slots" {
                        exported_names.has_slots_type = true;
                    } else if name == "$$Events" {
                        exported_names.has_events_type = true;
                    }
                    exported_names.instance_type_names.insert(name.clone());
                    if !is_special_type_name(&name) {
                        candidates.push(HoistCandidate {
                            name,
                            rel_start: type_alias.span.start,
                            rel_end: type_alias.span.end,
                        });
                    }
                    // Detect `type X = $$Generic;` or `type X = $$Generic<constraint>;`
                    let type_text = &raw_content[type_alias.type_annotation.span().start as usize
                        ..type_alias.type_annotation.span().end as usize];
                    if type_text == "$$Generic" || type_text.starts_with("$$Generic<") {
                        let name = type_alias.id.name.to_string();
                        let constraint = if type_text.starts_with("$$Generic<") {
                            // Extract the constraint from $$Generic<constraint>
                            let inner = &type_text[10..type_text.len() - 1]; // skip "$$Generic<" and ">"
                            Some(inner.to_string())
                        } else {
                            None
                        };
                        exported_names.dollar_generics.push((name, constraint));
                        // Record the position to blank out later
                        exported_names
                            .dollar_generic_positions
                            .push((type_alias.span.start, type_alias.span.end));
                    }
                }
                // Detect rune globals used as standalone expression statements,
                // e.g. `$effect(() => { ... })` or `$effect.pre(() => { ... })`.
                // These are missed by `detect_runes_call` which only visits
                // VariableDeclarator inits.
                // Reference: svelte2tsx ExportedNames.ts `hasRunesGlobals` check.
                oxc::Statement::ExpressionStatement(es) => {
                    detect_runes_expr_stmt(es, exported_names, &declared_names);
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
                    raw_content,
                    is_ts,
                    basename,
                    emit_jsdoc,
                );
            }
        }

        // Blank out $$Generic type alias declarations
        for &(start, end) in &exported_names.dollar_generic_positions {
            str.overwrite(start + offset, end + offset, "");
        }

        // Pass 2.5: Split multi-declarator let statements when variables are
        // exported via specifiers (e.g., `let a = 1, b;` with `export { a, b }`)
        for stmt in program.body.iter() {
            if let oxc::Statement::VariableDeclaration(var_decl) = stmt {
                let is_let = matches!(
                    var_decl.kind,
                    oxc::VariableDeclarationKind::Let | oxc::VariableDeclarationKind::Var
                );
                let num_declarators = var_decl.declarations.len();
                if is_let && num_declarators > 1 {
                    // Check if any declarator in this statement is exported
                    let any_exported = var_decl.declarations.iter().any(|d| {
                        if let Some(name) = binding_pattern_simple_name(&d.id) {
                            // Match through aliases: `export { v1 as a1 }` keys
                            // the entry by `a1`, so `has(v1)` is false — check
                            // the local name too.
                            exported_names.has(&name) || exported_names.has_local(&name)
                        } else {
                            false
                        }
                    });
                    if any_exported {
                        for decl_idx in 0..num_declarators - 1 {
                            let decl_end_rel = var_decl.declarations[decl_idx].span.end;
                            // Find the comma after the declarator end and overwrite just it
                            let comma_pos = raw_content[decl_end_rel as usize..]
                                .find(',')
                                .map(|p| decl_end_rel + p as u32)
                                .unwrap_or(decl_end_rel);
                            str.overwrite(comma_pos + offset, comma_pos + 1 + offset, ";let ");
                        }
                        // Mirror official `propTypeAssertToUserDefined`, which is
                        // invoked on the *whole* declaration list when any of its
                        // bindings is exported by reference and wraps EVERY
                        // widening-eligible declarator — including siblings that
                        // are not themselves exported. The exported declarators
                        // are already wrapped in the export-specifier handling
                        // (Case 2), so here we only cover the non-exported
                        // siblings to avoid double-wrapping.
                        for d in var_decl.declarations.iter() {
                            let Some(name) = binding_pattern_simple_name(&d.id) else {
                                continue;
                            };
                            if exported_names.has(&name) || exported_names.has_local(&name) {
                                continue;
                            }
                            // Match handleTypeAssertion's widening condition:
                            // no initializer, OR a boolean-literal initializer
                            // (TS narrows `let x = false` to `false`), OR a type
                            // annotation.
                            let widen = d.init.is_none()
                                || matches!(d.init, Some(oxc::Expression::BooleanLiteral(_)))
                                || d.type_annotation.is_some();
                            if widen {
                                let inject = format!(
                                    "/*\u{03A9}ignore_start\u{03A9}*/;{name} = __sveltets_2_any({name});/*\u{03A9}ignore_end\u{03A9}*/"
                                );
                                str.append_left(d.span.end + offset, &inject);
                            }
                        }
                    }
                }
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
            if let oxc::Statement::LabeledStatement(labeled) = stmt
                && labeled.label.name == "$"
            {
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

        // Snapshot instance-script value declarations so callers (in particular
        // the force-inside-render heuristic for `$$ComponentProps`) can detect
        // when the props type references an instance-scope binding.
        for name in declared_names.iter() {
            exported_names.instance_value_names.insert(name.clone());
        }

        // Unconditionally hoist instance-script type/interface declarations whose
        // names appear as `$$Generic<X>` constraints. Mirrors the JS reference's
        // `nodesToMove = interfacesAndTypes.getNodesWithNames(generics.getTypeReferences())`
        // path in `processInstanceScriptContent`, which moves these regardless of
        // whether the component uses the `$props()` rune.
        hoist_dollar_generic_referenced_types(&candidates, raw_content, offset, exported_names);

        // Resolve which instance-script type/interface declarations are
        // hoistable above `function $$render()`. Mirrors
        // `HoistableInterfaces.moveHoistableInterfaces` in the JS reference,
        // including the early-exit `if (!this.props_interface.name) return;`
        // — without a `$props()` typed annotation there's nothing for the
        // hoisted types to feed, so we leave them in place.
        if props_rune_info.is_some() {
            resolve_hoistable_type_decls(
                &candidates,
                raw_content,
                offset,
                exported_names,
                script_generic_names,
            );
        }

        // Pass 4: Apply $props() $$ComponentProps typedef transformations
        if let Some(info) = props_rune_info {
            apply_props_typedef(
                &info,
                offset,
                str,
                exported_names,
                raw_content,
                is_ts,
                basename,
            );
        }

        // Pass 5: store subscriptions. Reuses the already-parsed program
        // so we don't re-parse the instance script content with OXC.
        inject_store_subscriptions_with_program(program, offset, source, str);

        // Pass 6: disambiguate generic arrow type-parameter lists for the
        // `.tsx` overlay (`<T>` → `<T,>`) so they aren't misparsed as JSX.
        disambiguate_arrow_type_params(program, offset, raw_content, str);
    });
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
    raw_content: &str,
    is_ts: bool,
    basename: &str,
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
        // Track the position right BEFORE the leading whitespace of the
        // `let { ... } = $props()` declaration so the caller can insert
        // `;type $$ComponentProps = ...;` there when the type cannot be
        // hoisted out of $$render (e.g. when it references `typeof <runtime-var>`
        // or a generic). This matches the JS reference's
        // `move(generic_arg.pos, generic_arg.end, node.parent.pos)` — TypeScript's
        // `pos` lands right after the previous statement's trailing trivia.
        let raw_bytes = raw_content.as_bytes();
        let mut p = info.let_pos as usize;
        while p > 0 {
            let prev = raw_bytes[p - 1];
            if prev == b' ' || prev == b'\t' || prev == b'\n' || prev == b'\r' {
                p -= 1;
            } else {
                break;
            }
        }
        exported_names.props_let_abs_pos = Some(p as u32 + offset);
    } else if info.has_type_annotation && !info.is_hoistable_type && !info.is_named_type_reference {
        // TS case with non-TSTypeReference annotation (e.g. `SvelteHTMLElements["div"]`,
        // union types, intersection types, etc.).
        // Mirrors the official `!ts.isTypeReferenceNode(generic_arg)` branch:
        // create a `$$ComponentProps` alias and replace the annotation with
        // `/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/`.
        // The type alias is placed BEFORE `$$render` (same mechanism as the hoistable
        // TSTypeLiteral case) via `props_let_abs_pos` + `props_type_text`.
        if let (Some(colon), Some(ta_end)) = (info.colon_pos, info.type_annotation_end) {
            let abs_colon = colon + offset;
            let abs_end = ta_end + offset;
            str.overwrite(
                abs_colon + 1,
                abs_end,
                "/*\u{03A9}ignore_start\u{03A9}*/$$ComponentProps/*\u{03A9}ignore_end\u{03A9}*/",
            );
        }
        exported_names.has_component_props_typedef = true;
        // props_type_text is the original type text (set by detect_props_rune_oxc).
        // svelte2tsx.rs uses it in `ts_component_props_before_render` to emit
        // `;type $$ComponentProps = <type_text>;` before `function $$render`.
        // Leave type_already_inserted = false so it goes BEFORE render.
        let raw_bytes = raw_content.as_bytes();
        let mut p = info.let_pos as usize;
        while p > 0 {
            let prev = raw_bytes[p - 1];
            if prev == b' ' || prev == b'\t' || prev == b'\n' || prev == b'\r' {
                p -= 1;
            } else {
                break;
            }
        }
        exported_names.props_let_abs_pos = Some(p as u32 + offset);
    } else if info.has_type_annotation && !info.is_hoistable_type && info.is_named_type_reference {
        // TS case with simple named type reference: `: Props` or `: Props<T>`
        // Keep the type annotation as-is, use it directly in props_type_text
        // (props_type_text is already set by detect_props_rune_oxc)
        // Don't create $$ComponentProps
    } else if let Some(ref jsdoc_type) = info.jsdoc_type {
        // JS case with JSDoc @type
        // Check if the type is an inline object type `{{ ... }}` or a named reference `{SomeType}`
        let inner = jsdoc_type
            .strip_prefix('{')
            .and_then(|s| s.strip_suffix('}'))
            .unwrap_or("");
        let is_inline_object_type = inner.starts_with('{');

        if is_inline_object_type {
            // Inline object type: transform `/** @type {{ a: number }} */` to
            // `/** @typedef {{ a: number }}  $$ComponentProps *//** @type {$$ComponentProps} */`.
            //
            // Mirrors the official JS two-step:
            //   1. overwrite `@type` → `@typedef`
            //   2. overwrite `*/` at end → ` $$ComponentProps */` + `/** @type {$$ComponentProps} */`
            //
            // The original comment typically has a space before `*/` (e.g. `}} */`).
            // After step 2, that space is preserved and the new ` $$ComponentProps */`
            // contributes another space → two spaces between `}}` and `$$ComponentProps`.
            // We replicate by finding the `*/` position in the original and capturing
            // the trailing whitespace between the type text and `*/`.
            if let (Some(jsdoc_start), Some(jsdoc_end)) = (info.jsdoc_start, info.jsdoc_end) {
                let orig_comment = &raw_content[jsdoc_start as usize..jsdoc_end as usize];
                // Locate `@type` and `*/` positions within the original comment text
                let typedef = if let (Some(at_type_rel), Some(star_slash_rel)) =
                    (orig_comment.find("@type"), orig_comment.rfind("*/"))
                {
                    // Everything from `/**` up to (but not including) `@type`
                    let prefix = &orig_comment[..at_type_rel];
                    // The type content including surrounding whitespace up to `*/`
                    // e.g. for `/** @type {{ a: string }} */`: after-@typedef text
                    let after_typedef_kw = &orig_comment[at_type_rel + 5..star_slash_rel];
                    // after_typedef_kw is like ` {{ a: string }} ` (includes surrounding spaces)
                    // Produce: `/** @typedef{{ a: string }} $$ComponentProps *//** @type {$$ComponentProps} */`
                    // The official replaces `*/` with ` $$ComponentProps */`, so the space before `*/`
                    // in the original is preserved plus one new space → two spaces for the typical case.
                    format!(
                        "{}@typedef{} $$ComponentProps *//** @type {{$$ComponentProps}} */",
                        prefix, after_typedef_kw
                    )
                } else {
                    // Fallback: generate from extracted type (may lose trailing space)
                    format!(
                        "/** @typedef {} $$ComponentProps *//** @type {{$$ComponentProps}} */",
                        jsdoc_type
                    )
                };
                let abs_start = jsdoc_start + offset;
                let abs_end = jsdoc_end + offset;
                str.overwrite(abs_start, abs_end, &typedef);
            }
            exported_names.has_component_props_typedef = true;
            exported_names.props_jsdoc_type = Some(jsdoc_type.clone());
        } else {
            // Named type reference: keep `/** @type {SomeType} */` as-is
            // Use the type name directly in create_props_str
            exported_names.props_jsdoc_type = Some(jsdoc_type.clone());
        }
    } else if info.prop_types.is_empty() && !info.has_rest && !info.has_unknown_props {
        // No named props, no rest element, no non-identifier keys:
        // whole-object identifier (`let props = $props()`) or empty ObjectPattern (`let {} = $props()`).
        //
        // Official sets `this.$props.type = '$$ComponentProps'` (TS) or
        // `this.$props.comment = '/** @type {$$ComponentProps} */'` (JS) unconditionally,
        // without emitting any type alias — the identifier `$$ComponentProps` is left
        // unresolved but that's intentional (mirrors official behavior exactly).
        // Reference: ExportedNames.ts handle$propsRune lines 376-401.
        if is_ts {
            // TS: props_type_text = "$$ComponentProps" → create_props_str returns `{} as any as $$ComponentProps`
            // has_component_props_typedef stays false (no alias emitted)
            exported_names.props_type_text = Some("$$ComponentProps".to_string());
        } else {
            // JS: has_component_props_typedef = true → create_props_str returns `/** @type {$$ComponentProps} */({})`
            // No source changes needed, no typedef inserted
            exported_names.has_component_props_typedef = true;
        }
    } else if !info.prop_types.is_empty() || info.has_rest || info.has_unknown_props {
        // Auto-generate typedef from destructured props.
        //
        // For SvelteKit `+page.svelte` / `+layout.svelte` route files, override
        // the inferred `any` for the well-known prop names `data`, `form`,
        // `params` with `import('./$types.js').*` references — matches the JS
        // reference's `isKitRouteFile` branch in `ExportedNames.handle$propsRune`.
        let kit_layout = classify_kit_route_file(basename);
        // Build type entries for each named prop.
        //
        // For SvelteKit route files, the official code only includes the well-known
        // kit props (`data`, `form`, `params`) and silently skips any other names
        // (their types are not inferred). After the loop, layout files get
        // `children: import('svelte').Snippet` appended unconditionally.
        // For non-kit files, all named props are included with inferred types.
        // Mirrors official ExportedNames.ts lines 296-366.
        let mut type_entries: Vec<String> = info
            .prop_types
            .iter()
            .filter_map(|(name, optional, inferred_type)| {
                if let Some(is_layout) = kit_layout {
                    // Kit route file: only include special props
                    let kit_type = match name.as_str() {
                        "data" => Some(
                            if is_layout {
                                "import('./$types.js').LayoutData"
                            } else {
                                "import('./$types.js').PageData"
                            }
                            .to_string(),
                        ),
                        "form" if !is_layout => {
                            Some("import('./$types.js').ActionData".to_string())
                        }
                        "params" => Some(
                            if is_layout {
                                "import('./$types.js').LayoutProps['params']"
                            } else {
                                "import('./$types.js').PageProps['params']"
                            }
                            .to_string(),
                        ),
                        _ => return None, // skip non-kit props; they're not inferred for kit files
                    };
                    Some(format!("{}: {}", name, kit_type.unwrap()))
                } else {
                    // Non-kit file: include all props with inferred types
                    let resolved = inferred_type.as_str();
                    if *optional {
                        Some(format!("{}?: {}", name, resolved))
                    } else {
                        Some(format!("{}: {}", name, resolved))
                    }
                }
            })
            .collect();

        // For SvelteKit layout files, always append `children: import('svelte').Snippet`.
        // Mirrors official ExportedNames.ts line 364-366:
        //   `if (isKitLayoutFile) { props.push('children: import(\'svelte\').Snippet'); }`
        if kit_layout == Some(true) {
            type_entries.push("children: import('svelte').Snippet".to_string());
        }

        // `with_unknown` mirrors official's `withUnknown`: true when there's a rest
        // element OR non-identifier property keys (e.g. 'kebab-case': x).
        let with_unknown = info.has_rest || info.has_unknown_props;

        // Build the type body string, mirroring official lines 368-377:
        //   if props.length > 0:
        //     `{ p1: T1, p2?: T2 }` + (withUnknown ? ' & Record<string, any>' : '')
        //   else if withUnknown (rest only or unknown-prop only):
        //     `Record<string, any>`
        //   else (no props, no unknown):
        //     `Record<string, never>`
        let type_body = if !type_entries.is_empty() && with_unknown {
            // Named props AND (rest element or unknown props): `{ ... } & Record<string, any>`
            format!("{{ {} }} & Record<string, any>", type_entries.join(", "))
        } else if !type_entries.is_empty() {
            format!("{{ {} }}", type_entries.join(", "))
        } else if with_unknown {
            // Only rest/unknown, no named props
            "Record<string, any>".to_string()
        } else {
            "Record<string, never>".to_string()
        };

        if is_ts {
            // TS case: The type declaration `/*Ωignore_startΩ*/;type $$ComponentProps = { ... };/*Ωignore_endΩ*/`
            // will be inserted by svelte2tsx.rs as part of the $$render function body.
            // Here we only add `: $$ComponentProps` after the destructuring pattern `}`.

            // Insert `: $$ComponentProps` after the destructuring pattern `}`
            let abs_pattern_end = info.destructure_end + offset;
            str.append_left(abs_pattern_end, ": $$ComponentProps");

            exported_names.has_component_props_typedef = true;
            // Store the type text as props_type_text so it's used in `create_props_str`
            exported_names.props_type_text = Some(type_body);
            // Mark that this is a best-effort type that needs to go inside $$render
            exported_names.type_already_inserted = true;
            // Track the let position so the caller (`svelte2tsx::svelte2tsx`)
            // can insert the synthesised `;type $$ComponentProps = ...;` right
            // before the `let { ... } = $props()` statement instead of at the
            // very start of `$$render` — matches the JS reference's
            // `preprendStr(node.parent.pos + astOffset, ...)`.
            let raw_bytes = raw_content.as_bytes();
            let mut p = info.let_pos as usize;
            while p > 0 {
                let prev = raw_bytes[p - 1];
                if prev == b' ' || prev == b'\t' || prev == b'\n' || prev == b'\r' {
                    p -= 1;
                } else {
                    break;
                }
            }
            exported_names.props_let_abs_pos = Some(p as u32 + offset);
        } else {
            // JS case: Insert JSDoc typedef between `let` and `{`
            let typedef_text = format!(
                "/** @typedef {{{}}} $$ComponentProps *//** @type {{$$ComponentProps}} */",
                type_body
            );

            let abs_let = info.let_pos + offset;
            let abs_destruct = info.destructure_start + offset;
            // Insert right after the declaration keyword. The keyword is usually
            // `let` (3 chars) but may be `const` (5) — count the leading
            // identifier characters at `let_pos` instead of assuming `let`.
            let raw_bytes = raw_content.as_bytes();
            let mut kw_len = 0usize;
            let start = info.let_pos as usize;
            while start + kw_len < raw_bytes.len()
                && raw_bytes[start + kw_len].is_ascii_alphabetic()
            {
                kw_len += 1;
            }
            let insert_pos = abs_let + kw_len as u32; // after the keyword (let/const/var)
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
    exported_names: &mut ExportedNames,
) {
    // Module script exports are kept as-is (with the export keyword).
    // They are not component props and do not go into the return statement.
    //
    // Previously the module script was parsed up to three times (var-only
    // store-subscription injection, type-assertion rewrite, name snapshot).
    // Parse once and share the program across all three passes.
    let offset = script.content_offset;
    with_parsed_script(script, source, |program, raw_content| {
        // Inject store subscriptions for module-level variable declarations
        // only. Import-based store subscriptions are NOT injected here
        // because they need to go inside the $$render function body.
        inject_store_subscriptions_vars_only_with_program(program, offset, source, str);

        // Rewrite TypeScript angle-bracket type assertions (`<X>e`) into
        // the `e as X` form. Inside the module script the rewrite is
        // required because the generated `.tsx` parses the module-script
        // body at top level, where `<X>e` would be lexed as JSX.
        rewrite_module_script_type_assertions_with_program(
            program,
            raw_content,
            offset as usize,
            str,
        );

        // Disambiguate generic arrow type-parameter lists (`<T>` → `<T,>`) so
        // the module-script body, parsed at the top level of the `.tsx`
        // overlay, doesn't lex a single-parameter arrow generic as JSX.
        disambiguate_arrow_type_params(program, offset, raw_content, str);

        // Snapshot top-level module-script names for the snippet hoist analysis.
        for stmt in program.body.iter() {
            match stmt {
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
                            exported_names.module_import_names.insert(name.clone());
                            exported_names.module_value_names.insert(name);
                        }
                    }
                }
                oxc::Statement::VariableDeclaration(var_decl) => {
                    for declarator in var_decl.declarations.iter() {
                        for n in extract_all_names_from_binding_pattern(&declarator.id) {
                            exported_names.module_value_names.insert(n);
                        }
                    }
                }
                oxc::Statement::FunctionDeclaration(func) => {
                    if let Some(ref id) = func.id {
                        exported_names
                            .module_value_names
                            .insert(id.name.to_string());
                    }
                }
                oxc::Statement::ClassDeclaration(class) => {
                    if let Some(ref id) = class.id {
                        exported_names
                            .module_value_names
                            .insert(id.name.to_string());
                    }
                }
                oxc::Statement::ExportNamedDeclaration(export) => {
                    if let Some(ref decl) = export.declaration {
                        match decl {
                            oxc::Declaration::VariableDeclaration(var_decl) => {
                                for declarator in var_decl.declarations.iter() {
                                    for n in extract_all_names_from_binding_pattern(&declarator.id)
                                    {
                                        exported_names.module_value_names.insert(n);
                                    }
                                }
                            }
                            oxc::Declaration::FunctionDeclaration(func) => {
                                if let Some(ref id) = func.id {
                                    exported_names
                                        .module_value_names
                                        .insert(id.name.to_string());
                                }
                            }
                            oxc::Declaration::ClassDeclaration(class) => {
                                if let Some(ref id) = class.id {
                                    exported_names
                                        .module_value_names
                                        .insert(id.name.to_string());
                                }
                            }
                            oxc::Declaration::TSTypeAliasDeclaration(t) => {
                                exported_names
                                    .module_type_names
                                    .insert(t.id.name.to_string());
                            }
                            oxc::Declaration::TSInterfaceDeclaration(iface) => {
                                exported_names
                                    .module_type_names
                                    .insert(iface.id.name.to_string());
                            }
                            _ => {}
                        }
                    }
                }
                oxc::Statement::TSTypeAliasDeclaration(t) => {
                    exported_names
                        .module_type_names
                        .insert(t.id.name.to_string());
                }
                oxc::Statement::TSInterfaceDeclaration(iface) => {
                    exported_names
                        .module_type_names
                        .insert(iface.id.name.to_string());
                }
                // Module-level `namespace X { ... }` and `enum X { ... }`
                // contribute both a value and a type binding, so an
                // instance-script `interface X` would shadow the module
                // declaration once hoisted.
                oxc::Statement::TSModuleDeclaration(module_decl) => {
                    if let oxc_ast::ast::TSModuleDeclarationName::Identifier(id) = &module_decl.id {
                        exported_names
                            .module_value_names
                            .insert(id.name.to_string());
                        exported_names.module_type_names.insert(id.name.to_string());
                    }
                }
                oxc::Statement::TSEnumDeclaration(enum_decl) => {
                    exported_names
                        .module_value_names
                        .insert(enum_decl.id.name.to_string());
                    exported_names
                        .module_type_names
                        .insert(enum_decl.id.name.to_string());
                }
                _ => {}
            }
        }
    });
}

/// Walk every `TSTypeAssertion` in a module script's AST and rewrite
/// `<Type>expr` to `expr as Type` via `MagicString.overwrite`. Nested
/// Rewrite a top-level `interface X { ... }` (with optional `extends Y, Z`)
/// into `type X = Y & Z & { ... }` for dts-mode output. Indirectly using
/// interfaces inside the return type of a function is forbidden by the
/// declaration emitter, so the JS reference's
/// `transformInterfacesToTypes(...)` performs this rewrite. Mirror that here.
/// One top-level `type X = ...` or `interface X { ... }` from the instance
/// script that may be hoistable above `function $$render()`.
#[derive(Debug, Clone)]
struct HoistCandidate {
    name: String,
    /// Span relative to the script content (raw_content).
    rel_start: u32,
    rel_end: u32,
}

/// Names that have a special meaning in svelte2tsx and must never be hoisted.
fn is_special_type_name(name: &str) -> bool {
    matches!(name, "$$Props" | "$$Slots" | "$$Events")
}

/// Walk a TS type body lexically and collect:
/// - identifiers that appear in `typeof IDENT` positions (value dependencies)
/// - identifiers that match a known candidate-name (type dependencies)
/// - identifiers that match an instance-script value declaration that isn't
///   an import (treated as a value dependency — a namespace `A` referenced
///   via `A.Abc` would land here, mirroring the JS reference's
///   `disallowed_types.add(node.name.text)` for namespace declarations)
///
/// This is intentionally narrow — non-candidate identifiers (like property
/// keys or generic param names) are ignored, so we only flag references that
/// actually matter for the hoist decision. The JS reference uses TS AST
/// walking to be exact; this lexical filter matches its decisions on the
/// fixtures the rsvelte port currently cares about.
fn collect_type_body_deps(
    body: &str,
    candidate_names: &HashSet<String>,
    self_name: &str,
    generics: &HashSet<String>,
    instance_value_names: &HashSet<String>,
    instance_import_names: &HashSet<String>,
) -> (HashSet<String>, HashSet<String>) {
    let mut value_deps: HashSet<String> = HashSet::new();
    let mut type_deps: HashSet<String> = HashSet::new();
    let bytes = body.as_bytes();
    let len = bytes.len();
    let mut i = 0usize;
    while i < len {
        let b = bytes[i];
        // Skip line/block comments and strings.
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
        if (b.is_ascii_alphabetic() || b == b'_' || b == b'$') && !b.is_ascii_digit() {
            let start = i;
            i += 1;
            while i < len
                && (bytes[i].is_ascii_alphanumeric() || bytes[i] == b'_' || bytes[i] == b'$')
            {
                i += 1;
            }
            let ident = &body[start..i];
            if ident == self_name || generics.contains(ident) {
                continue;
            }
            // `typeof <ident>` lookbehind.
            let mut j = start;
            while j > 0 && matches!(bytes[j - 1], b' ' | b'\t' | b'\r' | b'\n') {
                j -= 1;
            }
            // `&body[j - 6..j]` is raw byte arithmetic: when non-ASCII (e.g.
            // CJK) text precedes the identifier, `j - 6` can land inside a
            // multibyte char and panic the whole run (issue #719). Guard the
            // slice with `is_char_boundary` — the 6 bytes can only spell the
            // ASCII keyword `typeof` when `j - 6` is already a boundary.
            let preceded_by_typeof = j >= 6
                && body.is_char_boundary(j - 6)
                && &body[j - 6..j] == "typeof"
                && (j == 6 || !is_ident_byte(bytes[j - 7]));
            // Detect property-key context: `key:` or `key?:` (with optional
            // whitespace) — these are object-type member keys, not type
            // references, so they shouldn't count as deps even if they
            // happen to share a name with an instance-script binding.
            let mut k = i;
            while k < len && matches!(bytes[k], b' ' | b'\t' | b'\r' | b'\n') {
                k += 1;
            }
            let is_property_key = k < len
                && (bytes[k] == b':' || (bytes[k] == b'?' && k + 1 < len && bytes[k + 1] == b':'));

            if preceded_by_typeof {
                value_deps.insert(ident.to_string());
            } else if is_property_key {
                // skip — property keys aren't dependencies
            } else if candidate_names.contains(ident) {
                type_deps.insert(ident.to_string());
            } else if instance_value_names.contains(ident) && !instance_import_names.contains(ident)
            {
                // Identifier resolves to an instance-script value (a `let`,
                // `const`, `class`, `enum`, or namespace) that isn't an
                // import. Even outside a `typeof`, mentioning such a name
                // inside a type body forbids hoisting because hoisting would
                // place the type at module scope where the binding is gone.
                value_deps.insert(ident.to_string());
            }
            continue;
        }
        i += 1;
    }
    (value_deps, type_deps)
}

#[inline]
fn is_ident_byte(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'$'
}

/// Determine which `HoistCandidate`s can be hoisted above `function $$render()`
/// and record their absolute source ranges (and names) on `exported_names`.
///
/// `script_generic_names` is the set of generic parameter names declared on
/// the `<script generics="...">` attribute. Any candidate that references
/// one of those names (even transitively, via another candidate) can't be
/// hoisted — `T` in scope on `function $$render<T>()` isn't visible at
/// module scope.
fn resolve_hoistable_type_decls(
    candidates: &[HoistCandidate],
    raw_content: &str,
    offset: u32,
    exported_names: &mut ExportedNames,
    script_generic_names: &HashSet<String>,
) {
    if candidates.is_empty() {
        return;
    }
    let candidate_names: HashSet<String> = candidates.iter().map(|c| c.name.clone()).collect();
    // Per-candidate: collect generic parameter names (so `interface Props<T>`
    // doesn't see `T` as a dependency).
    let generics: Vec<HashSet<String>> = candidates
        .iter()
        .map(|c| {
            let mut g = HashSet::new();
            // Look at the text between `name` and the first `{` / `=`. If a
            // `<...>` block exists in that range, parse comma-separated entries
            // and take their leading identifier.
            let s = c.rel_start as usize;
            let e = c.rel_end as usize;
            if s >= raw_content.len() || e > raw_content.len() {
                return g;
            }
            let header_end = raw_content[s..e]
                .find(['{', '='])
                .map(|p| s + p)
                .unwrap_or(e);
            let header = &raw_content[s..header_end];
            if let (Some(lt), Some(gt)) = (header.find('<'), header.rfind('>'))
                && lt < gt
            {
                let inner = &header[lt + 1..gt];
                for part in inner.split(',') {
                    let trimmed = part.trim();
                    let name = trimmed
                        .split(|ch: char| !is_ident_char_for_str(ch))
                        .find(|s| !s.is_empty())
                        .unwrap_or("");
                    if !name.is_empty() {
                        g.insert(name.to_string());
                    }
                }
            }
            g
        })
        .collect();

    // Pre-compute deps for each candidate.
    let deps: Vec<(HashSet<String>, HashSet<String>)> = candidates
        .iter()
        .enumerate()
        .map(|(i, c)| {
            let s = c.rel_start as usize;
            let e = c.rel_end.min(raw_content.len() as u32) as usize;
            let body = if s < e { &raw_content[s..e] } else { "" };
            collect_type_body_deps(
                body,
                &candidate_names,
                &c.name,
                &generics[i],
                &exported_names.instance_value_names,
                &exported_names.instance_import_names,
            )
        })
        .collect();

    // Initial blocked: candidates whose name shadows a module-script
    // declaration of any kind.
    let mut blocked = vec![false; candidates.len()];
    for (i, c) in candidates.iter().enumerate() {
        if exported_names.module_value_names.contains(&c.name)
            || exported_names.module_import_names.contains(&c.name)
            || exported_names.module_type_names.contains(&c.name)
        {
            blocked[i] = true;
        }
    }

    // Initial blocked: candidates that reference any `<script generics="...">`
    // parameter name. Hoisting them out of `function $$render<T>(){...}` would
    // put them at module scope where `T` no longer exists.
    if !script_generic_names.is_empty() {
        for (i, c) in candidates.iter().enumerate() {
            if blocked[i] {
                continue;
            }
            let s = c.rel_start as usize;
            let e = c.rel_end.min(raw_content.len() as u32) as usize;
            if s >= e {
                continue;
            }
            let body = &raw_content[s..e];
            for name in script_generic_names.iter() {
                if has_whole_ident(body, name) {
                    blocked[i] = true;
                    break;
                }
            }
        }
    }
    // Initial blocked: candidates with a value_dep that isn't allowed.
    // "Allowed" = NOT in instance_value_names except imports, OR in any
    // module-script set (module-script bindings are stable references).
    for (i, (value_deps, _)) in deps.iter().enumerate() {
        if blocked[i] {
            continue;
        }
        for v in value_deps {
            // Resolve `$name` references back to their underlying `name`,
            // so the analysis treats `typeof $store` the same way as
            // `addDisallowed(getAccessedStores())` in the JS reference.
            let resolved: &str = if let Some(stripped) = v.strip_prefix('$') {
                if !stripped.is_empty() && !stripped.starts_with('$') {
                    stripped
                } else {
                    v.as_str()
                }
            } else {
                v.as_str()
            };
            let in_instance_value = exported_names.instance_value_names.contains(resolved);
            let in_instance_import = exported_names.instance_import_names.contains(resolved);
            let in_module = exported_names.module_value_names.contains(resolved)
                || exported_names.module_import_names.contains(resolved);
            // The JS reference: `disallowed_values` = instance script values
            // EXCEPT imports. So a value_dep blocks iff it's an instance
            // value AND NOT an import (and NOT a module-script binding).
            if in_instance_value && !in_instance_import && !in_module {
                blocked[i] = true;
                break;
            }
        }
    }

    // Fixed-point: a candidate that depends on a blocked candidate's type is
    // itself blocked. Promote candidates to hoistable when all type-deps are
    // hoistable.
    let mut hoistable = vec![false; candidates.len()];
    // Record the order in which candidates are promoted to hoistable. The JS
    // reference (`HoistableInterfaces.determineHoistableInterfaces`) inserts
    // each interface into a `Map` as soon as all its type dependencies are
    // already hoistable, then `moveHoistableInterfaces` moves them to
    // `scriptStart` in that Map (insertion) order. A dependency therefore lands
    // BEFORE the interface that depends on it, even when it appears later in
    // source (e.g. `interface A extends B<A>` followed by `interface B<T> {}`
    // emits `B` first). We mirror that by emitting `hoistable_type_ranges` in
    // promotion order rather than source order.
    let mut hoist_order: Vec<usize> = Vec::new();
    let mut progress = true;
    while progress {
        progress = false;
        for i in 0..candidates.len() {
            if hoistable[i] || blocked[i] {
                continue;
            }
            let (_, type_deps) = &deps[i];
            let mut can_hoist = true;
            for dep in type_deps {
                let dep_idx = candidates.iter().position(|c| &c.name == dep);
                if let Some(idx) = dep_idx {
                    if blocked[idx] {
                        blocked[i] = true;
                        can_hoist = false;
                        break;
                    }
                    if !hoistable[idx] {
                        can_hoist = false;
                    }
                }
                // type_deps are limited to candidate_names by
                // `collect_type_body_deps`, so anything else simply doesn't
                // appear here.
            }
            if can_hoist {
                hoistable[i] = true;
                hoist_order.push(i);
                progress = true;
            }
        }
    }

    let raw_bytes = raw_content.as_bytes();
    for &i in &hoist_order {
        let c = &candidates[i];
        // Extend the move range backward through preceding trivia
        // (whitespace + line / block comments) so JSDoc and explanatory
        // comments on the declaration travel with the hoisted chunk.
        // Matches TypeScript's `node.pos`, which spans leading trivia.
        let start = walk_back_through_trivia(raw_bytes, c.rel_start as usize);
        exported_names
            .hoistable_type_ranges
            .push((start as u32 + offset, c.rel_end + offset));
        exported_names
            .hoistable_instance_type_names
            .insert(c.name.clone());
    }
}

#[inline]
fn is_ident_char_for_str(ch: char) -> bool {
    ch.is_ascii_alphanumeric() || ch == '_' || ch == '$'
}

/// Hoist instance-script type/interface declarations whose names appear as
/// `$$Generic<X>` constraints. Mirrors the JS reference's `nodesToMove` path
/// (`interfacesAndTypes.getNodesWithNames(generics.getTypeReferences())`) which
/// moves these unconditionally regardless of `$props()` rune usage — without
/// hoisting, the constraint references the type before it's defined.
fn hoist_dollar_generic_referenced_types(
    candidates: &[HoistCandidate],
    _raw_content: &str,
    offset: u32,
    exported_names: &mut ExportedNames,
) {
    if candidates.is_empty() || exported_names.dollar_generics.is_empty() {
        return;
    }
    // Constraint text is a single identifier matching a candidate name. Inline
    // type expressions like `{a: string}` won't match (correct: only named
    // type references can be hoisted by name).
    let referenced: HashSet<&str> = exported_names
        .dollar_generics
        .iter()
        .filter_map(|(_, c)| c.as_deref())
        .filter(|s| s.chars().all(is_ident_char_for_str) && !s.is_empty())
        .collect();
    if referenced.is_empty() {
        return;
    }
    for c in candidates {
        if !referenced.contains(c.name.as_str()) {
            continue;
        }
        if exported_names
            .hoistable_instance_type_names
            .contains(&c.name)
        {
            continue;
        }
        // Use `c.rel_start` directly (no trivia walk-back) so the moved chunk
        // starts with the declaration keyword — mirrors `node.getStart()` in
        // the JS reference's `moveNode`.
        exported_names
            .dollar_generic_referenced_ranges
            .push((c.rel_start + offset, c.rel_end + offset));
        exported_names
            .hoistable_instance_type_names
            .insert(c.name.clone());
    }
}

/// Walk backwards from `from` through whitespace, `//` line comments and
/// `/* … */` (or `/** … */`) block comments, returning the resulting
/// position. The returned index is the start of the contiguous trivia run.
fn walk_back_through_trivia(bytes: &[u8], from: usize) -> usize {
    let mut p = from;
    loop {
        let before = p;
        // Skip pure whitespace.
        while p > 0 && matches!(bytes[p - 1], b' ' | b'\t' | b'\n' | b'\r') {
            p -= 1;
        }

        // Try to absorb a preceding block comment `/* … */` or `/** … */`.
        if p >= 2 && bytes[p - 2] == b'*' && bytes[p - 1] == b'/' {
            // Find the matching `/*` to the left.
            let mut q = p as isize - 3;
            while q >= 1 && !(bytes[q as usize - 1] == b'/' && bytes[q as usize] == b'*') {
                q -= 1;
            }
            if q >= 1 {
                p = (q - 1) as usize;
                continue;
            }
        }

        // Try to absorb a preceding `// …` line comment. After whitespace
        // skip, `p` is at the start of the line that follows the comment.
        if p > 0 {
            let mut line_start = p;
            while line_start > 0 && bytes[line_start - 1] != b'\n' {
                line_start -= 1;
            }
            if line_start + 1 < p {
                let line = &bytes[line_start..p];
                if let Some(off) = find_line_comment_start(line) {
                    p = line_start + off;
                    continue;
                }
            }
        }

        if p == before {
            break;
        }
    }
    p
}

/// Find the byte offset of `//` in a single line, ignoring `//` that appears
/// inside string literals. Returns `None` if no line-comment is present.
fn find_line_comment_start(line: &[u8]) -> Option<usize> {
    let mut i = 0usize;
    let mut in_str: Option<u8> = None;
    while i < line.len() {
        let b = line[i];
        if let Some(quote) = in_str {
            if b == b'\\' && i + 1 < line.len() {
                i += 2;
                continue;
            }
            if b == quote {
                in_str = None;
            }
            i += 1;
            continue;
        }
        if b == b'\'' || b == b'"' || b == b'`' {
            in_str = Some(b);
            i += 1;
            continue;
        }
        if b == b'/' && i + 1 < line.len() && line[i + 1] == b'/' {
            return Some(i);
        }
        i += 1;
    }
    None
}

/// Return true if `text` contains `name` as a whole identifier (not as a
/// substring of a longer one).
fn has_whole_ident(text: &str, name: &str) -> bool {
    if name.is_empty() {
        return false;
    }
    let bytes = text.as_bytes();
    let nbytes = name.as_bytes();
    if nbytes.len() > bytes.len() {
        return false;
    }
    let mut i = 0usize;
    while i + nbytes.len() <= bytes.len() {
        if &bytes[i..i + nbytes.len()] == nbytes {
            let before_ok = i == 0 || !is_ident_byte(bytes[i - 1]);
            let after_idx = i + nbytes.len();
            let after_ok = after_idx == bytes.len() || !is_ident_byte(bytes[after_idx]);
            if before_ok && after_ok {
                return true;
            }
        }
        i += 1;
    }
    false
}

///
/// Concretely:
/// - `interface X { … }`                  → `type X ={ … }`
/// - `interface X extends Y { … }`        → `type X = Y &  { … }`
/// - `interface X extends Y, Z { … }`     → `type X = Y & Z &  { … }`
/// - `interface X<T> extends Y { … }`     → `type X<T> = Y &  { … }`
fn rewrite_interface_to_type_dts(
    iface: &oxc_ast::ast::TSInterfaceDeclaration<'_>,
    raw_content: &str,
    offset: u32,
    str: &mut MagicString,
) {
    // 1. `interface` -> `type`
    let iface_kw_start = iface.span.start;
    let iface_kw_end = iface_kw_start + 9; // "interface".len()
    if (iface_kw_end as usize) <= raw_content.len()
        && &raw_content[iface_kw_start as usize..iface_kw_end as usize] == "interface"
    {
        str.overwrite(iface_kw_start + offset, iface_kw_end + offset, "type");
    }

    let extends = &iface.extends;
    if !extends.is_empty() {
        {
            // 2. `extends` -> `=`. The `extends` token sits between `iface.id`
            //    (or its type-parameter list) and the first heritage entry.
            let first_heritage = &extends[0];
            let first_start = first_heritage.span.start as usize;
            // Walk back from the heritage entry through whitespace, then
            // expect "extends" right before. The OXC AST doesn't expose the
            // keyword span directly.
            let bytes = raw_content.as_bytes();
            let mut p = first_start;
            while p > 0 {
                let prev = bytes[p - 1];
                if prev == b' ' || prev == b'\t' || prev == b'\n' || prev == b'\r' {
                    p -= 1;
                } else {
                    break;
                }
            }
            // p is now just past "extends" (or at the closing `>` of generics
            // if no `extends` token — but `iface.extends` is non-empty so
            // `extends` must exist).
            let extends_end = p;
            if extends_end >= 7 {
                let prev_kw = &raw_content[extends_end - 7..extends_end];
                if prev_kw == "extends" {
                    str.overwrite(
                        (extends_end - 7) as u32 + offset,
                        extends_end as u32 + offset,
                        "=",
                    );
                }
            }

            // 3. Replace each `,` between heritage entries with ` &`.
            let mut prev_end = first_heritage.span.end;
            for entry in extends.iter().skip(1) {
                let entry_start = entry.span.start;
                if entry_start > prev_end {
                    let between = &raw_content[prev_end as usize..entry_start as usize];
                    if let Some(comma_off) = between.find(',') {
                        let comma_abs = prev_end + comma_off as u32;
                        str.overwrite(comma_abs + offset, comma_abs + 1 + offset, " &");
                    }
                }
                prev_end = entry.span.end;
            }

            // 4. Append ` & ` immediately before the body's `{`.
            let last_extends_end = extends.last().unwrap().span.end;
            let after = &raw_content[last_extends_end as usize..];
            if let Some(brace_off) = after.find('{') {
                let brace_abs = last_extends_end + brace_off as u32;
                str.append_left(brace_abs + offset, " & ");
            }
        }
    } else {
        // No extends: insert `=` immediately before the body's `{`.
        let body_start = iface.body.span.start;
        if (body_start as usize) <= raw_content.len() {
            str.append_left(body_start + offset, "=");
        }
    }
}

/// Reuses an already-parsed module program (callers parse the module
/// script once and pass the result here, avoiding a second OXC parse).
fn rewrite_module_script_type_assertions_with_program(
    program: &oxc::Program,
    raw_content: &str,
    content_offset: usize,
    str: &mut MagicString,
) {
    let mut assertions: Vec<(u32, u32, u32, u32)> = Vec::new();
    for stmt in program.body.iter() {
        collect_ts_type_assertions_stmt(stmt, &mut assertions);
    }
    assertions.sort_by_key(|(start, end, _, _)| (*start, std::cmp::Reverse(*end)));
    let mut last_end: u32 = 0;
    for (start, end, type_start, type_end) in assertions {
        if start < last_end {
            continue;
        }
        let type_text = &raw_content[type_start as usize..type_end as usize];
        let bytes = raw_content.as_bytes();
        let mut gt_pos = type_end as usize;
        while gt_pos < bytes.len() && bytes[gt_pos] != b'>' {
            gt_pos += 1;
        }
        if gt_pos >= bytes.len() {
            continue;
        }
        let expr_start = gt_pos + 1;
        let expr_text = raw_content[expr_start..end as usize].trim_start();
        let new_text = format!("{} as {}", expr_text, type_text);
        let abs_start = (start as usize + content_offset) as u32;
        let abs_end = (end as usize + content_offset) as u32;
        str.overwrite(abs_start, abs_end, &new_text);
        last_end = end;
    }
}

/// Walk a parsed script `program` and add a trailing comma to every generic
/// **arrow function** type-parameter list that would otherwise be misparsed as
/// JSX in the generated `.tsx` overlay.
///
/// In a `.tsx` file `const f = <T>(x: T) => x` is lexed as a JSX element
/// (`<T>…`), producing a cascade of bogus "JSX element 'T' has no corresponding
/// closing tag" errors. TypeScript itself disambiguates by requiring either a
/// trailing comma (`<T,>`), a constraint (`<T extends X>`), a default
/// (`<T = Y>`), or more than one parameter (`<T, U>`). Only the bare
/// single-parameter form `<T>` is ambiguous, so that is the only shape we
/// rewrite — to `<T,>`.
///
/// Note: this targets arrow functions only. `function foo<T>()`, call type
/// arguments `f<T>()`, and class / interface generics are all unambiguous in
/// TSX and are left untouched.
fn disambiguate_arrow_type_params(
    program: &oxc::Program,
    offset: u32,
    raw_content: &str,
    str: &mut MagicString,
) {
    let mut collector = ArrowGenericCommaCollector {
        raw_content,
        insert_at: Vec::new(),
    };
    collector.visit_program(program);
    for pos in collector.insert_at {
        str.append_left(pos + offset, ",");
    }
}

/// Collects byte offsets (relative to the script content) where a trailing
/// comma must be inserted into a single-parameter generic arrow function.
struct ArrowGenericCommaCollector<'s> {
    raw_content: &'s str,
    insert_at: Vec<u32>,
}

impl<'a> Visit<'a> for ArrowGenericCommaCollector<'_> {
    fn visit_arrow_function_expression(&mut self, it: &oxc::ArrowFunctionExpression<'a>) {
        if let Some(tp) = it.type_parameters.as_deref() {
            // Only the single-parameter form is ambiguous. `<T, U>` already
            // carries a disambiguating comma.
            if tp.params.len() == 1 {
                let param = &tp.params[0];
                // A constraint (`extends`) or default (`=`) already makes the
                // list unambiguous in TSX, so leave those alone.
                if param.constraint.is_none() && param.default.is_none() {
                    let bytes = self.raw_content.as_bytes();
                    let mut i = param.span.end as usize;
                    // Skip whitespace up to the closing `>` (or an existing
                    // trailing comma).
                    while i < bytes.len() && bytes[i].is_ascii_whitespace() {
                        i += 1;
                    }
                    let already_has_comma = i < bytes.len() && bytes[i] == b',';
                    if !already_has_comma {
                        self.insert_at.push(param.span.end);
                    }
                }
            }
        }
        // Recurse so nested arrow functions are handled too.
        oxc_ast_visit::walk::walk_arrow_function_expression(self, it);
    }
}

fn collect_ts_type_assertions_stmt(stmt: &oxc::Statement, out: &mut Vec<(u32, u32, u32, u32)>) {
    match stmt {
        oxc::Statement::VariableDeclaration(var_decl) => {
            for declarator in var_decl.declarations.iter() {
                if let Some(init) = &declarator.init {
                    collect_ts_type_assertions_expr(init, out);
                }
            }
        }
        oxc::Statement::ExpressionStatement(es) => {
            collect_ts_type_assertions_expr(&es.expression, out);
        }
        oxc::Statement::ExportNamedDeclaration(export) => {
            if let Some(decl) = &export.declaration
                && let oxc::Declaration::VariableDeclaration(var_decl) = decl
            {
                for declarator in var_decl.declarations.iter() {
                    if let Some(init) = &declarator.init {
                        collect_ts_type_assertions_expr(init, out);
                    }
                }
            }
        }
        _ => {
            // Other statement kinds (functions, classes, ifs, blocks…) are not
            // part of the simple module-script `let x = <X>...;` pattern this
            // pass targets. Extend if a fixture demands it.
        }
    }
}

fn collect_ts_type_assertions_expr(expr: &oxc::Expression, out: &mut Vec<(u32, u32, u32, u32)>) {
    if let oxc::Expression::TSTypeAssertion(assertion) = expr {
        let span = assertion.span;
        let type_span = oxc_ast_span(&assertion.type_annotation);
        out.push((span.start, span.end, type_span.0, type_span.1));
        // Recurse into the wrapped expression in case it's another assertion.
        collect_ts_type_assertions_expr(&assertion.expression, out);
    }
}

fn oxc_ast_span(ty: &oxc::TSType) -> (u32, u32) {
    use oxc::TSType::*;
    let span = match ty {
        TSAnyKeyword(t) => t.span,
        TSBigIntKeyword(t) => t.span,
        TSBooleanKeyword(t) => t.span,
        TSIntrinsicKeyword(t) => t.span,
        TSNeverKeyword(t) => t.span,
        TSNullKeyword(t) => t.span,
        TSNumberKeyword(t) => t.span,
        TSObjectKeyword(t) => t.span,
        TSStringKeyword(t) => t.span,
        TSSymbolKeyword(t) => t.span,
        TSUndefinedKeyword(t) => t.span,
        TSUnknownKeyword(t) => t.span,
        TSVoidKeyword(t) => t.span,
        TSThisType(t) => t.span,
        TSTypeReference(t) => t.span,
        TSArrayType(t) => t.span,
        TSConditionalType(t) => t.span,
        TSConstructorType(t) => t.span,
        TSFunctionType(t) => t.span,
        TSImportType(t) => t.span,
        TSIndexedAccessType(t) => t.span,
        TSInferType(t) => t.span,
        TSIntersectionType(t) => t.span,
        TSLiteralType(t) => t.span,
        TSMappedType(t) => t.span,
        TSNamedTupleMember(t) => t.span,
        TSTemplateLiteralType(t) => t.span,
        TSTupleType(t) => t.span,
        TSTypeLiteral(t) => t.span,
        TSTypeOperatorType(t) => t.span,
        TSTypePredicate(t) => t.span,
        TSTypeQuery(t) => t.span,
        TSUnionType(t) => t.span,
        _ => return (0, 0),
    };
    (span.start, span.end)
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
    raw_content: &str,
    is_ts: bool,
    basename: &str,
    emit_jsdoc: bool,
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
                        // Capture type annotation text for exported variables
                        let type_annotation_text =
                            declarator.type_annotation.as_ref().and_then(|ta| {
                                let ts_type = &ta.type_annotation;
                                let start = ts_type.span().start as usize;
                                let end = ts_type.span().end as usize;
                                if start < end && end <= raw_content.len() {
                                    Some(raw_content[start..end].to_string())
                                } else {
                                    None
                                }
                            });
                        extract_names_from_binding_pattern_full(
                            &declarator.id,
                            exported_names,
                            has_default,
                            is_prop,
                            is_let,
                            false,
                        );
                        // Update the type annotation on the exported name
                        if let Some(ref ta_text) = type_annotation_text
                            && let Some(name) = binding_pattern_simple_name(&declarator.id)
                            && let Some(info) = exported_names.get_mut(&name)
                        {
                            info.type_annotation = Some(ta_text.clone());
                        }

                        // Preserve a leading JSDoc `/** @type {…} */` on the
                        // export so it round-trips into the legacy props return
                        // (`props: { /** @type {boolean} */ visible: visible }`),
                        // mirroring official's `value.doc`.
                        if let Some(name) = binding_pattern_simple_name(&declarator.id)
                            && let Some(doc) =
                                leading_jsdoc_comment(raw_content, export.span.start as usize)
                        {
                            exported_names.set_doc(&name, doc);
                        }

                        // For multi-declarator let exports (export let a, b, c;),
                        // replace the comma between declarators with `;let `.
                        // This splits them into separate `let` statements,
                        // matching JS svelte2tsx behavior.
                        // Only split `let` declarations, not `const`.
                        // NOTE: This must happen BEFORE the __sveltets_2_any injection
                        // to avoid MagicString conflicts at the same position.
                        if is_instance
                            && is_let
                            && num_declarators > 1
                            && decl_idx < num_declarators - 1
                        {
                            let decl_end_rel = declarator.span.end;
                            // Find the comma after the declarator end and overwrite just it
                            // This preserves any comments/whitespace between declarators
                            let comma_pos = raw_content[decl_end_rel as usize..]
                                .find(',')
                                .map(|p| decl_end_rel + p as u32)
                                .unwrap_or(decl_end_rel);
                            str.overwrite(comma_pos + offset, comma_pos + 1 + offset, ";let ");
                        }

                        // For exported prop variables, inject __sveltets_2_any when:
                        // 1. No initializer: `export let a;`
                        // 2. Has a type annotation: `export let a: Type = value;`
                        // 3. Initializer is a boolean literal: `export let a = true;`
                        //    (prevents TS from narrowing to `true`/`false` literal type)
                        let has_type_annotation = declarator.type_annotation.is_some();
                        let has_boolean_init = declarator
                            .init
                            .as_ref()
                            .is_some_and(|init| matches!(init, oxc::Expression::BooleanLiteral(_)));
                        if is_prop
                            && (!has_default || has_type_annotation || has_boolean_init)
                            && let Some(name) = binding_pattern_simple_name(&declarator.id)
                        {
                            let inject = format!(
                                "/*\u{03A9}ignore_start\u{03A9}*/;{name} = __sveltets_2_any({name});/*\u{03A9}ignore_end\u{03A9}*/",
                            );
                            let inject_pos = declarator.span.end + offset;
                            str.append_left(inject_pos, &inject);
                        }

                        // SvelteKit `+page.svelte` / `+layout.svelte`: inject
                        // `import('./$types.js').*` annotations on the
                        // well-known prop names and on `export const snapshot`.
                        // Mirrors `emitKitType(...)` in the JS reference's
                        // `handleVariableStatement`.
                        if is_instance
                            && classify_kit_route_file(basename).is_some()
                            && !has_type_annotation
                            && let Some(name) = binding_pattern_simple_name(&declarator.id)
                        {
                            let kit_layout = classify_kit_route_file(basename);
                            let inject_type: Option<&str> = if !is_let {
                                // `export const snapshot = ...`
                                match name.as_str() {
                                    "snapshot" => Some("import('./$types.js').Snapshot"),
                                    _ => None,
                                }
                            } else {
                                // `export let data | form | params`
                                match (name.as_str(), kit_layout) {
                                    ("data", Some(true)) => {
                                        Some("import('./$types.js').LayoutData")
                                    }
                                    ("data", Some(false)) => Some("import('./$types.js').PageData"),
                                    ("form", Some(false)) => {
                                        Some("import('./$types.js').ActionData")
                                    }
                                    ("params", Some(true)) => {
                                        Some("import('./$types.js').LayoutProps['params']")
                                    }
                                    ("params", Some(false)) => {
                                        Some("import('./$types.js').PageProps['params']")
                                    }
                                    _ => None,
                                }
                            };
                            if let Some(kit_type) = inject_type
                                && let oxc::BindingPattern::BindingIdentifier(id) = &declarator.id
                            {
                                let name_start = id.span.start + offset;
                                let name_end = id.span.end + offset;
                                if emit_jsdoc && !is_ts {
                                    let inject = format!("/** @type {{{}}} */ ", kit_type);
                                    str.append_left(name_start, &inject);
                                } else {
                                    let inject = format!(
                                        "/*\u{03A9}ignore_start\u{03A9}*/: {}/*\u{03A9}ignore_end\u{03A9}*/",
                                        kit_type
                                    );
                                    str.append_left(name_end, &inject);
                                }
                            }
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
            let type_ann = possible.and_then(|p| p.type_annotation_text.clone());
            let doc = possible.and_then(|p| p.doc.clone());
            let is_prop = is_instance && is_let;
            exported_names.add_full(
                exported.clone(),
                local.clone(),
                has_init,
                type_ann,
                is_prop,
                is_let,
                true,
            );
            // The JSDoc lives on the `let x` declaration; carry it onto the
            // export so it round-trips into the legacy props return.
            if let Some(doc) = doc {
                exported_names.set_doc(&exported, doc);
            }
            // Inject __sveltets_2_any for exported variables that either:
            // 1. Have no initializer (export { x } where x has no default)
            // 2. Have a type annotation (export { x } where x: Type = value)
            if is_instance && is_let {
                let has_ta = possible.map(|p| p.has_type_annotation).unwrap_or(false);
                if (!has_init || has_ta)
                    && let Some(pe) = possible
                {
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
/// True if a reactive assignment's LHS qualifies for the
/// `__sveltets_2_invalidate(() => …)` RHS wrap — i.e. it is a plain Identifier,
/// an object destructuring target, or an array destructuring target. Mirrors
/// official `isAssignmentBinaryExpr`'s `isIdentifier(left) ||
/// isObjectLiteralExpression(left) || isArrayLiteralExpression(left)`. A
/// member-expression target (`foo.bar`) does NOT qualify.
fn is_invalidate_assignment_target(target: &oxc::AssignmentTarget) -> bool {
    matches!(
        target,
        oxc::AssignmentTarget::AssignmentTargetIdentifier(_)
            | oxc::AssignmentTarget::ObjectAssignmentTarget(_)
            | oxc::AssignmentTarget::ArrayAssignmentTarget(_)
    )
}

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

            // Official only applies the `__sveltets_2_invalidate(() => …)` RHS
            // wrap when the labeled statement is a plain `=` assignment whose
            // LHS is an Identifier / object pattern / array pattern
            // (`isAssignmentBinaryExpr` in `utils/tsAst.ts`). Member-expression
            // LHS (`$: foo.bar = …`) and compound operators (`$: x *= 2`) do
            // NOT qualify — those are wrapped whole in `;() => {$: …}` like any
            // other reactive statement (`handleReactiveStatement`'s else branch).
            let qualifies_for_invalidate = matches!(
                expr,
                oxc::Expression::AssignmentExpression(assign)
                    if matches!(assign.operator, oxc::AssignmentOperator::Assign)
                        && is_invalidate_assignment_target(&assign.left)
            );

            if let oxc::Expression::AssignmentExpression(assign) = expr
                && qualifies_for_invalidate
            {
                {
                    // Get the LHS names
                    let lhs_names = extract_names_from_assignment_target(&assign.left);

                    // Check if the LHS is a $store reference
                    let is_store_assignment = match &assign.left {
                        oxc::AssignmentTarget::AssignmentTargetIdentifier(id) => {
                            id.name.starts_with('$')
                        }
                        _ => false,
                    };

                    // Mirrors `nodes/ImplicitTopLevelNames.ts::modifyCode`:
                    //   - all LHS names are NEW → replace `$:` with `let `,
                    //     drop the parens.
                    //   - some are declared, some are new → prepend
                    //     `let <new>;\n` BEFORE the `$:` line, keep `$:` form.
                    //   - all already declared → keep `$:` form unchanged.
                    //
                    // The "declared" check uses `rootScope.declared` only
                    // (i.e. real `let`/`const` declarations), NOT names
                    // already declared via earlier reactive statements —
                    // matching the JS reference's `rootVariables` parameter.
                    let new_names: Vec<String> = lhs_names
                        .iter()
                        .filter(|n| !declared_names.contains(*n))
                        .cloned()
                        .collect();
                    let all_new = !lhs_names.is_empty() && new_names.len() == lhs_names.len();

                    let is_new_declaration =
                        !is_store_assignment && all_new && !lhs_names.is_empty();
                    let is_partial_new = !is_store_assignment && !all_new && !new_names.is_empty();

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

                    if is_partial_new {
                        // For each new name, declare `let <name>;\n` before the
                        // `$:` line — JS reference uses `prependRight` at
                        // `node.label.getStart()`. The `$:` form is kept so
                        // the assignment still triggers reactivity.
                        let mut decls = String::new();
                        for name in &new_names {
                            let _ = writeln!(decls, "let {};", name);
                        }
                        str.prepend_right(label_start, &decls);
                        for name in &new_names {
                            reactive_declared_names.insert(name.clone());
                        }
                    }

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
                // Non-qualifying reactive statement — a non-assignment
                // expression (`$: console.log(x)`), a member-LHS assignment
                // (`$: foo.bar = x`), or a compound operator (`$: x *= 2`).
                // All are wrapped whole: `;() => {$: …}`.
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

/// The official svelte2tsx `is_rune` quirk: a `$state(...)`/`$derived(...)`/
/// `$props(...)` call that is the *direct* initializer of a variable
/// declaration whose binding name (source text) **includes** the rune base
/// name (`state`/`derived`/`props`) is treated as the canonical rune form and
/// is therefore NOT counted as a store-access global — so it does not, on its
/// own, switch the component into runes mode.
///
/// Reference: `processInstanceScriptContent.ts` `handleIdentifier`:
/// ```text
/// const is_rune =
///   (text === '$props' || text === '$derived' || text === '$state') &&
///   ts.isCallExpression(parent) &&
///   ts.isVariableDeclaration(parent.parent) &&
///   parent.parent.name.getText().includes(text.slice(1));
/// ```
///
/// Returns the base rune call when the init is the excluded canonical form, so
/// callers can still scan its *arguments* for nested rune globals (which keep
/// their own non-VariableDeclaration parent and so are not excluded).
fn excluded_rune_init<'a>(
    init: &'a oxc::Expression,
    id: &oxc::BindingPattern,
) -> Option<&'a oxc::CallExpression<'a>> {
    let oxc::Expression::CallExpression(call) = init else {
        return None;
    };
    let oxc::Expression::Identifier(callee) = &call.callee else {
        return None;
    };
    let base = match callee.name.as_str() {
        "$state" => "state",
        "$derived" => "derived",
        "$props" => "props",
        _ => return None,
    };
    if binding_name_contains(id, base) {
        Some(call)
    } else {
        None
    }
}

/// True if any identifier bound by `pattern` contains `needle` as a substring.
/// Mirrors official's `name.getText().includes(base)` for the common simple /
/// destructuring cases.
fn binding_name_contains(pattern: &oxc::BindingPattern, needle: &str) -> bool {
    extract_all_names_from_binding_pattern(pattern)
        .iter()
        .any(|n| n.contains(needle))
}

/// Scan a rune call's arguments for nested rune globals (used when the call
/// itself is the excluded canonical form but its arguments may still contain
/// runes, e.g. `let derived1 = $derived($state(0))`).
fn detect_rune_in_call_args(call: &oxc::CallExpression, declared_names: &HashSet<String>) -> bool {
    call.arguments.iter().any(|arg| match arg {
        oxc::Argument::SpreadElement(spread) => {
            detect_rune_in_expr(&spread.argument, declared_names)
        }
        _ => detect_rune_in_expr(arg.to_expression(), declared_names),
    })
}

fn detect_runes_call(
    declarator: &oxc::VariableDeclarator,
    exported_names: &mut ExportedNames,
    declared_names: &HashSet<String>,
) {
    if let Some(ref init) = declarator.init {
        // Apply the official `is_rune` exclusion: the canonical
        // `let stateX = $state(...)` form does not, by itself, trigger runes
        // mode — but nested runes in the arguments still do.
        if let Some(call) = excluded_rune_init(init, &declarator.id) {
            if detect_rune_in_call_args(call, declared_names) {
                exported_names.set_uses_runes(true);
            }
            return;
        }
        // `detect_rune_in_expr` subsumes `detect_rune_global_call_expr`: it
        // fast-paths to the top-level check first, then recurses into nested
        // function/arrow bodies. This catches patterns like:
        //   `const action = (node) => { $effect(() => { … }); }`
        // which the original top-level-only check missed.
        // Reference: ExportedNames.ts `checkGlobalsForRunes` which walks the
        // entire TS AST (not just top-level statements).
        if detect_rune_in_expr(init, declared_names) {
            exported_names.set_uses_runes(true);
        }
    }
}

/// Detect `$state(...)`, `$derived(...)`, `$effect(...)` — including member-call
/// variants such as `$state.raw(...)`, `$effect.pre(...)` — anywhere as an
/// expression (not just as a VariableDeclarator init).
///
/// Mirrors the official `isRunesMode` `hasRunesGlobals` check which looks for
/// undeclared `$state`/`$derived`/`$effect` identifiers in the instance scope.
/// We check both direct calls (`$state(v)`) and member calls (`$state.raw(v)`)
/// since both reference the `$state` global.
///
/// Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts
///   `hasRunesGlobals = isSvelte5Plus && globals.some(g => ['$state','$derived','$effect'].includes(g))`
fn detect_rune_global_call_expr(expr: &oxc::Expression, declared_names: &HashSet<String>) -> bool {
    match expr {
        // Direct call: $state(...), $derived(...), $effect(...)
        oxc::Expression::CallExpression(call) => {
            match &call.callee {
                // $state(...), $derived(...), $effect(...)
                oxc::Expression::Identifier(id)
                    if matches!(id.name.as_str(), "$state" | "$derived" | "$effect") =>
                {
                    // Not a rune if either the store base (`$state` is a
                    // store-sub of a declared `state`) OR the full `$state`
                    // identifier itself is declared (e.g. shadowed by a param
                    // named `$derived`).
                    let base = &id.name[1..]; // "$state" -> "state"
                    !declared_names.contains(base) && !declared_names.contains(id.name.as_str())
                }
                // Member call: $state.raw(...), $effect.pre(...), etc.
                // The object identifier must be $state/$derived/$effect.
                oxc::Expression::StaticMemberExpression(mem) => {
                    if let oxc::Expression::Identifier(obj) = &mem.object
                        && matches!(obj.name.as_str(), "$state" | "$derived" | "$effect")
                    {
                        let base = &obj.name[1..];
                        !declared_names.contains(base)
                            && !declared_names.contains(obj.name.as_str())
                    } else {
                        false
                    }
                }
                _ => false,
            }
        }
        _ => false,
    }
}

/// Detect rune globals used as top-level ExpressionStatements in the instance
/// script, e.g. `$effect(() => { ... })`.
///
/// These don't have a VariableDeclarator so `detect_runes_call` misses them.
/// Reference: official svelte2tsx `hasRunesGlobals` which checks ALL undeclared
/// `$state`/`$derived`/`$effect` references in the instance script scope.
fn detect_runes_expr_stmt(
    expr_stmt: &oxc::ExpressionStatement,
    exported_names: &mut ExportedNames,
    declared_names: &HashSet<String>,
) {
    // Use the recursive walker so runes nested in arrow/function bodies are also
    // detected (e.g. `setTimeout(() => { $effect(() => {}) })`).
    // `detect_rune_in_expr` fast-paths to `detect_rune_global_call_expr` first.
    if detect_rune_in_expr(&expr_stmt.expression, declared_names) {
        exported_names.set_uses_runes(true);
    }
}

/// Detect whether any rune global call (`$state`, `$derived`, `$effect` including
/// member variants such as `$state.raw`, `$effect.pre`) appears anywhere inside
/// a function, class, or arrow-function body — even when not at the top level.
///
/// The official svelte2tsx `checkGlobalsForRunes` works by collecting every
/// undeclared identifier referenced anywhere in the script (via the TypeScript
/// compiler's symbol walk) and then testing whether any of `$state`/`$derived`/
/// `$effect` appears. This mirrors that behaviour for the OXC AST by recursively
/// walking statements and expressions inside nested bodies.
///
/// Reference: ExportedNames.ts `checkGlobalsForRunes` + `ImplicitStoreValues.getGlobals()`
///   `this.hasRunesGlobals = isSvelte5Plus && globals.some(g => runes.includes(g))`
fn detect_rune_in_nested_body(stmts: &[oxc::Statement], declared_names: &HashSet<String>) -> bool {
    for stmt in stmts {
        if detect_rune_in_stmt(stmt, declared_names) {
            return true;
        }
    }
    false
}

/// Walk a single statement (and any nested sub-statements / expressions)
/// looking for an undeclared `$state`/`$derived`/`$effect` reference.
fn detect_rune_in_stmt(stmt: &oxc::Statement, declared_names: &HashSet<String>) -> bool {
    match stmt {
        oxc::Statement::ExpressionStatement(es) => {
            detect_rune_in_expr(&es.expression, declared_names)
        }
        oxc::Statement::VariableDeclaration(var_decl) => var_decl.declarations.iter().any(|d| {
            d.init.as_ref().is_some_and(|e| {
                // Same `is_rune` exclusion as the top-level pass: the canonical
                // `let stateX = $state(...)` form is not a runes-globals trigger,
                // but nested runes in the arguments still are.
                if let Some(call) = excluded_rune_init(e, &d.id) {
                    detect_rune_in_call_args(call, declared_names)
                } else {
                    detect_rune_in_expr(e, declared_names)
                }
            })
        }),
        oxc::Statement::ReturnStatement(ret) => ret
            .argument
            .as_ref()
            .is_some_and(|e| detect_rune_in_expr(e, declared_names)),
        oxc::Statement::BlockStatement(block) => {
            detect_rune_in_nested_body(&block.body, declared_names)
        }
        oxc::Statement::IfStatement(if_stmt) => {
            detect_rune_in_expr(&if_stmt.test, declared_names)
                || detect_rune_in_stmt(&if_stmt.consequent, declared_names)
                || if_stmt
                    .alternate
                    .as_ref()
                    .is_some_and(|s| detect_rune_in_stmt(s, declared_names))
        }
        oxc::Statement::WhileStatement(while_stmt) => {
            detect_rune_in_expr(&while_stmt.test, declared_names)
                || detect_rune_in_stmt(&while_stmt.body, declared_names)
        }
        oxc::Statement::ForStatement(for_stmt) => {
            for_stmt.init.as_ref().is_some_and(|init| match init {
                oxc::ForStatementInit::VariableDeclaration(vd) => vd.declarations.iter().any(|d| {
                    d.init
                        .as_ref()
                        .is_some_and(|e| detect_rune_in_expr(e, declared_names))
                }),
                // ForStatementInit inherits Expression variants; use to_expression()
                // for all non-VariableDeclaration arms.
                _ => {
                    if let Some(e) = init.as_expression() {
                        detect_rune_in_expr(e, declared_names)
                    } else {
                        false
                    }
                }
            }) || for_stmt
                .test
                .as_ref()
                .is_some_and(|e| detect_rune_in_expr(e, declared_names))
                || for_stmt
                    .update
                    .as_ref()
                    .is_some_and(|e| detect_rune_in_expr(e, declared_names))
                || detect_rune_in_stmt(&for_stmt.body, declared_names)
        }
        oxc::Statement::LabeledStatement(labeled) => {
            detect_rune_in_stmt(&labeled.body, declared_names)
        }
        oxc::Statement::ForOfStatement(f) => {
            detect_rune_in_expr(&f.right, declared_names)
                || detect_rune_in_stmt(&f.body, declared_names)
        }
        oxc::Statement::ForInStatement(f) => {
            detect_rune_in_expr(&f.right, declared_names)
                || detect_rune_in_stmt(&f.body, declared_names)
        }
        oxc::Statement::TryStatement(t) => {
            detect_rune_in_nested_body(&t.block.body, declared_names)
                || t.handler
                    .as_ref()
                    .is_some_and(|h| detect_rune_in_nested_body(&h.body.body, declared_names))
                || t.finalizer
                    .as_ref()
                    .is_some_and(|f| detect_rune_in_nested_body(&f.body, declared_names))
        }
        oxc::Statement::SwitchStatement(s) => s.cases.iter().any(|c| {
            c.test
                .as_ref()
                .is_some_and(|e| detect_rune_in_expr(e, declared_names))
                || detect_rune_in_nested_body(&c.consequent, declared_names)
        }),
        oxc::Statement::FunctionDeclaration(func) => func.body.as_ref().is_some_and(|body| {
            let scope = scope_with_params(declared_names, &func.params);
            detect_rune_in_nested_body(&body.statements, &scope)
        }),
        _ => false,
    }
}

/// Recursively detect an undeclared `$state`/`$derived`/`$effect` reference
/// (including member variants) anywhere inside the given expression tree.
/// Clone `base` and add a function's parameter names, so a `$state`/`$derived`/
/// `$effect` shadowed by a parameter (e.g. `function bar($derived) { $derived(x) }`)
/// is treated as a store-sub / call of the param, not a rune. Mirrors official's
/// scope-aware global resolution.
fn scope_with_params(base: &HashSet<String>, params: &oxc::FormalParameters) -> HashSet<String> {
    let mut s = base.clone();
    let mut tmp: Vec<String> = Vec::new();
    for p in params.items.iter() {
        collect_binding_names(&p.pattern, &mut tmp);
    }
    if let Some(rest) = &params.rest {
        collect_binding_names(&rest.rest.argument, &mut tmp);
    }
    for n in tmp {
        s.insert(n);
    }
    s
}

fn detect_rune_in_expr(expr: &oxc::Expression, declared_names: &HashSet<String>) -> bool {
    // Fast-path: check if this expression itself is a rune call.
    if detect_rune_global_call_expr(expr, declared_names) {
        return true;
    }
    match expr {
        oxc::Expression::CallExpression(call) => {
            // The callee might not be a rune but the arguments could contain rune calls.
            detect_rune_in_expr(&call.callee, declared_names)
                || call.arguments.iter().any(|arg| match arg {
                    oxc::Argument::SpreadElement(spread) => {
                        detect_rune_in_expr(&spread.argument, declared_names)
                    }
                    // Argument inherits Expression variants via `@inherit Expression`;
                    // use to_expression() (panics for SpreadElement, already handled above).
                    _ => detect_rune_in_expr(arg.to_expression(), declared_names),
                })
        }
        oxc::Expression::ArrowFunctionExpression(arrow) => {
            let scope = scope_with_params(declared_names, &arrow.params);
            detect_rune_in_nested_body(&arrow.body.statements, &scope)
        }
        oxc::Expression::FunctionExpression(func) => func.body.as_ref().is_some_and(|body| {
            let scope = scope_with_params(declared_names, &func.params);
            detect_rune_in_nested_body(&body.statements, &scope)
        }),
        oxc::Expression::ClassExpression(class) => {
            class.body.body.iter().any(|member| match member {
                oxc::ClassElement::MethodDefinition(method) => {
                    method.value.body.as_ref().is_some_and(|body| {
                        let scope = scope_with_params(declared_names, &method.value.params);
                        detect_rune_in_nested_body(&body.statements, &scope)
                    })
                }
                oxc::ClassElement::PropertyDefinition(prop) => prop
                    .value
                    .as_ref()
                    .is_some_and(|e| detect_rune_in_expr(e, declared_names)),
                _ => false,
            })
        }
        oxc::Expression::AssignmentExpression(assign) => {
            detect_rune_in_expr(&assign.right, declared_names)
        }
        oxc::Expression::BinaryExpression(bin) => {
            detect_rune_in_expr(&bin.left, declared_names)
                || detect_rune_in_expr(&bin.right, declared_names)
        }
        oxc::Expression::LogicalExpression(log) => {
            detect_rune_in_expr(&log.left, declared_names)
                || detect_rune_in_expr(&log.right, declared_names)
        }
        oxc::Expression::ConditionalExpression(cond) => {
            detect_rune_in_expr(&cond.test, declared_names)
                || detect_rune_in_expr(&cond.consequent, declared_names)
                || detect_rune_in_expr(&cond.alternate, declared_names)
        }
        oxc::Expression::SequenceExpression(seq) => seq
            .expressions
            .iter()
            .any(|e| detect_rune_in_expr(e, declared_names)),
        oxc::Expression::ObjectExpression(obj) => obj.properties.iter().any(|prop| match prop {
            oxc::ObjectPropertyKind::ObjectProperty(p) => {
                detect_rune_in_expr(&p.value, declared_names)
            }
            oxc::ObjectPropertyKind::SpreadProperty(spread) => {
                detect_rune_in_expr(&spread.argument, declared_names)
            }
        }),
        oxc::Expression::ArrayExpression(arr) => arr.elements.iter().any(|el| match el {
            oxc::ArrayExpressionElement::SpreadElement(spread) => {
                detect_rune_in_expr(&spread.argument, declared_names)
            }
            oxc::ArrayExpressionElement::Elision(_) => false,
            // ArrayExpressionElement inherits Expression variants via `@inherit Expression`;
            // use to_expression() for all non-SpreadElement, non-Elision arms.
            _ => detect_rune_in_expr(el.to_expression(), declared_names),
        }),
        oxc::Expression::StaticMemberExpression(mem) => {
            detect_rune_in_expr(&mem.object, declared_names)
        }
        oxc::Expression::ComputedMemberExpression(mem) => {
            detect_rune_in_expr(&mem.object, declared_names)
                || detect_rune_in_expr(&mem.expression, declared_names)
        }
        oxc::Expression::UnaryExpression(unary) => {
            detect_rune_in_expr(&unary.argument, declared_names)
        }
        oxc::Expression::NewExpression(new_expr) => {
            // e.g. `new class Counter { constructor() { this.x = $state(0) } }`
            // or `new Foo($derived(...))`.
            detect_rune_in_expr(&new_expr.callee, declared_names)
                || new_expr.arguments.iter().any(|arg| match arg {
                    oxc::Argument::SpreadElement(spread) => {
                        detect_rune_in_expr(&spread.argument, declared_names)
                    }
                    _ => detect_rune_in_expr(arg.to_expression(), declared_names),
                })
        }
        oxc::Expression::TemplateLiteral(tpl) => tpl
            .expressions
            .iter()
            .any(|e| detect_rune_in_expr(e, declared_names)),
        oxc::Expression::TaggedTemplateExpression(tagged) => {
            detect_rune_in_expr(&tagged.tag, declared_names)
                || tagged
                    .quasi
                    .expressions
                    .iter()
                    .any(|e| detect_rune_in_expr(e, declared_names))
        }
        oxc::Expression::AwaitExpression(aw) => detect_rune_in_expr(&aw.argument, declared_names),
        oxc::Expression::YieldExpression(y) => y
            .argument
            .as_ref()
            .is_some_and(|e| detect_rune_in_expr(e, declared_names)),
        oxc::Expression::ParenthesizedExpression(paren) => {
            detect_rune_in_expr(&paren.expression, declared_names)
        }
        oxc::Expression::TSAsExpression(ts_as) => {
            detect_rune_in_expr(&ts_as.expression, declared_names)
        }
        oxc::Expression::TSNonNullExpression(nn) => {
            detect_rune_in_expr(&nn.expression, declared_names)
        }
        // Identifier, literals, template literals without expressions, etc. → no rune
        _ => false,
    }
}

/// Detect `createEventDispatcher<Type>()` calls and extract the generic type.
///
/// Records the type text (e.g. `{a: A}`) in the events struct for use
/// in the return statement's events field.
fn detect_create_event_dispatcher(
    declarator: &oxc::VariableDeclarator,
    raw_content: &str,
    events: &mut ComponentEvents,
) {
    if let Some(ref init) = declarator.init
        && let oxc::Expression::CallExpression(call) = init
        && let oxc::Expression::Identifier(ref callee) = call.callee
        && callee.name == "createEventDispatcher"
    {
        // Check for type arguments: createEventDispatcher<Type>()
        if let Some(ref type_args) = call.type_arguments
            && let Some(first_param) = type_args.params.first()
        {
            let start = first_param.span().start as usize;
            let end = first_param.span().end as usize;
            if start < end && end <= raw_content.len() {
                let type_text = raw_content[start..end].to_string();
                events.dispatcher_generic_type = Some(type_text);
            }
        } else if let Some(name) = binding_pattern_simple_name(&declarator.id) {
            // Untyped dispatcher: record its name so `dispatch("name")` call
            // sites (anywhere in the component, incl. template handlers) can be
            // scanned to populate the events return.
            events.dispatcher_names.push(name);
        }
    }
}

/// Check if a variable declarator's init is a `$props()` call.
fn is_props_call_oxc(declarator: &oxc::VariableDeclarator) -> bool {
    if let Some(ref init) = declarator.init
        && let oxc::Expression::CallExpression(call) = init
        && let oxc::Expression::Identifier(ref callee) = call.callee
    {
        return callee.name == "$props";
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
/// Also handles `$bindable(x) as Type` (TSAsExpression wrapping $bindable).
fn is_bindable_call(expr: &oxc::Expression, raw_content: &str) -> (bool, Option<String>) {
    // Unwrap TSAsExpression if present: `$bindable(0) as number`
    let inner = match expr {
        oxc::Expression::TSAsExpression(ts_as) => &ts_as.expression,
        other => other,
    };
    if let oxc::Expression::CallExpression(call) = inner
        && let oxc::Expression::Identifier(ref callee) = call.callee
        && callee.name == "$bindable"
    {
        // Get the first argument if any (for type inference)
        let arg_text = call.arguments.first().map(|arg| {
            let start = arg.span().start as usize;
            let end = arg.span().end as usize;
            raw_content[start..end].to_string()
        });
        return (true, arg_text);
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
            if let oxc::Expression::Identifier(ref callee) = call.callee
                && callee.name == "$bindable"
            {
                if let Some(first_arg) = call.arguments.first() {
                    if let oxc::Argument::SpreadElement(_) = first_arg {
                        return "any".to_string();
                    }
                    return infer_type_from_default(first_arg.to_expression(), raw_content);
                }
                return "any".to_string();
            }
            "any".to_string()
        }
        oxc::Expression::TSAsExpression(ts_as) => {
            // `value as Type` → use the asserted type text from source
            let start = ts_as.type_annotation.span().start as usize;
            let end = ts_as.type_annotation.span().end as usize;
            if start < end && end <= raw_content.len() {
                raw_content[start..end].to_string()
            } else {
                "any".to_string()
            }
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
        is_named_type_reference,
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
        // Inline object types are hoistable, named type references are not.
        // Mirrors official `ts.isTypeReferenceNode` check:
        // - TSTypeLiteral (`{ a: T }`) → hoistable (inline object)
        // - TSTypeReference (`Props`, `Props<T>`) → named reference, use directly
        // - Everything else (TSIndexedAccessType, TSUnionType, etc.) → create $$ComponentProps
        let is_hoistable = matches!(&ts_type, oxc::TSType::TSTypeLiteral(_));
        let is_named_ref = matches!(&ts_type, oxc::TSType::TSTypeReference(_));
        // The colon position is the start of the TSTypeAnnotation span (includes `:`)
        let colon = ta.span.start;
        (
            true,
            Some(start),
            Some(end),
            text,
            is_hoistable,
            is_named_ref,
            Some(colon),
        )
    } else {
        (false, None, None, None, false, false, None)
    };

    // Detect JSDoc @type comment before the let statement
    let (jsdoc_type, jsdoc_start, jsdoc_end) = detect_jsdoc_type_before(
        raw_content,
        var_decl.span.start as usize,
        program,
        stmt_index,
    );

    // Detect rest element and collect prop types.
    // Also detect whether the binding is an identifier (whole-object) vs destructure.
    let mut has_rest = false;
    // `has_unknown_props` mirrors official's `withUnknown` flag: set to true when
    // a property has a non-identifier key (string literal, numeric, computed) or
    // a non-identifier name. Mirrors official check:
    //   `!ts.isIdentifier(element.name) || (element.propertyName && !ts.isIdentifier(element.propertyName))`
    let mut has_unknown_props = false;
    let mut prop_types: Vec<(String, bool, String)> = Vec::new();
    let mut bindable_names: Vec<String> = Vec::new();
    let is_identifier_pattern = matches!(&declarator.id, oxc::BindingPattern::BindingIdentifier(_));

    if let oxc::BindingPattern::ObjectPattern(obj_pat) = &declarator.id {
        has_rest = obj_pat.rest.is_some();

        for prop in obj_pat.properties.iter() {
            // Only include a prop in the type if its key is a plain identifier.
            // For non-identifier keys (string literals like `'kebab-case'`, numeric
            // literals like `0`, computed properties), set `has_unknown_props = true`
            // which will contribute `& Record<string, any>` or `Record<string, any>`
            // to the generated type — mirrors official's `withUnknown` path.
            let is_identifier_key = matches!(&prop.key, oxc::PropertyKey::StaticIdentifier(_));
            if !is_identifier_key {
                has_unknown_props = true;
                continue;
            }
            let key_name = property_key_to_string(&prop.key);
            if let Some(key) = key_name {
                // Also check that the binding target name is a simple identifier
                // (not a nested destructure, which is a non-identifier).
                match &prop.value {
                    oxc::BindingPattern::AssignmentPattern(assign) => {
                        if binding_pattern_simple_name(&assign.left).is_none() {
                            // Complex binding (nested destructure) → unknown
                            has_unknown_props = true;
                            continue;
                        }
                        let inferred_type = infer_type_from_default(&assign.right, raw_content);
                        let (bindable, _) = is_bindable_call(&assign.right, raw_content);
                        prop_types.push((key.clone(), true, inferred_type));
                        if bindable {
                            bindable_names.push(key);
                        }
                    }
                    oxc::BindingPattern::BindingIdentifier(_) => {
                        prop_types.push((key, false, "any".to_string()));
                    }
                    _ => {
                        // Nested destructure in value position → unknown
                        has_unknown_props = true;
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
        is_named_type_reference,
        is_identifier_pattern,
        jsdoc_type,
        jsdoc_start,
        jsdoc_end,
        has_rest,
        has_unknown_props,
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
            for el in arr_pat.elements.iter().flatten() {
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
            for el in arr_pat.elements.iter().flatten() {
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
/// Return the leading `/** … */` JSDoc comment immediately before `before`
/// (skipping whitespace), or None. Mirrors official `getLastLeadingDoc`.
fn leading_jsdoc_comment(source: &str, before: usize) -> Option<String> {
    let bytes = source.as_bytes();
    let before = before.min(bytes.len());
    // Skip whitespace immediately before the declaration.
    let mut p = before;
    while p > 0 && bytes[p - 1].is_ascii_whitespace() {
        p -= 1;
    }
    // Require a block comment terminator `*/` right there.
    if p < 2 || &source[p - 2..p] != "*/" {
        return None;
    }
    // Find the matching `/**` (JSDoc) opener.
    let open = source[..p].rfind("/**")?;
    // Ensure the `/**` is the opener for THIS `*/` (no intervening `*/`).
    if source[open..p - 2].contains("*/") {
        return None;
    }
    Some(source[open..p].to_string())
}

/// True when the source has a `<script context="module">` / `<script module>` tag.
fn has_module_script(source: &str) -> bool {
    find_module_script_span(source).is_some()
}

/// Locate the module `<script>` tag, returning `(body_start, body_end)` — the
/// byte range of its inner content (between `>` and `</script>`).
fn find_module_script_span(source: &str) -> Option<(usize, usize)> {
    let bytes = source.as_bytes();
    let mut search = 0usize;
    while let Some(rel) = source[search..].find("<script") {
        let tag_start = search + rel;
        // Find the end of the opening tag `>`.
        let gt = match source[tag_start..].find('>') {
            Some(g) => tag_start + g,
            None => return None,
        };
        let open_tag = &source[tag_start..gt];
        // `module` either as a bare attribute or `context="module"` / `context='module'`.
        let is_module = open_tag.contains("context=\"module\"")
            || open_tag.contains("context='module'")
            || open_tag
                .split(|c: char| c.is_ascii_whitespace() || c == '>' || c == '=')
                .any(|tok| tok == "module");
        if is_module && !open_tag.starts_with("<scripts") {
            let body_start = gt + 1;
            let body_end = source[body_start..]
                .find("</script")
                .map(|e| body_start + e)
                .unwrap_or(bytes.len());
            return Some((body_start, body_end));
        }
        search = gt + 1;
    }
    None
}

/// Blank the inner content of the module `<script>` so a byte-level store scan
/// never sees module-internal `$name` references.
fn blank_module_script_body(source: &str, buf: &mut [u8]) {
    if let Some((start, end)) = find_module_script_span(source) {
        for b in &mut buf[start..end] {
            if *b != b'\n' && *b != b'\r' {
                *b = b' ';
            }
        }
    }
}

fn collect_store_references(source: &str) -> HashSet<String> {
    // Hand-rolled byte-level scan. The previous implementation compiled a
    // regex on every call; using `memchr` to jump between `$` bytes is
    // dramatically faster on the common script-free template (one SIMD
    // pass returns `None`) and avoids per-match string allocations.
    //
    // HTML comments are blanked first: a `$name` inside `<!-- … -->` is not a
    // real reference (official builds stores from parsed expressions, never
    // comments), so e.g. a `<!-- … `$derived` … -->` migration-task comment
    // must not make a local `derived` variable look like a store subscription.
    // The module script's own `$name` references are NOT auto-subscriptions —
    // official `svelte2tsx` only runs the `Stores` walker over the instance
    // script + template, never the module script body. So a `<script module>`
    // that internally reads `$foo` must not make `foo` look like a store.
    let blanked;
    let needs_blank = source.contains("<!--") || has_module_script(source);
    let source: &str = if needs_blank {
        let mut buf = source.as_bytes().to_vec();
        let mut j = 0usize;
        while let Some(rel) = source[j..].find("<!--") {
            let start = j + rel;
            let end = source[start..]
                .find("-->")
                .map(|e| start + e + 3)
                .unwrap_or(buf.len());
            for b in &mut buf[start..end] {
                if *b != b'\n' && *b != b'\r' {
                    *b = b' ';
                }
            }
            j = end;
        }
        blank_module_script_body(source, &mut buf);
        blanked = String::from_utf8(buf).unwrap_or_else(|_| source.to_string());
        &blanked
    } else {
        source
    };
    let mut stores = HashSet::new();
    let bytes = source.as_bytes();
    let len = bytes.len();
    let mut i = 0usize;
    while let Some(off) = memchr::memchr(b'$', &bytes[i..]) {
        let pos = i + off;
        let next = pos + 1;
        if next >= len {
            break;
        }
        let nb = bytes[next];
        // Skip `$$` prefixed names (like `$$props`).
        if nb == b'$' {
            i = next + 1;
            continue;
        }
        // Skip member access, string keys, identifier continuations.
        if pos > 0 {
            let prev = bytes[pos - 1];
            if prev == b'.'
                || prev == b'\''
                || prev == b'"'
                || prev.is_ascii_alphanumeric()
                || prev == b'_'
            {
                i = next;
                continue;
            }
        }
        if !(nb.is_ascii_alphabetic() || nb == b'_') {
            i = next;
            continue;
        }
        let mut end = next + 1;
        while end < len {
            let b = bytes[end];
            if b.is_ascii_alphanumeric() || b == b'_' {
                end += 1;
            } else {
                break;
            }
        }
        let full = &source[pos..end];
        if RESERVED_STORE_NAMES.contains(&full) {
            i = end;
            continue;
        }
        // Rune-call exclusion (mirror `processInstanceScriptContent.ts` `is_rune`):
        // `$props`/`$state`/`$derived` immediately called as `<name> = $state(…)`
        // is the rune, not a store sub — but ONLY when the declared binding name
        // includes the rune's base (`let state = $state()` → rune; `let count =
        // $state()` → still a `state` store access).
        if matches!(full, "$state" | "$props" | "$derived")
            && next_non_ws_is_paren(bytes, end)
            && is_self_named_rune_decl(source, bytes, pos, &full[1..])
        {
            i = end;
            continue;
        }
        stores.insert(source[next..end].to_string());
        i = end;
    }
    stores
}

/// True when the first non-whitespace byte at/after `from` is `(`.
fn next_non_ws_is_paren(bytes: &[u8], from: usize) -> bool {
    let mut k = from;
    while k < bytes.len() && bytes[k].is_ascii_whitespace() {
        k += 1;
    }
    bytes.get(k) == Some(&b'(')
}

/// Approximates upstream's `ts.isVariableDeclaration(parent.parent) &&
/// parent.parent.name.getText().includes(text.slice(1))`: walk back from the
/// rune's `$` over `= ` to the binding pattern, and test whether that binding
/// text contains the rune base name.
fn is_self_named_rune_decl(source: &str, bytes: &[u8], dollar_pos: usize, base: &str) -> bool {
    let mut k = dollar_pos;
    while k > 0 && bytes[k - 1].is_ascii_whitespace() {
        k -= 1;
    }
    if k == 0 || bytes[k - 1] != b'=' {
        return false;
    }
    let eq = k - 1;
    // Reject compound/comparison operators (`==`, `<=`, `+=`, …); a plain `=` only.
    if eq > 0
        && matches!(
            bytes[eq - 1],
            b'=' | b'!' | b'<' | b'>' | b'+' | b'-' | b'*' | b'/' | b'%' | b'&' | b'|' | b'^' | b'~'
        )
    {
        return false;
    }
    // Walk back to the declaration boundary, collecting the binding region.
    let mut start = eq;
    let mut depth = 0i32;
    while start > 0 {
        let c = bytes[start - 1];
        match c {
            b'}' | b']' | b')' => depth += 1,
            b'{' | b'[' | b'(' => {
                if depth == 0 {
                    break;
                }
                depth -= 1;
            }
            b';' | b',' | b'\n' if depth == 0 => break,
            _ => {}
        }
        start -= 1;
    }
    let lhs = source[start..eq].trim();
    let lhs = lhs
        .strip_prefix("let")
        .or_else(|| lhs.strip_prefix("const"))
        .or_else(|| lhs.strip_prefix("var"))
        .unwrap_or(lhs);
    lhs.contains(base)
}

/// Pre-pass: collect EVERY top-level declared binding name in the instance
/// script before rune detection runs. Official `svelte2tsx` resolves a
/// `$name` reference as a store auto-subscription (NOT the `$state`/`$derived`/
/// `$effect` rune) whenever `name` is a declared binding, using the COMPLETE
/// top-level scope. So `let state = $state(0)` must see its own `state` as
/// declared (→ legacy), while `let x = $state(0)` stays runes. Without this
/// pre-pass `declared_names` was still empty when a declarator's own
/// initializer was checked, over-detecting runes. Mirrors upstream
/// `ImplicitStoreValues` / `checkGlobalsForRunes`.
fn collect_top_level_declared_names(body: &[oxc::Statement]) -> HashSet<String> {
    fn add_var(vd: &oxc::VariableDeclaration, names: &mut HashSet<String>) {
        for d in vd.declarations.iter() {
            for n in extract_all_names_from_binding_pattern(&d.id) {
                names.insert(n);
            }
        }
    }
    let mut names = HashSet::new();
    for stmt in body {
        match stmt {
            oxc::Statement::VariableDeclaration(vd) => add_var(vd, &mut names),
            oxc::Statement::FunctionDeclaration(f) => {
                if let Some(id) = &f.id {
                    names.insert(id.name.to_string());
                }
            }
            oxc::Statement::ClassDeclaration(c) => {
                if let Some(id) = &c.id {
                    names.insert(id.name.to_string());
                }
            }
            oxc::Statement::TSModuleDeclaration(m) => {
                if let oxc_ast::ast::TSModuleDeclarationName::Identifier(id) = &m.id {
                    names.insert(id.name.to_string());
                }
            }
            oxc::Statement::TSEnumDeclaration(e) => {
                names.insert(e.id.name.to_string());
            }
            oxc::Statement::ImportDeclaration(imp) => {
                if let Some(specs) = &imp.specifiers {
                    for s in specs.iter() {
                        let n = match s {
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
                        names.insert(n);
                    }
                }
            }
            oxc::Statement::ExportNamedDeclaration(ex) => {
                if let Some(decl) = &ex.declaration {
                    match decl {
                        oxc::Declaration::VariableDeclaration(vd) => add_var(vd, &mut names),
                        oxc::Declaration::FunctionDeclaration(f) => {
                            if let Some(id) = &f.id {
                                names.insert(id.name.to_string());
                            }
                        }
                        oxc::Declaration::ClassDeclaration(c) => {
                            if let Some(id) = &c.id {
                                names.insert(id.name.to_string());
                            }
                        }
                        _ => {}
                    }
                }
            }
            _ => {}
        }
    }
    names
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
            for el in arr.elements.iter().flatten() {
                collect_binding_names(el, names);
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
            for el in arr.elements.iter().flatten() {
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
        let _ = write!(result, ";let ${} = __sveltets_2_store_get({});", name, name);
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
/// Reuses an already-parsed program (callers parse the instance script
/// once and pass the result here, avoiding a second OXC parse).
fn inject_store_subscriptions_with_program(
    program: &oxc::Program,
    offset: u32,
    source: &str,
    str: &mut MagicString,
) {
    let accessed_stores = collect_store_references(source);
    if accessed_stores.is_empty() {
        return;
    }

    let mut import_store_names: Vec<String> = Vec::new();

    for stmt in program.body.iter() {
        match stmt {
            oxc::Statement::VariableDeclaration(var_decl) => {
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

            oxc::Statement::ImportDeclaration(import) => {
                collect_import_store_names(import, &accessed_stores, &mut import_store_names);
            }

            oxc::Statement::ExportNamedDeclaration(export) => {
                if let Some(ref decl) = export.declaration
                    && let oxc::Declaration::VariableDeclaration(var_decl) = decl
                {
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

            oxc::Statement::LabeledStatement(labeled) if labeled.label.name == "$" => {
                let names = extract_names_from_labeled_body(&labeled.body);
                let matching: Vec<String> = names
                    .into_iter()
                    .filter(|n| accessed_stores.contains(n))
                    .collect();

                if !matching.is_empty() {
                    let inject_pos = labeled.span.end + offset;
                    let name_refs: Vec<&str> = matching.iter().map(|s| s.as_str()).collect();
                    let store_decls = create_store_declarations(&name_refs);
                    str.append_left(inject_pos, &store_decls);
                }
            }

            _ => {}
        }
    }

    collect_module_script_import_stores(source, &accessed_stores, &mut import_store_names);

    // Order the store-subscription declarations by first `$store` use in source
    // (official emits them in walk order), not alphabetically. Dedup preserving
    // that order.
    import_store_names.sort_by_key(|n| source.find(&format!("${}", n)).unwrap_or(usize::MAX));
    {
        let mut seen = std::collections::HashSet::new();
        import_store_names.retain(|n| seen.insert(n.clone()));
    }
    if !import_store_names.is_empty() {
        let name_refs: Vec<&str> = import_store_names.iter().map(|s| s.as_str()).collect();
        let store_decls = create_store_declarations(&name_refs);
        str.append_right(offset, &store_decls);
    }
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
    // Fast path: no `<script` substring → no module script.
    if !source.contains("<script") {
        return;
    }
    // Cache the regex once across calls. The previous implementation
    // compiled it on every call, which was measurable overhead given the
    // benchmark's 3000+ files.
    use std::sync::LazyLock;
    static MODULE_PATTERN: LazyLock<Regex> =
        LazyLock::new(|| Regex::new(r#"<script[^>]*context\s*=\s*["']module["'][^>]*>"#).unwrap());
    let module_match = match MODULE_PATTERN.find(source) {
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

    // Skip the OXC parse when there are no `import` declarations to find.
    if !raw_content.contains("import") {
        return;
    }

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
/// Reuses an already-parsed module program (callers parse the module
/// script once and pass the result here, avoiding a second OXC parse).
fn inject_store_subscriptions_vars_only_with_program(
    program: &oxc::Program,
    offset: u32,
    source: &str,
    str: &mut MagicString,
) {
    let accessed_stores = collect_store_references(source);
    if accessed_stores.is_empty() {
        return;
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
    fn collect_type_body_deps_handles_multibyte_before_ident() {
        // Regression for #719: the `typeof` lookbehind sliced `&body[j - 6..j]`
        // with raw byte arithmetic, which panicked when a multibyte (CJK)
        // char preceded an identifier (here `必須) */` before `imageSrc`).
        let body = "interface Props {\n\
            \u{20}\u{20}/** \u{30A2}\u{30D0}\u{30BF}\u{30FC} */\n\
            \u{20}\u{20}content: 'image' | 'initial' | 'count';\n\
            \u{20}\u{20}/** \u{753B}\u{50CF} (content='image' \u{306E}\u{5834}\u{5408}\u{306B}\u{5FC5}\u{9808}) */\n\
            \u{20}\u{20}imageSrc?: string;\n}";
        let candidates: HashSet<String> = HashSet::new();
        let generics: HashSet<String> = HashSet::new();
        let values: HashSet<String> = HashSet::new();
        let imports: HashSet<String> = HashSet::new();
        // Must not panic.
        let (_value_deps, _type_deps) =
            collect_type_body_deps(body, &candidates, "Props", &generics, &values, &imports);
    }

    #[test]
    fn svelte2tsx_does_not_panic_on_cjk_jsdoc() {
        // End-to-end guard for #719: a `<script lang="ts">` whose JSDoc
        // comments contain CJK characters used to abort the whole svelte2tsx
        // run with a char-boundary panic during overlay generation.
        let source = "<script lang=\"ts\">\n\
            \u{20}\u{20}interface Props {\n\
            \u{20}\u{20}\u{20}\u{20}/** \u{30A2}\u{30D0}\u{30BF}\u{30FC}\u{306E}\u{30B3}\u{30F3}\u{30C6}\u{30F3}\u{30C4} */\n\
            \u{20}\u{20}\u{20}\u{20}content: 'image' | 'initial' | 'count';\n\
            \u{20}\u{20}\u{20}\u{20}/** \u{753B}\u{50CF}\u{306E}\u{30BD}\u{30FC}\u{30B9} (content='image' \u{306E}\u{5834}\u{5408}\u{306B}\u{5FC5}\u{9808}) */\n\
            \u{20}\u{20}\u{20}\u{20}imageSrc?: string;\n\
            \u{20}\u{20}}\n\
            \u{20}\u{20}const { content, imageSrc }: Props = $props();\n\
            </script>\n\
            <p>{content}{imageSrc}</p>\n";
        let out = svelte2tsx(source, Svelte2TsxOptions::default()).expect("svelte2tsx ok");
        // Smoke check: the prop identifiers survived into the overlay.
        assert!(out.code.contains("imageSrc"));
    }

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

        // With $$ComponentProps typedef, the output uses the typedef
        assert!(
            result.code.contains("$$ComponentProps") || result.code.contains("x: x"),
            "Output should contain $$ComponentProps typedef or 'x: x' in props return.\nGot: {}",
            result.code
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

    // -- Bug 1: empty-props TS vs JS cast (addComponentExport.ts `props()`) --

    /// For a TS file with no props, the return statement must use the TS `as`
    /// cast form: `{} as Record<string, never>`.
    /// Reference: ExportedNames.ts `createPropsStr` runes-mode branch:
    ///   `return this.isTsFile ? '{} as Record<string, never>' : '/** @type ... */ ({})'`
    #[test]
    fn test_empty_props_ts_file_uses_as_cast() {
        let source = "<script lang=\"ts\">\nconst internal: number = 5;\n</script>";
        let opts = crate::svelte2tsx::svelte2tsx::Svelte2TsxOptions {
            is_ts_file: true,
            ..Default::default()
        };
        let result = svelte2tsx(source, opts).expect("svelte2tsx should not fail");
        assert!(
            result.code.contains("{} as Record<string, never>"),
            "TS file with no props must use `{{}} as Record<string, never>`, got:\n{}",
            result.code
        );
        assert!(
            !result.code.contains("/** @type {Record<string, never>} */"),
            "TS file must NOT use JSDoc cast for empty props, got:\n{}",
            result.code
        );
    }

    /// For a JS file with no props, the JSDoc cast form must be used:
    /// `/** @type {Record<string, never>} */ ({})`.
    /// Reference: same ExportedNames.ts branch, JS (non-TS) path.
    #[test]
    fn test_empty_props_js_file_uses_jsdoc() {
        let source = "<script>\nconst internal = 5;\n</script>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("/** @type {Record<string, never>} */"),
            "JS file with no props must use JSDoc cast, got:\n{}",
            result.code
        );
        assert!(
            !result.code.contains("{} as Record<string, never>"),
            "JS file must NOT use TS `as` cast for empty props, got:\n{}",
            result.code
        );
    }

    /// Runes-mode TS file with no props must also emit `{} as Record<string, never>`.
    /// Reference: ExportedNames.ts `createPropsStr` runes branch (same isTsFile check).
    #[test]
    fn test_empty_props_runes_ts_file_uses_as_cast() {
        // A runes component (uses $state) with no exported props in a TS file.
        let source_no_props = "<script lang=\"ts\">\nlet x = $state(0);\n</script>";
        let opts = crate::svelte2tsx::svelte2tsx::Svelte2TsxOptions {
            is_ts_file: true,
            ..Default::default()
        };
        let result = svelte2tsx(source_no_props, opts).expect("svelte2tsx should not fail");
        assert!(
            result.code.contains("{} as Record<string, never>"),
            "Runes-mode TS file with no props must use `{{}} as Record<string, never>`, got:\n{}",
            result.code
        );
    }

    // -- Bug 2: nested $effect (inside function body) triggers runes mode --

    /// A JS component with `$effect` called INSIDE a function body (not top-level)
    /// should still be detected as runes mode and emit `__sveltets_$$bindings("")`.
    /// Reference: ExportedNames.ts `checkGlobalsForRunes` which walks the entire AST.
    #[test]
    fn test_runes_effect_in_function_body() {
        let source = "<script>\nfunction myaction(node) {\n    $effect(() => {\n        // setup\n    });\n}\n</script>\n<div use:myaction>...</div>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("__sveltets_$$bindings"),
            "Component with $effect inside function body should be runes mode (emit __sveltets_$$bindings), got:\n{}",
            result.code
        );
        assert!(
            !result.code.contains("bindings: \"\""),
            "Runes mode must not emit `bindings: \"\"`, got:\n{}",
            result.code
        );
    }

    // -- Generic arrow disambiguation (#725) --

    #[test]
    fn test_generic_arrow_gets_trailing_comma() {
        // A bare single-parameter generic arrow `<T>` would be lexed as a JSX
        // element in the `.tsx` overlay; svelte2tsx must rewrite it to `<T,>`.
        let source =
            "<script lang=\"ts\">\nconst id = <T>(x: T): T => x;\n</script>\n<p>{id(1)}</p>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("<T,>(x: T)"),
            "Generic arrow should be disambiguated to `<T,>`.\nGot: {}",
            result.code
        );
        assert!(
            !result.code.contains("<T>(x: T)"),
            "The ambiguous `<T>` form must not survive into the overlay.\nGot: {}",
            result.code
        );
    }

    #[test]
    fn test_generic_arrow_already_safe_forms_untouched() {
        let source = "<script lang=\"ts\">\n\
            const multi = <T, U>(x: T, y: U): T => x;\n\
            const constrained = <T extends number>(x: T): T => x;\n\
            const defaulted = <T = string>(x: T): T => x;\n\
            const already = <T,>(x: T): T => x;\n\
            function fn<T>(x: T): T { return x; }\n\
            const call = fn<number>(1);\n\
            </script>";
        let result = run_svelte2tsx(source);
        // None of these forms are ambiguous in TSX, so they must be emitted
        // verbatim — in particular no double comma on the already-safe arrow.
        assert!(
            result.code.contains("<T, U>(x: T, y: U)"),
            "got: {}",
            result.code
        );
        assert!(
            result.code.contains("<T extends number>(x: T)"),
            "got: {}",
            result.code
        );
        assert!(
            result.code.contains("<T = string>(x: T)"),
            "got: {}",
            result.code
        );
        assert!(result.code.contains("<T,>(x: T)"), "got: {}", result.code);
        assert!(
            !result.code.contains("<T,,>"),
            "no double comma; got: {}",
            result.code
        );
        assert!(
            result.code.contains("function fn<T>(x: T)"),
            "got: {}",
            result.code
        );
        assert!(
            result.code.contains("fn<number>(1)"),
            "got: {}",
            result.code
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

    // =========================================================================
    // $$ComponentProps generation tests
    // Reference: ExportedNames.ts handle$propsRune / createPropsStr
    // =========================================================================

    /// Helper to run svelte2tsx with TS enabled
    fn run_svelte2tsx_ts(source: &str) -> crate::svelte2tsx::svelte2tsx::Svelte2TsxResult {
        svelte2tsx(
            source,
            Svelte2TsxOptions {
                filename: "Component.svelte".to_string(),
                is_ts_file: true,
                ..Default::default()
            },
        )
        .expect("svelte2tsx should not fail")
    }

    /// Case A: JS whole-object `let props = $props()` — no typedef, but props slot
    /// uses `/** @type {$$ComponentProps} */({})` (mirrors official behavior).
    /// Reference: ExportedNames.ts handle$propsRune, else-branch line 393.
    #[test]
    fn test_component_props_js_whole_object() {
        let source = "<script>\nlet props = $props();\n</script>\n<p>{props.x}</p>";
        let result = run_svelte2tsx(source);
        // No typedef should be emitted
        assert!(
            !result.code.contains("@typedef"),
            "JS whole-object: no @typedef expected, got:\n{}",
            result.code
        );
        // Props slot should use $$ComponentProps
        assert!(
            result.code.contains("/** @type {$$ComponentProps} */({})"),
            "JS whole-object: props slot should use $$ComponentProps, got:\n{}",
            result.code
        );
    }

    /// Case A-TS: TS whole-object `let props = $props()` — no typedef, but props slot
    /// uses `{} as any as $$ComponentProps` (mirrors official behavior).
    #[test]
    fn test_component_props_ts_whole_object() {
        let source = "<script lang=\"ts\">\nlet props = $props();\n</script>";
        let result = run_svelte2tsx_ts(source);
        // No typedef should be emitted
        assert!(
            !result.code.contains("type $$ComponentProps"),
            "TS whole-object: no type alias expected, got:\n{}",
            result.code
        );
        // Props slot should use $$ComponentProps
        assert!(
            result.code.contains("{} as any as $$ComponentProps"),
            "TS whole-object: props slot should use $$ComponentProps, got:\n{}",
            result.code
        );
    }

    /// Case B: TS with inline object type annotation — creates hoistable `$$ComponentProps` alias.
    /// `let { x }: { a: string } = $props()` →
    ///   `;type $$ComponentProps = { a: string };` (before $$render)
    ///   annotation becomes `/*Ωignore_start*/$$ComponentProps/*Ωignore_end*/`
    ///   props slot: `{} as any as $$ComponentProps`
    /// Reference: ExportedNames.ts handle$propsRune, TSTypeLiteral branch.
    #[test]
    fn test_component_props_ts_inline_object_type() {
        let source = "<script lang=\"ts\">\nlet { x }: { a: string } = $props();\n</script>";
        let result = run_svelte2tsx_ts(source);
        // Should emit type alias before $$render
        assert!(
            result.code.contains("type $$ComponentProps ="),
            "TS inline type: should emit $$ComponentProps alias, got:\n{}",
            result.code
        );
        // Annotation should be replaced with $$ComponentProps
        assert!(
            result.code.contains("$$ComponentProps"),
            "annotation should reference $$ComponentProps, got:\n{}",
            result.code
        );
        // Props slot should use `{} as any as $$ComponentProps`
        assert!(
            result.code.contains("{} as any as $$ComponentProps"),
            "props slot should use $$ComponentProps, got:\n{}",
            result.code
        );
    }

    /// Case C: TS with named type reference — uses type directly, no $$ComponentProps.
    /// `let { x }: Props = $props()` → props slot: `{} as any as Props`
    /// Reference: ExportedNames.ts handle$propsRune, TSTypeReferenceNode branch.
    #[test]
    fn test_component_props_ts_named_type_ref() {
        let source = "<script lang=\"ts\">\ninterface Props { x: string }\nlet { x }: Props = $props();\n</script>";
        let result = run_svelte2tsx_ts(source);
        // Should NOT emit $$ComponentProps alias
        assert!(
            !result.code.contains("type $$ComponentProps"),
            "TS named ref: should NOT emit $$ComponentProps alias, got:\n{}",
            result.code
        );
        // Props slot should use Props directly
        assert!(
            result.code.contains("{} as any as Props"),
            "TS named ref: props slot should use Props, got:\n{}",
            result.code
        );
    }

    /// Case D: TS with non-TSTypeReference annotation (e.g. TSIndexedAccessType) — creates $$ComponentProps.
    /// `let { x }: SvelteHTMLElements["div"] = $props()` →
    ///   `type $$ComponentProps = SvelteHTMLElements["div"];` (before $$render)
    ///   props slot: `{} as any as $$ComponentProps`
    /// Reference: ExportedNames.ts handle$propsRune, !isTypeReferenceNode branch.
    #[test]
    fn test_component_props_ts_indexed_access_type() {
        let source = "<script lang=\"ts\">\nlet { x }: SomeType[\"key\"] = $props();\n</script>";
        let result = run_svelte2tsx_ts(source);
        // Should emit $$ComponentProps alias
        assert!(
            result.code.contains("type $$ComponentProps ="),
            "TS indexed access: should emit $$ComponentProps alias, got:\n{}",
            result.code
        );
        assert!(
            result.code.contains("{} as any as $$ComponentProps"),
            "TS indexed access: props slot should use $$ComponentProps, got:\n{}",
            result.code
        );
    }

    /// Case E: JS with inline JSDoc type `/** @type {{ a: string }} */`.
    /// The `@type` is rewritten to `@typedef` and the type is renamed to `$$ComponentProps`.
    /// Reference: ExportedNames.ts handle$propsRune, JSDoc inline object branch.
    #[test]
    fn test_component_props_js_jsdoc_inline_type() {
        let source = "<script>\n/** @type {{ adjective: string }} */\nlet { adjective } = $props();\n</script>";
        let result = run_svelte2tsx(source);
        // Should have @typedef with $$ComponentProps
        assert!(
            result.code.contains("@typedef"),
            "JS JSDoc inline: should have @typedef, got:\n{}",
            result.code
        );
        assert!(
            result.code.contains("$$ComponentProps"),
            "JS JSDoc inline: should reference $$ComponentProps, got:\n{}",
            result.code
        );
        assert!(
            result.code.contains("/** @type {$$ComponentProps} */({})"),
            "JS JSDoc inline: props slot should use $$ComponentProps, got:\n{}",
            result.code
        );
        // The @typedef should have two spaces before $$ComponentProps (preserving original trailing space)
        assert!(
            result.code.contains("}}  $$ComponentProps"),
            "JS JSDoc inline: should have two spaces before $$ComponentProps (orig space preserved), got:\n{}",
            result.code
        );
    }

    /// Case F: JS destructure with rest element + named props.
    /// `let { a, ...rest } = $props()` →
    ///   `@typedef {{ a: any } & Record<string, any>} $$ComponentProps`
    /// Reference: ExportedNames.ts, lines 369-370.
    #[test]
    fn test_component_props_js_rest_with_named_props() {
        let source = "<script>\nlet { a, ...rest } = $props();\n</script>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("{ a: any } & Record<string, any>"),
            "JS rest+named: type should include named props AND Record, got:\n{}",
            result.code
        );
    }

    /// Case G: JS destructure with only rest element.
    /// `let { ...rest } = $props()` → `@typedef {Record<string, any>} $$ComponentProps`
    #[test]
    fn test_component_props_js_rest_only() {
        let source = "<script>\nlet { ...rest } = $props();\n</script>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("Record<string, any>"),
            "JS rest-only: type should be Record<string, any>, got:\n{}",
            result.code
        );
    }

    /// Case H: JS empty destructure `let {} = $props()`.
    /// No typedef, but props slot uses `/** @type {$$ComponentProps} */({})`.
    /// Reference: ExportedNames.ts, empty ObjectBindingPattern path (propsStr = Record<string,never>
    /// but $props.comment = '/** @type {$$ComponentProps} */').
    #[test]
    fn test_component_props_js_empty_destructure() {
        let source = "<script>\nlet {} = $props();\n</script>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("/** @type {$$ComponentProps} */({})"),
            "JS empty destructure: props slot should use $$ComponentProps, got:\n{}",
            result.code
        );
        // No typedef should be inserted (only the @type comment in props slot)
        assert!(
            !result.code.contains("@typedef"),
            "JS empty destructure: no @typedef expected, got:\n{}",
            result.code
        );
    }

    /// Case I: JS with non-identifier property key (string literal key).
    /// `let { 'kebab-case': x } = $props()` → `withUnknown = true` → `Record<string, any>`
    /// Reference: ExportedNames.ts withUnknown condition line 299-303.
    #[test]
    fn test_component_props_js_non_identifier_key() {
        let source = "<script>\nlet { 'kebab-case': x } = $props();\n</script>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("Record<string, any>"),
            "JS non-identifier key: should generate Record<string, any>, got:\n{}",
            result.code
        );
    }
}
