use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast_visit::VisitMut;
use rsvelte_svelte_semantic::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind};

use crate::lower::builder::Runtime;
use crate::lower::server::template::Template;
use crate::lower::server::{BLOCK_CLOSE, R, ServerCompilationContext};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `AwaitBlock` (server): the pending and the then branches; the server never
    /// renders `{:catch}`.
    pub(in crate::lower::server) fn await_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Template<'_, 'o>,
    ) -> R<()> {
        let b = self.b;
        let NodeKind::Await(block) = &self.compiler_syntax_tree.node(identifier).kind else {
            unreachable!("an await block")
        };
        let promise = self.expression(block.expression);
        let pending = match block.pending() {
            Some(pending) => self.fragment(pending)?,
            None => Vec::new(),
        };
        let pending = b.arrow_block(b.parameters([]), pending, false);
        let then = match block.then() {
            Some(then) => self.fragment(then)?,
            None => Vec::new(),
        };
        let mut parameters = Vec::new();
        if let Some(value) = block.value {
            let mut pattern = self
                .javascript
                .get_pattern(value)
                .pattern
                .clone_in_with_semantic_ids(b.allocator());
            self.rewrite().visit_binding_pattern(&mut pattern);
            parameters.push(b.parameter(pattern));
        }
        let then = b.arrow_block(b.formal_parameters(parameters), then, false);
        let call = b.runtime("await", [b.id("$$renderer"), promise, pending, then]);
        template.statement(b.statement(call));
        template.text(BLOCK_CLOSE);
        Ok(())
    }
}
