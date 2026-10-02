use super::{
    AssignmentOperator, ClientCompilationContext, CompilerNodeIdentifier, Frag, Item, Kind, Lists,
    NodeIdentifier, NodeKind, Prev, R, SourceLocation, Walk,
};

impl ClientCompilationContext<'_> {
    /// Upstream `process_children`.
    pub(super) fn process_children(
        &mut self,
        items: &[Item<'_>],
        initial: Prev,
        is_element: bool,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        let mut st = Walk {
            prev: initial,
            skipped: 0,
        };
        let mut sequence: Vec<Item<'_>> = Vec::new();
        for item in items {
            if matches!(item, Item::Text { .. } | Item::Expression(_)) {
                sequence.push(item.clone());
                continue;
            }
            if !sequence.is_empty() {
                self.flush_sequence(&std::mem::take(&mut sequence), &mut st, frag, l);
            }
            let Item::Node(identifier) = item else {
                unreachable!("text is part of a sequence")
            };
            let identifier = *identifier;
            if self.is_static_element(identifier) {
                st.skipped += 1;
                self.visit(identifier, &st.prev_name(), frag, l)?;
            } else if is_element
                && items.len() == 1
                && matches!(
                    self.compiler_syntax_tree.node(identifier).kind,
                    NodeKind::Each(_)
                )
            {
                // Upstream's `is_controlled`: the element is the block's anchor.
                self.each_block(identifier, &st.prev_name(), true, frag, l)?;
            } else {
                let name = match &self.compiler_syntax_tree.node(identifier).kind {
                    NodeKind::Element(el) => el.name.text(self.source_text).to_owned(),
                    _ => "node".to_owned(),
                };
                let node = self.flush_node(&mut st, false, &name, l);
                self.visit(identifier, &node, frag, l)?;
            }
        }
        if !sequence.is_empty() {
            self.flush_sequence(&sequence, &mut st, frag, l);
        }
        if st.skipped > 1 {
            st.skipped -= 1;
            let n = (st.skipped != 1).then(|| self.write_number(st.skipped));
            let call = self.call("next", vec![n]);
            l.initializer.push(self.statement(call));
        }
        Ok(())
    }

    fn prev_expression(&mut self, prev: &Prev, is_text: bool) -> NodeIdentifier {
        match prev {
            Prev::Identifier(name) => self.out.identifier(name),
            Prev::Call { method, of } => {
                let x = self.out.identifier(of);
                let t = is_text.then(|| self.tru());
                self.call(method, vec![Some(x), t])
            }
        }
    }

    fn get_node(&mut self, st: &Walk, is_text: bool) -> NodeIdentifier {
        if st.skipped == 0 {
            return self.prev_expression(&st.prev, is_text);
        }
        let p = self.prev_expression(&st.prev, false);
        let n = (is_text || st.skipped != 1).then(|| self.write_number(st.skipped));
        let t = is_text.then(|| self.tru());
        self.call("sibling", vec![Some(p), n, t])
    }

    fn flush_node(&mut self, st: &mut Walk, is_text: bool, name: &str, l: &mut Lists) -> String {
        let expression = self.get_node(st, is_text);
        let identifier = if let Kind::Identifier(_) = self.out.kind(expression) {
            self.out.name(expression).to_owned()
        } else {
            let identifier = self.names.generate(name);
            let declaration = self.var(&identifier, expression);
            l.initializer.push(declaration);
            identifier
        };
        st.prev = Prev::Identifier(identifier.clone());
        st.skipped = 1;
        identifier
    }

    fn flush_sequence(&mut self, seq: &[Item<'_>], st: &mut Walk, frag: &mut Frag, l: &mut Lists) {
        if seq.iter().all(|i| matches!(i, Item::Text { .. })) {
            st.skipped += 1;
            let raw: String = seq
                .iter()
                .map(|i| match i {
                    Item::Text { raw, .. } => raw.as_ref(),
                    _ => unreachable!("all text"),
                })
                .collect();
            frag.tpl.push_text(raw);
            return;
        }
        frag.tpl.push_text(" ".into());
        let (value, has_state) = self.template_chunk(seq, frag);
        let identifier = self.flush_node(st, seq.len() == 1, "text", l);
        let x = self.out.identifier(&identifier);
        if has_state {
            let call = self.call("set_text", vec![Some(x), Some(value)]);
            l.update.push(self.statement(call));
        } else {
            let target = self.out.dot(x, "nodeValue");
            let assign = self.out.assign(
                AssignmentOperator::Assign,
                target,
                value,
                SourceLocation::SYNTHETIC,
            );
            l.initializer.push(self.statement(assign));
        }
    }

    fn visit(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        match self.compiler_syntax_tree.node(identifier).kind {
            NodeKind::Element(_) => self.element(identifier, node, frag, l),
            NodeKind::If { .. } => self.if_block(identifier, node, frag, l),
            NodeKind::Each(_) => self.each_block(identifier, node, false, frag, l),
            _ => unreachable!("clean_nodes keeps only elements and blocks as nodes"),
        }
    }
}
