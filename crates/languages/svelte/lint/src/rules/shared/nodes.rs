//! Small questions about JavaScript nodes that several rules ask.

use oxc_ast::AstKind;
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

/// A `$props()` call, also behind TypeScript's `!`, `as`, `satisfies` or `<T>`, which the compiler
/// removes.
pub(crate) fn is_props_call(expression: &Expression<'_>) -> bool {
    matches!(
        expression.get_inner_expression(),
        Expression::CallExpression(call) if is_named(&call.callee, "$props")
    )
}

/// The one statement of a body, a directive counting as a statement as in `ESTree`.
pub(crate) fn only_statement<'a>(body: &'a FunctionBody<'a>) -> Option<&'a Statement<'a>> {
    match (body.directives.as_slice(), body.statements.as_slice()) {
        ([], [statement]) => Some(statement),
        _ => None,
    }
}

/// `getPropertyName`: a member's static property name. A private name has none, since `#name`
/// never equals a public name.
pub(crate) fn property_name(member: AstKind<'_>) -> Option<&str> {
    match member {
        AstKind::StaticMemberExpression(member) => Some(member.property.name.as_str()),
        AstKind::ComputedMemberExpression(member) => match &member.expression {
            Expression::StringLiteral(string) => string.value.as_str(),
            // The raw text, escapes unprocessed.
            Expression::TemplateLiteral(template) if template.expressions.is_empty() => template
                .quasis
                .first()
                .map(|quasi| quasi.value.raw.as_str()),
            _ => None,
        },
        _ => None,
    }
}
