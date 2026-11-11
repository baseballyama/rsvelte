use crate::lower::server::{
    CompilerNodeIdentifier, EMPTY_COMMENT, NodeKind, Piece, R, ServerCompilationContext,
};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `KeyBlock` (server): the body between two empty comments.
    pub(in crate::lower::server) fn key_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece<'o>>,
    ) -> R<()> {
        let NodeKind::Key { body, .. } = self.compiler_syntax_tree.node(identifier).kind else {
            unreachable!("a key block")
        };
        let body = self.fragment(body)?;
        template.push(Piece::Text(EMPTY_COMMENT.into()));
        template.push(Piece::Statement(self.b.block(body)));
        template.push(Piece::Text(EMPTY_COMMENT.into()));
        Ok(())
    }
}
