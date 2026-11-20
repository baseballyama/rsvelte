//! svelte2tsx's `handleTypeAssertion`: the module script's `<T>e` as `e as T`, since it reads the
//! script as TSX, where `<T>` opens an element. It leaves the instance script's as they are.

use oxc_ast::ast::{Program, TSTypeAssertion};
use oxc_ast_visit::{Visit, walk};
use oxc_span::GetSpan;
use rsvelte_kernel::source::positions::Span;

use super::contract::Edit;
use super::{Builder, span};
use crate::syntax_tree::{Node, NodeIdentifier};

/// An assertion's whole span, its type's and its expression's, without the expression's
/// parentheses, which the tree drops.
type Assertion = (Span, Span, Span);

impl Builder<'_> {
    /// Adds an edit for each outermost type assertion in `program` that no edit in `edits`
    /// overlaps, then sorts `edits`.
    pub(super) fn type_assertions(&mut self, program: &Program<'_>, edits: &mut Vec<Edit>) {
        struct Assertions(Vec<Assertion>);
        impl<'a> Visit<'a> for Assertions {
            fn visit_ts_type_assertion(&mut self, it: &TSTypeAssertion<'a>) {
                walk::walk_ts_type_assertion(self, it);
                self.0.push((
                    span(it.span),
                    span(it.type_annotation.span()),
                    span(it.expression.span()),
                ));
            }
        }
        edits.sort_by_key(|edit| edit.span.start_offset);
        if self.tree.javascript {
            return;
        }
        let mut found = Assertions(Vec::new());
        found.visit_program(program);
        if found.0.is_empty() {
            return;
        }
        // In post-order, so an assertion's inner ones are on the stack when it is reached.
        let mut outer: Vec<(Span, NodeIdentifier)> = Vec::new();
        for (assertion, written, expression) in found.0 {
            let inner = outer.partition_point(|&(at, _)| at.start_offset < expression.start_offset);
            let node = self.asserted(expression, written, &outer[inner..]);
            outer.truncate(inner);
            outer.push((assertion, node));
        }
        let overlaps = |at: Span| {
            let after = edits.partition_point(|edit| edit.span.start_offset < at.end_offset);
            edits[..after]
                .last()
                .is_some_and(|edit| edit.span.end_offset > at.start_offset)
        };
        let kept: Vec<Edit> = outer
            .into_iter()
            .filter(|&(at, _)| !overlaps(at))
            .map(|(span, node)| Edit {
                span,
                replacement: Some(node),
            })
            .collect();
        edits.extend(kept);
        edits.sort_by_key(|edit| edit.span.start_offset);
    }

    /// `(expression) as written`, with each of `inner`'s assertions in its place.
    fn asserted(
        &mut self,
        expression: Span,
        written: Span,
        inner: &[(Span, NodeIdentifier)],
    ) -> NodeIdentifier {
        let holes = inner.iter().map(|&(at, node)| (at, Some(node)));
        let parts = self.spliced(expression, holes);
        self.tree.push(Node::AsType { parts, written })
    }
}
