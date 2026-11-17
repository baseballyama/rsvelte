use oxc_ast::ast::Statement;
use rsvelte_svelte_semantic::compiler_syntax_tree::Children;

use super::super::component::{Standalone, standalone};
use super::{EMPTY_COMMENT, R, ServerCompilationContext, Template};
use crate::render_plan::Region;

impl<'c, 'o> ServerCompilationContext<'c, 'o> {
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
        let plan = self.plan;
        self.region_parts(plan.fragment(children), skipped)
    }

    /// [`Self::fragment_parts`] over a region the plan prepared, such as one slot's.
    pub(super) fn region_parts(
        &mut self,
        region: &Region,
        skipped: fn(&str) -> bool,
    ) -> R<(Vec<Statement<'o>>, Vec<Statement<'o>>)> {
        let outer = std::mem::take(&mut self.snippets);
        let template = self.fragment_template(region, skipped);
        let snippets = std::mem::replace(&mut self.snippets, outer);
        Ok((snippets, template?.finish()))
    }

    fn fragment_template(
        &mut self,
        cleaned: &Region,
        skipped: fn(&str) -> bool,
    ) -> R<Template<'c, 'o>> {
        let mut template = Template::new(self.b);
        self.hoisted_elements(&cleaned.hoisted, skipped, &mut template)?;
        if cleaned.text_first {
            template.text(EMPTY_COMMENT);
        }
        match standalone(
            self.compiler_syntax_tree,
            self.javascript,
            self.res,
            self.source_text,
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
}
