use crate::lower::server::{
    CompilerNodeIdentifier, Element, Piece, R, ServerCompilationContext, is_customizable_select,
    synthetic_value,
};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `RegularElement`'s `is_select_special` / `is_option_special` branches: the
    /// renderer writes the element, so it can mark the selected option.
    pub(super) fn select_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        el: &Element,
        tag: &str,
        template: &mut Vec<Piece<'o>>,
    ) -> R<()> {
        let b = self.b;
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let body = if let Some(e) = synthetic_value(compiler_syntax_tree, self.source_text, tag, el)
        {
            self.expression(e)
        } else {
            let plan = self.plan;
            let mut inner = Vec::new();
            self.process_children(&plan.fragment(el.children).items, &mut inner)?;
            let statements = self.build_template(inner);
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
        template.push(Piece::Statement(b.statement(call)));
        Ok(())
    }
}
