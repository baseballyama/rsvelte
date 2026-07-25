//! Relocation of top-level `{#snippet}` blocks: module-hoistable ones move to
//! module scope, the rest to the top of the instance script.

use crate::ast::template::Root;

use super::super::magic_string::MagicString;
use super::super::script::ExportedNames;
use super::super::svelte2tsx::slice_src;
use super::super::utils::lexical::{lexical_identifiers, lexical_identifiers_in_expressions};

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
            if !is_snippet_module_hoistable(snippet, source, exported_names) {
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
