//! Relocation of top-level `{#snippet}` blocks: module-hoistable ones move to
//! module scope, the rest to the top of the instance script.

use std::collections::VecDeque;

use crate::ast::template::Root;
use rustc_hash::FxHashMap;

use super::super::magic_string::MagicString;
use super::super::script::ExportedNames;
use super::super::svelte2tsx::slice_src;
use super::super::utils::lexical::{lexical_identifiers, lexical_identifiers_in_expressions};

fn propagate_blocked_dependencies(dependents: &[Vec<u32>], blocked: &mut [bool]) {
    let mut blocked_queue = VecDeque::new();
    for (index, &is_blocked) in blocked.iter().enumerate() {
        if is_blocked {
            blocked_queue.push_back(index as u32);
        }
    }
    while let Some(dependency) = blocked_queue.pop_front() {
        for &candidate in &dependents[dependency as usize] {
            let candidate = candidate as usize;
            if !blocked[candidate] {
                blocked[candidate] = true;
                blocked_queue.push_back(candidate as u32);
            }
        }
    }
}

/// Analyze and relocate top-level `{#snippet}` blocks. Non-hoistable snippets
/// (those closing over instance-script values, or referencing a non-hoistable
/// snippet) are moved to the top of the instance script; the returned ranges are
/// the module-hoistable snippets, which the caller relocates to module scope.
pub(crate) fn hoist_top_level_snippets(
    ast: &Root,
    source: &str,
    exported_names: &ExportedNames,
    str: &mut MagicString,
) -> Vec<(u32, u32)> {
    let mut hoistable_snippet_ranges: Vec<(u32, u32)> = Vec::new();
    let mut nonhoistable_snippet_ranges: Vec<(u32, u32)> = Vec::new();
    let module_script_present = ast.module.is_some();

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

    // Initial blocked set: snippets that directly reference an
    // instance-script value (or a $store of one).
    let mut blocked = vec![false; snippets.len()];
    if module_script_present {
        for (i, snippet) in snippets.iter().enumerate() {
            if !is_snippet_module_hoistable(snippet, source, exported_names) {
                blocked[i] = true;
            }
        }

        if blocked.iter().any(|&is_blocked| is_blocked) {
            let snippet_names: Vec<Option<&str>> = snippets
                .iter()
                .map(|snippet| {
                    let expression_start = snippet.expression.start()? as usize;
                    let expression_end = snippet.expression.end()? as usize;
                    source.get(expression_start..expression_end)
                })
                .collect();
            let mut snippet_indices: FxHashMap<&str, Vec<u32>> = FxHashMap::default();
            for (index, &name) in snippet_names.iter().enumerate() {
                if let Some(name) = name {
                    snippet_indices.entry(name).or_default().push(index as u32);
                }
            }

            let mut dependents = vec![Vec::<u32>::new(); snippets.len()];
            let mut seen_dependencies = vec![u32::MAX; snippets.len()];
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
                    if snippet_names[i] == Some(ident.as_str()) {
                        continue;
                    }
                    if let Some(dependencies) = snippet_indices.get(ident.as_str()) {
                        for &dependency in dependencies {
                            let dependency_index = dependency as usize;
                            if seen_dependencies[dependency_index] != i as u32 {
                                seen_dependencies[dependency_index] = i as u32;
                                dependents[dependency_index].push(i as u32);
                            }
                        }
                    }
                }
            }

            propagate_blocked_dependencies(&dependents, &mut blocked);
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

    hoistable_snippet_ranges
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
    exported_names: &ExportedNames,
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
    let body_text = slice_src(source, body_start as usize, body_end as usize);

    // Lexical scan: any identifier in the body that resolves to an
    // instance-script value (and isn't an import or a snippet param) blocks
    // hoisting.
    //
    // We use `lexical_identifiers_in_expressions` (identifiers inside `{...}` blocks)
    // rather than `lexical_identifiers` to avoid false positives from HTML attribute
    // NAMES like `data-state` (where `data` or `state` follow a `-` and are not JS
    // references).  Periscopic's scope analysis only sees JS AST nodes, not attribute
    // name strings, so this is the correct approximation.
    //
    // `$name` references trigger auto-store subscription; the JS reference
    // adds the un-prefixed `name` to `disallowed_values` via
    // `addDisallowed(getAccessedStores())`, so any `$name` whose underlying
    // `name` is bound in the instance script (value OR import) also blocks.
    // Collect the snippet body's expression-context identifiers ONCE — we use
    // `lexical_identifiers_in_expressions` (only identifiers inside `{...}`
    // blocks) rather than the general `lexical_identifiers` to avoid false
    // positives from HTML attribute names like `data-state` (where `state`
    // follows a `-` and is not a JS reference). Both checks below iterate it.
    let body_idents = lexical_identifiers_in_expressions(body_text);
    for ident in &body_idents {
        if params_set.contains(ident) {
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

        if exported_names.instance_value_names.contains(ident)
            && !exported_names.instance_import_names.contains(ident)
        {
            return false;
        }
    }

    // Additional check: JS reference's `addDisallowed(implicitStoreValues.getAccessedStores())`
    // adds the base names of ALL `$X` identifiers found in the instance script (the `is_rune`
    // filter is broken in JS due to TypeScript parent pointers not being set, so `$props`,
    // `$bindable`, etc. always land in `accessedStores`).  If any such base name `X` appears
    // as a plain identifier in the snippet body's EXPRESSION context, hoisting is blocked.
    //
    // E.g. `{#snippet Tree}` that contains `{#snippet child({ props })}` has `props` inside
    // a `{...}` expression block.  Meanwhile `$props()` in the instance script means `props`
    // is in `disallowed_values` (JS) / `instance_script_loose_dollar_names` (Rust). → blocked.
    if !exported_names.instance_script_loose_dollar_names.is_empty() {
        for ident in &body_idents {
            if params_set.contains(ident) {
                continue;
            }
            if exported_names
                .instance_script_loose_dollar_names
                .contains(ident)
            {
                return false;
            }
        }
    }

    true
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

    fn old_propagate_blocked(dependencies: &[Vec<u32>], blocked: &mut [bool]) {
        let mut changed = true;
        while changed {
            changed = false;
            for candidate in 0..dependencies.len() {
                if !blocked[candidate]
                    && dependencies[candidate]
                        .iter()
                        .any(|&dependency| blocked[dependency as usize])
                {
                    blocked[candidate] = true;
                    changed = true;
                }
            }
        }
    }

    #[test]
    fn blocked_dependency_worklist_matches_fixed_point_oracle() {
        let mut state = 0x243f_6a88_u32;
        for candidate_count in 1..=32 {
            for _ in 0..32 {
                let mut dependencies = vec![Vec::new(); candidate_count];
                let mut dependents = vec![Vec::new(); candidate_count];
                let mut expected = vec![false; candidate_count];
                for candidate in 0..candidate_count {
                    state = state.wrapping_mul(1_664_525).wrapping_add(1_013_904_223);
                    expected[candidate] = state & 31 == 0;
                    for (dependency, dependency_dependents) in dependents.iter_mut().enumerate() {
                        if candidate == dependency {
                            continue;
                        }
                        state = state.wrapping_mul(1_664_525).wrapping_add(1_013_904_223);
                        if state & 15 == 0 {
                            dependencies[candidate].push(dependency as u32);
                            dependency_dependents.push(candidate as u32);
                        }
                    }
                }
                let mut actual = expected.clone();
                old_propagate_blocked(&dependencies, &mut expected);
                propagate_blocked_dependencies(&dependents, &mut actual);
                assert_eq!(actual, expected);
            }
        }
    }

    #[test]
    fn self_reference_stays_module_hoistable() {
        let source = "<script module>export const value = 1;</script>\n\
            {#snippet recursive(n)}{#if n}{@render recursive(n - 1)}{/if}{/snippet}";
        let code = svelte2tsx(source, Svelte2TsxOptions::default())
            .expect("svelte2tsx")
            .code;
        assert!(code.find("const recursive").unwrap() < code.find("function $$render").unwrap());
    }

    #[test]
    fn reverse_blocked_chain_moves_inside_render() {
        let source = "<script module>export const value = 1;</script>\n\
            <script>let local = 1;</script>\n\
            {#snippet first()}{@render second()}{/snippet}\n\
            {#snippet second()}{@render third()}{/snippet}\n\
            {#snippet third()}{local}{/snippet}";
        let code = svelte2tsx(source, Svelte2TsxOptions::default())
            .expect("svelte2tsx")
            .code;
        let render = code.find("function $$render").unwrap();
        for name in ["first", "second", "third"] {
            assert!(code.find(&format!("const {name}")).unwrap() > render);
        }
    }

    #[test]
    fn duplicate_name_self_reference_does_not_inherit_blocked_peer() {
        let source = "<script module>export const value = 1;</script>\n\
            <script>let local = 1;</script>\n\
            {#snippet same()}{local}{/snippet}\n\
            {#snippet same()}{@render same()}{/snippet}";
        let code = svelte2tsx(source, Svelte2TsxOptions::default())
            .expect("svelte2tsx")
            .code;
        let render = code.find("function $$render").unwrap();
        let first = code.find("const same").unwrap();
        let second = code[first + 1..].find("const same").unwrap() + first + 1;
        assert!(first < render || second < render);
        assert!(first > render || second > render);
    }

    #[test]
    fn hoistable_snippets_keep_source_order() {
        let source = "<script module>export const value = 1;</script>\n\
            {#snippet earlier()}{@render later()}{/snippet}\n\
            {#snippet later()}ok{/snippet}";
        let code = svelte2tsx(source, Svelte2TsxOptions::default())
            .expect("svelte2tsx")
            .code;
        let earlier = code.find("const earlier").unwrap();
        let later = code.find("const later").unwrap();
        let render = code.find("function $$render").unwrap();
        assert!(earlier < later);
        assert!(later < render);
    }
}
