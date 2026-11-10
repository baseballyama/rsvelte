use oxc_ast::ast::{Expression, Statement};
use rsvelte_svelte_semantic::compiler_syntax_tree::Children;

use super::{EMPTY_COMMENT, NodeKind, Piece, R, ServerCompilationContext};

impl<'o> ServerCompilationContext<'_, 'o> {
    pub(super) fn fragment(&mut self, children: Children) -> R<Vec<Statement<'o>>> {
        self.fragment_with_snippets(children, true)
    }

    pub(super) fn fragment_with_snippets(
        &mut self,
        children: Children,
        include_snippets: bool,
    ) -> R<Vec<Statement<'o>>> {
        let cleaned = self.plan.fragment(children);
        let mut template = Vec::new();
        for &identifier in &cleaned.hoisted {
            if !include_snippets
                && matches!(
                    self.compiler_syntax_tree.node(identifier).kind,
                    NodeKind::Snippet(_)
                )
            {
                continue;
            }
            self.special_element(identifier, &mut template)?;
        }
        if cleaned.text_first {
            template.push(Piece::Text(EMPTY_COMMENT.into()));
        }
        if let Some(component) = super::super::component::standalone_component(
            self.compiler_syntax_tree,
            self.javascript,
            self.res,
            &cleaned.items,
        ) {
            self.component(component, true, &mut template)?;
        } else {
            self.process_children(&cleaned.items, &mut template)?;
        }
        Ok(self.build_template(template))
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
