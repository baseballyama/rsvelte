//! Small questions about JavaScript nodes that several rules ask.

use oxc_ast::ast::Expression;
use oxc_span::GetSpan;
use rsvelte_kernel::source::positions::Span;

/// The node's span as the document's position type.
pub(super) fn span(node: &impl GetSpan) -> Span {
    super::node_span(node.span())
}

pub(super) fn text<'s>(node: &impl GetSpan, source: &'s str) -> &'s str {
    span(node).text(source)
}

/// `expression` is an identifier called `name`.
pub(super) fn is_named(expression: &Expression<'_>, name: &str) -> bool {
    matches!(expression, Expression::Identifier(identifier) if identifier.name == name)
}
