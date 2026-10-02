use super::{
    EMPTY_COMMENT, Item, NodeIdentifier, NodeKind, Piece, R, ScriptRewrite,
    ServerCompilationContext, SourceLocation, Target, copy, escape_markup, known_string,
    sanitize_template_string,
};

impl ServerCompilationContext<'_> {
    pub(super) fn expression(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        let mut rw = ScriptRewrite {
            target: Target::Server,
            res: self.res,
            source_text: self.source_text,
            each: None,
        };
        copy(self.javascript, &mut self.out, &mut rw, e)
    }

    pub(super) fn fragment(
        &mut self,
        children: rsvelte_svelte::compilation::compiler_syntax_tree::Children,
    ) -> R<Vec<NodeIdentifier>> {
        let cleaned = self.plan.fragment(children);
        let mut template = Vec::new();
        if cleaned.text_first {
            template.push(Piece::Text(EMPTY_COMMENT.into()));
        }
        self.process_children(&cleaned.items, &mut template)?;
        Ok(self.build_template(template))
    }

    /// Upstream `process_children` (server).
    pub(super) fn process_children(
        &mut self,
        items: &[Item<'_>],
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let mut sequence: Vec<&Item<'_>> = Vec::new();
        for item in items {
            match item {
                Item::Text { .. } | Item::Expression(_) => sequence.push(item),
                Item::Node(identifier) => {
                    self.flush(&mut sequence, template);
                    match self.compiler_syntax_tree.node(*identifier).kind {
                        NodeKind::Element(_) => self.element(*identifier, template)?,
                        NodeKind::If { .. } => self.if_block(*identifier, template)?,
                        NodeKind::Each(_) => self.each_block(*identifier, template)?,
                        _ => unreachable!("clean_nodes keeps only elements and blocks as nodes"),
                    }
                }
            }
        }
        self.flush(&mut sequence, template);
        Ok(())
    }

    pub(super) fn flush(&mut self, sequence: &mut Vec<&Item<'_>>, template: &mut Vec<Piece>) {
        if sequence.is_empty() {
            return;
        }
        let mut quasis = vec![String::new()];
        let mut expressions = Vec::new();
        for item in sequence.drain(..) {
            match item {
                Item::Text { data, .. } => quasis
                    .last_mut()
                    .expect("never empty")
                    .push_str(&escape_markup(data, false)),
                Item::Expression(e) => {
                    let evaluated = self.res.evaluate(self.javascript, self.source_text, *e);
                    if evaluated.is_known {
                        let s = known_string(&evaluated.value);
                        quasis
                            .last_mut()
                            .expect("never empty")
                            .push_str(&escape_markup(&s, false));
                    } else {
                        let v = self.expression(*e);
                        expressions.push(self.out.runtime("$", "escape", &[v]));
                        quasis.push(String::new());
                    }
                }
                Item::Node(_) => unreachable!("sequences hold text and expressions"),
            }
        }
        template.push(Piece::Template(quasis, expressions));
    }

    /// Upstream `build_template`: adjacent pieces fold into one `$$renderer.push(`…`)`.
    pub(super) fn build_template(&mut self, template: Vec<Piece>) -> Vec<NodeIdentifier> {
        let mut statements = Vec::new();
        let mut strings: Vec<String> = Vec::new();
        let mut expressions: Vec<NodeIdentifier> = Vec::new();
        for piece in template {
            if let Piece::Statement(s) = piece {
                if !strings.is_empty() {
                    statements.push(self.push_call(
                        &std::mem::take(&mut strings),
                        &std::mem::take(&mut expressions),
                    ));
                }
                statements.push(s);
                continue;
            }
            if strings.is_empty() {
                strings.push(String::new());
            }
            match piece {
                Piece::Text(t) => strings.last_mut().expect("never empty").push_str(&t),
                Piece::Template(q, e) => {
                    let mut q = q.into_iter();
                    strings
                        .last_mut()
                        .expect("never empty")
                        .push_str(&q.next().expect("at least one quasi"));
                    strings.extend(q);
                    expressions.extend(e);
                }
                Piece::Expression(e) => {
                    expressions.push(e);
                    strings.push(String::new());
                }
                Piece::Statement(_) => unreachable!("handled above"),
            }
        }
        if !strings.is_empty() {
            statements.push(self.push_call(&strings, &expressions));
        }
        statements
    }

    pub(super) fn push_call(
        &mut self,
        strings: &[String],
        expressions: &[NodeIdentifier],
    ) -> NodeIdentifier {
        let n = strings.len();
        let quasis: Vec<NodeIdentifier> = strings
            .iter()
            .enumerate()
            .map(|(i, s)| {
                self.out
                    .template_element(&sanitize_template_string(s), i + 1 == n)
            })
            .collect();
        let t = self
            .out
            .template(&quasis, expressions, SourceLocation::SYNTHETIC);
        let r = self.out.identifier("$$renderer");
        let callee = self.out.dot(r, "push");
        let call = self
            .out
            .call(callee, &[t], false, SourceLocation::SYNTHETIC);
        self.out.expression_statement(call)
    }
}
