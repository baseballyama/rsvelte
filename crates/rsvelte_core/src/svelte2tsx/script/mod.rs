//! Script processing for svelte2tsx.
//!
//! Handles `<script>` and `<script context="module">` blocks in Svelte components.
//! Extracts exported names, component events, and prop declarations to generate
//! proper TypeScript type information.
//!
//! Script AST is obtained by re-parsing the raw script content via OXC and walking
//! the OXC AST directly. This avoids dependency on the thread-local ParseArena
//! used by the main compiler, keeping svelte2tsx self-contained.

mod ast_utils;
mod component_events;
mod hoistable_types;
mod parse;
mod runes;
#[cfg(test)]
mod test_support;
mod type_assertion;

use std::collections::{HashMap, HashSet};
use std::fmt::Write as _;

use oxc_allocator::Allocator;
use oxc_ast::ast as oxc;
use oxc_ast_visit::Visit;
use oxc_parser::Parser as OxcParser;
use oxc_span::{GetSpan, SourceType};

use crate::ast::template::Script;

use super::magic_string::MagicString;
use super::svelte2tsx::slice_src;

pub use component_events::{ComponentEvents, EventInfo};

use ast_utils::{
    binding_pattern_simple_name, collect_binding_names, collect_top_level_declared_names,
    declarator_has_boolean_init, extract_all_names_from_binding_pattern,
    extract_names_from_assignment_target, extract_names_from_binding_pattern_full,
    module_export_name_to_string, property_key_to_string,
};
use hoistable_types::{
    HoistCandidate, hoist_dollar_generic_referenced_types, is_ident_char_for_str,
    is_special_type_name, resolve_hoistable_type_decls, rewrite_interface_to_type_dts,
    walk_back_through_trivia,
};
use parse::with_parsed_script;
use runes::{
    detect_rune_in_class_body, detect_rune_in_expr, detect_rune_in_nested_body, detect_runes_call,
    detect_runes_expr_stmt, excluded_rune_init, scope_with_params,
};
use type_assertion::{disambiguate_arrow_type_params, rewrite_type_assertions_with_program};

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
    /// Whether a legacy `type $$Props` / `interface $$Props` is declared.
    pub uses_dollar_props_type: bool,
    /// Whether `$$Slots` type/interface is declared in the script
    pub has_slots_type: bool,
    /// Whether `$$Events` type/interface is declared in the script
    pub has_events_type: bool,
    /// Absolute source position of the FIRST `$$Events` interface / type
    /// declaration, if any. Official only injects `<__sveltets_2_CustomEvents<
    /// $$Events>>` onto an untyped `createEventDispatcher()` when the `$$Events`
    /// declaration was already seen earlier in the single source-order walk
    /// (`ComponentEventsFromInterface.isPresent()` gate), so the injection is
    /// gated on the dispatcher position coming AFTER this.
    pub events_type_decl_pos: Option<u32>,
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
    /// Base names of `$X` references found in the instance script raw source,
    /// WITHOUT applying the rune-exclusion filter.
    ///
    /// The official JS svelte2tsx's `processInstanceScriptContent` calls
    /// `resolveStore` for every `$X` identifier in the instance script via
    /// `pendingStoreResolutions`. Due to a broken `parent.parent` check in
    /// `is_rune` (TypeScript AST nodes don't have parent pointers set), the
    /// exclusion for `$props`/`$state`/`$derived` never fires in practice —
    /// they ALL land in `accessedStores` and then `addDisallowed(...)` puts
    /// their base names into `disallowed_values`. A snippet that references
    /// plain `props` (e.g. from a nested `{#snippet child({ props })}`) will
    /// therefore be blocked from module-scope hoisting.
    ///
    /// This field replicates that behaviour: populated by scanning the raw
    /// instance script text for `$name` patterns without the rune filter.
    pub instance_script_loose_dollar_names: HashSet<String>,
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
    /// Absolute source range of the inline type argument in `$props<{ ... }>()`.
    /// When set, the type arg is moved to `scriptStart` (like other hoistable types)
    /// with `\ntype $$ComponentProps = ` prepended and `;` appended.
    /// The original position gets `/*Ωignore_startΩ*/ $$ComponentProps /*Ωignore_endΩ*/`
    /// inserted via `append_right`.
    /// Mirrors upstream's `analyze$propsRune` → `moveHoistableInterfaces` for `$$ComponentProps`.
    pub props_type_arg_hoist: Option<(u32, u32)>,
    /// True when `$props<{ ... }>()` (inline non-named type arg) form is used and the type
    /// is being moved to scriptStart via `props_type_arg_hoist`. In this case `create_props_str`
    /// should return `{} as any as $$ComponentProps` even without `props_type_text` being set
    /// (to avoid triggering `ts_component_props_before_render`).
    pub props_type_arg_hoist_ts: bool,
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
    /// Initializer is a boolean literal (`let x = false`). Like official's
    /// `propTypeAssertToUserDefined`, this still forces the `__sveltets_2_any`
    /// widen (TS would otherwise narrow `x` to the `false`/`true` literal type).
    has_boolean_init: bool,
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
            uses_dollar_props_type: false,
            has_slots_type: false,
            has_events_type: false,
            events_type_decl_pos: None,
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
            props_type_arg_hoist: None,
            props_type_arg_hoist_ts: false,
            instance_script_loose_dollar_names: HashSet::new(),
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
    /// Mirror official `addExport` overwriting an existing entry when a binding
    /// already added by `export let local` (Case 1) is later renamed via
    /// `export { local as exported }`. Official keys its `exports` map by the
    /// LOCAL name, so the rename overwrites the same entry in place. An
    /// `export let` is NOT a "possible export", so `existingDeclaration` is
    /// undefined inside `addExport`: `isLet` falls to `false`, the type is
    /// dropped, and the doc comes only from the `export { … }` statement's own
    /// leading comment (`getDoc(target)`), never the declaration's. rsvelte keys
    /// by the EXPORTED name, so emulate the overwrite by relocating the
    /// `local`-keyed entry to the `exported` key at its original insertion
    /// position instead of appending a duplicate entry.
    pub fn rename_export_let_in_place(
        &mut self,
        local: &str,
        exported: String,
        doc: Option<String>,
    ) {
        let Some(mut info) = self.names.remove(local) else {
            return;
        };
        info.local_name = local.to_string();
        info.is_let = false;
        info.is_named_export = true;
        info.type_annotation = None;
        info.doc = doc;
        match self.insertion_order.iter().position(|k| k == local) {
            Some(pos) => self.insertion_order[pos] = exported.clone(),
            None => self.insertion_order.push(exported.clone()),
        }
        self.names.insert(exported, info);
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
            // Type-arg hoist case: `$props<{ ... }>()` with type moved to scriptStart
            if self.props_type_arg_hoist_ts {
                return "{} as any as $$ComponentProps".to_string();
            }
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
        // Legacy `$$Props` type/interface (TS only): mirror official's
        // `uses$$Props` branch — wrap the props in `__sveltets_2_ensureRightProps`
        // and assert against `$$Props` (with non-`let` exports `& `-joined in).
        // Reference: ExportedNames.ts createPropsStr uses$$Props branch.
        if self.uses_dollar_props_type && is_ts {
            // Mirror official `createReturnElementsType`: each member is prefixed
            // with its leading JSDoc (`addDoc` defaults true), so a `/** … */`
            // comment on the `export let` survives into the `$$Props` type list.
            let type_entry = |en: &str, info: &ExportedNameInfo| -> String {
                let optional = if info.has_default || !info.is_let {
                    "?"
                } else {
                    ""
                };
                let doc = match &info.doc {
                    Some(d) => format!("{} ", d),
                    None => String::new(),
                };
                match &info.type_annotation {
                    Some(ta) => format!("{}{}{}: {}", doc, en, optional, ta),
                    None => format!("{}{}{}: typeof {}", doc, en, optional, info.local_name),
                }
            };
            let lets: Vec<String> = self
                .get_ordered()
                .iter()
                .filter(|(_, info)| info.is_let)
                .map(|(en, info)| type_entry(en, info))
                .collect();
            let others: Vec<String> = self
                .get_ordered()
                .iter()
                .filter(|(_, info)| !info.is_let)
                .map(|(en, info)| type_entry(en, info))
                .collect();
            let others_prefix = if others.is_empty() {
                String::new()
            } else {
                format!("{{{}}} & ", others.join(","))
            };
            return format!(
                "{{ ...__sveltets_2_ensureRightProps<{{{}}}>(__sveltets_2_any(\"\") as $$Props)}} as {}$$Props",
                lets.join(","),
                others_prefix
            );
        }
        // Mirror official `dontAddTypeDef` (ExportedNames.ts createPropsStr):
        // omit the `as {…}` cast entirely when every export is untyped AND
        // required — a plain `export let x` with no default and no type
        // annotation (`required = !initializer`). A typed or defaulted /
        // optional export (or any non-`let` export) forces the cast. Computed
        // up-front because it also gates whether the *value* elements carry the
        // leading JSDoc (official `createReturnElements`: doc when dontAddTypeDef).
        let dont_add_type_def = !is_ts
            || self.get_ordered().iter().all(|(_, info)| {
                info.type_annotation.is_none() && info.is_let && !info.has_default
            });
        // When `dontAddTypeDef`, the props object omits the `as {…}` type assert,
        // so a captured leading JSDoc `/** … */` is emitted before the prop's
        // value element — mirrors official `createReturnElements`.
        let entries: Vec<String> = self
            .get_ordered()
            .iter()
            .map(|(en, info)| match &info.doc {
                Some(doc) if dont_add_type_def => format!("{} {}: {}", doc, en, info.local_name),
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
            if is_ts && !dont_add_type_def {
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
                        // A leading block comment on the export is preserved
                        // before its type-cast entry (official emits the doc here).
                        let doc = match &info.doc {
                            Some(d) => format!("{} ", d),
                            None => String::new(),
                        };
                        if let Some(ref ta) = info.type_annotation {
                            format!("{}{}{}: {}", doc, en, optional, ta)
                        } else {
                            format!("{}{}{}: typeof {}", doc, en, optional, info.local_name)
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
                    // In TS files, doc comments are included (addDoc = true in JS reference).
                    // In JS files, addDoc = false — no doc prefix.
                    let doc_prefix = if is_ts {
                        match &info.doc {
                            Some(d) => format!("\n{}", d),
                            None => String::new(),
                        }
                    } else {
                        String::new()
                    };
                    if let Some(ref ta) = info.type_annotation {
                        format!("{}{}: {}", doc_prefix, en, ta)
                    } else {
                        format!("{}{}: typeof {}", doc_prefix, en, info.local_name)
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
    /// Whether the $props() call has a type argument: `$props<TypeArg>()`
    has_type_arg: bool,
    /// Start of the type argument (relative to raw_content), for `$props<TypeArg>()`
    type_arg_start: Option<u32>,
    /// End of the type argument (relative to raw_content), for `$props<TypeArg>()`
    type_arg_end: Option<u32>,
    /// Text of the type argument
    type_arg_text: Option<String>,
    /// Whether the type argument is a plain named type reference (TSTypeReference),
    /// e.g. `$props<Props>()` — used directly without creating `$$ComponentProps`.
    type_arg_is_named_ref: bool,
}

// =============================================================================
// Script Processing
// =============================================================================

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

/// Process an instance script block (`<script>`).
///
/// Extracts:
/// - Exported variables (props in Svelte 4, or named exports)
/// - `$props()` usage (Svelte 5 runes)
/// - Event dispatcher declarations
/// - Store subscriptions
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
        // Usually one `$props()`; a duplicate `$props()` (a compiler error, but
        // svelte2tsx still compiles it) gets the inline `$$ComponentProps`
        // typedef on EACH destructure, so collect all of them.
        let mut props_rune_infos: Vec<PropsRuneInfo> = Vec::new();

        for (stmt_index, stmt) in program.body.iter().enumerate() {
            match stmt {
                oxc::Statement::VariableDeclaration(var_decl) => {
                    // Mirror official `isLet = flags === NodeFlags.Let`: only a
                    // `let` binding is a reactive prop. `var`/`const` are exports
                    // (`export var x` / `export { v }` where `v` is var/const go
                    // into the `exports:` return, not `props:`).
                    let is_let = matches!(var_decl.kind, oxc::VariableDeclarationKind::Let);
                    for declarator in var_decl.declarations.iter() {
                        detect_runes_call(declarator, exported_names, &declared_names);
                        detect_props_rune_oxc(declarator, exported_names, raw_content);
                        // Detect createEventDispatcher<Type>() calls
                        detect_create_event_dispatcher(declarator, raw_content, _events, offset);
                        // Collect $props() info for typedef generation (one per
                        // `$props()` destructure).
                        if let Some(info) = collect_props_rune_info(
                            var_decl,
                            declarator,
                            raw_content,
                            program,
                            stmt_index,
                        ) {
                            props_rune_infos.push(info);
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
                                    has_boolean_init: declarator_has_boolean_init(declarator),
                                    decl_end: declarator.span.end,
                                    type_annotation_text: ta_text,
                                    doc: leading_jsdoc_comment(
                                        raw_content,
                                        var_decl.span.start as usize,
                                    ),
                                },
                            );
                        } else {
                            // Destructured bindings (`let { a, c } = …`) are not a
                            // single simple name, but each name can still be
                            // re-exported via `export { a, c }`. Record them as
                            // possible exports so the specifier handler resolves
                            // the correct `is_let` (a `let` destructure → prop).
                            for name in &names {
                                possible_exports.insert(
                                    name.clone(),
                                    PossibleExport {
                                        is_let,
                                        has_init: declarator.init.is_some(),
                                        has_type_annotation: false,
                                        has_boolean_init: false,
                                        decl_end: declarator.span.end,
                                        type_annotation_text: None,
                                        doc: None,
                                    },
                                );
                            }
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
                                // Only `let` is a reactive prop; `var`/`const` are
                                // exports (mirror official isLet === NodeFlags.Let).
                                let is_let =
                                    matches!(var_decl.kind, oxc::VariableDeclarationKind::Let);
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
                                                has_boolean_init: declarator_has_boolean_init(
                                                    declarator,
                                                ),
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
                                // Runes inside an exported function body still
                                // put the component in runes mode.
                                if let Some(ref body) = func.body {
                                    let scope = scope_with_params(&declared_names, &func.params);
                                    if detect_rune_in_nested_body(&body.statements, &scope) {
                                        exported_names.set_uses_runes(true);
                                    }
                                }
                            }
                            oxc::Declaration::ClassDeclaration(class) => {
                                if let Some(ref id) = class.id {
                                    declared_names.insert(id.name.to_string());
                                }
                                // `export class C { x = $state(0) }` → runes mode.
                                if detect_rune_in_class_body(class, &declared_names) {
                                    exported_names.set_uses_runes(true);
                                }
                            }
                            // `export type X = ...` / `export interface X { ... }`.
                            //
                            // In TypeScript these are still TypeAliasDeclaration /
                            // InterfaceDeclaration nodes (the `export` is just a
                            // modifier), so official svelte2tsx
                            // (`HoistableInterfaces.analyzeInstanceScriptNode`)
                            // treats them exactly like their non-exported forms —
                            // they become hoist candidates and `instance_type_names`
                            // entries. OXC instead wraps them in an
                            // `ExportNamedDeclaration`, so we have to unwrap and
                            // register the inner declaration here. Without this an
                            // exported type that another (hoisted) interface depends
                            // on stays trapped inside `$$render()` and goes out of
                            // scope (#963).
                            //
                            // The candidate span starts at the `export` keyword so
                            // the modifier travels with the declaration when it is
                            // moved above `$$render()`, preserving the component's
                            // public type surface.
                            oxc::Declaration::TSTypeAliasDeclaration(type_alias) => {
                                let name = type_alias.id.name.to_string();
                                exported_names.instance_type_names.insert(name.clone());
                                if !is_special_type_name(&name) {
                                    candidates.push(HoistCandidate {
                                        name,
                                        rel_start: export.span.start,
                                        rel_end: type_alias.span.end,
                                    });
                                }
                            }
                            oxc::Declaration::TSInterfaceDeclaration(iface) => {
                                let name = iface.id.name.to_string();
                                exported_names.instance_type_names.insert(name.clone());
                                if !is_special_type_name(&name) {
                                    candidates.push(HoistCandidate {
                                        name,
                                        rel_start: export.span.start,
                                        rel_end: iface.span.end,
                                    });
                                }
                                if is_dts_mode {
                                    rewrite_interface_to_type_dts(iface, raw_content, offset, str);
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
                        if exported_names.events_type_decl_pos.is_none() {
                            exported_names.events_type_decl_pos = Some(offset + iface.span.start);
                        }
                    } else if name == "$$Props" {
                        exported_names.uses_dollar_props_type = true;
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
                        if exported_names.events_type_decl_pos.is_none() {
                            exported_names.events_type_decl_pos =
                                Some(offset + type_alias.span.start);
                        }
                    } else if name == "$$Props" {
                        exported_names.uses_dollar_props_type = true;
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
            } else if let oxc::Statement::ExportDefaultDeclaration(export) = stmt {
                // Instance scripts can't have `export default` (svelte rejects
                // it). Official svelte2tsx blanks just the `export` keyword for a
                // default-exported FUNCTION or CLASS declaration, leaving
                // `default function …`/`default class …` (invalid TSX → oxfmt
                // skips → raw output). A default-exported EXPRESSION
                // (`export default 42`) is kept verbatim. Mirror that.
                let is_decl = matches!(
                    export.declaration,
                    oxc::ExportDefaultDeclarationKind::FunctionDeclaration(_)
                        | oxc::ExportDefaultDeclarationKind::ClassDeclaration(_)
                );
                if is_decl {
                    let start = export.span.start + offset;
                    str.overwrite(start, start + 6, "");
                }
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
        let script_source = slice_src(source, script.start as usize, script.end as usize);
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

        // Collect loose `$name` references from the instance script WITHOUT the
        // rune-exclusion filter.  The official JS svelte2tsx's `is_rune` check is
        // broken at runtime (TypeScript parent pointers are not set) so ALL `$X`
        // identifiers — including `$props`, `$bindable`, `$state` etc. — end up in
        // `accessedStores`.  Their base names are then added to `disallowed_values`
        // via `addDisallowed(implicitStoreValues.getAccessedStores())`, which causes
        // snippets that reference `props` / `bindable` / etc. as plain identifiers
        // (e.g. from a nested `{#snippet child({ props })}`) to be treated as
        // non-hoistable.  Mirroring that behaviour here.
        for name in collect_loose_dollar_names_from_script(raw_content) {
            exported_names
                .instance_script_loose_dollar_names
                .insert(name);
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
        if let Some(info) = props_rune_infos.first() {
            // Determine the props-interface for gating. Mirrors official
            // `HoistableInterfaces.analyze$propsRune` / `moveHoistableInterfaces`:
            // when the `$props()` annotation is a bare named reference
            // (`: Props`), that interface IS the props interface; otherwise the
            // synthetic `$$ComponentProps` (built from the inline annotation) is.
            // Either way, NOTHING is hoisted unless the props interface itself is
            // hoistable — see `resolve_hoistable_type_decls`.
            // Determine the effective type source: type-arg form takes priority over
            // annotation form (mirrors upstream `typeArguments?.[0] || node.type`).
            let effective_is_named_ref = if info.has_type_arg && !info.has_type_annotation {
                info.type_arg_is_named_ref
            } else {
                info.is_named_type_reference
            };
            let effective_type_text: Option<&str> =
                if info.has_type_arg && !info.has_type_annotation {
                    info.type_arg_text.as_deref()
                } else {
                    info.type_text.as_deref()
                };
            let effective_has_type = info.has_type_annotation || info.has_type_arg;

            let props_named_ref: Option<String> = if effective_is_named_ref {
                effective_type_text.map(|t| {
                    // `Props` or `Props<T>` → root name `Props`.
                    t.split(|ch: char| !is_ident_char_for_str(ch))
                        .find(|s| !s.is_empty())
                        .unwrap_or("")
                        .to_string()
                })
            } else {
                None
            };
            let props_inline_type: Option<&str> = if effective_is_named_ref || !effective_has_type {
                None
            } else {
                effective_type_text
            };
            resolve_hoistable_type_decls(
                &candidates,
                raw_content,
                offset,
                exported_names,
                script_generic_names,
                props_named_ref.as_deref(),
                props_inline_type,
            );
        }

        // Pass 4: Apply $props() $$ComponentProps typedef transformations. With a
        // duplicate `$props()` each destructure gets its own inline typedef
        // (matches official, which re-emits `@typedef … $$ComponentProps` per
        // call); the single-valued `ExportedNames` fields used by the return are
        // idempotent across calls.
        for info in &props_rune_infos {
            apply_props_typedef(
                info,
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

        // Pass 7: rewrite TS angle-bracket type assertions (`<X>e` → `e as X`)
        // anywhere in the instance script — TSX cannot parse the `<X>e` form.
        // Mirrors official `handleTypeAssertion`, applied during the same walk.
        rewrite_type_assertions_with_program(program, offset as usize, str);
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
    if info.has_type_arg && !info.has_type_annotation {
        // TS type-argument form: `let { ... } = $props<TypeArg>()`
        // Mirrors upstream ExportedNames.ts handle$propsRune "Easy mode":
        //   `if (node.initializer.typeArguments?.length > 0 || node.type)`
        if info.type_arg_is_named_ref {
            // `$props<Props>()` → use Props directly, no $$ComponentProps needed.
            // props_type_text is already set by detect_props_rune_oxc.
            // No source manipulation needed.
        } else {
            // `$props<{ data: T; flag?: boolean }>()` → synthesize $$ComponentProps.
            // Mirror upstream's move-to-scriptStart mechanism:
            //   1. prepend_right(arg_start, ";type $$ComponentProps = ") — travels with chunk
            //   2. append_left(arg_end, ";") — travels with chunk
            //   3. move_range(arg_start, arg_end, scriptStart) — done in svelte2tsx.rs
            //   4. append_right(arg_end, "/*...$$ComponentProps...*/") — stays at original position
            // The move_range + append_right means the inline type is hoisted outside $$render
            // and the call site gets `$props</*Ωignore_startΩ*/ $$ComponentProps /*Ωignore_endΩ*/>()`.
            if let (Some(arg_start), Some(arg_end)) = (info.type_arg_start, info.type_arg_end) {
                let abs_start = arg_start + offset;
                let abs_end = arg_end + offset;
                // Prepend `;type $$ComponentProps = ` before the inline type (travels with move)
                str.prepend_right(abs_start, "\ntype $$ComponentProps = ");
                // Append `;` after the inline type (travels with move)
                str.append_left(abs_end, ";");
                // After the move, place $$ComponentProps reference at the original location.
                // This must be done BEFORE the move_range call in svelte2tsx.rs (or at any time,
                // since append_right inserts into the intro of the chunk at abs_end, which is NOT
                // the moved chunk but the chunk that starts right after abs_end).
                str.append_right(
                    abs_end,
                    "/*\u{03A9}ignore_start\u{03A9}*/ $$ComponentProps /*\u{03A9}ignore_end\u{03A9}*/",
                );
                // Signal svelte2tsx.rs to call move_range(abs_start, abs_end, scriptStart)
                exported_names.props_type_arg_hoist = Some((abs_start, abs_end));
                exported_names.props_type_arg_hoist_ts = true;
            }
            exported_names.has_component_props_typedef = true;
        }
        return;
    }

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

        // Only synthesise the `$$ComponentProps` alias + `: $$ComponentProps`
        // annotation when there is something to type — i.e. at least one inferred
        // prop OR a rest/unknown widening. Mirrors upstream ExportedNames.ts
        // `if (props.length > 0 || withUnknown)` (line 384): when the inference
        // yields `Record<string, never>` (e.g. a SvelteKit route file whose only
        // props are non-kit names, or `let { x = $bindable() } = $props()` on a
        // `+page.svelte`), upstream emits NOTHING — no alias, no annotation —
        // leaving `$props()` untyped. The `$bindable()` ignore markers below are
        // emitted regardless.
        let emit_props_typedef = !type_entries.is_empty() || with_unknown;
        if !emit_props_typedef {
            // Inference collapsed to `Record<string, never>`, so no alias /
            // annotation is emitted — but upstream still sets
            // `this.$props.type = '$$ComponentProps'` (ExportedNames.ts line 383,
            // outside the `props.length > 0 || withUnknown` guard), so the
            // component's return type is `{} as any as $$ComponentProps`
            // (TS) / `/** @type {$$ComponentProps} */({})` (JS) — identical to
            // the whole-object/untyped `$props()` case handled above.
            if is_ts {
                exported_names.props_type_text = Some("$$ComponentProps".to_string());
            } else {
                exported_names.has_component_props_typedef = true;
            }
        } else if is_ts {
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
            // `preprendStr(node.parent.pos + astOffset, ...)`. `node.parent.pos`
            // spans the declaration's *leading trivia*, so the insertion lands
            // BEFORE any `//` / `/* */` comments that precede the `let` — walk
            // back through them too, otherwise the typedef gets appended onto a
            // preceding `// …` line and is swallowed by that line comment.
            let raw_bytes = raw_content.as_bytes();
            let p = walk_back_through_trivia(raw_bytes, info.let_pos as usize);
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
        rewrite_type_assertions_with_program(program, offset as usize, str);

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
        //
        // Type-only declarations (`export type X` / `export interface X`) are the
        // exception: official svelte2tsx keeps their `export` keyword (they're
        // moved verbatim by `HoistableInterfaces` and re-surface as part of the
        // component's type API), so stripping it here would both diverge from
        // upstream and, once the declaration is hoisted above `$$render()`,
        // leave a dangling space. Skip the strip for those.
        let is_type_only_decl = matches!(
            decl,
            oxc::Declaration::TSTypeAliasDeclaration(_)
                | oxc::Declaration::TSInterfaceDeclaration(_)
        );
        if is_instance && !is_type_only_decl && decl_start > node_start {
            str.overwrite(node_start, decl_start, " ");
        }

        match decl {
            oxc::Declaration::VariableDeclaration(var_decl) => {
                let kind = var_decl.kind;
                // Only `let` is a reactive prop; `var`/`const` are exports.
                let is_let = matches!(kind, oxc::VariableDeclarationKind::Let);
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
                        let leading_doc =
                            leading_jsdoc_comment(raw_content, export.span.start as usize);
                        if let Some(name) = binding_pattern_simple_name(&declarator.id)
                            && let Some(ref doc) = leading_doc
                        {
                            exported_names.set_doc(&name, doc.clone());
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
                        // A JSDoc `/** @type {T} */` on the export is a type too,
                        // so a `/** @type {number} */ export let x = 1` widens via
                        // `x = __sveltets_2_any(x)` even with an initializer.
                        let has_jsdoc_type =
                            leading_jsdoc_comment(raw_content, export.span.start as usize)
                                .is_some_and(|d| d.contains("@type"));
                        let do_widen = is_prop
                            && (!has_default
                                || has_type_annotation
                                || has_boolean_init
                                || has_jsdoc_type);

                        // SvelteKit `+page.svelte` / `+layout.svelte`: the
                        // `import('./$types.js').*` annotation for well-known prop
                        // names / `export const snapshot`. Computed before the
                        // widener so the two combine into ONE ignore block in the
                        // right order (`: KitType; x = any(x);`), not separate
                        // out-of-order blocks. Mirrors `emitKitType`.
                        let kit_type: Option<&str> = if is_instance && !has_type_annotation {
                            binding_pattern_simple_name(&declarator.id).and_then(|name| {
                                classify_kit_route_file(basename).and_then(|layout| {
                                    if !is_let {
                                        match name.as_str() {
                                            "snapshot" => Some("import('./$types.js').Snapshot"),
                                            _ => None,
                                        }
                                    } else {
                                        match (name.as_str(), layout) {
                                            ("data", true) => {
                                                Some("import('./$types.js').LayoutData")
                                            }
                                            ("data", false) => {
                                                Some("import('./$types.js').PageData")
                                            }
                                            ("form", false) => {
                                                Some("import('./$types.js').ActionData")
                                            }
                                            ("params", true) => {
                                                Some("import('./$types.js').LayoutProps['params']")
                                            }
                                            ("params", false) => {
                                                Some("import('./$types.js').PageProps['params']")
                                            }
                                            _ => None,
                                        }
                                    }
                                })
                            })
                        } else {
                            None
                        };

                        if let Some(name) = binding_pattern_simple_name(&declarator.id) {
                            let use_jsdoc = emit_jsdoc && !is_ts;
                            let (id_start, id_end) = match &declarator.id {
                                oxc::BindingPattern::BindingIdentifier(id) => {
                                    (id.span.start + offset, id.span.end + offset)
                                }
                                _ => (declarator.span.end + offset, declarator.span.end + offset),
                            };
                            let widen_pos = declarator.span.end + offset;
                            if do_widen
                                && let Some(kit) = kit_type
                                && !use_jsdoc
                            {
                                // Combined: type annotation + widener, one block.
                                str.append_left(
                                    id_end,
                                    &format!(
                                        "/*\u{03A9}ignore_start\u{03A9}*/: {kit}; {name} = __sveltets_2_any({name});/*\u{03A9}ignore_end\u{03A9}*/"
                                    ),
                                );
                            } else {
                                if do_widen {
                                    str.append_left(
                                        widen_pos,
                                        &format!(
                                            "/*\u{03A9}ignore_start\u{03A9}*/;{name} = __sveltets_2_any({name});/*\u{03A9}ignore_end\u{03A9}*/"
                                        ),
                                    );
                                }
                                if let Some(kit) = kit_type {
                                    if use_jsdoc {
                                        str.append_left(
                                            id_start,
                                            &format!("/** @type {{{}}} */ ", kit),
                                        );
                                    } else {
                                        str.append_left(
                                            id_end,
                                            &format!(
                                                "/*\u{03A9}ignore_start\u{03A9}*/: {}/*\u{03A9}ignore_end\u{03A9}*/",
                                                kit
                                            ),
                                        );
                                    }
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
            // Mirror official `addExport`: `doc: this.getDoc(target) ||
            // existingDeclaration?.doc`. For a RENAMED export (`export { x as y }`,
            // `target = y`), `getDoc` reads the leading comment on the
            // `export { … }` statement itself first, then falls back to the
            // `let x` declaration's leading doc. A plain (non-renamed)
            // `export { x }` passes `target = undefined`, so `getDoc` is skipped
            // and only the declaration's doc applies.
            let renamed = local != exported;

            // Collision: `export let local; … export { local as exported }`.
            // The binding was already registered as a prop by Case 1 (keyed by
            // `local`). Official overwrites that same (local-keyed) entry in
            // place — see `rename_export_let_in_place`. The doc comes ONLY from
            // the `export { … }` statement's leading comment (an `export let` is
            // not a possible-export, so its declaration doc does not carry over),
            // and `propTypeAssert` is NOT re-run, so no extra widening here.
            if renamed && exported_names.has(&local) {
                let merged_doc = leading_jsdoc_comment(raw_content, export.span.start as usize);
                exported_names.rename_export_let_in_place(&local, exported.clone(), merged_doc);
                continue;
            }

            let doc = if renamed {
                leading_jsdoc_comment(raw_content, export.span.start as usize)
                    .or_else(|| possible.and_then(|p| p.doc.clone()))
            } else {
                possible.and_then(|p| p.doc.clone())
            };
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
            // The JSDoc lives on the `let x` declaration (or, for a renamed
            // export, on the `export { … }` statement); carry it onto the
            // export so it round-trips into the legacy props return.
            if let Some(doc) = doc {
                exported_names.set_doc(&exported, doc);
            }
            // Inject __sveltets_2_any for exported variables. Mirrors official
            // `propTypeAssertToUserDefined` (called from `addExport` when the
            // re-exported local is a `let`): widen when the declaration has
            //   1. no initializer (`export { x }` where `x` has no default), OR
            //   2. a type — a TS annotation (`let x: T = …`) OR a JSDoc
            //      `/** @type {T} */` (the doc lives on the `let x` declaration), OR
            //   3. a boolean-literal initializer (`let x = false`), which TS would
            //      otherwise narrow to the `false`/`true` literal type.
            // Cases 2 and 3 cover renamed legacy props like
            // `let className = ""; export { className as class }` with a JSDoc
            // `@type` (e.g. sveltestrap) that previously lost the widen.
            if is_instance && is_let {
                let has_ta = possible.map(|p| p.has_type_annotation).unwrap_or(false);
                let has_jsdoc_type = possible
                    .and_then(|p| p.doc.as_deref())
                    .is_some_and(|d| d.contains("@type"));
                let has_bool_init = possible.map(|p| p.has_boolean_init).unwrap_or(false);
                if (!has_init || has_ta || has_jsdoc_type || has_bool_init)
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

/// Detect `createEventDispatcher<Type>()` calls and extract the generic type.
///
/// Records the type text (e.g. `{a: A}`) in the events struct for use
/// in the return statement's events field.
fn detect_create_event_dispatcher(
    declarator: &oxc::VariableDeclarator,
    raw_content: &str,
    events: &mut ComponentEvents,
    content_offset: u32,
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
            // Untyped dispatcher: record its name + absolute declaration position
            // (`content_offset + declarator.span.start`) so `dispatch("name")`
            // call sites can be scanned — and order-gated against this position —
            // to populate the events return.
            let decl_pos = content_offset + declarator.span.start;
            events.dispatcher_decls.push((name, decl_pos));
            // Record the callee end (before `(`) so a `$$Events` interface can
            // inject `<__sveltets_2_CustomEvents<$$Events>>` onto the untyped call.
            events
                .dispatcher_typing_inject_pos
                .push(content_offset + callee.span.end);
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

        // Extract type from the $props() call, checking type arguments first
        // (mirrors upstream's `generic_arg = node.initializer.typeArguments?.[0] || node.type`).
        // 1. Check type arguments: `let { ... } = $props<Props>()`
        // 2. Fall back to type annotation: `let { ... }: Props = $props()`
        let mut found_type = false;
        if let Some(ref init) = declarator.init
            && let oxc::Expression::CallExpression(call) = init
            && let Some(ref type_args) = call.type_arguments
            && let Some(first_param) = type_args.params.first()
        {
            let start = first_param.span().start as usize;
            let end = first_param.span().end as usize;
            if start < end && end <= raw_content.len() {
                let type_text = &raw_content[start..end];
                // For plain named type references, use directly.
                // For complex types (inline object, union, etc.), the type is
                // MOVED to scriptStart via props_type_arg_hoist — do NOT set
                // props_type_text here, otherwise ts_component_props_before_render
                // would emit a duplicate `type $$ComponentProps = ...;`.
                if matches!(first_param, oxc::TSType::TSTypeReference(_)) {
                    exported_names.props_type_text = Some(type_text.to_string());
                }
                // Non-named type arg: props_type_text stays None;
                // create_props_str uses props_type_arg_hoist_ts flag instead.
                found_type = true;
            }
        }
        if !found_type {
            // Extract type annotation if present (e.g., `: Props` in `let {...}: Props = $props()`)
            if let Some(ref ta) = declarator.type_annotation {
                let ts_type = &ta.type_annotation;
                let start = ts_type.span().start as usize;
                let end = ts_type.span().end as usize;
                if start < end && end <= raw_content.len() {
                    let type_text = &raw_content[start..end];
                    exported_names.props_type_text = Some(type_text.to_string());
                }
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
        oxc::Expression::ArrayExpression(_) => "any[]".to_string(),
        oxc::Expression::ObjectExpression(_) => "Record<string, any>".to_string(),
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
            Some(end),
            text,
            is_hoistable,
            is_named_ref,
            Some(colon),
        )
    } else {
        (false, None, None, false, false, None)
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
                        let Some(local_name) = binding_pattern_simple_name(&assign.left) else {
                            // Complex binding (nested destructure) → unknown
                            has_unknown_props = true;
                            continue;
                        };
                        let inferred_type = infer_type_from_default(&assign.right, raw_content);
                        let (bindable, _) = is_bindable_call(&assign.right, raw_content);
                        prop_types.push((key.clone(), true, inferred_type));
                        if bindable {
                            // The bindable marker statement uses the LOCAL binding
                            // name, not the prop key: `{ count: definedCount =
                            // $bindable() }` → `definedCount;`.
                            bindable_names.push(local_name);
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

    // Detect type arguments on the $props() call: `$props<TypeArg>()`
    let (has_type_arg, type_arg_start, type_arg_end, type_arg_text, type_arg_is_named_ref) =
        if let Some(ref init) = declarator.init
            && let oxc::Expression::CallExpression(call) = init
            && let Some(ref type_args) = call.type_arguments
            && let Some(first_param) = type_args.params.first()
        {
            let start = first_param.span().start;
            let end = first_param.span().end;
            let text =
                if (start as usize) < raw_content.len() && (end as usize) <= raw_content.len() {
                    Some(raw_content[start as usize..end as usize].to_string())
                } else {
                    None
                };
            let is_named_ref = matches!(first_param, oxc::TSType::TSTypeReference(_));
            (true, Some(start), Some(end), text, is_named_ref)
        } else {
            (false, None, None, None, false)
        };

    Some(PropsRuneInfo {
        let_pos,
        destructure_start,
        destructure_end,
        props_call_end,
        has_type_annotation,
        type_annotation_end,
        type_text,
        colon_pos,
        is_hoistable_type,
        is_named_type_reference,
        jsdoc_type,
        jsdoc_start,
        jsdoc_end,
        has_rest,
        has_unknown_props,
        prop_types,
        bindable_names,
        has_type_arg,
        type_arg_start,
        type_arg_end,
        type_arg_text,
        type_arg_is_named_ref,
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

// =============================================================================
// Store subscription injection
// =============================================================================

/// Reserved names that should not be treated as store references.
const RESERVED_STORE_NAMES: &[&str] = &["$$props", "$$restProps", "$$slots"];

/// Return the leading `/** … */` JSDoc comment immediately before `before`
/// (skipping whitespace), or None. Mirrors official `getLastLeadingDoc`.
fn leading_jsdoc_comment(source: &str, before: usize) -> Option<String> {
    let bytes = source.as_bytes();
    let before = before.min(bytes.len());
    // Mirror official `getLastLeadingDoc`: walk the leading trivia and return the
    // LAST block comment (`MultiLineCommentTrivia`) — i.e. the one closest to the
    // declaration. Whitespace AND intervening single-line `// …` comments are
    // skipped (they're filtered out by `c.kind === MultiLineCommentTrivia`), so a
    // `/** … */` separated from the export by a `// @ts-expect-error` line still
    // attaches. Stop at the first non-trivia content (the previous token).
    let mut p = before;
    loop {
        // Skip whitespace immediately before `p`.
        while p > 0 && bytes[p - 1].is_ascii_whitespace() {
            p -= 1;
        }
        if p == 0 {
            return None;
        }
        // A block comment terminator `*/` right here? `p` is a valid char
        // boundary (stepped back only over ASCII whitespace / to a `\n`+1 line
        // start), but the two bytes ending at `p` may land inside a multi-byte
        // char (e.g. a `─` in a preceding comment), so test with `ends_with`.
        if source[..p].ends_with("*/") {
            // Official `getDoc` captures ANY leading block comment (not just
            // `/**` JSDoc), so a plain `/* … */` before an export is preserved.
            let open = source[..p].rfind("/*")?;
            // Ensure the `/*` is the opener for THIS `*/` (no intervening `*/`).
            if source[open..p - 2].contains("*/") {
                return None;
            }
            return Some(source[open..p].to_string());
        }
        // Otherwise, if the trivia line ending at `p` is a single-line `// …`
        // comment, skip the whole line and keep looking for an earlier block
        // comment. A non-comment line (real code / previous token) stops the walk.
        let line_start = source[..p].rfind('\n').map(|i| i + 1).unwrap_or(0);
        if source[line_start..p].trim_start().starts_with("//") {
            p = line_start;
            continue;
        }
        return None;
    }
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
        let gt = tag_start + source[tag_start..].find('>')?;
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

/// Locate the instance `<script>` tag (the one WITHOUT `module` /
/// `context="module"`), returning `(body_start, body_end)`.
fn find_instance_script_span(source: &str) -> Option<(usize, usize)> {
    let bytes = source.as_bytes();
    let mut search = 0usize;
    while let Some(rel) = source[search..].find("<script") {
        let tag_start = search + rel;
        let gt = tag_start + source[tag_start..].find('>')?;
        let open_tag = &source[tag_start..gt];
        let is_module = open_tag.contains("context=\"module\"")
            || open_tag.contains("context='module'")
            || open_tag
                .split(|c: char| c.is_ascii_whitespace() || c == '>' || c == '=')
                .any(|tok| tok == "module");
        if !is_module && !open_tag.starts_with("<scripts") {
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

/// Cheap pre-check: does the instance script body contain a `//` or `/*`
/// comment-opener? (Gates the buffer copy in `collect_store_references`.)
fn instance_script_has_comment(source: &str) -> bool {
    if !source.contains("<script") {
        return false;
    }
    match find_instance_script_span(source) {
        Some((start, end)) => {
            let body = &source[start..end];
            body.contains("//") || body.contains("/*")
        }
        None => false,
    }
}

/// Blank `//` line and `/* */` block comments inside the instance `<script>`
/// body so a byte-level store scan never sees a `$name` token that only appears
/// in a comment. String literals are skipped (not blanked) so a `//` inside a
/// string is not mistaken for a comment. Mirrors the level of care in
/// `collect_loose_dollar_names_from_script`.
fn blank_instance_script_comments(source: &str, buf: &mut [u8]) {
    let (start, end) = match find_instance_script_span(source) {
        Some(s) => s,
        None => return,
    };
    let bytes = source.as_bytes();
    let mut i = start;
    while i < end {
        let b = bytes[i];
        // Line comment `// … <eol>`
        if b == b'/' && i + 1 < end && bytes[i + 1] == b'/' {
            while i < end && bytes[i] != b'\n' {
                buf[i] = b' ';
                i += 1;
            }
            continue;
        }
        // Block comment `/* … */`
        if b == b'/' && i + 1 < end && bytes[i + 1] == b'*' {
            let mut j = i + 2;
            while j + 1 < end && !(bytes[j] == b'*' && bytes[j + 1] == b'/') {
                j += 1;
            }
            let stop = (j + 2).min(end);
            for slot in &mut buf[i..stop] {
                if *slot != b'\n' && *slot != b'\r' {
                    *slot = b' ';
                }
            }
            i = stop;
            continue;
        }
        // String / template literal — skip (do NOT blank) so `$name` inside a
        // real string is handled by the existing prev-byte quote guards.
        if b == b'"' || b == b'\'' || b == b'`' {
            let q = b;
            i += 1;
            while i < end && bytes[i] != q {
                if bytes[i] == b'\\' {
                    i += 1;
                }
                i += 1;
            }
            i += 1;
            continue;
        }
        i += 1;
    }
}

/// Scan raw instance-script text for `$name` patterns WITHOUT applying the
/// rune-call exclusion (`$props`/`$state`/`$derived`).
///
/// The official JS `processInstanceScriptContent` runs a TypeScript AST walker
/// that calls `resolveStore` for every `$X` identifier.  The rune-exclusion
/// (`is_rune`) check inside that walker is broken in practice because TypeScript
/// source-file nodes don't have their `.parent` pointer set, causing
/// `ts.isVariableDeclaration(parent.parent)` to always be `false`.  As a result
/// ALL `$X` identifiers in the instance script — including `$props()`,
/// `$bindable()` etc. — land in `accessedStores` / `disallowed_values`.
///
/// We replicate that behaviour here: scan the raw text and return every base
/// name `X` for every `$X` token found, skipping only `$$`-prefixed forms and
/// obvious non-identifiers (comments, strings, member accesses, etc.) but NOT
/// applying the rune-name filter.
fn collect_loose_dollar_names_from_script(text: &str) -> HashSet<String> {
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut names = HashSet::new();
    let mut i = 0usize;

    // Simple comment/string skipper — matches the level of care in
    // `collect_store_references`, which is the nearest sibling function.
    while i < len {
        // Skip line comments
        if i + 1 < len && bytes[i] == b'/' && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }
        // Skip block comments
        if i + 1 < len && bytes[i] == b'/' && bytes[i + 1] == b'*' {
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            i += 2;
            continue;
        }
        // Skip string literals (single and double quote, simple heuristic)
        if bytes[i] == b'"' || bytes[i] == b'\'' || bytes[i] == b'`' {
            let q = bytes[i];
            i += 1;
            while i < len && bytes[i] != q {
                if bytes[i] == b'\\' {
                    i += 1; // skip escaped char
                }
                i += 1;
            }
            i += 1;
            continue;
        }

        if bytes[i] != b'$' {
            i += 1;
            continue;
        }

        let pos = i;
        let next = pos + 1;
        if next >= len {
            break;
        }
        let nb = bytes[next];

        // Skip `$$` (special identifiers like `$$props`)
        if nb == b'$' {
            i = next + 1;
            continue;
        }

        // Skip member-access / string-key context
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

        // Must start a valid identifier
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

        let base = &text[next..end];
        names.insert(base.to_string());
        i = end;
    }
    names
}

fn collect_store_references(source: &str) -> HashSet<String> {
    // No parsed program here (import-only module path): there are no self-named
    // rune-call callees to exclude, so an empty position set is exact.
    collect_store_references_with_shadow(source, &HashMap::new(), &HashSet::new())
}

fn collect_store_references_with_shadow(
    source: &str,
    shadow: &HashMap<String, Vec<(u32, u32)>>,
    self_named_rune_calls: &HashSet<u32>,
) -> HashSet<String> {
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
    // Instance-script JS comments must be blanked too: official only collects
    // `$name` store accesses from the parsed instance-script AST + template
    // expression values, so a `$name` that appears only inside a `//` / `/* */`
    // comment (e.g. a JSDoc `[`$on`](…$on)` link) is never a store reference.
    let needs_blank =
        source.contains("<!--") || has_module_script(source) || instance_script_has_comment(source);
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
        blank_instance_script_comments(source, &mut buf);
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
            // `...$store` (a spread element) IS a real store reference, but a
            // single-dot member access `obj.$store` is not. Official walks the
            // parsed AST, where a `SpreadElement` argument identifier is
            // collected while a `.property` member is skipped. The byte scan
            // distinguishes the two by looking one byte further back: the third
            // dot of `...` is preceded by another `.`.
            let is_spread_dot = prev == b'.' && pos >= 2 && bytes[pos - 2] == b'.';
            if (prev == b'.' && !is_spread_dot)
                || prev == b'\''
                || prev == b'"'
                || prev.is_ascii_alphanumeric()
                || prev == b'_'
            {
                i = next;
                continue;
            }
            // `use:$store` / `transition:$x` / `in:$x` / `out:$x` / `animate:$x`
            // — the `$name` is a DIRECTIVE NAME (in an element opener), not a
            // store auto-subscription. Official collects template stores from
            // expression VALUES, never directive names.
            if prev == b':' {
                let kw_end = pos - 1;
                let mut k = kw_end;
                while k > 0 && bytes[k - 1].is_ascii_lowercase() {
                    k -= 1;
                }
                let kw = &source[k..kw_end];
                let boundary_ok =
                    k == 0 || matches!(bytes[k - 1], b' ' | b'\t' | b'\n' | b'\r' | b'<');
                if boundary_ok && matches!(kw, "use" | "transition" | "in" | "out" | "animate") {
                    i = next;
                    continue;
                }
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
        // Object-literal property KEY (`{ $name: value }` / after a `,`): the
        // `$name` is a property name, not a store reference. Official walks the
        // parsed AST and skips `Property.key` identifiers, so e.g. a row object
        // `{ $expanded: …, $selected: … }` must not turn `expanded` / `selected`
        // into store auto-subscriptions. Detected by `$name` followed (skipping
        // whitespace) by `:` AND preceded (skipping whitespace) by `{` or `,`
        // (which excludes a ternary `cond ? $name : x`, where the preceding
        // token is `?`).
        if is_object_property_key(bytes, pos, end) {
            i = end;
            continue;
        }
        if RESERVED_STORE_NAMES.contains(&full) {
            i = end;
            continue;
        }
        // Rune-call exclusion (mirror `processInstanceScriptContent.ts` `is_rune`):
        // a `$props`/`$state`/`$derived` CALL whose declaration binding name
        // includes the rune base (`let state = $state()` → rune; `let count =
        // $state()` → still a `state` store access) is the rune, not a store sub.
        // The precise set of such call callees is precomputed from the AST
        // (`collect_self_named_rune_call_positions`) so a type annotation with
        // generic-argument commas can't fool a text scan, and — crucially — only
        // the CALL occurrence is skipped: a sibling `$state.snapshot(state)`
        // keeps `state` a store, matching upstream.
        if matches!(full, "$state" | "$props" | "$derived")
            && self_named_rune_calls.contains(&(pos as u32))
        {
            i = end;
            continue;
        }
        let base = &source[next..end];
        // A `$name` whose `$`-prefixed binding (a function/arrow parameter)
        // lexically encloses this position is a LOCAL binding reference, not a
        // store auto-subscription. Mirrors official `resolveStore`, which walks
        // the scope chain and skips a `$name` reference declared in any
        // enclosing `scope.declared` set.
        if !is_dollar_binding_shadowed(shadow, base, pos) {
            stores.insert(base.to_string());
        }
        i = end;
    }
    stores
}

/// True when the `$name` token spanning `[pos, end)` is an object-literal
/// property KEY (`{ $name: value }` or `, $name: value`), which the official
/// `Stores` AST walker skips (it only collects `$name` Identifier nodes in
/// reference position, never `Property.key`).
///
/// A property key is `$name` followed — skipping whitespace — by a single `:`
/// (not `::` and not a ternary `?:`, since a ternary's `$name` is preceded by
/// `?`), AND preceded — skipping whitespace — by `{` or `,`. Comments are
/// already blanked to spaces before this scan, so the whitespace skip crosses
/// them. Shorthand (`{ $name }`, no colon) and computed keys (`{ [$name]: … }`,
/// preceded by `[`) are intentionally NOT treated as keys.
fn is_object_property_key(bytes: &[u8], pos: usize, end: usize) -> bool {
    // Look forward for a `:` after optional whitespace.
    let mut f = end;
    while f < bytes.len() && matches!(bytes[f], b' ' | b'\t' | b'\n' | b'\r') {
        f += 1;
    }
    if f >= bytes.len() || bytes[f] != b':' {
        return false;
    }
    // `::` is not an object-key colon.
    if f + 1 < bytes.len() && bytes[f + 1] == b':' {
        return false;
    }
    // Look backward for `{` or `,` after optional whitespace.
    let mut b = pos;
    while b > 0 && matches!(bytes[b - 1], b' ' | b'\t' | b'\n' | b'\r') {
        b -= 1;
    }
    b > 0 && matches!(bytes[b - 1], b'{' | b',')
}

/// True when `pos` (a source byte offset of a `$name` reference) falls inside a
/// function span that binds `$name` as a parameter.
fn is_dollar_binding_shadowed(
    shadow: &HashMap<String, Vec<(u32, u32)>>,
    name: &str,
    pos: usize,
) -> bool {
    match shadow.get(name) {
        Some(spans) => {
            let p = pos as u32;
            spans.iter().any(|&(s, e)| p >= s && p < e)
        }
        None => false,
    }
}

/// Collect, from the instance-script AST, every `$`-prefixed function / arrow
/// parameter binding mapped (sans `$`) to the source span of its enclosing
/// function. A `$name` reference inside such a span is a local binding read, not
/// a store auto-subscription (official tracks this via `Scope.declared`).
fn collect_dollar_param_shadow(
    program: &oxc::Program,
    offset: u32,
) -> HashMap<String, Vec<(u32, u32)>> {
    let mut collector = DollarParamShadowCollector {
        offset,
        spans: HashMap::new(),
    };
    collector.visit_program(program);
    collector.spans
}

struct DollarParamShadowCollector {
    offset: u32,
    spans: HashMap<String, Vec<(u32, u32)>>,
}

impl DollarParamShadowCollector {
    fn add_params(&mut self, params: &oxc::FormalParameters, span: oxc_span::Span) {
        let src_span = (span.start + self.offset, span.end + self.offset);
        for item in params.items.iter() {
            let mut names = Vec::new();
            collect_binding_names(&item.pattern, &mut names);
            for n in names {
                if let Some(base) = n.strip_prefix('$') {
                    self.spans
                        .entry(base.to_string())
                        .or_default()
                        .push(src_span);
                }
            }
        }
    }
}

impl<'a> Visit<'a> for DollarParamShadowCollector {
    fn visit_function(&mut self, it: &oxc::Function<'a>, flags: oxc_syntax::scope::ScopeFlags) {
        self.add_params(&it.params, it.span);
        oxc_ast_visit::walk::walk_function(self, it, flags);
    }

    fn visit_arrow_function_expression(&mut self, it: &oxc::ArrowFunctionExpression<'a>) {
        self.add_params(&it.params, it.span);
        oxc_ast_visit::walk::walk_arrow_function_expression(self, it);
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

/// Collect the source byte offsets of the `$props` / `$state` / `$derived`
/// callee identifiers of self-named rune CALLS — a `<binding> = $rune(…)`
/// whose binding NAME includes the rune base (e.g. `let { …, ...props }:
/// SomeProps<T> = $props()`). Mirrors upstream `processInstanceScriptContent.ts`
/// `is_rune`, which inspects the binding name only (never the type annotation)
/// via the AST and excludes exactly that call occurrence from store resolution.
///
/// The text-based `$name` scan then skips only these positions — leaving a
/// non-call occurrence such as `$state.snapshot(x)` intact, so a genuine
/// `let state = $state([])` next to `$state.snapshot(state)` still auto-
/// subscribes exactly as upstream does.
fn collect_self_named_rune_call_positions(program: &oxc::Program, offset: u32) -> HashSet<u32> {
    let mut positions = HashSet::new();
    let mut visit_var_decl = |var_decl: &oxc::VariableDeclaration| {
        for declarator in var_decl.declarations.iter() {
            let Some(init) = declarator.init.as_ref() else {
                continue;
            };
            if let Some(call) = excluded_rune_init(init, &declarator.id)
                && let oxc::Expression::Identifier(callee) = &call.callee
            {
                positions.insert(callee.span.start + offset);
            }
        }
    };
    for stmt in program.body.iter() {
        match stmt {
            oxc::Statement::VariableDeclaration(vd) => visit_var_decl(vd),
            oxc::Statement::ExportNamedDeclaration(ex) => {
                if let Some(oxc::Declaration::VariableDeclaration(vd)) = &ex.declaration {
                    visit_var_decl(vd);
                }
            }
            _ => {}
        }
    }
    positions
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
    // Exclude `$name` references that are shadowed by a `$`-prefixed function /
    // arrow parameter binding in the instance script (official `resolveStore`
    // scope-chain check). The shadow map is keyed by source byte ranges.
    let shadow = collect_dollar_param_shadow(program, offset);
    let self_named_rune_calls = collect_self_named_rune_call_positions(program, offset);
    let accessed_stores =
        collect_store_references_with_shadow(source, &shadow, &self_named_rune_calls);
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

    // Official `attachStoreValueDeclarationOfImportsToRenderFn` iterates
    // `importStatements` in IMPORT-DECLARATION order (not first-`$store`-use
    // order), which is exactly the collection order here (instance imports in
    // program order, then module imports). Just dedup preserving that order.
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
    // Locate the module script body. `find_module_script_span` matches BOTH
    // `<script context="module">` and the Svelte 5 `<script module>` shorthand
    // (the old regex only matched the `context=` form, so `<script module>`
    // imports used as stores were never injected).
    let (content_start, close_tag) = match find_module_script_span(source) {
        Some(span) => span,
        None => return,
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
    let self_named_rune_calls = collect_self_named_rune_call_positions(program, offset);
    let accessed_stores =
        collect_store_references_with_shadow(source, &HashMap::new(), &self_named_rune_calls);
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
    use super::test_support::{run_svelte2tsx, run_svelte2tsx_ts};
    use super::*;
    use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

    #[test]
    fn collect_loose_dollar_names_strips_dollar_skips_comments_strings_members() {
        // Base names of every `$X` (rune-filter intentionally NOT applied —
        // mirrors upstream's broken `is_rune`), but skipping comments, string
        // literals, member access, and `$$`-prefixed forms.
        let got = collect_loose_dollar_names_from_script(
            "let x = $state(0);\n\
             // $commented\n\
             const s = '$stringy';\n\
             foo.$member;\n\
             $$props;\n\
             const d = $derived($state);",
        );
        assert!(got.contains("state"), "$state base captured: {got:?}");
        assert!(got.contains("derived"), "$derived base captured: {got:?}");
        assert!(!got.contains("commented"), "line comment skipped: {got:?}");
        assert!(!got.contains("stringy"), "string literal skipped: {got:?}");
        assert!(!got.contains("member"), "member access skipped: {got:?}");
        assert!(!got.contains("props"), "$$-prefixed skipped: {got:?}");
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

    // =========================================================================
    // Integration tests using the full svelte2tsx pipeline
    // =========================================================================

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

    // -- Generic arrow disambiguation (#725) --

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
