use crate::lower::builder::Runtime;
use crate::lower::client::{
    ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, NodeKind, R,
};

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `KeyBlock` (client): `$.key(node, () => key, ($$anchor) => { … })`.
    pub(in crate::lower::client) fn key_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag<'o>,
        l: &mut Lists<'o>,
    ) -> R<()> {
        let b = self.b;
        frag.tpl.push_comment();
        let NodeKind::Key { expression, body } = self.compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!("a key block")
        };
        let key = b.thunk(self.expression(expression));
        let body = self.fragment(body)?;
        let render = self.anchor_arrow(body);
        l.initializer
            .push(b.statement(b.runtime("key", [b.id(node), key, render])));
        Ok(())
    }
}
