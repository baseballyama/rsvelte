//! What the rules on `svelte/store` share: its calls, and renaming a callback's parameter.

use rsvelte_kernel::source::interning::Atom;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_typescript::scope::{BindingIdentifier, ScopeIdentifier};
use rsvelte_typescript::semantic::reference_tracker::import_references;
use rsvelte_typescript::{Kind, NodeIdentifier};
use rustc_hash::{FxHashMap, FxHashSet};

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
        matches!(javascript.kind(call), Kind::Call { .. }).then_some((call, reference.name))
    })
    .collect();
    out.sort_by_key(|&(call, _)| span(javascript, call).start_offset);
    out
}

/// The names each scope declares and refers to, for `findVariableForReplacement`.
pub(super) struct Scopes {
    declared: FxHashMap<(ScopeIdentifier, Atom), Vec<BindingIdentifier>>,
    referred: FxHashSet<(ScopeIdentifier, Atom)>,
}

impl Scopes {
    pub(super) fn new(file: &File<'_>) -> Self {
        let javascript = file.javascript();
        let sem = file.semantic();
        let mut declared: FxHashMap<_, Vec<BindingIdentifier>> = FxHashMap::default();
        for (binding, declaration) in sem.bindings.iter_enumerated() {
            declared
                .entry((declaration.scope, declaration.name))
                .or_default()
                .push(binding);
        }
        let referred = sem
            .references
            .iter()
            .filter_map(|reference| Some((reference.scope, javascript.atom(reference.node)?)))
            .collect();
        Self { declared, referred }
    }

    /// `findVariableForReplacement`: the binding named `name` in `function`'s own scope, unless
    /// that scope already declares or refers to `replacement` (`Err`).
    pub(super) fn replaceable(
        &self,
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
        // `ESLint` declares a function expression's own name in a scope around the function's.
        let own = |atom: Atom| {
            self.declared
                .get(&(scope, atom))
                .into_iter()
                .flatten()
                .copied()
                .filter(|&binding| Some(sem.bindings[binding].node) != function_name)
        };
        if let Some(atom) = javascript.atoms.lookup(replacement)
            && (self.referred.contains(&(scope, atom)) || own(atom).next().is_some())
        {
            return Err(());
        }
        Ok(name
            .and_then(|name| javascript.atoms.lookup(name))
            .and_then(|atom| own(atom).next_back()))
    }
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
