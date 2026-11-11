use oxc_ast::ast::Expression;

use super::{
    ClientCompilationContext, CompilerNodeIdentifier, Frag, Item, Lists, NodeKind, Prev, R, Walk,
};
use crate::lower::builder::Runtime;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `process_children`.
    pub(super) fn process_children(
        &mut self,
        items: &[Item<'_>],
        initial: Prev,
        is_element: bool,
        frag: &mut Frag<'o>,
        l: &mut Lists<'o>,
    ) -> R<()> {
        let b = self.b;
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
            let &Item::Node(identifier) = item else {
                self.flush_node(&mut st, false, "node", l);
                frag.tpl.push_comment();
                continue;
            };
            if self.is_static_element(identifier) {
                st.skipped += 1;
                self.visit(identifier, &st.prev_name(), frag, l)?;
            } else if is_element
                && items.len() == 1
                && matches!(
                    self.compiler_syntax_tree.node(identifier).kind,
                    NodeKind::Each(_) | NodeKind::Html { .. }
                )
            {
                // Upstream's `is_controlled`: the element is the block's anchor.
                let node = st.prev_name();
                if let NodeKind::Each(_) = self.compiler_syntax_tree.node(identifier).kind {
                    self.each_block(identifier, &node, true, frag, l)?;
                } else {
                    self.markup_tag(identifier, &node, true, frag, l);
                }
            } else {
                let name = match &self.compiler_syntax_tree.node(identifier).kind {
                    NodeKind::Element(el) if el.kind == super::ElementKind::Regular => {
                        el.name.text(self.source_text).to_owned()
                    }
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
            let n = (st.skipped != 1).then(|| b.number(f64::from(st.skipped)));
            l.initializer
                .push(b.statement(b.runtime_some("next", vec![n])));
        }
        Ok(())
    }

    fn prev_expression(&self, prev: &Prev, is_text: bool) -> Expression<'o> {
        let b = self.b;
        match prev {
            Prev::Identifier(name) => b.id(name),
            Prev::Call {
                method,
                of,
                content,
            } => {
                let of = if *content {
                    b.member(b.id(of), "content")
                } else {
                    b.id(of)
                };
                b.runtime_some(method, vec![Some(of), is_text.then(|| b.boolean(true))])
            }
        }
    }

    /// The node `st` points at: a name when it is one already, else the call that reaches it.
    fn get_node(&self, st: &Walk, is_text: bool) -> Result<String, Expression<'o>> {
        let b = self.b;
        if st.skipped == 0 {
            if let Prev::Identifier(name) = &st.prev {
                return Ok(name.clone());
            }
            return Err(self.prev_expression(&st.prev, is_text));
        }
        let p = self.prev_expression(&st.prev, false);
        let n = (is_text || st.skipped != 1).then(|| b.number(f64::from(st.skipped)));
        let t = is_text.then(|| b.boolean(true));
        Err(b.runtime_some("sibling", vec![Some(p), n, t]))
    }

    fn flush_node(&self, st: &mut Walk, is_text: bool, name: &str, l: &mut Lists<'o>) -> String {
        let identifier = match self.get_node(st, is_text) {
            Ok(identifier) => identifier,
            Err(expression) => {
                let identifier = self.names.generate(name);
                l.initializer.push(self.b.var(&identifier, expression));
                identifier
            }
        };
        st.prev = Prev::Identifier(identifier.clone());
        st.skipped = 1;
        identifier
    }

    fn flush_sequence(
        &self,
        seq: &[Item<'_>],
        st: &mut Walk,
        frag: &mut Frag<'o>,
        l: &mut Lists<'o>,
    ) {
        let b = self.b;
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
        let (value, has_state) = self.template_chunk(seq, &mut frag.memo, false);
        let identifier = self.flush_node(st, seq.len() == 1, "text", l);
        let x = b.id(&identifier);
        if has_state {
            l.update
                .push(b.statement(b.runtime("set_text", [x, value])));
        } else {
            let target = b.member(x, "nodeValue");
            l.initializer
                .push(b.statement(b.assign_member(target, value)));
        }
    }

    fn visit(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag<'o>,
        l: &mut Lists<'o>,
    ) -> R<()> {
        match self.compiler_syntax_tree.node(identifier).kind {
            NodeKind::Element(_) => self.element(identifier, node, frag, l),
            NodeKind::If { .. } => self.if_block(identifier, node, frag, l),
            NodeKind::Each(_) => self.each_block(identifier, node, false, frag, l),
            NodeKind::Key { .. } => self.key_block(identifier, node, frag, l),
            NodeKind::Await(_) => self.await_block(identifier, node, frag, l),
            NodeKind::Html { .. } => {
                self.markup_tag(identifier, node, false, frag, l);
                Ok(())
            }
            NodeKind::Render { .. } => {
                self.render_tag(identifier, node, frag, l);
                Ok(())
            }
            _ => unreachable!("clean_nodes keeps only elements and blocks as nodes"),
        }
    }
}
