use rsvelte_svelte::compilation::compiler_syntax_tree::Snippet;

use super::{
    BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE, Element, NodeIdentifier, NodeKind, Piece, R,
    ServerCompilationContext, SourceLocation, init_property,
};

impl ServerCompilationContext<'_> {
    pub(super) fn boundary(&mut self, element: &Element, template: &mut Vec<Piece>) -> R<()> {
        let tree = self.compiler_syntax_tree;
        let failed_snippet = tree
            .children(element.children)
            .iter()
            .find_map(|&identifier| {
                let NodeKind::Snippet(snippet) = &tree.node(identifier).kind else {
                    return None;
                };
                (self.javascript.name(snippet.name) == "failed").then_some(snippet)
            });
        let attributes = tree.attributes(element.attributes);
        let failed_attribute = attributes
            .iter()
            .find(|a| a.name.text(self.source_text) == "failed");
        let body = self.boundary_children(element)?;
        let mut declarations = Vec::new();
        let failed = if let Some(snippet) = failed_snippet {
            declarations.push(self.boundary_snippet(snippet)?);
            Some(self.out.identifier(self.javascript.name(snippet.name)))
        } else if let Some(attribute) = failed_attribute {
            let expression = super::super::template::single_expression(&attribute.value)
                .expect("a validated boundary attribute");
            Some(self.expression(expression))
        } else {
            None
        };
        if let Some(failed) = failed {
            let property = init_property(&mut self.out, "failed", failed);
            let props = self.out.object(&[property], SourceLocation::SYNTHETIC);
            let block = self.out.block(&body, SourceLocation::SYNTHETIC);
            let renderer = self.out.identifier("$$renderer");
            let callback =
                self.out
                    .arrow(&[renderer], block, false, false, SourceLocation::SYNTHETIC);
            let call = self
                .out
                .runtime("$$renderer", "boundary", &[props, callback]);
            let statement = self.out.expression_statement(call);
            let statement = if declarations.is_empty() {
                statement
            } else {
                declarations.push(statement);
                self.out.block(&declarations, SourceLocation::SYNTHETIC)
            };
            template.push(Piece::Statement(statement));
        } else {
            template.extend(body.into_iter().map(Piece::Statement));
        }
        Ok(())
    }

    fn boundary_children(&mut self, element: &Element) -> R<Vec<NodeIdentifier>> {
        let tree = self.compiler_syntax_tree;
        let attributes = tree.attributes(element.attributes);
        let pending_snippet = tree
            .children(element.children)
            .iter()
            .find_map(|&identifier| {
                let NodeKind::Snippet(snippet) = &tree.node(identifier).kind else {
                    return None;
                };
                (self.javascript.name(snippet.name) == "pending").then_some(snippet)
            });
        let children = self.fragment_with_snippets(element.children, false)?;
        let children = self.out.block(&children, SourceLocation::SYNTHETIC);
        let normal = vec![
            Piece::Text(BLOCK_OPEN.into()),
            Piece::Statement(children),
            Piece::Text(BLOCK_CLOSE.into()),
        ];
        let pending_attribute = attributes
            .iter()
            .find(|a| a.name.text(self.source_text) == "pending");
        if let Some(attribute) = pending_attribute {
            let expression = super::super::template::single_expression(&attribute.value)
                .expect("a validated boundary attribute");
            let callee = self.expression(expression);
            let renderer = self.out.identifier("$$renderer");
            let call = self.out.call0(callee, &[renderer]);
            let statement = self.out.expression_statement(call);
            let pending = self.build_template(vec![
                Piece::Text(BLOCK_OPEN_ELSE.into()),
                Piece::Statement(statement),
                Piece::Text(BLOCK_CLOSE.into()),
            ]);
            if self
                .res
                .evaluate(self.javascript, self.source_text, expression)
                .is_defined
                || pending_snippet.is_some()
            {
                return Ok(pending);
            }
            let pending = self.out.block(&pending, SourceLocation::SYNTHETIC);
            let normal = self.build_template(normal);
            let normal = self.out.block(&normal, SourceLocation::SYNTHETIC);
            let condition = self
                .out
                .if_(callee, pending, Some(normal), SourceLocation::SYNTHETIC);
            return Ok(vec![condition]);
        }
        if let Some(snippet) = pending_snippet {
            let body = self.fragment(snippet.body)?;
            let body = self.out.block(&body, SourceLocation::SYNTHETIC);
            return Ok(self.build_template(vec![
                Piece::Text(BLOCK_OPEN_ELSE.into()),
                Piece::Statement(body),
                Piece::Text(BLOCK_CLOSE.into()),
            ]));
        }
        Ok(self.build_template(normal))
    }

    fn boundary_snippet(&mut self, snippet: &Snippet) -> R<NodeIdentifier> {
        let body = self.fragment(snippet.body)?;
        let block = self.out.block(&body, SourceLocation::SYNTHETIC);
        let mut parameters = vec![self.out.identifier("$$renderer")];
        for &parameter in self
            .compiler_syntax_tree
            .javascript_list(snippet.parameters)
        {
            parameters.push(self.expression(parameter));
        }
        let name = self.out.identifier(self.javascript.name(snippet.name));
        Ok(self.out.function(
            true,
            Some(name),
            &parameters,
            block,
            false,
            SourceLocation::SYNTHETIC,
        ))
    }
}
