//! Expressions as `ESTree` has them. The tree erases TypeScript's `e as T`, `e satisfies T`, `e!`
//! and `<T>e` to `e`; `ESTree` keeps each as a node around `e`, so here an expression reaches over
//! its assertions and is not what it asserts. Also `ESLint`'s `equalTokens`: two expressions are
//! the same when their tokens are, kind and text, whatever the whitespace and comments between.

use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::syntax_tree::TypeScriptKind;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use super::node_span;

#[derive(Debug)]
pub(super) struct Expressions<'a> {
    pub javascript: &'a SyntaxTree,
    pub source: &'a str,
    /// The assertions around a node, by node.
    assertions: Vec<(NodeIdentifier, TypeScriptKind, Span)>,
}

impl<'a> Expressions<'a> {
    pub(super) fn new(javascript: &'a SyntaxTree, source: &'a str) -> Self {
        let mut assertions: Vec<_> = javascript
            .typescript
            .iter()
            .filter(|syntax| {
                matches!(
                    syntax.kind,
                    TypeScriptKind::As
                        | TypeScriptKind::Satisfies
                        | TypeScriptKind::NonNull
                        | TypeScriptKind::Assertion
                )
            })
            .map(|syntax| (syntax.node, syntax.kind, syntax.span))
            .collect();
        // Stable, so each node's assertions stay in the parser's order.
        assertions.sort_by_key(|&(node, ..)| node);
        Self {
            javascript,
            source,
            assertions,
        }
    }

    fn assertions(&self, node: NodeIdentifier) -> &[(NodeIdentifier, TypeScriptKind, Span)] {
        let start = self.assertions.partition_point(|&(n, ..)| n < node);
        let end = self.assertions.partition_point(|&(n, ..)| n <= node);
        &self.assertions[start..end]
    }

    /// The span `ESTree` gives the expression: its outermost assertion's, if any.
    pub(super) fn span(&self, node: NodeIdentifier) -> Span {
        let mut span = node_span(self.javascript, node);
        for &(_, _, assertion) in self.assertions(node) {
            span = Span::new(
                span.start_offset.min(assertion.start_offset),
                span.end_offset.max(assertion.end_offset),
            );
        }
        span
    }

    /// The outermost assertion: the parser records an assertion after the ones inside it.
    pub(super) fn assertion(&self, node: NodeIdentifier) -> Option<TypeScriptKind> {
        self.assertions(node).last().map(|&(_, kind, _)| kind)
    }

    /// Whether an assertion wraps the node, which `ESTree` then sees as another node.
    pub(super) fn asserted(&self, node: NodeIdentifier) -> bool {
        !self.assertions(node).is_empty()
    }

    /// The node's kind, unless an assertion wraps it: `'a' as string` is not a string literal.
    pub(super) fn kind(&self, node: NodeIdentifier) -> Option<Kind<'a>> {
        self.assertions(node)
            .is_empty()
            .then(|| self.javascript.kind(node))
    }

    pub(super) fn equal_tokens(&self, a: NodeIdentifier, b: NodeIdentifier) -> bool {
        let tokens = |node| self.javascript.tokens.within(self.span(node));
        let (a, b) = (tokens(a), tokens(b));
        a.len() == b.len()
            && a.iter().zip(b).all(|(a, b)| {
                a.kind == b.kind && a.span.text(self.source) == b.span.text(self.source)
            })
    }
}
