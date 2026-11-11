//! What the rules on `svelte/store` share: its calls, and renaming a callback's parameter.

use oxc_ast::AstKind;
use oxc_ast::ast::{CallExpression, Expression};
use oxc_semantic::{ReferenceId, ScopeId, SymbolId};
use oxc_span::GetSpan;
use oxc_syntax::reference::Reference;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_typescript_semantic::reference_tracker::import_references;
use rustc_hash::FxHashSet;

use super::nodes::span;
use crate::rule::File;

/// The calls of `names` (some of `writable`, `readable` and `derived`) imported from
/// `svelte/store`, in source order, with the name each calls.
pub(super) fn store_calls<'a>(
    file: &File<'a>,
    names: &[&'static str],
) -> Vec<(&'a CallExpression<'a>, &'static str)> {
    let semantic = file.semantic();
    let nodes = semantic.nodes();
    let mut out: Vec<(&'a CallExpression<'a>, &'static str)> =
        import_references(semantic, &file.programs(), "svelte/store", names)
            .into_iter()
            .filter_map(|reference| match nodes.kind(reference.call?) {
                AstKind::CallExpression(call) => Some((call, reference.name)),
                _ => None,
            })
            .collect();
    out.sort_by_key(|&(call, _)| call.span.start);
    out
}

/// A reference to a value, not one in type syntax (`x: T`, `typeof x` in a type).
pub(super) fn is_value(reference: &Reference) -> bool {
    (reference.is_read() || reference.is_write()) && !reference.flags().is_value_as_type()
}

/// The names each scope refers to, for `findVariableForReplacement`.
pub(super) struct Scopes<'a> {
    referred: FxHashSet<(ScopeId, &'a str)>,
}

impl<'a> Scopes<'a> {
    pub(super) fn new(file: &File<'a>) -> Self {
        let semantic = file.semantic();
        let scoping = semantic.scoping();
        let nodes = semantic.nodes();
        let referred = (0..scoping.references_len())
            .map(|index| scoping.get_reference(ReferenceId::from_usize(index)))
            .filter(|reference| is_value(reference))
            .filter_map(|reference| match nodes.kind(reference.node_id()) {
                AstKind::IdentifierReference(identifier) => {
                    Some((reference.scope_id(), identifier.name.as_str()))
                }
                _ => None,
            })
            .collect();
        Self { referred }
    }

    /// `findVariableForReplacement`: the symbol named `name` in the scope of the function
    /// `function`, unless that scope already declares or refers to `replacement` (`Err`).
    pub(super) fn replaceable(
        &self,
        file: &File<'_>,
        function: Function<'_>,
        name: Option<&str>,
        replacement: &str,
    ) -> Result<Option<SymbolId>, ()> {
        let scoping = file.semantic().scoping();
        let Some(scope) = function.scope else {
            return Ok(None);
        };
        // `ESLint` declares a function expression's own name in a scope around the function's.
        let own = |name: &str| {
            scoping
                .get_binding(scope, name.into())
                .filter(|&symbol| Some(symbol) != function.name)
        };
        if self.referred.contains(&(scope, replacement)) || own(replacement).is_some() {
            return Err(());
        }
        Ok(name.and_then(own))
    }
}

/// A function or arrow passed to a store: its scope, and the name a function expression has.
#[derive(Clone, Copy)]
pub(super) struct Function<'a> {
    pub scope: Option<ScopeId>,
    pub name: Option<SymbolId>,
    pub parameters: &'a oxc_ast::ast::FormalParameters<'a>,
    /// Where the body starts.
    pub body: u32,
    pub span: oxc_span::Span,
    pub is_async: bool,
}

impl<'a> Function<'a> {
    /// `expression` as a function or arrow.
    pub(super) fn of(expression: &'a Expression<'a>) -> Option<Self> {
        match expression {
            Expression::FunctionExpression(function) => Some(Self {
                scope: function.scope_id.get(),
                name: function.id.as_ref().and_then(|id| id.symbol_id.get()),
                parameters: &function.params,
                body: function.body.as_ref()?.span.start,
                span: function.span,
                is_async: function.r#async,
            }),
            Expression::ArrowFunctionExpression(arrow) => Some(Self {
                scope: arrow.scope_id.get(),
                name: None,
                parameters: &arrow.params,
                body: arrow.body.span().start,
                span: arrow.span,
                is_async: arrow.r#async,
            }),
            _ => None,
        }
    }
}

/// Renames the parameter declared at `declaration` and every reference to `symbol` to
/// `replacement`.
pub(super) fn rename(
    file: &File<'_>,
    declaration: Span,
    symbol: Option<SymbolId>,
    replacement: &str,
) -> Fix {
    let semantic = file.semantic();
    let scoping = semantic.scoping();
    let mut spans: Vec<Span> = vec![declaration];
    if let Some(symbol) = symbol {
        spans.extend(
            scoping
                .get_resolved_reference_ids(symbol)
                .iter()
                .map(|&id| scoping.get_reference(id))
                .filter(|reference| is_value(reference))
                .map(|reference| span(&semantic.nodes().kind(reference.node_id()))),
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
