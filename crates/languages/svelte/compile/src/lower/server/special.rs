use rsvelte_svelte::compilation::compiler_syntax_tree::MetadataTag;

use super::{
    CompilerNodeIdentifier, ElementKind, NodeKind, Piece, R, ServerCompilationContext,
    SourceLocation, unsupported,
};

impl ServerCompilationContext<'_> {
    pub(super) fn hoisted_elements(
        &mut self,
        identifiers: &[CompilerNodeIdentifier],
        template: &mut Vec<Piece>,
    ) -> R<()> {
        for &identifier in identifiers {
            self.special_element(identifier, template)?;
        }
        Ok(())
    }

    pub(super) fn special_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("special elements are elements")
        };
        match element.kind {
            ElementKind::Metadata(Some(MetadataTag::Head)) => {
                let body = self.fragment(element.children)?;
                let block = self.out.block(&body, SourceLocation::SYNTHETIC);
                let renderer = self.out.identifier("$$renderer");
                let callback =
                    self.out
                        .arrow(&[renderer], block, false, false, SourceLocation::SYNTHETIC);
                let hash = self.out.write_string(
                    self.identity
                        .head_hash
                        .as_deref()
                        .expect("a head has an identity"),
                );
                let call = self.out.runtime("$", "head", &[hash, renderer, callback]);
                template.push(Piece::Statement(self.out.expression_statement(call)));
            }
            ElementKind::Title => {
                let mut pieces = vec![Piece::Text("<title>".into())];
                self.process_children(&self.plan.fragment(element.children).items, &mut pieces)?;
                pieces.push(Piece::Text("</title>".into()));
                let body = self.build_template(pieces);
                let block = self.out.block(&body, SourceLocation::SYNTHETIC);
                let renderer = self.out.identifier("$$renderer");
                let callback =
                    self.out
                        .arrow(&[renderer], block, false, false, SourceLocation::SYNTHETIC);
                let call = self.out.runtime("$$renderer", "title", &[callback]);
                template.push(Piece::Statement(self.out.expression_statement(call)));
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
            _ => return unsupported("this special element", element.name),
        }
        Ok(())
    }
}
