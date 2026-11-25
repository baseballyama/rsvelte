use oxc_ast::ast::{Expression, IdentifierReference, ObjectPropertyKind, PropertyKey};
use oxc_span::SPAN;
pub(crate) use rsvelte_typescript_semantic::property_key::{literal_key_name, string_value};

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

/// Upstream's `b.literal(key.value)` for a `$props()` key: its name, a number or `BigInt` kept as
/// one.
pub(crate) fn prop_key<'o>(b: &Builder<'o>, key: &PropertyKey<'_>) -> Option<Expression<'o>> {
    let name = literal_key_name(key)?;
    Some(match key {
        PropertyKey::StaticNumericLiteral(literal) | PropertyKey::NumericLiteral(literal) => {
            b.number(literal.value)
        }
        PropertyKey::StaticBigIntLiteral(_) | PropertyKey::BigIntLiteral(_) => {
            Expression::new_big_int_literal(SPAN, b.str(&name), None, b)
        }
        _ => b.string(&name),
    })
}

/// Upstream's `is_simple_expression`, on the expression with its types erased.
pub(crate) fn is_simple_expression(e: &Expression<'_>) -> bool {
    is_simple_expression_in(e, &|_| false)
}

/// [`is_simple_expression`] where `parenthesized` tells the nodes upstream keeps in parentheses,
/// which are never simple.
pub(crate) fn is_simple_expression_in(
    e: &Expression<'_>,
    parenthesized: &dyn Fn(&Expression<'_>) -> bool,
) -> bool {
    let simple = |e| is_simple_expression_in(e, parenthesized);
    if parenthesized(e) {
        return false;
    }
    match e.get_inner_expression() {
        Expression::StringLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::Identifier(_)
        | Expression::ArrowFunctionExpression(_)
        | Expression::FunctionExpression(_) => true,
        Expression::ConditionalExpression(c) => {
            simple(&c.test) && simple(&c.consequent) && simple(&c.alternate)
        }
        Expression::BinaryExpression(b) => simple(&b.left) && simple(&b.right),
        Expression::LogicalExpression(l) => simple(&l.left) && simple(&l.right),
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
pub(crate) fn into_without_typescript(mut e: Expression<'_>) -> Expression<'_> {
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
