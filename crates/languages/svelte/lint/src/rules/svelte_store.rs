//! What the rules on `svelte/store` share: its calls, and renaming a callback's parameter.

use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_typescript::scope::BindingIdentifier;
use rsvelte_typescript::semantic::imports::import_references;
use rsvelte_typescript::{Kind, NodeIdentifier};

use super::javascript::span;
use super::reactive_statements::programs;
use crate::rule::File;

/// The calls of `names` (some of `writable`, `readable` and `derived`) imported from
/// `svelte/store`, in source order, with the name each calls.
pub(super) fn store_calls(
    file: &File<'_>,
    names: &[&'static str],
) -> Vec<(NodeIdentifier, &'static str)> {
    let javascript = file.javascript();
    let roots: Vec<NodeIdentifier> = match (file.component(), file.module()) {
        (Some(component), _) => programs(component).collect(),
        (None, Some(module)) => vec![module.root],
        (None, None) => Vec::new(),
    };
    let mut out: Vec<(NodeIdentifier, &'static str)> = import_references(
        javascript,
        file.semantic(),
        file.parents(),
        file.source(),
        &roots,
        "svelte/store",
        names,
    )
    .into_iter()
    .filter_map(|reference| {
        let call = reference.call?;
        matches!(javascript.kind(call), Kind::Call { .. }).then_some((call, reference.export))
    })
    .collect();
    out.sort_by_key(|&(call, _)| span(javascript, call).start_offset);
    out
}

/// `findVariableForReplacement`: the binding named `name` in `function`'s own scope, unless
/// that scope already declares or refers to `replacement` (`Err`).
pub(super) fn replaceable(
    file: &File<'_>,
    function: NodeIdentifier,
    name: Option<&str>,
    replacement: &str,
) -> Result<Option<BindingIdentifier>, ()> {
    let javascript = file.javascript();
    let sem = file.semantic();
    let Some(scope) = sem.scope_of(function) else {
        return Ok(None);
    };
    let function_name = match javascript.kind(function) {
        Kind::Function { name, .. } => name,
        _ => None,
    };
    let named = |node| javascript.atom(node).map(|atom| javascript.atoms.get(atom));
    if sem
        .references
        .iter()
        .any(|reference| reference.scope == scope && named(reference.node) == Some(replacement))
    {
        return Err(());
    }
    let mut found = None;
    for (binding, declared) in sem.bindings.iter_enumerated() {
        // `ESLint` declares a function expression's own name in a scope around the function's.
        if declared.scope != scope || Some(declared.node) == function_name {
            continue;
        }
        let declared_name = javascript.atoms.get(declared.name);
        if declared_name == replacement {
            return Err(());
        }
        if Some(declared_name) == name {
            found = Some(binding);
        }
    }
    Ok(found)
}

/// Renames `declaration` and every reference to `binding` to `replacement`.
pub(super) fn rename(
    file: &File<'_>,
    declaration: NodeIdentifier,
    binding: Option<BindingIdentifier>,
    replacement: &str,
) -> Fix {
    let javascript = file.javascript();
    let mut spans: Vec<Span> = vec![span(javascript, declaration)];
    if let Some(binding) = binding {
        spans.extend(
            file.semantic()
                .references_to(binding)
                .map(|reference| span(javascript, reference.node)),
        );
    }
    spans.sort_by_key(|s| s.start_offset);
    spans.dedup();
    let mut fix = Fix::new();
    for span in spans {
        fix.push(span, replacement);
    }
    fix
}
