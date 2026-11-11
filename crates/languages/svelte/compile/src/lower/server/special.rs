use rsvelte_svelte_semantic::compiler_syntax_tree::MetadataTag;

use super::{
    CompilerNodeIdentifier, ElementKind, NodeKind, Piece, R, ServerCompilationContext, unsupported,
};

impl<'o> ServerCompilationContext<'_, 'o> {
    pub(super) fn hoisted_elements(
        &mut self,
        identifiers: &[CompilerNodeIdentifier],
        template: &mut Vec<Piece<'o>>,
    ) -> R<()> {
        for &identifier in identifiers {
            if let NodeKind::Snippet(_) = self.compiler_syntax_tree.node(identifier).kind {
                self.snippet(identifier)?;
            } else {
                self.special_element(identifier, template)?;
            }
        }
        Ok(())
    }

    pub(super) fn special_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece<'o>>,
    ) -> R<()> {
        let b = self.b;
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("special elements are elements")
        };
        match element.kind {
            ElementKind::Metadata(Some(MetadataTag::Head)) => {
                let body = self.fragment(element.children)?;
                let callback = b.arrow_block(b.params(["$$renderer"]), body, false);
                let hash = b.string(
                    self.identity
                        .head_hash
                        .as_deref()
                        .expect("a head has an identity"),
                );
                let call = b.runtime("head", [hash, b.id("$$renderer"), callback]);
                template.push(Piece::Statement(b.stmt(call)));
            }
            ElementKind::Title => {
                let plan = self.plan;
                let mut pieces = vec![Piece::Text("<title>".into())];
                self.process_children(&plan.fragment(element.children).items, &mut pieces)?;
                pieces.push(Piece::Text("</title>".into()));
                let body = self.build_template(pieces);
                let callback = b.arrow_block(b.params(["$$renderer"]), body, false);
                let call = b.call(b.member(b.id("$$renderer"), "title"), [callback]);
                template.push(Piece::Statement(b.stmt(call)));
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
            ElementKind::Metadata(Some(MetadataTag::Element)) => {
                return self.dynamic_element(identifier, template);
            }
            ElementKind::Component => return self.component(identifier, false, template),
            _ => return unsupported("this special element", element.name),
        }
        Ok(())
    }
}
