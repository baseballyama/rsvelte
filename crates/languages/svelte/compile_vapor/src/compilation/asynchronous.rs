use oxc_ast::ast::{ArrowFunctionExpression, AwaitExpression, Class, Expression, Function};
use oxc_ast_visit::Visit;
use oxc_syntax::scope::ScopeFlags;

/// An `await` that `e` itself runs, outside the functions it creates.
pub(crate) fn has_await(e: &Expression<'_>) -> bool {
    let mut v = Await(false);
    v.visit_expression(e);
    v.0
}

/// An `await` that a program's top level runs.
pub(crate) fn program_has_await(program: &oxc_ast::ast::Program<'_>) -> bool {
    let mut v = Await(false);
    v.visit_program(program);
    v.0
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
