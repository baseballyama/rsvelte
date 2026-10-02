use crate::lower::client::{
    ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, NodeIdentifier, NodeKind, R,
    SourceLocation,
};

impl ClientCompilationContext<'_> {
    /// Upstream `IfBlock` (client), with `{:else if}` chains flattened.
    pub(in crate::lower::client) fn if_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
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
        let mut tests_and_renders: Vec<(NodeIdentifier, NodeIdentifier)> = Vec::new();
        for (index, b) in compiler_syntax_tree.branches(branches).iter().enumerate() {
            let test = b.test;
            let body = self.fragment(b.body)?;
            let cid = self.names.generate("consequent");
            let arrow = self.anchor_arrow(&body);
            statements.push(self.var(&cid, arrow));
            let meta = self.an.meta(test);
            let mut t = self.expression(test);
            if meta.has_call {
                let d = self.names.generate("d");
                let thunk = self
                    .out
                    .arrow(&[], t, true, false, SourceLocation::SYNTHETIC);
                let derived = self.call("derived", vec![Some(thunk)]);
                statements.push(self.var(&d, derived));
                let x = self.out.identifier(&d);
                t = self.call("get", vec![Some(x)]);
            }
            let render = self.out.identifier("$$render");
            let c = self.out.identifier(&cid);
            let index = (index != 0).then(|| self.write_number(index as u32));
            let mut arguments = vec![c];
            arguments.extend(index);
            let call = self
                .out
                .call(render, &arguments, false, SourceLocation::SYNTHETIC);
            tests_and_renders.push((t, self.out.expression_statement(call)));
        }
        let else_statement = if let Some(o) = otherwise {
            let body = self.fragment(o)?;
            let aid = self.names.generate("alternate");
            let arrow = self.anchor_arrow(&body);
            statements.push(self.var(&aid, arrow));
            let render = self.out.identifier("$$render");
            let x = self.out.identifier(&aid);
            let minus = self.out.write_number(-1.0, SourceLocation::SYNTHETIC);
            let call = self
                .out
                .call(render, &[x, minus], false, SourceLocation::SYNTHETIC);
            Some(self.out.expression_statement(call))
        } else {
            None
        };
        let mut chain = else_statement;
        for (t, r) in tests_and_renders.into_iter().rev() {
            chain = Some(self.out.if_(t, r, chain, SourceLocation::SYNTHETIC));
        }
        let inner = self.out.block(
            &chain.into_iter().collect::<Vec<_>>(),
            SourceLocation::SYNTHETIC,
        );
        let render_param = self.out.identifier("$$render");
        let f = self.out.arrow(
            &[render_param],
            inner,
            false,
            false,
            SourceLocation::SYNTHETIC,
        );
        let x = self.out.identifier(node);
        // Upstream's third argument marks a nested `{:else if}` block; a chain is one node here.
        let call = self.call("if", vec![Some(x), Some(f)]);
        statements.push(self.statement(call));
        l.initializer
            .push(self.out.block(&statements, SourceLocation::SYNTHETIC));
        Ok(())
    }
}
