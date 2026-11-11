use crate::lower::builder::Runtime;
use oxc_ast::ast::{Expression, Statement};

use crate::lower::client::{
    ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, NodeKind, R,
};

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `IfBlock` (client), with `{:else if}` chains flattened.
    pub(in crate::lower::client) fn if_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag<'o>,
        l: &mut Lists<'o>,
    ) -> R<()> {
        let b = self.b;
        frag.tpl.push_comment();
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::If {
            branches,
            otherwise,
        } = compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!()
        };
        let mut statements = Vec::new();
        let mut tests_and_renders: Vec<(Expression<'o>, Statement<'o>)> = Vec::new();
        for (index, branch) in compiler_syntax_tree.branches(branches).iter().enumerate() {
            let test = branch.test;
            let body = self.fragment(branch.body)?;
            let cid = self.names.generate("consequent");
            statements.push(b.var(&cid, self.anchor_arrow(body)));
            let meta = self.an.meta(test);
            let mut t = self.expression(test);
            if meta.has_call {
                let d = self.names.generate("d");
                let derived = b.runtime("derived", [b.arrow(b.params([]), t)]);
                statements.push(b.var(&d, derived));
                t = b.runtime("get", [b.id(&d)]);
            }
            let mut arguments = vec![b.id(&cid)];
            #[expect(clippy::cast_precision_loss, reason = "a branch index is small")]
            arguments.extend((index != 0).then(|| b.number(index as f64)));
            tests_and_renders.push((t, b.stmt(b.call(b.id("$$render"), arguments))));
        }
        let mut chain = if let Some(o) = otherwise {
            let body = self.fragment(o)?;
            let aid = self.names.generate("alternate");
            statements.push(b.var(&aid, self.anchor_arrow(body)));
            Some(b.stmt(b.call(b.id("$$render"), [b.id(&aid), b.number(-1.0)])))
        } else {
            None
        };
        for (t, r) in tests_and_renders.into_iter().rev() {
            chain = Some(b.if_(t, r, chain));
        }
        let f = b.arrow_block(b.params(["$$render"]), chain, false);
        // Upstream's third argument marks a nested `{:else if}` block; a chain is one node here.
        statements.push(b.stmt(b.runtime("if", [b.id(node), f])));
        l.initializer.push(b.block(statements));
        Ok(())
    }
}
