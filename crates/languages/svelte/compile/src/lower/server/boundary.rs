use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::Statement;
use rsvelte_svelte_semantic::compiler_syntax_tree::Snippet;

use super::{
    BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE, Element, NodeKind, R, ServerCompilationContext,
    Template,
};
use crate::lower::Builder;

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

    pub(super) fn boundary(&mut self, element: &Element, template: &mut Template<'_, 'o>) -> R<()> {
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
            let expression = crate::lower::attributes::single_expression(&attribute.value)
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
            template.statement(statement);
        } else {
            template.statements(body);
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
        let normal = |b| marked(b, BLOCK_OPEN, b.block(children));
        let pending_attribute = attributes
            .iter()
            .find(|a| a.name.text(self.source_text) == "pending");
        if let Some(attribute) = pending_attribute {
            let expression = crate::lower::attributes::single_expression(&attribute.value)
                .expect("a validated boundary attribute");
            let callee = self.expression(expression);
            // The callee is both the test and the call when the pending value may be absent.
            let call = b.call(callee.clone_in(b.allocator()), [b.id("$$renderer")]);
            let pending = marked(b, BLOCK_OPEN_ELSE, b.statement(call));
            if self.evaluate(expression).is_defined || pending_snippet.is_some() {
                return Ok(pending);
            }
            return Ok(vec![b.if_(
                callee,
                b.block(pending),
                Some(b.block(normal(b))),
            )]);
        }
        if let Some(snippet) = pending_snippet {
            let body = self.fragment(snippet.body)?;
            return Ok(marked(b, BLOCK_OPEN_ELSE, b.block(body)));
        }
        Ok(normal(b))
    }
}

/// `statement` between `open` and the block's close.
fn marked<'o>(b: &Builder<'o>, open: &str, statement: Statement<'o>) -> Vec<Statement<'o>> {
    let mut template = Template::new(b);
    template.text(open);
    template.statement(statement);
    template.text(BLOCK_CLOSE);
    template.finish()
}
