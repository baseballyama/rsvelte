use oxc_ast::ast::{Expression, Statement};
use rsvelte_svelte_semantic::compiler_syntax_tree::Children;

use super::super::component::{Standalone, standalone};
use super::{EMPTY_COMMENT, Piece, R, ServerCompilationContext};

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
        let (mut snippets, template) = self.fragment_parts(children, skipped)?;
        snippets.extend(template);
        Ok(snippets)
    }

    /// The snippets a fragment declares, apart from the rest of it.
    pub(super) fn fragment_parts(
        &mut self,
        children: Children,
        skipped: fn(&str) -> bool,
    ) -> R<(Vec<Statement<'o>>, Vec<Statement<'o>>)> {
        let outer = std::mem::take(&mut self.snippets);
        let template = self.fragment_template(children, skipped);
        let snippets = std::mem::replace(&mut self.snippets, outer);
        Ok((snippets, self.build_template(template?)))
    }

    fn fragment_template(
        &mut self,
        children: Children,
        skipped: fn(&str) -> bool,
    ) -> R<Vec<Piece<'o>>> {
        let cleaned = self.plan.fragment(children);
        let mut template = Vec::new();
        self.hoisted_elements(&cleaned.hoisted, skipped, &mut template)?;
        if cleaned.text_first {
            template.push(Piece::Text(EMPTY_COMMENT.into()));
        }
        match standalone(
            self.compiler_syntax_tree,
            self.javascript,
            self.res,
            &cleaned.items,
        ) {
            Some(Standalone::Render(tag)) => self.render_tag(tag, true, &mut template),
            Some(Standalone::Component(component)) => {
                self.component(component, true, &mut template)?;
            }
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
