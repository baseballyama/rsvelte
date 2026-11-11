use super::{CompilerNodeIdentifier, NodeKind, Piece, R, ServerCompilationContext};
use crate::lower::builder::Runtime;

impl<'o> ServerCompilationContext<'_, 'o> {
    pub(super) fn dynamic_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece<'o>>,
    ) -> R<()> {
        let b = self.b;
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
        let attributes =
            (!statements.is_empty()).then(|| b.arrow_block(b.params([]), statements, false));
        let statements = self.fragment(element.children)?;
        let children =
            (!statements.is_empty()).then(|| b.arrow_block(b.params([]), statements, false));
        let call = b.runtime_some(
            "element",
            vec![Some(b.id("$$renderer")), Some(tag), attributes, children],
        );
        template.push(Piece::Statement(b.stmt(call)));
        Ok(())
    }
}
