use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::Expression;
use rsvelte_vue_semantic::compiler_syntax_tree::CompilerNodeIdentifier;
use rsvelte_vue_syntax::syntax_tree::{DirectiveExpression, DirectiveName};

use super::{Body, Emitter};
use crate::compilation::asynchronous::has_await;
use crate::helpers::Helper;

impl<'o> Emitter<'_, 'o> {
    pub(super) fn client_setup(&mut self, body: &mut Body<'o>) -> Expression<'o> {
        let b = self.b;
        let root = self.tree.root();
        if !self.t.template.helpers.contains(&Helper::Transition) {
            let nodes = self.list(root, body);
            return b.array(nodes);
        }
        self.helpers
            .extend(["VaporFragment", "remove", "queuePostFlushCb"]);
        let mut template = Body::default();
        let nodes = self.list(root, &mut template);
        let render = self.render_block(template, b.array(nodes), b.params([]));
        b.call(self.transition_branch(render), [])
    }

    /// `(parameters) => { body; return result; }`.
    pub(super) fn render_block(
        &self,
        body: Body<'o>,
        result: Expression<'o>,
        parameters: oxc_allocator::Box<'o, oxc_ast::ast::FormalParameters<'o>>,
    ) -> Expression<'o> {
        let b = self.b;
        let mut statements = body.finish(b);
        statements.push(b.return_(Some(result)));
        b.arrow_block(parameters, statements, false)
    }

    pub(super) fn list(
        &mut self,
        nodes: &[CompilerNodeIdentifier],
        body: &mut Body<'o>,
    ) -> Vec<Expression<'o>> {
        let mut result = Vec::with_capacity(nodes.len());
        let mut i = 0;
        while i < nodes.len() {
            if self.structural(nodes[i], DirectiveName::If).is_some() {
                let start = i;
                i += 1;
                while i < nodes.len()
                    && (self.structural(nodes[i], DirectiveName::ElseIf).is_some()
                        || self.structural(nodes[i], DirectiveName::Else).is_some())
                {
                    i += 1;
                }
                let branch = self.if_chain(&nodes[start..i]);
                result.push(self.b.id(&self.declare(branch, body)));
            } else {
                result.push(self.loop_or_node(nodes[i], body));
                i += 1;
            }
        }
        result
    }

    fn if_chain(&mut self, branches: &[CompilerNodeIdentifier]) -> Expression<'o> {
        let b = self.b;
        let first = branches[0];
        let test = [DirectiveName::If, DirectiveName::ElseIf]
            .into_iter()
            .find_map(|name| self.structural(first, name))
            .and_then(|d| match d.exp {
                DirectiveExpression::Expression(e) => Some(e),
                _ => None,
            });
        let mut body = Body::default();
        let node = self.loop_or_node(first, &mut body);
        let branch = self.render_block(body, node, b.params([]));
        let branch = self.transition_branch(branch);
        let Some(test) = test else { return branch };
        let test = self.source(test);
        let mut arguments = Vec::with_capacity(3);
        arguments.push(branch);
        if branches.len() > 1 {
            let otherwise = self.if_chain(&branches[1..]);
            arguments.push(
                if self.structural(branches[1], DirectiveName::Else).is_some() {
                    otherwise
                } else {
                    self.arrow(otherwise)
                },
            );
        }
        if has_await(test) {
            return self.async_if(test, arguments);
        }
        let test = self.expression(test);
        arguments.insert(0, self.arrow(test));
        self.call("createIf", arguments)
    }

    fn loop_or_node(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Body<'o>,
    ) -> Expression<'o> {
        let special = matches!(self.tag(identifier), "$$Await" | "$$Snippet" | "$$Scope");
        if special || self.structural(identifier, DirectiveName::For).is_none() {
            return self.node(identifier, body);
        }
        self.each(identifier, body)
    }

    fn each(&mut self, identifier: CompilerNodeIdentifier, body: &mut Body<'o>) -> Expression<'o> {
        let b = self.b;
        let DirectiveExpression::For(loop_) = &self
            .structural(identifier, DirectiveName::For)
            .expect("a loop directive")
            .exp
        else {
            unreachable!("a translated loop has aliases and a source")
        };
        let parameters = self.res.tree().get_parameters(loop_.parameters);
        let source = self.render_expression(self.source(loop_.source), body);
        let source = self.arrow(source);
        let key = self.bound(identifier, Some("$$key")).map(|key| {
            let key = self.expression(self.source(key));
            b.arrow(b.alloc(parameters.clone_in(b.allocator())), key)
        });
        let mut item = Body::default();
        let (output, added) = self.scope_parameters(parameters, &mut item, false);
        let node = self.node(identifier, &mut item);
        for symbol in added {
            self.cells.remove(&symbol);
        }
        let render = self.render_block(item, node, output);
        let render = self.transition_branch(render);
        let mut arguments = vec![source, render];
        arguments.extend(key);
        let call = if self.t.template.animation_loops.contains(&identifier) {
            self.helpers.insert("createFor");
            b.call(b.id("$$animated_for"), arguments)
        } else {
            self.call("createFor", arguments)
        };
        b.id(&self.declare(call, body))
    }
}
