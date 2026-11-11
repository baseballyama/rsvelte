use oxc_ast::ast::{Argument, Expression, LogicalOperator, Statement};
use rsvelte_vue_semantic::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind};
use rsvelte_vue_syntax::syntax_tree::{DirectiveExpression, DirectiveName};

use super::{Body, Emitter};
use crate::compilation::asynchronous::has_await;

impl<'o> Emitter<'_, 'o> {
    /// `function $$snippet_N(parameters) { …; return nodes; }`.
    pub(super) fn snippet_declaration(
        &mut self,
        identifier: CompilerNodeIdentifier,
        server: bool,
    ) -> Statement<'o> {
        let b = self.b;
        let NodeKind::Element(element) = &self.tree.node(identifier).kind else {
            unreachable!("a snippet is an element")
        };
        let DirectiveExpression::For(scope) = &self
            .structural(identifier, DirectiveName::For)
            .expect("a snippet has parameters")
            .exp
        else {
            unreachable!("a snippet's parameters are a loop's")
        };
        let Expression::Identifier(name) =
            self.source(self.bound(identifier, None).expect("a snippet has a name"))
        else {
            unreachable!("a snippet's name is an identifier")
        };
        let parameters = self.res.tree().get_parameters(scope.parameters);
        let mut body = Body::default();
        let (parameters, added) = if server {
            let items: Vec<_> = parameters
                .items
                .iter()
                .map(|p| {
                    let mut p = oxc_allocator::CloneIn::clone_in_with_semantic_ids(
                        p,
                        oxc_allocator::GetAllocator::allocator(b),
                    );
                    self.rewrite_parameter(&mut p);
                    p
                })
                .collect();
            (b.formal_parameters(items), Vec::new())
        } else {
            self.scope_parameters(parameters, &mut body, true)
        };
        let children = self.tree.children(element.children);
        let result = if server {
            self.server_list(children)
        } else {
            let nodes = self.list(children, &mut body);
            b.array(nodes)
        };
        for symbol in added {
            self.cells.remove(&symbol);
        }
        let mut statements = body.finish(b);
        statements.push(b.return_(Some(result)));
        b.function_declaration(&name.name, parameters, statements, false)
    }

    /// `{@render f(…)}`: a fragment keyed by the snippet, its arguments as cells.
    pub(super) fn render_snippet(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Body<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        let expression = self.source(self.bound(identifier, None).expect("a render has a call"));
        // `f?.()` calls as `f()` does: the fragment renders nothing while `f` is nullish.
        let call = match expression.get_inner_expression() {
            Expression::CallExpression(call) => call,
            Expression::ChainExpression(chain) => match &chain.expression {
                oxc_ast::ast::ChainElement::CallExpression(call) => call,
                _ => unreachable!("a render tag holds a call"),
            },
            _ => unreachable!("a render tag holds a call"),
        };
        let mut ready = Vec::new();
        let callee = self.snippet_argument(&call.callee, body, &mut ready);
        let arguments: Vec<_> = call
            .arguments
            .iter()
            .map(|argument| {
                let Argument::SpreadElement(_) = argument else {
                    let value = self.snippet_argument(argument.to_expression(), body, &mut ready);
                    return self.call("computed", [self.arrow(value)]);
                };
                unreachable!("the translation refused spread render arguments")
            })
            .collect();
        let key = self.arrow(self.copy_output(&callee));
        let invoked = b.call(self.copy_output(&callee), arguments);
        let result =
            Expression::new_conditional_expression(oxc_span::SPAN, callee, invoked, b.array([]), b);
        let render = self.arrow(result);
        let mut fragment = self.keyed_fragment(key, render);
        if let Some(test) = ready
            .into_iter()
            .reduce(|test, condition| b.logical(test, LogicalOperator::And, condition))
        {
            fragment = self.call("createIf", [self.arrow(test), self.arrow(fragment)]);
        }
        b.id(&self.declare(fragment, body))
    }

    fn snippet_argument(
        &mut self,
        source: &Expression<'_>,
        body: &mut Body<'o>,
        ready: &mut Vec<Expression<'o>>,
    ) -> Expression<'o> {
        let value = self.render_expression(source, body);
        if has_await(source) {
            ready.push(self.ready(&value));
        }
        value
    }

    /// Another copy of an expression built here.
    pub(super) fn copy_output(&self, e: &Expression<'o>) -> Expression<'o> {
        oxc_allocator::CloneIn::clone_in(e, oxc_allocator::GetAllocator::allocator(self.b))
    }
}
