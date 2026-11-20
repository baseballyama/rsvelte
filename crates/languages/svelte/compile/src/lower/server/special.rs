use rsvelte_svelte_semantic::compiler_syntax_tree::{
    CompilerNodeIdentifier, ElementKind, MetadataTag, NodeKind,
};

use super::template::Template;
use super::{R, ServerCompilationContext};
use crate::lower::builder::Runtime;
use crate::lower::unsupported;

impl<'o> ServerCompilationContext<'_, 'o> {
    /// The snippets and special elements of a fragment, but the snippets named so that `skipped`
    /// holds.
    pub(super) fn hoisted_elements(
        &mut self,
        identifiers: &[CompilerNodeIdentifier],
        skipped: fn(&str) -> bool,
        template: &mut Template<'_, 'o>,
    ) -> R<()> {
        for &identifier in identifiers {
            match &self.compiler_syntax_tree.node(identifier).kind {
                NodeKind::Snippet(snippet) if skipped(self.snippet_name(snippet)) => {}
                NodeKind::Snippet(_) => self.snippet(identifier)?,
                NodeKind::Const { .. } => self.const_tag(identifier),
                &NodeKind::Declaration { declaration } => {
                    let lowered = self.declaration_tag(declaration);
                    self.snippets.extend(lowered);
                }
                &NodeKind::Debug { identifiers } => {
                    let (b, tree) = (self.b, self.compiler_syntax_tree);
                    let body = crate::lower::debug_tag::debug_tag(
                        b,
                        tree,
                        self.javascript,
                        identifiers,
                        |e| self.expression(e),
                    );
                    template.statements(body);
                }
                _ => self.special_element(identifier, template)?,
            }
        }
        Ok(())
    }

    pub(super) fn special_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Template<'_, 'o>,
    ) -> R<()> {
        let b = self.b;
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("special elements are elements")
        };
        match element.kind {
            ElementKind::Metadata(Some(MetadataTag::Head)) => {
                let body = self.fragment(element.children)?;
                let callback = b.arrow_block(b.parameters(["$$renderer"]), body, false);
                let hash = b.string(
                    self.identity
                        .head_hash
                        .as_deref()
                        .expect("a head has an identity"),
                );
                let call = b.runtime("head", [hash, b.id("$$renderer"), callback]);
                template.statement(b.statement(call));
            }
            ElementKind::Title => {
                let plan = self.plan;
                let mut title = Template::new(b);
                title.text("<title>");
                self.process_children(&plan.fragment(element.children).items, &mut title)?;
                title.text("</title>");
                let body = title.finish();
                let callback = b.arrow_block(b.parameters(["$$renderer"]), body, false);
                let call = b.call(b.member(b.id("$$renderer"), "title"), [callback]);
                // Upstream puts it in `state.init`, which comes before the template.
                self.snippets.push(b.statement(call));
            }
            ElementKind::Metadata(Some(
                MetadataTag::Window
                | MetadataTag::Document
                | MetadataTag::Body
                | MetadataTag::Options,
            )) => {}
            ElementKind::Metadata(Some(MetadataTag::Boundary)) => {
                self.boundary(element, template)?;
            }
            ElementKind::Metadata(Some(MetadataTag::Fragment)) => {
                let body = self.fragment(element.children)?;
                template.statement(b.block(body));
            }
            ElementKind::Metadata(Some(MetadataTag::Element)) => {
                return self.dynamic_element(identifier, template);
            }
            ElementKind::Component
            | ElementKind::Metadata(Some(MetadataTag::Component | MetadataTag::SelfRef)) => {
                return self.component(identifier, false, template);
            }
            ElementKind::Slot => return self.slot_element(identifier, template),
            _ => return unsupported("this special element", element.name),
        }
        Ok(())
    }
}
