mod await_block;
mod each_block;
mod if_block;
mod key_block;

use oxc_ast::ast::{Expression, Statement};

use super::ClientCompilationContext;

impl<'o> ClientCompilationContext<'_, 'o> {
    fn anchor_arrow(&self, body: Vec<Statement<'o>>) -> Expression<'o> {
        self.b
            .arrow_block(self.b.parameters(["$$anchor"]), body, false)
    }
}
