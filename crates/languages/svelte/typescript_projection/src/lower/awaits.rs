//! Where svelte2tsx sees a top-level `await`, which makes its render function async.

use oxc_ast::ast::Program;
use oxc_ast_visit::{Visit, walk};
use oxc_syntax::scope::ScopeFlags;

/// Whether `program` awaits outside every block and function, where svelte2tsx makes its render
/// function async.
pub(super) fn awaits_at_top_level(program: &Program<'_>) -> bool {
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

        fn visit_arrow_function_expression(
            &mut self,
            it: &oxc_ast::ast::ArrowFunctionExpression<'a>,
        ) {
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
    let mut awaits = Awaits {
        depth: 0,
        found: false,
    };
    awaits.visit_program(program);
    awaits.found
}
