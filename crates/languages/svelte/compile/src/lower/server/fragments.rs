use super::{
    EMPTY_COMMENT, NodeIdentifier, Piece, R, ServerCompilationContext, SourceLocation,
    sanitize_template_string,
};

impl ServerCompilationContext<'_> {
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

    fn push_call(&mut self, strings: &[String], expressions: &[NodeIdentifier]) -> NodeIdentifier {
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
