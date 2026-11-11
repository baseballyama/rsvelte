use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::Statement;
use rsvelte_svelte_semantic::compiler_syntax_tree::Snippet;

use super::{
    BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE, Element, NodeKind, Piece, R, ServerCompilationContext,
};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// The child `{#snippet name()}` of `element`.
    fn child_snippet(&self, element: &Element, name: &str) -> Option<&'o Snippet> {
        let tree = self.compiler_syntax_tree;
        tree.children(element.children)
            .iter()
            .find_map(|&identifier| match &tree.node(identifier).kind {
                NodeKind::Snippet(snippet) if self.snippet_name(snippet) == name => Some(snippet),
                _ => None,
            })
    }

    pub(super) fn boundary(&mut self, element: &Element, template: &mut Vec<Piece<'o>>) -> R<()> {
        let b = self.b;
        let tree = self.compiler_syntax_tree;
        let failed_snippet = self.child_snippet(element, "failed");
        let attributes = tree.attributes(element.attributes);
        let failed_attribute = attributes
            .iter()
            .find(|a| a.name.text(self.source_text) == "failed");
        let body = self.boundary_children(element)?;
        let mut declarations = Vec::new();
        let failed = if let Some(snippet) = failed_snippet {
            declarations.push(self.snippet_declaration(snippet)?);
            Some(b.id(self.snippet_name(snippet)))
        } else if let Some(attribute) = failed_attribute {
            let expression = super::super::template::single_expression(&attribute.value)
                .expect("a validated boundary attribute");
            Some(self.expression(expression))
        } else {
            None
        };
        if let Some(failed) = failed {
            let props = b.object([b.init("failed", failed)]);
            let callback = b.arrow_block(b.parameters(["$$renderer"]), body, false);
            let call = b.call(b.member(b.id("$$renderer"), "boundary"), [props, callback]);
            let statement = b.statement(call);
            let statement = if declarations.is_empty() {
                statement
            } else {
                declarations.push(statement);
                b.block(declarations)
            };
            template.push(Piece::Statement(statement));
        } else {
            template.extend(body.into_iter().map(Piece::Statement));
        }
        Ok(())
    }

    fn boundary_children(&mut self, element: &Element) -> R<Vec<Statement<'o>>> {
        let b = self.b;
        let tree = self.compiler_syntax_tree;
        let attributes = tree.attributes(element.attributes);
        let pending_snippet = self.child_snippet(element, "pending");
        let children = self.fragment_without(element.children, |name| {
            matches!(name, "failed" | "pending")
        })?;
        let normal = vec![
            Piece::Text(BLOCK_OPEN.into()),
            Piece::Statement(b.block(children)),
            Piece::Text(BLOCK_CLOSE.into()),
        ];
        let pending_attribute = attributes
            .iter()
            .find(|a| a.name.text(self.source_text) == "pending");
        if let Some(attribute) = pending_attribute {
            let expression = super::super::template::single_expression(&attribute.value)
                .expect("a validated boundary attribute");
            let callee = self.expression(expression);
            // The callee is both the test and the call when the pending value may be absent.
            let call = b.call(callee.clone_in(b.allocator()), [b.id("$$renderer")]);
            let pending = self.build_template(vec![
                Piece::Text(BLOCK_OPEN_ELSE.into()),
                Piece::Statement(b.statement(call)),
                Piece::Text(BLOCK_CLOSE.into()),
            ]);
            if self.evaluate(expression).is_defined || pending_snippet.is_some() {
                return Ok(pending);
            }
            let normal = self.build_template(normal);
            return Ok(vec![b.if_(callee, b.block(pending), Some(b.block(normal)))]);
        }
        if let Some(snippet) = pending_snippet {
            let body = self.fragment(snippet.body)?;
            return Ok(self.build_template(vec![
                Piece::Text(BLOCK_OPEN_ELSE.into()),
                Piece::Statement(b.block(body)),
                Piece::Text(BLOCK_CLOSE.into()),
            ]));
        }
        Ok(self.build_template(normal))
    }
}
