use rsvelte_svelte_semantic::compiler_syntax_tree::MetadataTag;

use super::{
    AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, ElementKind, Frag, Lists,
    NodeKind, R, event_attribute, unsupported,
};
use crate::lower::builder::Runtime;

impl<'o> ClientCompilationContext<'_, 'o> {
    pub(super) fn hoisted_elements(
        &mut self,
        identifiers: &[CompilerNodeIdentifier],
        frag: &mut Frag<'o>,
        lists: &mut Lists<'o>,
    ) -> R<()> {
        for &identifier in identifiers {
            self.hoisted_element(identifier, frag, lists)?;
        }
        Ok(())
    }

    /// A node `clean_nodes` hoists: a snippet, or a special element with no place in the markup.
    pub(super) fn hoisted_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        frag: &mut Frag<'o>,
        lists: &mut Lists<'o>,
    ) -> R<()> {
        match self.compiler_syntax_tree.node(identifier).kind {
            NodeKind::Snippet(_) => return self.snippet(identifier),
            NodeKind::Const { .. } => {
                self.const_tag(identifier, lists);
                return Ok(());
            }
            _ => {}
        }
        self.special_element(identifier, "", frag, lists)
    }

    pub(super) fn special_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag<'o>,
        lists: &mut Lists<'o>,
    ) -> R<()> {
        let b = self.b;
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("special elements are elements")
        };
        match element.kind {
            ElementKind::Metadata(Some(MetadataTag::Head)) => {
                let body = self.fragment(element.children)?;
                let callback = b.arrow_block(b.params(["$$anchor"]), body, false);
                let hash = b.string(
                    self.identity
                        .head_hash
                        .as_deref()
                        .expect("a head has an identity"),
                );
                lists
                    .initializer
                    .push(b.stmt(b.runtime("head", [hash, callback])));
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
                        let call = self.event_directive(attribute, target, true, lists);
                        lists.initializer.push(self.b.stmt(call));
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
            ElementKind::Component
            | ElementKind::Metadata(Some(MetadataTag::Component | MetadataTag::SelfRef)) => {
                return self.component(identifier, node, false, frag, lists);
            }
            ElementKind::Metadata(Some(MetadataTag::Options)) => {}
            ElementKind::Slot => return self.slot_element(identifier, node, frag, lists),
            _ => return unsupported("this special element", element.name),
        }
        Ok(())
    }
}
