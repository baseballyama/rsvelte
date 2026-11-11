use oxc_ast::ast::{Expression, Statement};
use rsvelte_svelte_semantic::compiler_syntax_tree::Children;

use super::{EMPTY_COMMENT, NodeKind, Piece, R, ServerCompilationContext};

impl<'o> ServerCompilationContext<'_, 'o> {
    pub(super) fn fragment(&mut self, children: Children) -> R<Vec<Statement<'o>>> {
        self.fragment_without(children, |_| false)
    }

    /// Upstream `Fragment` over the children but the snippets named so that `skipped` holds,
    /// which the caller declares: the snippets come first (upstream `state.init`).
    pub(super) fn fragment_without(
        &mut self,
        children: Children,
        skipped: fn(&str) -> bool,
    ) -> R<Vec<Statement<'o>>> {
        let outer = std::mem::take(&mut self.snippets);
        let template = self.fragment_template(children, skipped);
        let mut snippets = std::mem::replace(&mut self.snippets, outer);
        snippets.extend(self.build_template(template?));
        Ok(snippets)
    }

    fn fragment_template(
        &mut self,
        children: Children,
        skipped: fn(&str) -> bool,
    ) -> R<Vec<Piece<'o>>> {
        let cleaned = self.plan.fragment(children);
        let mut template = Vec::new();
        let hoisted: Vec<_> = (cleaned.hoisted.iter().copied())
            .filter(
                |&identifier| match &self.compiler_syntax_tree.node(identifier).kind {
                    NodeKind::Snippet(snippet) => !skipped(self.snippet_name(snippet)),
                    _ => true,
                },
            )
            .collect();
        self.hoisted_elements(&hoisted, &mut template)?;
        if cleaned.text_first {
            template.push(Piece::Text(EMPTY_COMMENT.into()));
        }
        match super::super::component::standalone(
            self.compiler_syntax_tree,
            self.javascript,
            self.res,
            &cleaned.items,
        ) {
            Some(standalone)
                if matches!(
                    self.compiler_syntax_tree.node(standalone).kind,
                    NodeKind::Render { .. }
                ) =>
            {
                self.render_tag(standalone, true, &mut template);
            }
            Some(standalone) => self.component(standalone, true, &mut template)?,
            None => self.process_children(&cleaned.items, &mut template)?,
        }
        Ok(template)
    }

    /// Upstream `build_template`: adjacent pieces fold into one `$$renderer.push(`…`)`.
    pub(super) fn build_template(&self, template: Vec<Piece<'o>>) -> Vec<Statement<'o>> {
        let mut statements = Vec::new();
        let mut strings: Vec<String> = Vec::new();
        let mut expressions: Vec<Expression<'o>> = Vec::new();
        for piece in template {
            if let Piece::Statement(s) = piece {
                if !strings.is_empty() {
                    statements.push(self.push_call(
                        &std::mem::take(&mut strings),
                        std::mem::take(&mut expressions),
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
            statements.push(self.push_call(&strings, expressions));
        }
        statements
    }

    fn push_call(&self, strings: &[String], expressions: Vec<Expression<'o>>) -> Statement<'o> {
        let b = self.b;
        let template = b.template(strings.iter().map(String::as_str), expressions);
        b.stmt(b.call(b.member(b.id("$$renderer"), "push"), [template]))
    }
}
