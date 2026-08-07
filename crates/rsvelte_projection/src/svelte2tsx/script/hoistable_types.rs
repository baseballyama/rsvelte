//! Hoisting of instance-script `type` / `interface` declarations above
//! `function $$render()`, plus the dts-mode interface→type rewrite.

use std::collections::{HashSet, VecDeque};

use rustc_hash::{FxHashMap, FxHashSet};
#[cfg(test)]
use std::cell::Cell;

use super::super::magic_string::MagicString;
use super::ExportedNames;

#[cfg(test)]
thread_local! {
    static DEPENDENCY_EDGES: Cell<usize> = const { Cell::new(0) };
}

#[inline(always)]
fn record_dependency_edge() {
    #[cfg(test)]
    DEPENDENCY_EDGES.with(|edges| edges.set(edges.get() + 1));
}

#[cfg(test)]
fn reset_dependency_edges() {
    DEPENDENCY_EDGES.with(|edges| edges.set(0));
}

#[cfg(test)]
fn dependency_edges() -> usize {
    DEPENDENCY_EDGES.with(Cell::get)
}

/// One top-level `type X = ...` or `interface X { ... }` from the instance
/// script that may be hoistable above `function $$render()`.
#[derive(Debug, Clone)]
pub(super) struct HoistCandidate {
    pub(super) name: String,
    /// Span relative to the script content (raw_content).
    pub(super) rel_start: u32,
    pub(super) rel_end: u32,
}

/// Names that have a special meaning in svelte2tsx and must never be hoisted.
pub(super) fn is_special_type_name(name: &str) -> bool {
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
pub(super) fn collect_type_body_deps<'a>(
    body: &'a str,
    candidate_indices: &FxHashMap<&str, u32>,
    self_name: &str,
    generics: &FxHashSet<&str>,
    script_generic_names: &HashSet<String>,
    instance_value_names: &HashSet<String>,
    instance_import_names: &HashSet<String>,
) -> (FxHashSet<&'a str>, FxHashSet<u32>, bool) {
    let mut value_deps = FxHashSet::default();
    let mut type_deps = FxHashSet::default();
    let mut references_script_generic = false;
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
            // TypeScript / JS structural keywords (e.g. the `type` in
            // `type X = …`) can never be type-reference identifiers, so skip
            // them. Without this, a user binding named `type` (from e.g.
            // `let { type, ...}: Props = $props()`) would appear in
            // `instance_value_names` and the text-scanner would wrongly flag
            // the `type` keyword in `type InputType = …` as a value_dep,
            // blocking hoisting of `InputType` and transitively `Props`.
            if is_ts_structural_keyword(ident) {
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
                && (j == 6 || !is_ascii_ident_byte(bytes[j - 7]));
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
                value_deps.insert(ident);
            } else if is_property_key {
                // skip — property keys aren't dependencies
            } else if script_generic_names.contains(ident) {
                references_script_generic = true;
            } else if let Some(&candidate_index) = candidate_indices.get(ident) {
                type_deps.insert(candidate_index);
            } else if instance_value_names.contains(ident) && !instance_import_names.contains(ident)
            {
                // Identifier resolves to an instance-script value (a `let`,
                // `const`, `class`, `enum`, or namespace) that isn't an
                // import. Even outside a `typeof`, mentioning such a name
                // inside a type body forbids hoisting because hoisting would
                // place the type at module scope where the binding is gone.
                value_deps.insert(ident);
            }
            continue;
        }
        i += 1;
    }
    (value_deps, type_deps, references_script_generic)
}

/// Returns `true` for TypeScript / JavaScript reserved keywords that can
/// never be a user-defined type-reference or value-reference in the sense
/// tracked by `collect_type_body_deps`. Mirrors what the TypeScript compiler
/// does implicitly: when it walks the AST, only `TypeReferenceNode` and
/// `TypeQueryNode` nodes contribute to deps; syntactic keyword tokens
/// (`type`, `interface`, `keyof`, etc.) are never `TypeReferenceNode`s.
///
/// Without this guard a destructured binding named `type` (e.g.
/// `let { type, ... }: Props = $props()`) ends up in `instance_value_names`
/// and the text scanner — which can't distinguish the `type` keyword in
/// `type InputType = Exclude<…>` from a reference to the binding — wrongly
/// flags `InputType` (and transitively `Props`) as non-hoistable.
#[inline]
pub(super) fn is_ts_structural_keyword(ident: &str) -> bool {
    matches!(
        ident,
        // Declaration-header keywords that are syntactic, never type-refs.
        "type"
            | "interface"
            | "enum"
            | "namespace"
            | "module"
            | "declare"
            | "abstract"
            | "export"
            | "import"
            // Type-operator keywords.
            | "keyof"
            | "infer"
            | "readonly"
            | "unique"
            | "is"
            | "asserts"
            | "satisfies"
            // Control-flow / statement keywords — can't be type-ref identifiers.
            | "extends"
            | "implements"
            | "new"
            | "typeof"
            | "instanceof"
            | "void"
            | "in"
            | "of"
            | "as"
            | "from"
            | "let"
            | "const"
            | "var"
            | "function"
            | "class"
            | "return"
            | "if"
            | "else"
            | "for"
            | "while"
            | "do"
            | "switch"
            | "case"
            | "break"
            | "continue"
            | "try"
            | "catch"
            | "finally"
            | "throw"
            | "delete"
            | "await"
            | "async"
            | "yield"
            | "with"
            | "static"
            | "get"
            | "set"
            | "super"
            | "this"
            // Primitive/built-in type keywords (not user-defined names).
            | "any"
            | "unknown"
            | "never"
            | "object"
            | "string"
            | "number"
            | "boolean"
            | "symbol"
            | "bigint"
            | "null"
            | "undefined"
            | "true"
            | "false"
    )
}

#[inline]
fn is_ascii_ident_byte(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'$'
}

fn resolve_candidate_dependencies<'a, I>(
    type_dependencies: I,
    blocked: &mut [bool],
) -> (Vec<bool>, Vec<usize>)
where
    I: Clone + ExactSizeIterator<Item = &'a FxHashSet<u32>>,
{
    let candidate_count = type_dependencies.len();
    let mut dependents = vec![Vec::<u32>::new(); candidate_count];
    for (candidate, dependencies) in type_dependencies.clone().enumerate() {
        for &dependency in dependencies {
            record_dependency_edge();
            dependents[dependency as usize].push(candidate as u32);
        }
    }

    let initially_blocked = blocked.to_vec();
    let mut blocked_pass = vec![u32::MAX; candidate_count];
    let mut blocked_queue = VecDeque::new();
    for (candidate, &is_blocked) in initially_blocked.iter().enumerate() {
        if is_blocked {
            blocked_pass[candidate] = 0;
            blocked_queue.push_back(candidate as u32);
        }
    }
    // Initially disallowed names are visible for the entire first upstream scan.
    for (dependency, &is_blocked) in initially_blocked.iter().enumerate() {
        if !is_blocked {
            continue;
        }
        for &candidate in &dependents[dependency] {
            let candidate_index = candidate as usize;
            if blocked_pass[candidate_index] != 0 {
                blocked_pass[candidate_index] = 0;
                blocked_queue.push_front(candidate);
            }
        }
    }
    while let Some(dependency) = blocked_queue.pop_front() {
        for &candidate in &dependents[dependency as usize] {
            let candidate_index = candidate as usize;
            let weight = u32::from(dependency >= candidate);
            let candidate_pass = blocked_pass[dependency as usize].saturating_add(weight);
            if candidate_pass < blocked_pass[candidate_index] {
                blocked_pass[candidate_index] = candidate_pass;
                if weight == 0 {
                    blocked_queue.push_front(candidate);
                } else {
                    blocked_queue.push_back(candidate);
                }
            }
        }
    }

    let mut remaining_dependencies: Vec<u32> = type_dependencies
        .map(|dependencies| dependencies.len() as u32)
        .collect();
    let mut promotion_pass = vec![0u32; candidate_count];
    let mut ready = VecDeque::new();
    for candidate in 0..candidate_count {
        if blocked_pass[candidate] == u32::MAX && remaining_dependencies[candidate] == 0 {
            ready.push_back(candidate as u32);
        }
    }

    let mut hoistable = vec![false; candidate_count];
    while let Some(dependency) = ready.pop_front() {
        let dependency_index = dependency as usize;
        hoistable[dependency_index] = true;
        for &candidate in &dependents[dependency_index] {
            let candidate_index = candidate as usize;
            if blocked_pass[candidate_index] != u32::MAX {
                continue;
            }
            let candidate_pass =
                promotion_pass[dependency_index] + u32::from(dependency >= candidate);
            promotion_pass[candidate_index] = promotion_pass[candidate_index].max(candidate_pass);
            remaining_dependencies[candidate_index] -= 1;
            if remaining_dependencies[candidate_index] == 0 {
                ready.push_back(candidate);
            }
        }
    }

    let max_pass = promotion_pass.iter().copied().max().unwrap_or(0) as usize;
    let mut candidates_by_pass = vec![Vec::new(); max_pass + 1];
    for candidate in 0..candidate_count {
        if hoistable[candidate] {
            candidates_by_pass[promotion_pass[candidate] as usize].push(candidate);
        }
    }
    let hoist_order: Vec<usize> = candidates_by_pass.into_iter().flatten().collect();
    // Upstream performs one final scan after the last pass that promotes a type.
    let last_executed_pass = if hoist_order.is_empty() {
        0
    } else {
        max_pass as u32 + 1
    };
    for candidate in 0..candidate_count {
        blocked[candidate] = blocked_pass[candidate] <= last_executed_pass;
    }
    (hoistable, hoist_order)
}

/// Determine which `HoistCandidate`s can be hoisted above `function $$render()`
/// and record their absolute source ranges (and names) on `exported_names`.
///
/// `script_generic_names` is the set of generic parameter names declared on
/// the `<script generics="...">` attribute. Any candidate that references
/// one of those names (even transitively, via another candidate) can't be
/// hoisted — `T` in scope on `function $$render<T>()` isn't visible at
/// module scope.
pub(super) fn resolve_hoistable_type_decls(
    candidates: &[HoistCandidate],
    raw_content: &str,
    offset: u32,
    exported_names: &mut ExportedNames,
    script_generic_names: &HashSet<String>,
    // Name of the props interface when `$props()` is annotated with a bare named
    // reference (`: Props` → `Some("Props")`).
    props_named_ref: Option<&str>,
    // The inline `$props()` annotation text when it is NOT a bare named reference
    // (e.g. `: { item: Wrapper<L> }`). Used to build the synthetic
    // `$$ComponentProps` props-interface dependency set.
    props_inline_type: Option<&str>,
) {
    if candidates.is_empty() {
        return;
    }
    let mut candidate_indices: FxHashMap<&str, u32> =
        FxHashMap::with_capacity_and_hasher(candidates.len(), Default::default());
    for (index, candidate) in candidates.iter().enumerate() {
        candidate_indices
            .entry(candidate.name.as_str())
            .or_insert(index as u32);
    }
    // Per-candidate: collect generic parameter names (so `interface Props<T>`
    // doesn't see `T` as a dependency).
    let generics: Vec<FxHashSet<&str>> = candidates
        .iter()
        .map(|c| {
            let mut g = FxHashSet::default();
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
            let generic_start = header.find(&c.name).map(|name_start| {
                let mut position = name_start + c.name.len();
                while position < header.len() && header.as_bytes()[position].is_ascii_whitespace() {
                    position += 1;
                }
                position
            });
            if let (Some(lt), Some(gt)) = (generic_start, header.rfind('>'))
                && lt < gt
                && header.as_bytes()[lt] == b'<'
            {
                let inner = &header[lt + 1..gt];
                for part in inner.split(',') {
                    let trimmed = part.trim();
                    let name = trimmed
                        .split(|ch: char| !is_ascii_ident_char(ch))
                        .find(|s| !s.is_empty())
                        .unwrap_or("");
                    if !name.is_empty() {
                        g.insert(name);
                    }
                }
                // type_deps are limited to candidate_indices by
                // `collect_type_body_deps`, so anything else simply doesn't
                // appear here.
            }
            g
        })
        .collect();

    // Pre-compute deps for each candidate.
    let deps: Vec<(FxHashSet<&str>, FxHashSet<u32>, bool)> = candidates
        .iter()
        .enumerate()
        .map(|(i, c)| {
            let s = c.rel_start as usize;
            let e = c.rel_end.min(raw_content.len() as u32) as usize;
            let body = if s < e { &raw_content[s..e] } else { "" };
            collect_type_body_deps(
                body,
                &candidate_indices,
                &c.name,
                &generics[i],
                script_generic_names,
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
        for (i, (_, _, references_script_generic)) in deps.iter().enumerate() {
            if !blocked[i] && *references_script_generic {
                blocked[i] = true;
            }
        }
    }
    // Initial blocked: candidates with a value_dep that isn't allowed.
    // "Allowed" = NOT in instance_value_names except imports, OR in any
    // module-script set (module-script bindings are stable references).
    for (i, (value_deps, _, _)) in deps.iter().enumerate() {
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
                    v
                }
            } else {
                v
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

    // Record the order in which candidates are promoted to hoistable. The JS
    // reference (`HoistableInterfaces.determineHoistableInterfaces`) inserts
    // each interface into a `Map` as soon as all its type dependencies are
    // already hoistable, then `moveHoistableInterfaces` moves them to
    // `scriptStart` in that Map (insertion) order. A dependency therefore lands
    // BEFORE the interface that depends on it, even when it appears later in
    // source (e.g. `interface A extends B<A>` followed by `interface B<T> {}`
    // emits `B` first). We mirror that by emitting `hoistable_type_ranges` in
    // promotion order rather than source order.
    let (hoistable, hoist_order) =
        resolve_candidate_dependencies(deps.iter().map(|(_, deps, _)| deps), &mut blocked);

    // Gate the entire move on the props interface being hoistable. Mirrors
    // `HoistableInterfaces.moveHoistableInterfaces`, which only moves anything
    // when `hoistable.has(this.props_interface.name)` — if the props interface
    // can't be hoisted (e.g. it references a `<script generics=...>` parameter),
    // NOTHING is moved and every type/interface stays inside `function
    // $$render<...>()` so the generic parameters remain in scope (#964).
    let props_interface_hoistable = if let Some(named) = props_named_ref {
        // Bare `: Props` reference. The props interface is the candidate named
        // `Props`; it's hoistable iff that candidate was promoted.
        candidate_indices
            .get(named)
            .map(|&idx| hoistable[idx as usize])
            // A bare `: Props` reference whose `Props` is NOT a local interface
            // (an imported / global type) never sets `props_interface.name` in
            // upstream `analyze$propsRune` (its `interface_map.get(name)` misses),
            // so `moveHoistableInterfaces` hits its early `return` and hoists
            // NOTHING — every type/interface stays inside `function $$render()`.
            // Gate false to match (`$$Generic`-referenced types are still moved
            // unconditionally by `hoist_dollar_generic_referenced_types`).
            .unwrap_or(false)
    } else if let Some(inline) = props_inline_type {
        // Synthetic `$$ComponentProps` built from the inline annotation. It's
        // hoistable iff every type dependency is a hoistable candidate (or an
        // outside reference such as an import) AND it doesn't reference a
        // `<script generics=...>` parameter and has no disallowed value deps.
        let (value_deps, type_deps, references_script_generic) = collect_type_body_deps(
            inline,
            &candidate_indices,
            // No self-name for the synthetic interface.
            "",
            // No own generics on the synthetic props interface.
            &FxHashSet::default(),
            script_generic_names,
            &exported_names.instance_value_names,
            &exported_names.instance_import_names,
        );
        let mut ok = !references_script_generic;
        if ok {
            for &idx in &type_deps {
                let idx = idx as usize;
                if blocked[idx] || !hoistable[idx] {
                    ok = false;
                    break;
                }
            }
        }
        if ok {
            for v in &value_deps {
                let resolved: &str = v.strip_prefix('$').filter(|s| !s.is_empty()).unwrap_or(v);
                let in_instance_value = exported_names.instance_value_names.contains(resolved);
                let in_instance_import = exported_names.instance_import_names.contains(resolved);
                let in_module = exported_names.module_value_names.contains(resolved)
                    || exported_names.module_import_names.contains(resolved);
                if in_instance_value && !in_instance_import && !in_module {
                    ok = false;
                    break;
                }
            }
        }
        ok
    } else {
        // Whole-object / untyped `$props()` (incl. the auto-generated
        // `$$ComponentProps`/`Record<…>` shapes) — there is no named props
        // interface, so upstream `moveHoistableInterfaces` hits its early
        // `if (!this.props_interface.name) return;` and hoists NOTHING; every
        // type/interface stays inside `function $$render()`. `$$Generic`-
        // referenced types are still hoisted unconditionally by the separate
        // `hoist_dollar_generic_referenced_types` path, so gating here false
        // does not strand a generic constraint.
        false
    };

    if !props_interface_hoistable {
        return;
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
pub(super) fn is_ascii_ident_char(ch: char) -> bool {
    ch.is_ascii_alphanumeric() || ch == '_' || ch == '$'
}

/// Hoist instance-script type/interface declarations whose names appear as
/// `$$Generic<X>` constraints. Mirrors the JS reference's `nodesToMove` path
/// (`interfacesAndTypes.getNodesWithNames(generics.getTypeReferences())`) which
/// moves these unconditionally regardless of `$props()` rune usage — without
/// hoisting, the constraint references the type before it's defined.
pub(super) fn hoist_dollar_generic_referenced_types(
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
        .filter(|s| s.chars().all(is_ascii_ident_char) && !s.is_empty())
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
pub(super) fn walk_back_through_trivia(bytes: &[u8], from: usize) -> usize {
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

/// Rewrite a top-level `interface X { ... }` (with optional `extends Y, Z`)
/// into `type X = Y & Z & { ... }` for dts-mode output. Indirectly using
/// interfaces inside the return type of a function is forbidden by the
/// declaration emitter, so the JS reference's
/// `transformInterfacesToTypes(...)` performs this rewrite. Mirror that here.
///
/// Concretely:
/// - `interface X { … }`                  → `type X ={ … }`
/// - `interface X extends Y { … }`        → `type X = Y &  { … }`
/// - `interface X extends Y, Z { … }`     → `type X = Y & Z &  { … }`
/// - `interface X<T> extends Y { … }`     → `type X<T> = Y &  { … }`
pub(super) fn rewrite_interface_to_type_dts(
    iface: &oxc_ast::ast::TSInterfaceDeclaration<'_>,
    raw_content: &str,
    offset: u32,
    str: &mut MagicString<'_>,
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

#[cfg(test)]
mod tests {
    use std::fmt::Write as _;

    use super::*;
    use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, Svelte2TsxResult, svelte2tsx};

    fn convert_ts(source: &str) -> Svelte2TsxResult {
        svelte2tsx(
            source,
            Svelte2TsxOptions {
                filename: "Hoist.svelte".to_string(),
                is_ts_file: true,
                ..Default::default()
            },
        )
        .expect("svelte2tsx ok")
    }

    fn line_column(text: &str, offset: usize) -> (u32, u32) {
        let prefix = &text[..offset];
        let line = prefix.bytes().filter(|byte| *byte == b'\n').count() as u32;
        let line_start = prefix.rfind('\n').map_or(0, |index| index + 1);
        let column = text[line_start..offset].encode_utf16().count() as u32;
        (line, column)
    }

    fn old_resolve_candidate_dependencies(
        dependencies: &[FxHashSet<u32>],
        mut blocked: Vec<bool>,
    ) -> (Vec<bool>, Vec<usize>) {
        let mut hoistable = vec![false; dependencies.len()];
        let mut hoist_order = Vec::new();
        let mut progress = true;
        while progress {
            progress = false;
            for candidate in 0..dependencies.len() {
                if blocked[candidate] || hoistable[candidate] {
                    continue;
                }
                let mut can_hoist = true;
                for &dependency in &dependencies[candidate] {
                    let dependency = dependency as usize;
                    if blocked[dependency] {
                        blocked[candidate] = true;
                        can_hoist = false;
                        break;
                    }
                    if !hoistable[dependency] {
                        can_hoist = false;
                    }
                }
                if can_hoist {
                    hoistable[candidate] = true;
                    hoist_order.push(candidate);
                    progress = true;
                }
            }
        }
        (blocked, hoist_order)
    }

    #[test]
    fn dependency_graph_matches_fixed_point_oracle() {
        let mut state = 0x9e37_79b9_u32;
        for candidate_count in 1..=32 {
            for _ in 0..32 {
                let mut dependencies = vec![FxHashSet::default(); candidate_count];
                let mut blocked = vec![false; candidate_count];
                for candidate in 0..candidate_count {
                    state = state.wrapping_mul(1_664_525).wrapping_add(1_013_904_223);
                    blocked[candidate] = state & 31 == 0;
                    for dependency in 0..candidate_count {
                        if candidate == dependency {
                            continue;
                        }
                        state = state.wrapping_mul(1_664_525).wrapping_add(1_013_904_223);
                        if state & 15 == 0 {
                            dependencies[candidate].insert(dependency as u32);
                        }
                    }
                }

                let expected = old_resolve_candidate_dependencies(&dependencies, blocked.clone());
                let mut actual_blocked = blocked;
                let (actual_hoistable, actual_order) =
                    resolve_candidate_dependencies(dependencies.iter(), &mut actual_blocked);
                let expected_hoistable: Vec<bool> = (0..candidate_count)
                    .map(|candidate| expected.1.contains(&candidate))
                    .collect();
                assert_eq!(
                    actual_blocked, expected.0,
                    "hoistable={actual_hoistable:?} dependencies={dependencies:?}"
                );
                assert_eq!(actual_hoistable, expected_hoistable);
                assert_eq!(actual_order, expected.1);
            }
        }
    }

    #[test]
    fn dependency_graph_handles_reverse_chain_fanout_cycles_and_order() {
        let candidate_count = 4096;
        let mut reverse_chain = vec![FxHashSet::default(); candidate_count];
        for (candidate, dependencies) in reverse_chain
            .iter_mut()
            .enumerate()
            .take(candidate_count - 1)
        {
            dependencies.insert(candidate as u32 + 1);
        }
        let mut blocked = vec![false; candidate_count];
        let (hoistable, order) = resolve_candidate_dependencies(reverse_chain.iter(), &mut blocked);
        assert!(hoistable.iter().all(|&value| value));
        assert_eq!(order, (0..candidate_count).rev().collect::<Vec<_>>());

        let mut fanout = vec![FxHashSet::default(); 256];
        for dependencies in fanout.iter_mut().skip(1) {
            dependencies.insert(0);
        }
        let mut blocked = vec![false; fanout.len()];
        blocked[0] = true;
        let (hoistable, order) = resolve_candidate_dependencies(fanout.iter(), &mut blocked);
        assert!(blocked.iter().all(|&value| value));
        assert!(hoistable.iter().all(|&value| !value));
        assert!(order.is_empty());

        let dependencies = [
            FxHashSet::from_iter([3]),
            FxHashSet::from_iter([2]),
            FxHashSet::default(),
            FxHashSet::default(),
            FxHashSet::from_iter([5]),
            FxHashSet::from_iter([4]),
        ];
        let mut blocked = vec![false; dependencies.len()];
        let (hoistable, order) = resolve_candidate_dependencies(dependencies.iter(), &mut blocked);
        assert_eq!(order, vec![2, 3, 0, 1]);
        assert_eq!(hoistable, vec![true, true, true, true, false, false]);
    }

    #[test]
    fn is_ts_structural_keyword_matches_keywords_not_type_names() {
        // Declaration / operator / control-flow keywords + primitive type
        // keywords are structural and never user type-reference names.
        for kw in [
            "type",
            "interface",
            "keyof",
            "infer",
            "readonly",
            "extends",
            "typeof",
            "satisfies",
            "string",
            "number",
            "boolean",
            "return",
            "null",
        ] {
            assert!(is_ts_structural_keyword(kw), "{kw} should be structural");
        }
        // Real user-defined type/interface names must NOT be treated as keywords.
        for name in ["Props", "InputType", "ComponentProps", "MyType", "T"] {
            assert!(
                !is_ts_structural_keyword(name),
                "{name} should not be structural"
            );
        }
    }

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
        let candidates: FxHashMap<&str, u32> = FxHashMap::default();
        let generics = FxHashSet::default();
        let script_generics = HashSet::new();
        let values: HashSet<String> = HashSet::new();
        let imports: HashSet<String> = HashSet::new();
        // Must not panic.
        let (_value_deps, _type_deps, _references_script_generic) = collect_type_body_deps(
            body,
            &candidates,
            "Props",
            &generics,
            &script_generics,
            &values,
            &imports,
        );
    }

    #[test]
    fn dependency_tokens_ignore_unicode_trivia_keys_keywords_and_candidate_generics() {
        let body = "type Props<Local> = {\n\
            /** 日本語 T type */\n\
            T: 'T';\n\
            type: Local;\n\
            wrapped: Wrapper;\n\
            value: typeof local_value;\n\
        }";
        let candidates = FxHashMap::from_iter([("Props", 0), ("Wrapper", 1)]);
        let generics = FxHashSet::from_iter(["Local"]);
        let script_generics = HashSet::from(["T".to_string(), "type".to_string()]);
        let values = HashSet::from(["local_value".to_string()]);
        let imports = HashSet::new();

        let (value_deps, type_deps, references_script_generic) = collect_type_body_deps(
            body,
            &candidates,
            "Props",
            &generics,
            &script_generics,
            &values,
            &imports,
        );

        assert_eq!(value_deps, FxHashSet::from_iter(["local_value"]));
        assert_eq!(type_deps, FxHashSet::from_iter([1]));
        assert!(!references_script_generic);
        let value = value_deps.iter().next().unwrap();
        let body_start = body.as_ptr() as usize;
        let value_start = value.as_ptr() as usize;
        assert!((body_start..body_start + body.len()).contains(&value_start));
    }

    #[test]
    fn candidate_generic_shadows_script_generic_when_hoisting() {
        let source = "<script lang=\"ts\" generics=\"T\">\n\
            type Local<T> = { value: T };\n\
            type Props = { item: Local<string> };\n\
            let { item }: Props = $props();\n\
            </script>\n\
            <p>{item.value}</p>";
        let out = svelte2tsx(source, Svelte2TsxOptions::default())
            .expect("svelte2tsx ok")
            .code;
        let local = out.find("type Local").expect("emits Local");
        let props = out.find("type Props").expect("emits Props");
        let render = out.find("function $$render").expect("has $$render");
        assert!(local < props && props < render, "{out}");
    }

    #[test]
    fn large_reverse_dependency_graph_keeps_official_order_with_unicode_trivia() {
        const TYPE_COUNT: usize = 256;
        let mut source = String::from("<script lang=\"ts\" generics=\"T\">\n");
        for index in 0..TYPE_COUNT - 1 {
            writeln!(
                source,
                "// 日本語 T appears only in trivia\ntype T{index} = {{ value: T{} }};\n",
                index + 1
            )
            .unwrap();
        }
        write!(
            source,
            "// 日本語 T appears only in trivia\ntype T{} = string;\n\
             type Props = {{ value: T0 }};\n\
             let {{ value }}: Props = $props();\n\
             </script>\n<p>{{value}}</p>",
            TYPE_COUNT - 1
        )
        .unwrap();

        let out = svelte2tsx(&source, Svelte2TsxOptions::default())
            .expect("svelte2tsx ok")
            .code;
        let render = out.find("function $$render").expect("has $$render");
        let mut previous = 0;
        for index in (0..TYPE_COUNT).rev() {
            let position = out
                .find(&format!("type T{index} ="))
                .unwrap_or_else(|| panic!("missing T{index}"));
            assert!(position > previous && position < render, "T{index}: {out}");
            previous = position;
        }
        let props = out.find("type Props").expect("emits Props");
        assert!(props > previous && props < render, "{out}");
    }

    #[test]
    fn imported_props_type_hoists_nothing_above_render() {
        // `}: ImportedProps = $props()` where `ImportedProps` is imported (not a
        // local interface) must NOT hoist any type above `function $$render()`
        // — upstream `analyze$propsRune`'s `interface_map.get(name)` misses an
        // imported name, so `moveHoistableInterfaces` early-returns. Guards the
        // `unwrap_or(false)` props-interface gate in `resolve_hoistable_type_decls`.
        let source = "<script lang=\"ts\">\n\
            import type { ImportedProps } from './types';\n\
            type Local = { a: number };\n\
            let { x }: ImportedProps = $props();\n\
            </script>\n\
            <div>{x}</div>";
        let out = svelte2tsx(source, Svelte2TsxOptions::default())
            .expect("svelte2tsx ok")
            .code;
        // `type Local` stays inside $$render → appears AFTER `function $$render`.
        let render_pos = out.find("function $$render").expect("has $$render");
        let local_pos = out.find("type Local").expect("emits Local");
        assert!(
            local_pos > render_pos,
            "type Local must stay inside $$render (not hoisted above it):\n{out}"
        );
    }

    #[test]
    fn props_type_arg_inline_synthesises_component_props_without_imports() {
        // `$props<{ ... }>()` type-argument form, in a component with NO import
        // statements (exercises the no-imports branch's duplicated
        // `props_type_arg_hoist` move_range). The inline object type is moved
        // out to `type $$ComponentProps = …` above `function $$render()` and the
        // call is rewritten to `$props<… $$ComponentProps …>()`.
        let source = "<script lang=\"ts\">\n\
            let { x } = $props<{ x: number }>();\n\
            </script>\n\
            <p>{x}</p>";
        let out = svelte2tsx(source, Svelte2TsxOptions::default())
            .expect("svelte2tsx ok")
            .code;
        assert!(
            out.contains("type $$ComponentProps = { x: number }"),
            "synthesises the alias:\n{out}"
        );
        let type_pos = out.find("type $$ComponentProps").unwrap();
        let render_pos = out.find("function $$render").unwrap();
        assert!(
            type_pos < render_pos,
            "alias hoisted above $$render:\n{out}"
        );
        assert!(
            out.contains("$props<") && out.contains("$$ComponentProps"),
            "call rewritten to reference the alias:\n{out}"
        );
    }

    #[test]
    fn reverse_dependency_chain_keeps_promotion_and_source_map_order() {
        let source = r#"<script lang="ts">
type Root = { value: Middle };
type Middle = { value: Leaf };
type Leaf = string;
let { value }: Root = $props();
</script>
<p>{value}</p>"#;
        let output = convert_ts(source);
        let leaf = output.code.find("type Leaf").expect("Leaf");
        let middle = output.code.find("type Middle").expect("Middle");
        let root = output.code.find("type Root").expect("Root");
        let render = output.code.find("function $$render").expect("render");
        assert!(leaf < middle && middle < root && root < render);

        let map =
            sourcemap::SourceMap::from_slice(output.map.as_deref().expect("source map").as_bytes())
                .expect("valid source map");
        for name in ["Leaf", "Middle", "Root"] {
            let source_declaration = source.find(&format!("type {name}")).expect("source type");
            let source_offset = source_declaration + "type ".len();
            let generated_declaration = output
                .code
                .find(&format!("type {name}"))
                .expect("generated type");
            let generated_offset = generated_declaration + "type ".len();
            assert_eq!(
                output.map_offset_forward(source_offset as u32),
                Some(generated_offset as u32)
            );
            let (generated_line, _) = line_column(&output.code, generated_declaration);
            let (source_line, _) = line_column(source, source_declaration);
            assert!(
                map.tokens().any(|token| {
                    token.get_dst_line() == generated_line
                        && token.get_src_line() == source_line
                        && token.get_src_col() == 0
                }),
                "{name} has no source-map segment on its moved output line"
            );
        }
    }

    #[test]
    fn reverse_chain_builds_one_reverse_edge_per_dependency() {
        let source = r#"<script lang="ts">
type T0 = { value: T1 };
type T1 = { value: T2 };
type T2 = { value: T3 };
type T3 = { value: T4 };
type T4 = { value: T5 };
type T5 = { value: T6 };
type T6 = { value: T7 };
type T7 = string;
let { value }: T0 = $props();
</script>
<p>{value}</p>"#;
        reset_dependency_edges();
        let output = convert_ts(source);
        assert_eq!(dependency_edges(), 7);
        assert!(
            output.code.find("type T7").expect("T7") < output.code.find("type T0").expect("T0")
        );
    }

    #[test]
    fn dense_reverse_dag_builds_one_reverse_edge_per_dependency() {
        let source = r#"<script lang="ts">
type T0 = { a: T1; b: T2; c: T3; d: T4; e: T5 };
type T1 = { b: T2; c: T3; d: T4; e: T5 };
type T2 = { c: T3; d: T4; e: T5 };
type T3 = { d: T4; e: T5 };
type T4 = { e: T5 };
type T5 = string;
let { a }: T0 = $props();
</script>
<p>{a}</p>"#;
        reset_dependency_edges();
        let output = convert_ts(source);
        assert_eq!(dependency_edges(), 15);
        let mut previous = 0;
        for name in ["T5", "T4", "T3", "T2", "T1", "T0"] {
            let position = output
                .code
                .find(&format!("type {name}"))
                .expect("hoisted type");
            assert!(position >= previous);
            previous = position;
        }
    }

    #[test]
    fn cyclic_types_and_their_props_consumer_stay_in_render() {
        let source = r#"<script lang="ts">
type A = B;
type B = A;
interface Props { value: A }
let { value }: Props = $props();
</script>
<p>{value}</p>"#;
        let output = convert_ts(source);
        let render = output.code.find("function $$render").expect("render");
        for declaration in ["type A", "type B", "interface Props"] {
            assert!(
                output.code.find(declaration).expect("declaration") > render,
                "{declaration} was unexpectedly hoisted:\n{}",
                output.code
            );
        }
    }

    #[test]
    fn module_shadow_blocks_type_and_dependent_props() {
        let source = r#"<script module lang="ts">
type Shared = { module: true };
</script>
<script lang="ts">
type Shared = { instance: true };
interface Props { value: Shared }
let { value }: Props = $props();
</script>
<p>{value}</p>"#;
        let output = convert_ts(source);
        let render = output.code.find("function $$render").expect("render");
        assert!(output.code.rfind("type Shared").expect("instance Shared") > render);
        assert!(output.code.find("interface Props").expect("Props") > render);
    }

    #[test]
    fn component_generic_dependency_blocks_the_whole_hoist() {
        let source = r#"<script lang="ts" generics="T">
type Box = { value: T };
interface Props { box: Box }
let { box }: Props = $props();
</script>
<p>{box.value}</p>"#;
        let output = convert_ts(source);
        let render = output
            .code
            .find("function $$render<T>")
            .expect("generic render");
        assert!(output.code.find("type Box").expect("Box") > render);
        assert!(output.code.find("interface Props").expect("Props") > render);
    }

    #[test]
    fn inline_props_type_uses_indexed_hoistability() {
        let source = r#"<script lang="ts">
type Leaf = string;
type Wrapper = { value: Leaf };
let { item }: { item: Wrapper } = $props();
</script>
<p>{item.value}</p>"#;
        let output = convert_ts(source);
        let leaf = output.code.find("type Leaf").expect("Leaf");
        let wrapper = output.code.find("type Wrapper").expect("Wrapper");
        let props = output
            .code
            .find("type $$ComponentProps")
            .expect("component props");
        let render = output.code.find("function $$render").expect("render");
        assert!(leaf < wrapper && wrapper < props && props < render);
    }

    #[test]
    fn dollar_generic_referenced_ranges_keep_candidate_source_order() {
        let source = r#"<script lang="ts">
interface First { first: true }
interface Second { second: true }
type A = $$Generic<Second>;
type B = $$Generic<First>;
export let value: A;
</script>
<p>{value}</p>"#;
        let output = convert_ts(source);
        let first = output.code.find("interface First").expect("First");
        let second = output.code.find("interface Second").expect("Second");
        let render = output.code.find("function $$render").expect("render");
        assert!(first < second && second < render);
    }
}
