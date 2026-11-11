//! svelte2tsx's `{#key}`, `{#snippet}`, `{@render}` and `{@debug}`.

use oxc_span::GetSpan;
use rsvelte_svelte_syntax::syntax_tree::TemplateNode;

use super::{Builder, Node, Result, SourceExpression, source_expression};

impl Builder<'_> {
    /// `{#key}`, `{#snippet}`, `{@render}` and `{@debug}`, as svelte2tsx writes them.
    pub(super) fn tag(&mut self, identifier: u32) -> Result<Node> {
        Ok(match *self.component.node(identifier) {
            TemplateNode::Key {
                expression, body, ..
            } => {
                let start = self.scratch.len();
                let value = source_expression(self.expression(expression).span(), None);
                self.scratch.push(self.tree.push(Node::Expression(value)));
                self.append_children(body)?;
                let body = self.finish_list(start);
                Node::Block { body }
            }
            TemplateNode::Render { expression, .. } => {
                let callee = self.tree.push(Node::Identifier("__rsvelte_ensure_snippet"));
                let value = self.expression_source(expression, None);
                let arguments = self.tree.list(&[value]);
                let call = self.tree.push(Node::Call { callee, arguments });
                Node::Statement(call)
            }
            TemplateNode::Debug { identifiers, .. } => {
                let start = self.scratch.len();
                for &identifier in self.component.debug_identifiers(identifiers) {
                    let value = source_expression(self.expression(identifier).span(), None);
                    self.scratch.push(self.tree.push(Node::Expression(value)));
                }
                let body = self.finish_list(start);
                Node::Block { body }
            }
            TemplateNode::Snippet {
                name,
                type_parameters,
                parameters,
                body,
                ..
            } => {
                let javascript = &self.component.javascript;
                let name = javascript.get_expression(name).span();
                let parameters = parameters.map(|p| javascript.get_parameters(p).span);
                let name = self.source(name, None);
                let type_parameters = type_parameters.map(|span| {
                    self.tree.push(Node::Source(SourceExpression {
                        span,
                        end: span.end_offset,
                    }))
                });
                let parameters = parameters.map(|at| self.source(at, None));
                let body = self.children(body)?;
                Node::Snippet {
                    name,
                    type_parameters,
                    parameters,
                    body,
                }
            }
            _ => unreachable!("only tags reach here"),
        })
    }
}
