use rsvelte_svelte_semantic::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind};

use super::template::Template;
use super::{R, ServerCompilationContext};
use crate::lower::attributes::DynamicTag;
use crate::lower::builder::Runtime;

impl<'o> ServerCompilationContext<'_, 'o> {
    pub(super) fn dynamic_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Template<'_, 'o>,
    ) -> R<()> {
        let b = self.b;
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("an element")
        };
        let attributes = tree.attributes(element.attributes);
        let tag = &tree.attributes[element.this.expect("dynamic tag is validated")];
        let tag = match crate::lower::attributes::dynamic_tag(&tag.value) {
            DynamicTag::Text(tag) => b.string(&tag),
            DynamicTag::Expression(e) => self.expression(e),
        };
        let mut pieces = Template::new(b);
        self.element_attributes(identifier, "svelte:element", attributes, &mut pieces);
        let statements = pieces.finish();
        let attributes =
            (!statements.is_empty()).then(|| b.arrow_block(b.parameters([]), statements, false));
        let statements = self.fragment(element.children)?;
        let children =
            (!statements.is_empty()).then(|| b.arrow_block(b.parameters([]), statements, false));
        let call = b.runtime_some(
            "element",
            vec![Some(b.id("$$renderer")), Some(tag), attributes, children],
        );
        template.statement(b.statement(call));
        Ok(())
    }
}
