use rsvelte_svelte_semantic::compiler_syntax_tree::{CompilerNodeIdentifier, Element};

use crate::lower::attributes::{is_customizable_select, synthetic_value};
use crate::lower::server::template::Template;
use crate::lower::server::{R, ServerCompilationContext};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `RegularElement`'s `is_select_special` / `is_option_special` branches: the
    /// renderer writes the element, so it can mark the selected option.
    pub(super) fn select_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        el: &Element,
        tag: &str,
        template: &mut Template<'_, 'o>,
    ) -> R<()> {
        let b = self.b;
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let body = if let Some(e) = synthetic_value(compiler_syntax_tree, self.source_text, tag, el)
        {
            self.expression(e)
        } else {
            let plan = self.plan;
            let mut inner = Template::new(b);
            self.process_children(&plan.fragment(el.children).items, &mut inner)?;
            let statements = inner.finish();
            b.arrow_block(b.parameters(["$$renderer"]), statements, false)
        };
        let (mut arguments, _) = self.spread_args(
            identifier,
            tag,
            compiler_syntax_tree.attributes(el.attributes),
            true,
        );
        arguments.insert(1, Some(body));
        if is_customizable_select(compiler_syntax_tree, self.source_text, el) {
            // Upstream passes `true` after the attributes, the scoping class, classes, styles
            // and flags.
            arguments.resize_with(6, || None);
            arguments.push(Some(b.boolean(true)));
        }
        let call = b.call_some(b.member(b.id("$$renderer"), tag), arguments);
        template.statement(b.statement(call));
        Ok(())
    }
}
