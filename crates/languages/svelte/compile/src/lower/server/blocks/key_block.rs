use crate::lower::server::{
    CompilerNodeIdentifier, EMPTY_COMMENT, NodeKind, R, ServerCompilationContext, Template,
};

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
