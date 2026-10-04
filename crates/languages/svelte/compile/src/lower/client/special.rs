use rsvelte_svelte::compilation::compiler_syntax_tree::MetadataTag;

use super::{
    AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, ElementKind, Frag, Lists,
    NodeKind, R, SourceLocation, event_attribute, unsupported,
};

impl ClientCompilationContext<'_> {
    pub(super) fn hoisted_elements(
        &mut self,
        identifiers: &[CompilerNodeIdentifier],
        frag: &mut Frag,
        lists: &mut Lists,
    ) -> R<()> {
        for &identifier in identifiers {
            self.special_element(identifier, "", frag, lists)?;
        }
        Ok(())
    }

    pub(super) fn special_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag,
        lists: &mut Lists,
    ) -> R<()> {
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("special elements are elements")
        };
        match element.kind {
            ElementKind::Metadata(Some(MetadataTag::Head)) => {
                let body = self.fragment(element.children)?;
                let block = self.out.block(&body, SourceLocation::SYNTHETIC);
                let anchor = self.out.identifier("$$anchor");
                let callback =
                    self.out
                        .arrow(&[anchor], block, false, false, SourceLocation::SYNTHETIC);
                let hash = self.out.write_string(
                    self.identity
                        .head_hash
                        .as_deref()
                        .expect("a head has an identity"),
                );
                let call = self.call("head", vec![Some(hash), Some(callback)]);
                lists.initializer.push(self.statement(call));
            }
            ElementKind::Title => self.title(element.children, lists),
            ElementKind::Metadata(Some(
                tag @ (MetadataTag::Window | MetadataTag::Document | MetadataTag::Body),
            )) => {
                let target = match tag {
                    MetadataTag::Window => "$.window",
                    MetadataTag::Document => "$.document",
                    _ => "$.document.body",
                };
                for attribute in tree.attributes(element.attributes) {
                    if matches!(attribute.value, AttributeValue::On { .. }) {
                        self.event_directive(attribute, target, true, lists);
                    } else if let Some(handler) = event_attribute(self.source_text, attribute) {
                        self.event_on(
                            attribute.name.text(self.source_text),
                            handler,
                            target,
                            false,
                            lists,
                        );
                    } else if matches!(attribute.value, AttributeValue::Bind(_)) {
                        self.global_binding(attribute, tag, lists);
                    }
                }
            }
            ElementKind::Metadata(Some(MetadataTag::Boundary)) => {
                return self.boundary(identifier, node, frag, lists);
            }
            ElementKind::Metadata(Some(MetadataTag::Element)) => {
                return self.dynamic_element(identifier, node, frag, lists);
            }
            ElementKind::Metadata(Some(MetadataTag::Options)) => {}
            _ => return unsupported("this special element", element.name),
        }
        Ok(())
    }
}
