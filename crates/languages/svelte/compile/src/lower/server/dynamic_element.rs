use super::{
    CompilerNodeIdentifier, NodeKind, Piece, R, ServerCompilationContext, SourceLocation,
    call_arguments,
};

impl ServerCompilationContext<'_> {
    pub(super) fn dynamic_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("an element")
        };
        let attributes = tree.attributes(element.attributes);
        let tag = &tree.attributes[element.this.expect("dynamic tag is validated")];
        let tag = self.attribute_value(tag, false, false);
        let mut pieces = Vec::new();
        self.element_attributes(identifier, "svelte:element", attributes, &mut pieces)?;
        let statements = self.build_template(pieces);
        let attributes = if statements.is_empty() {
            None
        } else {
            let block = self.out.block(&statements, SourceLocation::SYNTHETIC);
            Some(
                self.out
                    .arrow(&[], block, false, false, SourceLocation::SYNTHETIC),
            )
        };
        let statements = self.fragment(element.children)?;
        let children = if statements.is_empty() {
            None
        } else {
            let block = self.out.block(&statements, SourceLocation::SYNTHETIC);
            Some(
                self.out
                    .arrow(&[], block, false, false, SourceLocation::SYNTHETIC),
            )
        };
        let renderer = self.out.identifier("$$renderer");
        let arguments = call_arguments(
            &mut self.out,
            vec![Some(renderer), Some(tag), attributes, children],
        );
        let call = self.out.runtime("$", "element", &arguments);
        template.push(Piece::Statement(self.out.expression_statement(call)));
        Ok(())
    }
}
