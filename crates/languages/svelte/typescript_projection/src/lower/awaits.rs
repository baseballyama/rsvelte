//! Where svelte2tsx sees an `await` outside every function, which makes its render function
//! async in the instance and puts the component in runes mode anywhere.

use oxc_ast::ast::Program;
use oxc_ast_visit::{Visit, walk};
use oxc_syntax::scope::ScopeFlags;
use rsvelte_typescript_tree::Tree;

/// Whether `program` awaits outside every block and function, where svelte2tsx makes its render
/// function async.
pub(super) fn awaits_at_top_level(program: &Program<'_>) -> bool {
    let mut awaits = Awaits::default();
    awaits.visit_program(program);
    awaits.found
}

/// Whether a template expression, declaration or pattern awaits outside every function.
pub(super) fn awaits_in_template(javascript: &Tree) -> bool {
    let mut awaits = Awaits::default();
    for (_, expression) in javascript.expressions() {
        awaits.visit_expression(expression);
    }
    for (_, declaration) in javascript.declarations() {
        awaits.visit_variable_declaration(declaration);
    }
    for (_, pattern) in javascript.patterns() {
        awaits.visit_formal_parameter(pattern);
    }
    for (_, parameters) in javascript.parameters() {
        awaits.visit_formal_parameters(parameters);
    }
    awaits.found
}

#[derive(Default)]
struct Awaits {
    depth: u32,
    found: bool,
}

impl<'a> Visit<'a> for Awaits {
    fn visit_block_statement(&mut self, it: &oxc_ast::ast::BlockStatement<'a>) {
        self.depth += 1;
        walk::walk_block_statement(self, it);
        self.depth -= 1;
    }

    fn visit_static_block(&mut self, it: &oxc_ast::ast::StaticBlock<'a>) {
        self.depth += 1;
        walk::walk_static_block(self, it);
        self.depth -= 1;
    }

    fn visit_function(&mut self, it: &oxc_ast::ast::Function<'a>, flags: ScopeFlags) {
        self.depth += 1;
        walk::walk_function(self, it, flags);
        self.depth -= 1;
    }

    fn visit_arrow_function_expression(&mut self, it: &oxc_ast::ast::ArrowFunctionExpression<'a>) {
        self.depth += 1;
        walk::walk_arrow_function_expression(self, it);
        self.depth -= 1;
    }

    // TypeScript's method node holds its key and decorators, which svelte2tsx scopes with it.
    fn visit_method_definition(&mut self, it: &oxc_ast::ast::MethodDefinition<'a>) {
        self.depth += 1;
        walk::walk_method_definition(self, it);
        self.depth -= 1;
    }

    fn visit_object_property(&mut self, it: &oxc_ast::ast::ObjectProperty<'a>) {
        let method = it.method || it.kind != oxc_ast::ast::PropertyKind::Init;
        self.depth += u32::from(method);
        walk::walk_object_property(self, it);
        self.depth -= u32::from(method);
    }

    // TypeScript reads `await` in a namespace as a name, which awaits nothing.
    fn visit_ts_module_block(&mut self, it: &oxc_ast::ast::TSModuleBlock<'a>) {
        self.depth += 1;
        walk::walk_ts_module_block(self, it);
        self.depth -= 1;
    }

    fn visit_await_expression(&mut self, it: &oxc_ast::ast::AwaitExpression<'a>) {
        self.found |= self.depth == 0;
        walk::walk_await_expression(self, it);
    }
}
