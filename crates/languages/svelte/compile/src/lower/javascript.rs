use std::borrow::Cow;

use oxc_ast::ast::{Expression, IdentifierReference, ObjectPropertyKind, PropertyKey};
use oxc_str::JSStr;

use super::Builder;

/// `alias: name` for each export, as the server hands the exports over.
pub(super) fn export_properties<'o>(
    b: &Builder<'o>,
    exports: &[super::script::Export<'_>],
) -> impl Iterator<Item = ObjectPropertyKind<'o>> {
    exports
        .iter()
        .map(|export| b.init(export.alias, b.id(export.name)))
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
        // Upstream erases types first: `a!.b` is `a.b`.
        match e.get_inner_expression() {
            Expression::Identifier(identifier) => return Some(identifier),
            Expression::StaticMemberExpression(m) => e = &m.object,
            Expression::ComputedMemberExpression(m) => e = &m.object,
            Expression::PrivateFieldExpression(m) => e = &m.object,
            _ => return None,
        }
    }
}

/// `e` without the TypeScript wrappers upstream erases before it compiles.
pub(crate) fn without_typescript(mut e: Expression<'_>) -> Expression<'_> {
    loop {
        e = match e {
            Expression::TSAsExpression(x) => x.unbox().expression,
            Expression::TSSatisfiesExpression(x) => x.unbox().expression,
            Expression::TSNonNullExpression(x) => x.unbox().expression,
            Expression::TSTypeAssertion(x) => x.unbox().expression,
            Expression::TSInstantiationExpression(x) => x.unbox().expression,
            e => return e,
        };
    }
}
