use std::borrow::Cow;

use oxc_ast::ast::{
    BindingIdentifier, Expression, IdentifierReference, ObjectPropertyKind, PropertyKey,
};
use oxc_str::JSStr;

use super::Builder;

/// `{ name }` for each exported name, as both targets hand the exports over.
pub(crate) fn export_properties<'o>(
    b: &Builder<'o>,
    exports: &[&BindingIdentifier<'_>],
) -> impl Iterator<Item = ObjectPropertyKind<'o>> {
    exports
        .iter()
        .map(|name| b.init(&name.name, b.id(&name.name)))
}

/// Upstream's `prop_alias`: the name a `$props()` key reads, `String(key.value)` for a literal.
pub(crate) fn prop_alias<'s>(key: &'s PropertyKey<'s>) -> Cow<'s, str> {
    match key {
        PropertyKey::StaticIdentifier(identifier) => Cow::Borrowed(identifier.name.as_str()),
        PropertyKey::StringLiteral(literal) => string_value(literal.value),
        PropertyKey::NumericLiteral(literal) => {
            Cow::Owned(rsvelte_typescript_semantic::number::number(literal.value))
        }
        _ => unreachable!("validation refuses a computed `$props()` key"),
    }
}

/// A string literal's value; a lone surrogate prints as the replacement character.
pub(crate) fn string_value(value: JSStr<'_>) -> Cow<'_, str> {
    value
        .as_str()
        .map_or_else(|| Cow::Owned(value.display().to_string()), Cow::Borrowed)
}

pub(crate) fn is_simple_expression(e: &Expression<'_>) -> bool {
    match e {
        Expression::StringLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::Identifier(_)
        | Expression::ArrowFunctionExpression(_)
        | Expression::FunctionExpression(_) => true,
        Expression::ConditionalExpression(c) => {
            is_simple_expression(&c.test)
                && is_simple_expression(&c.consequent)
                && is_simple_expression(&c.alternate)
        }
        Expression::BinaryExpression(b) => {
            is_simple_expression(&b.left) && is_simple_expression(&b.right)
        }
        Expression::LogicalExpression(l) => {
            is_simple_expression(&l.left) && is_simple_expression(&l.right)
        }
        _ => false,
    }
}

/// The root identifier of the member chain `e`, if `e` is one.
pub(crate) fn member_root<'e>(mut e: &'e Expression<'e>) -> Option<&'e IdentifierReference<'e>> {
    loop {
        match e {
            Expression::Identifier(identifier) => return Some(identifier),
            Expression::StaticMemberExpression(m) => e = &m.object,
            Expression::ComputedMemberExpression(m) => e = &m.object,
            Expression::PrivateFieldExpression(m) => e = &m.object,
            _ => return None,
        }
    }
}
