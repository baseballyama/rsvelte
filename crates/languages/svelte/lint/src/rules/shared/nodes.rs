//! Small questions about JavaScript nodes that several rules ask.

use oxc_ast::ast::{Expression, FunctionBody, Statement};
use oxc_span::GetSpan;
use rsvelte_kernel::source::positions::Span;

/// An oxc span as the document's position type; every oxc tree is parsed in place.
pub(crate) const fn from_oxc(span: oxc_span::Span) -> Span {
    Span {
        start_offset: span.start,
        end_offset: span.end,
    }
}

/// The node's span as the document's position type.
pub(crate) fn span(node: &impl GetSpan) -> Span {
    from_oxc(node.span())
}

pub(crate) fn text<'s>(node: &impl GetSpan, source: &'s str) -> &'s str {
    span(node).text(source)
}

/// `expression` is an identifier called `name`.
pub(crate) fn is_named(expression: &Expression<'_>, name: &str) -> bool {
    matches!(expression, Expression::Identifier(identifier) if identifier.name == name)
}

/// The one statement of a body, a directive counting as a statement as in `ESTree`.
pub(crate) fn only_statement<'a>(body: &'a FunctionBody<'a>) -> Option<&'a Statement<'a>> {
    match (body.directives.as_slice(), body.statements.as_slice()) {
        ([], [statement]) => Some(statement),
        _ => None,
    }
}
