use rsvelte_vue::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind};
use rsvelte_vue::syntax_tree::{DirectiveExpression, DirectiveName};

use super::{Builder, Kind, NodeIdentifier, SYNTHETIC};

impl Builder<'_> {
    pub(super) fn snippet_declaration(
        &mut self,
        identifier: CompilerNodeIdentifier,
        server: bool,
    ) -> NodeIdentifier {
        let tree = &self.input.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!()
        };
        let DirectiveExpression::For(scope) = &self
            .structural(identifier, DirectiveName::For)
            .expect("a snippet has parameters")
            .exp
        else {
            unreachable!()
        };
        let name = self.copy_expression(self.raw_markup_value(identifier));
        let mut body = Vec::new();
        let (parameters, added) = if server {
            let parameters = scope
                .parameters
                .iter()
                .map(|&parameter| self.copy_expression(parameter))
                .collect();
            (parameters, Vec::new())
        } else {
            self.scope_parameters(&scope.parameters, &mut body, true)
        };
        let result = if server {
            self.server_list(tree.children(element.children))
        } else {
            let nodes = self.list(tree.children(element.children), &mut body);
            self.to.array(&nodes, SYNTHETIC)
        };
        for binding in added {
            self.loop_bindings.remove(&binding);
        }
        body.push(self.to.return_(Some(result), SYNTHETIC));
        let body = self.to.block(&body, SYNTHETIC);
        self.to
            .function(true, Some(name), &parameters, body, false, SYNTHETIC)
    }

    pub(super) fn render_snippet(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let expression = self.raw_markup_value(identifier);
        let Kind::Call {
            callee, arguments, ..
        } = self.input.javascript.kind(expression)
        else {
            unreachable!("a render tag holds a call")
        };
        let mut ready = Vec::new();
        let callee = self.snippet_argument(callee, body, &mut ready);
        let key = self.to.arrow(&[], callee, true, false, SYNTHETIC);
        let arguments: Vec<_> = arguments
            .iter()
            .map(|&argument| {
                let value = self.snippet_argument(argument, body, &mut ready);
                let getter = self.to.arrow(&[], value, true, false, SYNTHETIC);
                self.call("computed", &[getter])
            })
            .collect();
        let call = self.to.call0(callee, &arguments);
        let empty = self.to.array(&[], SYNTHETIC);
        let result = self.to.cond(callee, call, empty, SYNTHETIC);
        let render = self.to.arrow(&[], result, true, false, SYNTHETIC);
        let mut fragment = self.keyed_fragment(key, render);
        if let Some((&first, rest)) = ready.split_first() {
            let mut test = first;
            for &condition in rest {
                test = self.to.logical(
                    rsvelte_typescript::operators::LogicalOperator::And,
                    test,
                    condition,
                    SYNTHETIC,
                );
            }
            let test = self.to.arrow(&[], test, true, false, SYNTHETIC);
            let branch = self.to.arrow(&[], fragment, true, false, SYNTHETIC);
            fragment = self.call("createIf", &[test, branch]);
        }
        self.declare(fragment, body)
    }

    fn snippet_argument(
        &mut self,
        source: NodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
        ready: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let asynchronous = super::super::asynchronous::has_await(&self.input.javascript, source);
        let value = self.reactive_expression(source, body);
        if asynchronous {
            let Kind::Member { object: cell, .. } = self.to.kind(value) else {
                unreachable!("an async cell read")
            };
            let resolved = self.to.dot(cell, "resolved");
            ready.push(self.to.dot(resolved, "value"));
        }
        value
    }
}
