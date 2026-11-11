use oxc_ast::ast::{ArrowFunctionExpression, AwaitExpression, Class, Expression, Function};
use oxc_ast_visit::Visit;
use oxc_syntax::scope::ScopeFlags;

/// An `await` that `e` itself runs, outside the functions it creates.
pub(crate) fn has_await(e: &Expression<'_>) -> bool {
    let mut v = Await(false);
    v.visit_expression(e);
    v.0
}

/// Runs `visit` on a visitor that finds an `await` outside nested functions.
pub(crate) fn has_await_in(visit: impl FnOnce(&mut dyn FnMut(&Expression<'_>))) -> bool {
    let mut found = false;
    visit(&mut |e| found |= has_await(e));
    found
}

struct Await(bool);

impl<'a> Visit<'a> for Await {
    fn visit_await_expression(&mut self, _: &AwaitExpression<'a>) {
        self.0 = true;
    }

    fn visit_function(&mut self, _: &Function<'a>, _: ScopeFlags) {}

    fn visit_arrow_function_expression(&mut self, _: &ArrowFunctionExpression<'a>) {}

    fn visit_class(&mut self, _: &Class<'a>) {}
}
