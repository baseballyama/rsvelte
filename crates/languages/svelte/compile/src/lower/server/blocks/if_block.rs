use crate::lower::server::{
    BLOCK_CLOSE, CompilerNodeIdentifier, NodeKind, Piece, R, ServerCompilationContext,
};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `IfBlock` (server).
    pub(in crate::lower::server) fn if_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece<'o>>,
    ) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::If {
            branches,
            otherwise,
        } = compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!()
        };
        let mut arms = Vec::new();
        for (index, branch) in compiler_syntax_tree.branches(branches).iter().enumerate() {
            let body = self.fragment(branch.body)?;
            let marker = format!("<!--[{index}-->");
            let block = self.prepend_block_marker(body, &marker);
            arms.push((self.expression(branch.test), block));
        }
        let final_body = match otherwise {
            Some(o) => self.fragment(o)?,
            None => Vec::new(),
        };
        let mut chain = self.prepend_block_marker(final_body, "<!--[-1-->");
        for (test, block) in arms.into_iter().rev() {
            chain = self.b.if_(test, block, Some(chain));
        }
        template.push(Piece::Statement(chain));
        template.push(Piece::Text(BLOCK_CLOSE.into()));
        Ok(())
    }
}
