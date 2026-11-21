use rsvelte_svelte_semantic::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind};

use crate::lower::server::template::Template;
use crate::lower::server::{EMPTY_COMMENT, R, ServerCompilationContext};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `KeyBlock` (server): the body between two empty comments.
    pub(in crate::lower::server) fn key_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Template<'_, 'o>,
    ) -> R<()> {
        let NodeKind::Key { body, .. } = self.compiler_syntax_tree.node(identifier).kind else {
            unreachable!("a key block")
        };
        let body = self.fragment(body)?;
        template.text(EMPTY_COMMENT);
        template.statement(self.b.block(body));
        template.text(EMPTY_COMMENT);
        Ok(())
    }
}
