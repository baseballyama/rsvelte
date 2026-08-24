//! `ExportedNames` — props and named exports collected from a component's
//! script blocks, plus the generated `$$prop_def` / render-props output.

use std::collections::{HashMap, HashSet};
use std::fmt::Write as _;

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
    flags: ExportedNamesFlags,
    /// Upstream's `isSvelte5Plus`. Under `version: '4'` a rune global or a
    /// typed `$props()` does NOT put the component in runes mode.
    svelte5_plus: bool,
    /// Type annotation text for $`props()` (e.g., "Props" from `let {...}: Props = $props()`)
    pub props_type_text: Option<String>,
    /// Whether a $$`ComponentProps` typedef was generated (for use in return statement)
    /// Names of $`bindable()` props
    pub bindable_props: Vec<String>,
    /// `JSDoc` type text found before $`props()` (e.g., "{{ a: number, b: string }}")
    pub props_jsdoc_type: Option<String>,
    /// Whether a legacy `type $$Props` / `interface $$Props` is declared.
    /// Whether `$$Slots` type/interface is declared in the script
    /// Whether `$$Events` type/interface is declared in the script
    /// Absolute source position of the FIRST `$$Events` interface / type
    /// declaration, if any. Official only injects `<__sveltets_2_CustomEvents<
    /// $$Events>>` onto an untyped `createEventDispatcher()` when the `$$Events`
    /// declaration was already seen earlier in the single source-order walk
    /// (`ComponentEventsFromInterface.isPresent()` gate), so the injection is
    /// gated on the dispatcher position coming AFTER this.
    pub events_type_decl_pos: Option<u32>,
    /// Whether the $$`ComponentProps` type was already inserted by `apply_props_typedef`
    /// (for best-effort auto-generated types that go inside $$render, not before it)
    /// Generics collected from `type X = $$Generic<T>` declarations.
    /// Each entry is (name, constraint) e.g., ("A", None), ("B", Some("keyof A")).
    pub dollar_generics: Vec<(String, Option<String>)>,
    /// Source positions of `type X = $$Generic...` statements to blank out.
    pub dollar_generic_positions: Vec<(u32, u32)>,
    /// Message of the first invalid `$$Generic` declaration found in the
    /// instance script. Upstream throws from inside its walk; the walk here has
    /// no error channel, so the caller turns this into the returned error.
    pub dollar_generic_error: Option<String>,
    /// Type/interface declarations from instance script that should be hoisted
    /// before $$`render()`. Each entry is (start, end) relative to source (absolute positions).
    pub hoistable_type_ranges: Vec<(u32, u32)>,
    /// Type/interface declarations referenced by `$$Generic<X>` constraints that
    /// must be moved before $$`render()` so the generic constraint sees the type.
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
}

#[derive(Debug, Clone, Copy, Default)]
struct ExportedNamesFlags(u16);

impl ExportedNamesFlags {
    const USES_RUNES: u16 = 1;
    const HAS_PROPS_RUNE: u16 = 1 << 1;
    const HAS_COMPONENT_PROPS_TYPEDEF: u16 = 1 << 2;
    const USES_DOLLAR_PROPS_TYPE: u16 = 1 << 3;
    const HAS_SLOTS_TYPE: u16 = 1 << 4;
    const HAS_EVENTS_TYPE: u16 = 1 << 5;
    const TYPE_ALREADY_INSERTED: u16 = 1 << 6;
    const PROPS_TYPE_ARG_HOIST_TS: u16 = 1 << 7;
    const TEMPLATE_RUNES: u16 = 1 << 8;

    const fn contains(self, flag: u16) -> bool {
        self.0 & flag != 0
    }

    const fn set(&mut self, flag: u16, enabled: bool) {
        if enabled {
            self.0 |= flag;
        } else {
            self.0 &= !flag;
        }
    }
}

#[derive(Debug, Clone)]
pub struct ExportedNameInfo {
    pub local_name: String,
    flags: ExportFlags,
    pub type_annotation: Option<String>,
    /// Leading `JSDoc` `/** @type {…} */` comment on the export declaration,
    /// preserved in the legacy `props: { … }` return (mirrors official's
    /// `value.doc`).
    pub doc: Option<String>,
}

#[derive(Debug, Clone, Copy, Default)]
pub(super) struct ExportFlags(u8);

impl ExportFlags {
    const HAS_DEFAULT: u8 = 1;
    const IS_PROP: u8 = 1 << 1;
    const IS_LET: u8 = 1 << 2;
    const IS_NAMED_EXPORT: u8 = 1 << 3;
    /// Official `ExportedName.required`, set from `!node.initializer` for a
    /// variable declaration and left `false` for every other export kind.
    const IS_REQUIRED: u8 = 1 << 4;

    pub const fn with_required_if(mut self, enabled: bool) -> Self {
        if enabled {
            self.0 |= Self::IS_REQUIRED;
        }
        self
    }
    pub const fn with_default_if(mut self, enabled: bool) -> Self {
        if enabled {
            self.0 |= Self::HAS_DEFAULT;
        }
        self
    }
    pub const fn with_prop_if(mut self, enabled: bool) -> Self {
        if enabled {
            self.0 |= Self::IS_PROP;
        }
        self
    }
    pub const fn with_let_if(mut self, enabled: bool) -> Self {
        if enabled {
            self.0 |= Self::IS_LET;
        }
        self
    }
    pub const fn with_named_export_if(mut self, enabled: bool) -> Self {
        if enabled {
            self.0 |= Self::IS_NAMED_EXPORT;
        }
        self
    }
    const fn contains(self, flag: u8) -> bool {
        self.0 & flag != 0
    }
}

impl ExportedNameInfo {
    #[must_use]
    pub const fn has_default(&self) -> bool {
        self.flags.contains(ExportFlags::HAS_DEFAULT)
    }

    #[must_use]
    pub const fn is_prop(&self) -> bool {
        self.flags.contains(ExportFlags::IS_PROP)
    }

    #[must_use]
    pub const fn is_let(&self) -> bool {
        self.flags.contains(ExportFlags::IS_LET)
    }

    #[must_use]
    pub const fn is_named_export(&self) -> bool {
        self.flags.contains(ExportFlags::IS_NAMED_EXPORT)
    }

    #[must_use]
    pub const fn is_required(&self) -> bool {
        self.flags.contains(ExportFlags::IS_REQUIRED)
    }

    fn mark_named_export(&mut self) {
        self.flags.0 |= ExportFlags::IS_NAMED_EXPORT;
        self.flags.0 &= !ExportFlags::IS_LET;
        // `export { local as exported }` calls official `addExport` with
        // `required = false`. The renamed entry replaces the earlier
        // `export let local` entry, so its required bit must not survive.
        self.flags.0 &= !ExportFlags::IS_REQUIRED;
    }
}

#[derive(Debug, Clone)]
pub(super) struct PossibleExport {
    flags: PossibleExportFlags,
    /// Initializer is a boolean literal (`let x = false`). Like official's
    /// `propTypeAssertToUserDefined`, this still forces the `__sveltets_2_any`
    /// widen (TS would otherwise narrow `x` to the `false`/`true` literal type).
    pub(super) decl_end: u32,
    pub(super) type_annotation_text: Option<String>,
    /// Leading `JSDoc` `/** @type {…} */` on the declaration, for
    /// `export { x as y }` (the doc lives on the `let x` declaration).
    pub(super) doc: Option<String>,
}

#[derive(Debug, Clone, Copy, Default)]
pub(super) struct PossibleExportFlags(u8);

impl PossibleExportFlags {
    const IS_LET: u8 = 1;
    const HAS_INIT: u8 = 1 << 1;
    const HAS_TYPE_ANNOTATION: u8 = 1 << 2;
    const HAS_BOOLEAN_INIT: u8 = 1 << 3;

    const fn with_if(mut self, flag: u8, enabled: bool) -> Self {
        if enabled {
            self.0 |= flag;
        }
        self
    }

    pub(super) const fn with_let_if(self, enabled: bool) -> Self {
        self.with_if(Self::IS_LET, enabled)
    }

    pub(super) const fn with_init_if(self, enabled: bool) -> Self {
        self.with_if(Self::HAS_INIT, enabled)
    }

    pub(super) const fn with_type_annotation_if(self, enabled: bool) -> Self {
        self.with_if(Self::HAS_TYPE_ANNOTATION, enabled)
    }

    pub(super) const fn with_boolean_init_if(self, enabled: bool) -> Self {
        self.with_if(Self::HAS_BOOLEAN_INIT, enabled)
    }

    const fn contains(self, flag: u8) -> bool {
        self.0 & flag != 0
    }
}

impl PossibleExport {
    pub(super) const fn from_parts(
        flags: PossibleExportFlags,
        decl_end: u32,
        type_annotation_text: Option<String>,
        doc: Option<String>,
    ) -> Self {
        Self {
            flags,
            decl_end,
            type_annotation_text,
            doc,
        }
    }

    pub(super) const fn is_let(&self) -> bool {
        self.flags.contains(PossibleExportFlags::IS_LET)
    }

    pub(super) const fn has_init(&self) -> bool {
        self.flags.contains(PossibleExportFlags::HAS_INIT)
    }

    pub(super) const fn has_type_annotation(&self) -> bool {
        self.flags
            .contains(PossibleExportFlags::HAS_TYPE_ANNOTATION)
    }

    pub(super) const fn has_boolean_init(&self) -> bool {
        self.flags.contains(PossibleExportFlags::HAS_BOOLEAN_INIT)
    }
}

impl ExportedNames {
    #[must_use]
    pub fn new() -> Self {
        Self {
            names: HashMap::new(),
            insertion_order: Vec::new(),
            flags: ExportedNamesFlags::default(),
            svelte5_plus: true,
            props_type_text: None,
            bindable_props: Vec::new(),
            props_jsdoc_type: None,
            events_type_decl_pos: None,
            dollar_generics: Vec::new(),
            dollar_generic_positions: Vec::new(),
            dollar_generic_error: None,
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
            instance_script_loose_dollar_names: HashSet::new(),
        }
    }
    /// Build the generics string for `$$render` from `$$Generic` declarations.
    /// Returns something like `/*Ωignore_startΩ*/<A,B extends keyof A,C extends boolean>/*Ωignore_endΩ*/`
    /// or empty string if no $$Generic declarations.
    #[must_use]
    pub fn build_dollar_generics_str(&self) -> String {
        if self.dollar_generics.is_empty() {
            return String::new();
        }
        let parts: Vec<String> = self
            .dollar_generics
            .iter()
            .map(|(name, constraint)| {
                constraint.as_ref().map_or_else(
                    || name.clone(),
                    |constraint| format!("{name} extends {constraint}"),
                )
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
                flags: ExportFlags::default()
                    .with_default_if(has_default)
                    .with_prop_if(is_prop),
                type_annotation,
                doc: None,
            },
        );
    }
    pub(super) fn add_full(
        &mut self,
        name: String,
        local_name: String,
        type_annotation: Option<String>,
        flags: ExportFlags,
    ) {
        if !self.names.contains_key(&name) {
            self.insertion_order.push(name.clone());
        }
        self.names.insert(
            name,
            ExportedNameInfo {
                local_name,
                flags,
                type_annotation,
                doc: None,
            },
        );
    }
    pub const fn set_uses_runes(&mut self, val: bool) {
        self.flags.set(ExportedNamesFlags::USES_RUNES, val);
    }
    /// Runes mode from the template alone (`<svelte:options runes>`, a
    /// top-level `await` in a template expression) — upstream's ungated half.
    pub const fn set_template_runes(&mut self, val: bool) {
        self.flags.set(ExportedNamesFlags::TEMPLATE_RUNES, val);
    }
    pub const fn set_svelte5_plus(&mut self, val: bool) {
        self.svelte5_plus = val;
    }
    #[must_use]
    pub const fn is_svelte5_plus(&self) -> bool {
        self.svelte5_plus
    }
    pub const fn set_has_props_rune(&mut self, val: bool) {
        self.flags.set(ExportedNamesFlags::HAS_PROPS_RUNE, val);
    }
    #[must_use]
    pub const fn has_component_props_typedef(&self) -> bool {
        self.flags
            .contains(ExportedNamesFlags::HAS_COMPONENT_PROPS_TYPEDEF)
    }
    pub const fn set_has_component_props_typedef(&mut self, value: bool) {
        self.flags
            .set(ExportedNamesFlags::HAS_COMPONENT_PROPS_TYPEDEF, value);
    }
    #[must_use]
    pub const fn uses_dollar_props_type(&self) -> bool {
        self.flags
            .contains(ExportedNamesFlags::USES_DOLLAR_PROPS_TYPE)
    }
    pub const fn set_uses_dollar_props_type(&mut self, value: bool) {
        self.flags
            .set(ExportedNamesFlags::USES_DOLLAR_PROPS_TYPE, value);
    }
    #[must_use]
    pub const fn has_slots_type(&self) -> bool {
        self.flags.contains(ExportedNamesFlags::HAS_SLOTS_TYPE)
    }
    pub const fn set_has_slots_type(&mut self, value: bool) {
        self.flags.set(ExportedNamesFlags::HAS_SLOTS_TYPE, value);
    }
    #[must_use]
    pub const fn has_events_type(&self) -> bool {
        self.flags.contains(ExportedNamesFlags::HAS_EVENTS_TYPE)
    }
    pub const fn set_has_events_type(&mut self, value: bool) {
        self.flags.set(ExportedNamesFlags::HAS_EVENTS_TYPE, value);
    }
    #[must_use]
    pub const fn type_already_inserted(&self) -> bool {
        self.flags
            .contains(ExportedNamesFlags::TYPE_ALREADY_INSERTED)
    }
    pub const fn set_type_already_inserted(&mut self, value: bool) {
        self.flags
            .set(ExportedNamesFlags::TYPE_ALREADY_INSERTED, value);
    }
    #[must_use]
    pub const fn props_type_arg_hoist_ts(&self) -> bool {
        self.flags
            .contains(ExportedNamesFlags::PROPS_TYPE_ARG_HOIST_TS)
    }
    pub const fn set_props_type_arg_hoist_ts(&mut self, value: bool) {
        self.flags
            .set(ExportedNamesFlags::PROPS_TYPE_ARG_HOIST_TS, value);
    }
    #[must_use]
    pub const fn is_runes_mode(&self) -> bool {
        // Mirrors upstream `hasRunesGlobals || hasPropsRune() || isRunes`:
        // the first two are gated on `isSvelte5Plus`, the third is not.
        self.flags.contains(ExportedNamesFlags::TEMPLATE_RUNES)
            || (self.svelte5_plus
                && (self.flags.contains(ExportedNamesFlags::USES_RUNES)
                    || self.flags.contains(ExportedNamesFlags::HAS_PROPS_RUNE)))
    }
    #[must_use]
    pub fn get_prop_names(&self) -> Vec<&str> {
        let mut names: Vec<&str> = self
            .names
            .iter()
            .filter(|(_, info)| info.is_prop())
            .map(|(name, _)| name.as_str())
            .collect();
        names.sort_unstable();
        names
    }
    #[must_use]
    pub fn get_all_names(&self) -> Vec<&str> {
        let mut names: Vec<&str> = self.names.keys().map(std::string::String::as_str).collect();
        names.sort_unstable();
        names
    }
    #[must_use]
    pub fn has(&self, name: &str) -> bool {
        self.names.contains_key(name)
    }
    /// True if `local` is the *local* (source-declared) name of any export.
    /// Unlike `has`, this matches through aliases: `export { v1 as a1 }`
    /// is keyed by `a1`, but its local name is `v1`.
    #[must_use]
    pub fn has_local(&self, local: &str) -> bool {
        self.names.values().any(|info| info.local_name == local)
    }
    /// Mirror official `hasNoProps()`: runes mode → no `$props` type/comment;
    /// legacy → no exports.
    #[must_use]
    pub fn has_no_props(&self) -> bool {
        if self.is_runes_mode() {
            self.props_type_text.is_none()
                && !self.has_component_props_typedef()
                && self.props_jsdoc_type.is_none()
        } else {
            self.names.is_empty()
        }
    }
    /// Attach the leading `JSDoc` comment to an exported name (by export key).
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
        info.mark_named_export();
        info.type_annotation = None;
        info.doc = doc;
        match self.insertion_order.iter().position(|k| k == local) {
            Some(pos) => self.insertion_order[pos].clone_from(&exported),
            None => self.insertion_order.push(exported.clone()),
        }
        self.names.insert(exported, info);
    }
    #[must_use]
    pub fn get(&self, name: &str) -> Option<&ExportedNameInfo> {
        self.names.get(name)
    }
    pub fn get_mut(&mut self, name: &str) -> Option<&mut ExportedNameInfo> {
        self.names.get_mut(name)
    }
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.names.is_empty()
    }
    #[must_use]
    pub fn create_props_str(&self, is_ts: bool, uses_dollar_props: bool) -> String {
        if self.is_runes_mode() {
            return self.create_runes_props_str(is_ts);
        }
        // Legacy `$$Props` type/interface (TS only): mirror official's
        // `uses$$Props` branch — wrap the props in `__sveltets_2_ensureRightProps`
        // and assert against `$$Props` (with non-`let` exports `& `-joined in).
        // Reference: ExportedNames.ts createPropsStr uses$$Props branch.
        if self.uses_dollar_props_type() && is_ts {
            // Mirror official `createReturnElementsType`: each member is prefixed
            // with its leading JSDoc (`addDoc` defaults true), so a `/** … */`
            // comment on the `export let` survives into the `$$Props` type list.
            let mut lets = String::new();
            let mut others = String::new();
            for (en, info) in self.ordered() {
                let output = if info.is_let() {
                    &mut lets
                } else {
                    &mut others
                };
                if !output.is_empty() {
                    output.push(',');
                }
                Self::write_type_entry(output, en, info);
            }
            let mut result = String::with_capacity(
                85 + lets.len() + others.len() + usize::from(!others.is_empty()) * 5,
            );
            result.push_str("{ ...__sveltets_2_ensureRightProps<{");
            result.push_str(&lets);
            result.push_str("}>(__sveltets_2_any(\"\") as $$Props)} as ");
            if !others.is_empty() {
                result.push('{');
                result.push_str(&others);
                result.push_str("} & ");
            }
            result.push_str("$$Props");
            return result;
        }
        // Mirror official `dontAddTypeDef` (ExportedNames.ts createPropsStr):
        // omit the `as {…}` cast entirely when every export is untyped AND
        // required — a plain `export let x` with no default and no type
        // annotation (`required = !initializer`). A typed or defaulted /
        // optional export forces the cast. Computed up-front because it also
        // gates whether the *value* elements carry the leading JSDoc (official
        // `createReturnElements`: doc when dontAddTypeDef).
        let dont_add_type_def = !is_ts
            || self
                .names
                .values()
                .all(|info| info.type_annotation.is_none() && info.is_required());
        // When `dontAddTypeDef`, the props object omits the `as {…}` type assert,
        // so a captured leading JSDoc `/** … */` is emitted before the prop's
        // value element — mirrors official `createReturnElements`.
        if self.names.is_empty() {
            // Reference: ExportedNames.ts createPropsStr — non-runes mode with
            // no props. When `$$props`/`$$restProps` is used, props flattens to
            // a bare `{}`; otherwise TS uses `{} as Record<string, never>` and
            // JS uses `/** @type {Record<string, never>} */ ({})`.
            return if uses_dollar_props {
                "{}".to_string()
            } else if is_ts {
                "{} as Record<string, never>".to_string()
            } else {
                "/** @type {Record<string, never>} */ ({})".to_string()
            };
        }
        let mut entries = String::from("{");
        let mut type_entries = String::new();
        for (en, info) in self.ordered() {
            if entries.len() > 1 {
                entries.push_str(" , ");
            }
            if let Some(doc) = &info.doc
                && dont_add_type_def
            {
                entries.push_str(doc);
                entries.push(' ');
            }
            entries.push_str(en);
            entries.push_str(": ");
            entries.push_str(&info.local_name);

            if is_ts && !dont_add_type_def {
                if !type_entries.is_empty() {
                    type_entries.push_str(", ");
                }
                Self::write_type_entry(&mut type_entries, en, info);
            }
        }
        entries.push('}');
        if is_ts && !dont_add_type_def {
            entries.push_str(" as {");
            entries.push_str(&type_entries);
            entries.push('}');
        }
        entries
    }

    fn create_runes_props_str(&self, is_ts: bool) -> String {
        if self.props_type_arg_hoist_ts()
            || (self.has_component_props_typedef() && self.props_type_text.is_some())
        {
            return "{} as any as $$ComponentProps".to_string();
        }
        if self.has_component_props_typedef() {
            return "/** @type {$$ComponentProps} */({})".to_string();
        }
        if let Some(type_text) = &self.props_type_text {
            return format!("{{}} as any as {type_text}");
        }
        if let Some(jsdoc_type) = &self.props_jsdoc_type {
            return format!("/** @type {jsdoc_type} */({{}})");
        }

        let entries = self.runes_prop_entries();
        if entries.is_empty() {
            return if is_ts {
                "{} as Record<string, never>".to_string()
            } else {
                "/** @type {Record<string, never>} */ ({})".to_string()
            };
        }
        format!("{{{entries}}}")
    }

    fn runes_prop_entries(&self) -> String {
        if !self.flags.contains(ExportedNamesFlags::HAS_PROPS_RUNE) {
            return String::new();
        }
        self.ordered()
            .filter(|(_, info)| info.is_prop() && !info.is_named_export())
            .map(|(name, info)| format!("{name}: {}", info.local_name))
            .collect::<Vec<_>>()
            .join(" , ")
    }
    #[must_use]
    pub fn create_exports_str(&self, is_svelte5: bool, is_ts: bool) -> String {
        self.create_exports_str_with_accessors(is_svelte5, false, is_ts)
    }

    #[must_use]
    pub fn create_exports_str_with_accessors(
        &self,
        is_svelte5: bool,
        accessors: bool,
        is_ts: bool,
    ) -> String {
        if !is_svelte5 {
            return String::new();
        }
        let runes_mode = self.is_runes_mode();
        let mut type_entries = String::new();
        let mut value_entries = String::new();
        for (en, info) in self
            .ordered()
            .filter(|(_, info)| Self::is_export(info, accessors, runes_mode))
        {
            if !type_entries.is_empty() {
                type_entries.push(',');
            }
            if is_ts && let Some(doc) = &info.doc {
                type_entries.push('\n');
                type_entries.push_str(doc);
            }
            type_entries.push_str(en);
            if let Some(type_annotation) = &info.type_annotation {
                type_entries.push_str(": ");
                type_entries.push_str(type_annotation);
            } else {
                type_entries.push_str(": typeof ");
                type_entries.push_str(&info.local_name);
            }

            // Official's `onlyTyped` value list omits untyped runes exports.
            if runes_mode && info.type_annotation.is_some() {
                if !value_entries.is_empty() {
                    value_entries.push(',');
                }
                value_entries.push_str(en);
                value_entries.push_str(": ");
                value_entries.push_str(&info.local_name);
            }
        }
        if type_entries.is_empty() {
            ", exports: {}".to_string()
        } else {
            let mut result = String::with_capacity(40 + value_entries.len() + type_entries.len());
            if is_ts {
                result.push_str(", exports: {");
                result.push_str(&value_entries);
                result.push_str("} as any as { ");
                result.push_str(&type_entries);
                result.push_str(" }");
            } else {
                result.push_str(", exports: /** @type {{");
                result.push_str(&type_entries);
                result.push_str("}} */ ({})");
            }
            result
        }
    }
    #[must_use]
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
                    .map(|n| format!("'{n}'"))
                    .collect();
                format!(", bindings: __sveltets_$$bindings({})", bindings.join(", "))
            }
        } else {
            ", bindings: \"\"".to_string()
        }
    }
    /// Return just the raw bindings value (for __`sveltets_Render` class)
    #[must_use]
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
                    .map(|n| format!("'{n}'"))
                    .collect();
                format!("__sveltets_$$bindings({})", bindings.join(", "))
            }
        } else {
            "\"\"".to_string()
        }
    }

    /// Return just the raw exports value (for __`sveltets_Render` class)
    #[must_use]
    pub fn create_raw_exports_str(
        &self,
        is_svelte5: bool,
        accessors: bool,
        _is_ts: bool,
    ) -> String {
        if !is_svelte5 {
            return "{}".to_string();
        }
        let runes_mode = self.is_runes_mode();
        let has_exports = self
            .ordered()
            .any(|(_, info)| Self::is_export(info, accessors, runes_mode));
        if has_exports {
            // Return a sentinel that signals "has exports" - the caller
            // will use $$render<gn>().exports instead of {}
            "$$HAS_EXPORTS$$".to_string()
        } else {
            "{}".to_string()
        }
    }

    pub fn write_optional_props(&self, output: &mut String) -> bool {
        let mut wrote_prop = false;
        for en in &self.insertion_order {
            let Some(info) = self.names.get(en) else {
                continue;
            };
            if info.has_default() || !info.is_let() {
                if wrote_prop {
                    output.push(',');
                }
                output.push('\'');
                output.push_str(en);
                output.push('\'');
                wrote_prop = true;
            }
        }
        wrote_prop
    }
    /// Class-body getters for the Svelte-4 class component. Mirrors upstream
    /// `createClassGetters`: one per non-`let` export (const / function / class).
    #[must_use]
    pub fn create_class_getters(&self, generics: &str) -> String {
        let runes_mode = self.is_runes_mode();
        let mut out = String::new();
        for (_, info) in self.ordered().filter(|(_, info)| !info.is_let()) {
            let name = &info.local_name;
            if runes_mode {
                let _ = write!(
                    out,
                    "\n    get {name}() {{ return $$render{generics}().exports.{name} }}"
                );
            } else {
                let _ = write!(
                    out,
                    "\n    get {name}() {{ return __sveltets_2_nonNullable(this.$$prop_def.{name}) }}"
                );
            }
        }
        out
    }

    /// Class-body accessors emitted when `accessors` is on. Mirrors upstream
    /// `createClassAccessors`: every export that is not already a getter.
    #[must_use]
    pub fn create_class_accessors(&self) -> String {
        let mut out = String::new();
        for (_, info) in self.ordered().filter(|(_, info)| info.is_let()) {
            let name = &info.local_name;
            let _ = write!(
                out,
                "\n    get {name}() {{ return this.$$prop_def.{name} }}\n    /**accessor*/\n    set {name}(_) {{}}"
            );
        }
        out
    }

    fn ordered(&self) -> impl Iterator<Item = (&str, &ExportedNameInfo)> {
        self.insertion_order
            .iter()
            .filter_map(|n| self.names.get(n).map(|i| (n.as_str(), i)))
    }

    const fn is_export(info: &ExportedNameInfo, accessors: bool, runes_mode: bool) -> bool {
        if accessors && info.is_let() {
            return true;
        }
        if info.is_prop() && !info.is_named_export() {
            return false;
        }
        !info.is_let() || (runes_mode && info.is_named_export())
    }

    fn write_type_entry(output: &mut String, name: &str, info: &ExportedNameInfo) {
        if let Some(doc) = &info.doc {
            output.push_str(doc);
            output.push(' ');
        }
        output.push_str(name);
        // Official `createReturnElementsType`: `${name}${value.required ? '' : '?'}`.
        if !info.is_required() {
            output.push('?');
        }
        output.push_str(": ");
        if let Some(type_annotation) = &info.type_annotation {
            output.push_str(type_annotation);
        } else {
            output.push_str("typeof ");
            output.push_str(&info.local_name);
        }
    }
}

#[cfg(test)]
mod tests {
    use std::fmt::Write;

    use super::super::test_support::run_svelte2tsx;
    use super::*;
    use crate::svelte2tsx::svelte2tsx::svelte2tsx;

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

    #[test]
    fn large_props_output_preserves_insertion_order() {
        let mut names = ExportedNames::new();
        let mut expected = String::from("{");
        for index in 0..256 {
            let exported = format!("prop_{index:03}");
            let local = format!("local_{index:03}");
            names.add_full(
                exported.clone(),
                local.clone(),
                None,
                ExportFlags::default().with_prop_if(true).with_let_if(true),
            );
            if index != 0 {
                expected.push_str(" , ");
            }
            write!(expected, "{exported}: {local}").unwrap();
        }
        expected.push('}');

        assert_eq!(names.create_props_str(false, false), expected);
    }

    #[test]
    fn large_runes_exports_output_preserves_insertion_order() {
        let mut names = ExportedNames::new();
        names.set_uses_runes(true);
        let mut values = String::new();
        let mut types = String::new();
        for index in 0..256 {
            let exported = format!("export_{index:03}");
            let local = format!("local_{index:03}");
            names.add_full(
                exported.clone(),
                local.clone(),
                Some("number".to_string()),
                ExportFlags::default().with_named_export_if(true),
            );
            if index != 0 {
                values.push(',');
                types.push(',');
            }
            write!(values, "{exported}: {local}").unwrap();
            write!(types, "{exported}: number").unwrap();
        }

        assert_eq!(
            names.create_exports_str_with_accessors(true, false, true),
            format!(", exports: {{{values}}} as any as {{ {types} }}")
        );
    }
}
