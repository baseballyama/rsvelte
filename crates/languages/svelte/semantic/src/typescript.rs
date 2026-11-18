//! What upstream's `remove_typescript_nodes` erases before it analyzes, read through instead of
//! removed, since the trees are shared.

use oxc_ast::ast::Expression;

/// `e` without the casts and type arguments around it: `x as T`, `x satisfies T`, `x!`, `<T>x` and
/// `f<T>` read as `x` and `f`.
#[must_use]
pub fn without_typescript<'a>(mut e: &'a Expression<'a>) -> &'a Expression<'a> {
    loop {
        e = match e {
            Expression::TSAsExpression(t) => &t.expression,
            Expression::TSSatisfiesExpression(t) => &t.expression,
            Expression::TSNonNullExpression(t) => &t.expression,
            Expression::TSTypeAssertion(t) => &t.expression,
            Expression::TSInstantiationExpression(t) => &t.expression,
            _ => return e,
        };
    }
}
