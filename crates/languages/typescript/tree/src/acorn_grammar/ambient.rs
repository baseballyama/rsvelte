//! acorn-typescript's rule for a variable's initializer in an ambient context, which it checks
//! once it has read the whole declaration (`parseVarStatement`).

use oxc_ast::AstKind;
use oxc_ast::ast::{Expression, UnaryOperator, VariableDeclarationKind};
use oxc_span::GetSpan;

use super::{Rejection, Stop};

/// The first initializer of the declaration `kind` that acorn-typescript refuses in an ambient
/// context. It raises after reading the declaration, so an error inside comes first.
pub(super) fn initializer(kind: AstKind<'_>) -> Option<Stop> {
    let AstKind::VariableDeclaration(declaration) = kind else {
        return None;
    };
    declaration.declarations.iter().find_map(|declarator| {
        let init = declarator.init.as_ref()?;
        let why = if declaration.kind != VariableDeclarationKind::Const
            || declarator.type_annotation.is_some()
        {
            Rejection::AmbientInitializer
        } else if literal_or_enum(init) {
            return None;
        } else {
            Rejection::AmbientConstInitializer
        };
        Some(Stop {
            at: init.span().start,
            raised: declaration.span.end,
            why,
        })
    })
}

/// A literal, a template without expressions, a signed numeric literal, or what may be a literal
/// enum member: a member of a name or of a chain of names, under a key that is a template without
/// expressions where computed. acorn has no node for parentheses.
fn literal_or_enum(init: &Expression<'_>) -> bool {
    match init.without_parentheses() {
        Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::StringLiteral(_) => true,
        Expression::TemplateLiteral(it) => it.expressions.is_empty(),
        Expression::UnaryExpression(it) => {
            matches!(
                it.operator,
                UnaryOperator::UnaryNegation | UnaryOperator::UnaryPlus
            ) && matches!(
                it.argument.without_parentheses(),
                Expression::NumericLiteral(_) | Expression::BigIntLiteral(_)
            )
        }
        Expression::StaticMemberExpression(it) => names(&it.object),
        Expression::PrivateFieldExpression(it) => names(&it.object),
        Expression::ComputedMemberExpression(it) => {
            matches!(
                it.expression.without_parentheses(),
                Expression::TemplateLiteral(key) if key.expressions.is_empty()
            ) && names(&it.object)
        }
        _ => false,
    }
}

/// A name, or a chain of members not computed that starts at one.
fn names(object: &Expression<'_>) -> bool {
    match object.without_parentheses() {
        Expression::Identifier(_) => true,
        Expression::StaticMemberExpression(it) => names(&it.object),
        Expression::PrivateFieldExpression(it) => names(&it.object),
        _ => false,
    }
}
