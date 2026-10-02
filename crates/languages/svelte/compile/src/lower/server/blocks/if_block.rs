use crate::lower::server::{
    BLOCK_CLOSE, CompilerNodeIdentifier, NodeKind, Piece, R, ServerCompilationContext,
    SourceLocation,
};

impl ServerCompilationContext<'_> {
    /// Upstream `IfBlock` (server).
    pub(in crate::lower::server) fn if_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece>,
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
        for (index, b) in compiler_syntax_tree.branches(branches).iter().enumerate() {
            let body = self.fragment(b.body)?;
            let marker = format!("<!--[{index}-->");
            let block = self.prepend_block_marker(body, &marker);
            let t = self.expression(b.test);
            arms.push((t, block));
        }
        let final_body = match otherwise {
            Some(o) => self.fragment(o)?,
            None => Vec::new(),
        };
        let mut chain = self.prepend_block_marker(final_body, "<!--[-1-->");
        for (t, block) in arms.into_iter().rev() {
            chain = self
                .out
                .if_(t, block, Some(chain), SourceLocation::SYNTHETIC);
        }
        template.push(Piece::Statement(chain));
        template.push(Piece::Text(BLOCK_CLOSE.into()));
        Ok(())
    }
}
