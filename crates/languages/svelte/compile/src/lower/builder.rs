//! Svelte's runtime calls, over the output tree's constructors that every compiler shares.

use oxc_ast::ast::{Argument, ArrowFunctionBody, BindingPattern, Expression};
pub(crate) use rsvelte_typescript_compile::build::Builder;

/// The constructors that name Svelte's runtime, `$`.
pub(crate) trait Runtime<'o> {
    /// `$.method(…)`.
    fn runtime(
        &self,
        method: &str,
        arguments: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o>;

    /// `Builder::call_some` on `$.method`.
    fn runtime_some(&self, method: &str, arguments: Vec<Option<Expression<'o>>>) -> Expression<'o>;

    /// `b.thunk`: `() => e`, or `f` for `() => f()`.
    fn thunk(&self, e: Expression<'o>) -> Expression<'o>;
}

impl<'o> Runtime<'o> for Builder<'o> {
    fn runtime(
        &self,
        method: &str,
        arguments: impl IntoIterator<Item = Expression<'o>>,
    ) -> Expression<'o> {
        self.call(self.member(self.id("$"), method), arguments)
    }

    fn runtime_some(&self, method: &str, arguments: Vec<Option<Expression<'o>>>) -> Expression<'o> {
        self.call_some(self.member(self.id("$"), method), arguments)
    }

    fn thunk(&self, e: Expression<'o>) -> Expression<'o> {
        unthunk(self.arrow(self.params([]), e))
    }
}

/// `b.unthunk`: `(a, b) => f(a, b)` is `f`.
pub(crate) fn unthunk(arrow: Expression<'_>) -> Expression<'_> {
    let Expression::ArrowFunctionExpression(function) = &arrow else {
        return arrow;
    };
    let ArrowFunctionBody::CallExpression(call) = &function.body else {
        return arrow;
    };
    if function.r#async || call.optional {
        return arrow;
    }
    // Upstream names a runtime function `$.name` as one identifier.
    let callee_is_name = match &call.callee {
        Expression::Identifier(_) => true,
        Expression::StaticMemberExpression(member) => {
            matches!(&member.object, Expression::Identifier(o) if o.name == "$")
        }
        _ => false,
    };
    let parameters = &function.params;
    let same = callee_is_name
        && parameters.rest.is_none()
        && parameters.items.len() == call.arguments.len()
        && parameters.items.iter().zip(&call.arguments).all(|(p, a)| {
            matches!((&p.pattern, a), (BindingPattern::BindingIdentifier(p), Argument::Identifier(a)) if p.name == a.name)
        });
    if !same {
        return arrow;
    }
    let Expression::ArrowFunctionExpression(function) = arrow else {
        unreachable!()
    };
    let function = function.unbox();
    let ArrowFunctionBody::CallExpression(call) = function.body else {
        unreachable!()
    };
    call.unbox().callee
}
