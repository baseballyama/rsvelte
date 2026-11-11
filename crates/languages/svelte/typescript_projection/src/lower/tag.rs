//! svelte2tsx's `{#key}`, `{#snippet}`, `{@render}` and `{@debug}`.

use oxc_span::GetSpan;
use rsvelte_svelte_syntax::syntax_tree::{Range, TemplateNode};
use rsvelte_typescript_tree::{ExpressionIdentifier, PatternIdentifier};

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
            TemplateNode::Await {
                expression,
                value,
                error,
                pending,
                then,
                catch,
                ..
            } => self.await_block(expression, value, error, [pending, then, catch])?,
            _ => unreachable!("only tags reach here"),
        })
    }

    /// svelte2tsx's `handleAwait`: the pending branch, then the awaited value in a `try` when
    /// there is a `catch`.
    fn await_block(
        &mut self,
        expression: ExpressionIdentifier,
        value: Option<PatternIdentifier>,
        error: Option<PatternIdentifier>,
        [pending, then, catch]: [Range; 3],
    ) -> Result<Node> {
        let start = self.scratch.len();
        if let Some(pending) = pending.present() {
            self.append_children(pending)?;
        }
        let try_start = self.scratch.len();
        let awaited = self.expression_source(expression, None);
        let awaited = self.tree.push(Node::Await(awaited));
        let then = then.present();
        if let Some(value) = value {
            let name = self.tree.push(Node::Identifier("__rsvelte_awaited"));
            self.scratch.push(self.tree.push(Node::Const {
                name,
                value: awaited,
            }));
            let block = self.scratch.len();
            let pattern = self.component.javascript.get_pattern(value).span;
            let pattern = self.source(pattern, None);
            self.scratch.push(self.tree.push(Node::Const {
                name: pattern,
                value: name,
            }));
            if let Some(then) = then {
                self.append_children(then)?;
            }
            let body = self.finish_list(block);
            self.scratch.push(self.tree.push(Node::Block { body }));
        } else {
            self.scratch.push(self.tree.push(Node::Statement(awaited)));
            if let Some(then) = then {
                self.append_children(then)?;
            }
        }
        let catch = catch.present();
        if error.is_some() || catch.is_some() {
            let body = self.finish_list(try_start);
            let handler = self.scratch.len();
            if let Some(error) = error {
                let pattern = self.component.javascript.get_pattern(error).span;
                let name = self.source(pattern, None);
                let value = self.tree.push(Node::Identifier("__rsvelte_untyped_prop()"));
                self.scratch
                    .push(self.tree.push(Node::Const { name, value }));
            }
            if let Some(catch) = catch {
                self.append_children(catch)?;
            }
            let catch = self.finish_list(handler);
            self.scratch.push(self.tree.push(Node::Try { body, catch }));
        }
        Ok(Node::Block {
            body: self.finish_list(start),
        })
    }
}
