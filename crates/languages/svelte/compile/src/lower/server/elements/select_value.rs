use crate::lower::server::{
    CompilerNodeIdentifier, Element, Piece, R, ServerCompilationContext, SourceLocation,
    call_arguments, synthetic_value,
};

impl ServerCompilationContext<'_> {
    /// Upstream `RegularElement`'s `is_select_special` / `is_option_special` branches: the
    /// renderer writes the element, so it can mark the selected option.
    pub(super) fn select_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        el: &Element,
        tag: &str,
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let body = if let Some(e) = synthetic_value(compiler_syntax_tree, self.source_text, tag, el)
        {
            self.expression(e)
        } else {
            let cleaned = self.plan.fragment(el.children);
            let mut inner = Vec::new();
            self.process_children(&cleaned.items, &mut inner)?;
            let statements = self.build_template(inner);
            let block = self.out.block(&statements, SourceLocation::SYNTHETIC);
            let param = self.out.identifier("$$renderer");
            self.out
                .arrow(&[param], block, false, false, SourceLocation::SYNTHETIC)
        };
        let (mut arguments, _) = self.spread_args(
            identifier,
            tag,
            compiler_syntax_tree.attributes(el.attributes),
            true,
        )?;
        arguments.insert(1, Some(body));
        let arguments = call_arguments(&mut self.out, arguments);
        let r = self.out.identifier("$$renderer");
        let callee = self.out.dot(r, tag);
        let call = self
            .out
            .call(callee, &arguments, false, SourceLocation::SYNTHETIC);
        template.push(Piece::Statement(self.out.expression_statement(call)));
        Ok(())
    }
}
