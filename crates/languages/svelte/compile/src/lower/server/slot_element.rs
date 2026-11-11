use super::super::slot_element::{SlotAttribute, slot_attributes, slot_call};
use super::{
    BLOCK_CLOSE, BLOCK_OPEN, CompilerNodeIdentifier, NodeKind, Piece, R, ServerCompilationContext,
    Target,
};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `SlotElement` (server): the call between a block's comments.
    pub(super) fn slot_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece<'o>>,
    ) -> R<()> {
        let b = self.b;
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("a slot element")
        };
        let (mut name, mut properties, mut spreads) = (None, Vec::new(), Vec::new());
        for attribute in slot_attributes(tree.attributes(element.attributes), self.source_text) {
            match attribute {
                SlotAttribute::Spread(e) => spreads.push(self.expression(e)),
                SlotAttribute::Name(a) => name = Some(self.attribute_value(a, false, false)),
                SlotAttribute::Prop(a) => {
                    let value = self.attribute_value(a, false, false);
                    properties.push(b.init(a.name.text(self.source_text), value));
                }
            }
        }
        let fallback = if tree.children(element.children).is_empty() {
            None
        } else {
            let body = self.fragment(element.children)?;
            Some(b.arrow_block(b.parameters([]), body, false))
        };
        let anchor = b.id("$$renderer");
        let call = slot_call(
            b,
            anchor,
            name,
            properties,
            spreads,
            fallback,
            Target::Server,
        );
        template.push(Piece::Text(BLOCK_OPEN.into()));
        template.push(Piece::Statement(b.statement(call)));
        template.push(Piece::Text(BLOCK_CLOSE.into()));
        Ok(())
    }
}
