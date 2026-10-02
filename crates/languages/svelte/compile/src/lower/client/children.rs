use super::{
    AssignmentOperator, ClientCompilationContext, CompilerNodeIdentifier, Frag, Item, Kind, Lists,
    LogicalOperator, NodeIdentifier, NodeKind, Prev, R, SourceLocation, Walk,
    sanitize_template_string,
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

    pub(super) fn prev_expression(&mut self, prev: &Prev, is_text: bool) -> NodeIdentifier {
        match prev {
            Prev::Identifier(name) => self.out.identifier(name),
            Prev::Call { method, of } => {
                let x = self.out.identifier(of);
                let t = is_text.then(|| self.tru());
                self.call(method, vec![Some(x), t])
            }
        }
    }

    pub(super) fn get_node(&mut self, st: &Walk, is_text: bool) -> NodeIdentifier {
        if st.skipped == 0 {
            return self.prev_expression(&st.prev, is_text);
        }
        let p = self.prev_expression(&st.prev, false);
        let n = (is_text || st.skipped != 1).then(|| self.write_number(st.skipped));
        let t = is_text.then(|| self.tru());
        self.call("sibling", vec![Some(p), n, t])
    }

    pub(super) fn flush_node(
        &mut self,
        st: &mut Walk,
        is_text: bool,
        name: &str,
        l: &mut Lists,
    ) -> String {
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

    pub(super) fn flush_sequence(
        &mut self,
        seq: &[Item<'_>],
        st: &mut Walk,
        frag: &mut Frag,
        l: &mut Lists,
    ) {
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

    /// Upstream `build_template_chunk`.
    pub(super) fn template_chunk(
        &mut self,
        values: &[Item<'_>],
        frag: &mut Frag,
    ) -> (NodeIdentifier, bool) {
        let mut quasis: Vec<String> = vec![String::new()];
        let mut expressions: Vec<NodeIdentifier> = Vec::new();
        let mut has_state = false;
        for item in values {
            let expression = match item {
                Item::Text { data, .. } => {
                    quasis.last_mut().expect("never empty").push_str(data);
                    continue;
                }
                Item::Expression(e) => *e,
                Item::Node(_) => unreachable!("sequences hold text and expression tags"),
            };
            let javascript = self.javascript;
            match javascript.kind(expression) {
                Kind::String | Kind::Number(_) | Kind::Boolean(_) | Kind::Null => {
                    if !matches!(javascript.kind(expression), Kind::Null) {
                        let v = self
                            .res
                            .evaluate(javascript, self.source_text, expression)
                            .value
                            .to_javascript_string();
                        quasis.last_mut().expect("never empty").push_str(&v);
                    }
                    continue;
                }
                Kind::Identifier(_)
                    if javascript.name(expression) == "undefined"
                        && self.res.binding(expression).is_none() =>
                {
                    continue;
                }
                _ => {}
            }
            let meta = self.an.meta(expression);
            let built = self.expression(expression);
            let mut value = self.memoize(frag, built, meta);
            let evaluated = self.res.evaluate_output(
                javascript,
                self.source_text,
                &self.out,
                value,
                self.scope,
            );
            let known = evaluated.is_known.then_some(&evaluated);
            has_state |= meta.has_state && known.is_none();
            if values.len() == 1 {
                if let Some(k) = known {
                    let s = Self::template_string(&k.value);
                    value = self.out.write_string(&s);
                }
                return (value, has_state);
            }
            if let Kind::Logical(op @ (LogicalOperator::Nullish | LogicalOperator::Or), l, r) =
                self.out.kind(value)
                && matches!(self.out.kind(r), Kind::Null)
            {
                let empty = self.out.write_string("");
                value = self
                    .out
                    .logical(op, l, empty, self.out.source_location(value));
            }
            if let Some(k) = known {
                let s = Self::template_string(&k.value);
                quasis.last_mut().expect("never empty").push_str(&s);
            } else {
                if !evaluated.is_defined {
                    let empty = self.out.write_string("");
                    value = self.out.logical(
                        LogicalOperator::Nullish,
                        value,
                        empty,
                        SourceLocation::SYNTHETIC,
                    );
                }
                expressions.push(value);
                quasis.push(String::new());
            }
        }
        if expressions.is_empty() {
            let s = quasis.pop().expect("never empty");
            return (self.out.write_string(&s), has_state);
        }
        let n = quasis.len();
        let elements: Vec<NodeIdentifier> = quasis
            .iter()
            .enumerate()
            .map(|(i, q)| {
                self.out
                    .template_element(&sanitize_template_string(q), i + 1 == n)
            })
            .collect();
        (
            self.out
                .template(&elements, &expressions, SourceLocation::SYNTHETIC),
            has_state,
        )
    }

    pub(super) fn template_string(value: &rsvelte_svelte::semantic::evaluate::Value) -> String {
        match value {
            rsvelte_svelte::semantic::evaluate::Value::Null
            | rsvelte_svelte::semantic::evaluate::Value::Undefined => String::new(),
            value => value.to_javascript_string(),
        }
    }

    pub(super) fn visit(
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
