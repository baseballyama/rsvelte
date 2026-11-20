//! Small questions about JavaScript nodes that several rules ask.

use oxc_ast::ast::{Expression, FunctionBody, Statement};
use oxc_span::GetSpan;
use rsvelte_typescript_tree::node_span;

pub(crate) fn text<'s>(node: &impl GetSpan, source: &'s str) -> &'s str {
    node_span(node).text(source)
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
