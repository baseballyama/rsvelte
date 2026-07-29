//! Hoisting of instance-script `type` / `interface` declarations above
//! `function $$render()`, plus the dts-mode interface→type rewrite.

use std::collections::HashSet;

use rustc_hash::FxHashMap;
#[cfg(test)]
use std::cell::Cell;

use super::super::magic_string::MagicString;
use super::ExportedNames;

#[cfg(test)]
thread_local! {
    static FIXED_POINT_LOOKUPS: Cell<usize> = const { Cell::new(0) };
}

#[inline(always)]
fn record_fixed_point_lookup() {
    #[cfg(test)]
    FIXED_POINT_LOOKUPS.with(|lookups| lookups.set(lookups.get() + 1));
}

#[cfg(test)]
fn reset_fixed_point_lookups() {
    FIXED_POINT_LOOKUPS.with(|lookups| lookups.set(0));
}

#[cfg(test)]
fn fixed_point_lookups() -> usize {
    FIXED_POINT_LOOKUPS.with(Cell::get)
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
pub(super) fn collect_type_body_deps(
    body: &str,
    candidate_indices: &FxHashMap<&str, usize>,
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
            } else if candidate_indices.contains_key(ident) {
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
    let mut candidate_indices: FxHashMap<&str, usize> =
        FxHashMap::with_capacity_and_hasher(candidates.len(), Default::default());
    for (index, candidate) in candidates.iter().enumerate() {
        candidate_indices
            .entry(candidate.name.as_str())
            .or_insert(index);
    }
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
                // type_deps are limited to candidate_indices by
                // `collect_type_body_deps`, so anything else simply doesn't
                // appear here.
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
                &candidate_indices,
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
                // A type dep that isn't a local candidate is an outside
                // reference (import / global) — fine to reference from a hoisted
                // declaration.
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
                record_fixed_point_lookup();
                if let Some(&idx) = candidate_indices.get(dep.as_str()) {
                    if blocked[idx] {
                        blocked[i] = true;
                        can_hoist = false;
                        break;
                    }
                    if !hoistable[idx] {
                        can_hoist = false;
                    }
                }
            }
            if can_hoist {
                hoistable[i] = true;
                hoist_order.push(i);
                progress = true;
            }
        }
    }

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
            .map(|&idx| hoistable[idx])
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
        let (value_deps, type_deps) = collect_type_body_deps(
            inline,
            &candidate_indices,
            // No self-name for the synthetic interface.
            "",
            // No own generics on the synthetic props interface.
            &HashSet::new(),
            &exported_names.instance_value_names,
            &exported_names.instance_import_names,
        );
        let mut ok = true;
        // Generic references make the synthetic props interface non-hoistable.
        if !script_generic_names.is_empty() {
            for g in script_generic_names.iter() {
                if has_whole_ident(inline, g) {
                    ok = false;
                    break;
                }
            }
        }
        if ok {
            for dep in &type_deps {
                if let Some(&idx) = candidate_indices.get(dep.as_str())
                    && (blocked[idx] || !hoistable[idx])
                {
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
pub(super) fn is_ident_char_for_str(ch: char) -> bool {
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

#[cfg(test)]
mod tests {
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
        let candidates: FxHashMap<&str, usize> = FxHashMap::default();
        let generics: HashSet<String> = HashSet::new();
        let values: HashSet<String> = HashSet::new();
        let imports: HashSet<String> = HashSet::new();
        // Must not panic.
        let (_value_deps, _type_deps) =
            collect_type_body_deps(body, &candidates, "Props", &generics, &values, &imports);
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
    fn reverse_chain_uses_one_index_lookup_per_dependency_check() {
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
        reset_fixed_point_lookups();
        let output = convert_ts(source);
        assert_eq!(fixed_point_lookups(), 35);
        assert!(
            output.code.find("type T7").expect("T7") < output.code.find("type T0").expect("T0")
        );
    }

    #[test]
    fn dense_reverse_dag_has_quadratic_lookup_count() {
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
        reset_fixed_point_lookups();
        let output = convert_ts(source);
        assert_eq!(fixed_point_lookups(), 70);
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
