//! Small questions about JavaScript nodes that several rules ask.

use oxc_ast::ast::{Expression, FunctionBody, Statement};
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

/// The one statement of a body, a directive counting as a statement as in `ESTree`.
pub(super) fn only_statement<'a>(body: &'a FunctionBody<'a>) -> Option<&'a Statement<'a>> {
    match (body.directives.as_slice(), body.statements.as_slice()) {
        ([], [statement]) => Some(statement),
        _ => None,
    }
}
