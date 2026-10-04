use rsvelte_typescript::copy::{Verbatim, copy};
use rsvelte_vue::compiler_syntax_tree::{
    CompilerNodeIdentifier, Directive, NodeKind, PropertyKind,
};
use rsvelte_vue::syntax_tree::{DirectiveExpression, DirectiveName};

use super::{Builder, NodeIdentifier, SYNTHETIC};

impl<'a> Builder<'a> {
    pub(super) fn client_setup(&mut self, body: &mut Vec<NodeIdentifier>) -> NodeIdentifier {
        if !self
            .input
            .helpers
            .contains(&crate::helpers::Helper::Transition)
        {
            let nodes = self.list(self.input.compiler_syntax_tree.root(), body);
            return self.to.array(&nodes, SYNTHETIC);
        }
        self.helpers
            .extend(["VaporFragment", "remove", "queuePostFlushCb"]);
        let mut template = Vec::new();
        let nodes = self.list(self.input.compiler_syntax_tree.root(), &mut template);
        let nodes = self.to.array(&nodes, SYNTHETIC);
        template.push(self.to.return_(Some(nodes), SYNTHETIC));
        let block = self.to.block(&template, SYNTHETIC);
        let render = self.to.arrow(&[], block, false, false, SYNTHETIC);
        let render = self.transition_branch(render);
        self.to.call0(render, &[])
    }

    pub(super) fn structural(
        &self,
        identifier: CompilerNodeIdentifier,
        name: DirectiveName,
    ) -> Option<&'a Directive> {
        let NodeKind::Element(el) = &self.input.compiler_syntax_tree.node(identifier).kind else {
            return None;
        };
        self.input
            .compiler_syntax_tree
            .props(el.props)
            .iter()
            .find_map(|p| match &p.kind {
                PropertyKind::Directive(d) if d.name == name => Some(d),
                _ => None,
            })
    }

    pub(super) fn list(
        &mut self,
        nodes: &[CompilerNodeIdentifier],
        body: &mut Vec<NodeIdentifier>,
    ) -> Vec<NodeIdentifier> {
        let mut result = Vec::with_capacity(nodes.len());
        let mut i = 0;
        while i < nodes.len() {
            let identifier = nodes[i];
            if self.structural(identifier, DirectiveName::If).is_some() {
                let start = i;
                i += 1;
                while i < nodes.len()
                    && (self.structural(nodes[i], DirectiveName::ElseIf).is_some()
                        || self.structural(nodes[i], DirectiveName::Else).is_some())
                {
                    i += 1;
                }
                let branch = self.if_chain(&nodes[start..i]);
                result.push(self.declare(branch, body));
            } else {
                result.push(self.loop_or_node(identifier, body));
                i += 1;
            }
        }
        result
    }

    fn if_chain(&mut self, branches: &[CompilerNodeIdentifier]) -> NodeIdentifier {
        let first = branches[0];
        let test = [DirectiveName::If, DirectiveName::ElseIf]
            .into_iter()
            .find_map(|name| self.structural(first, name))
            .and_then(|d| match d.exp {
                DirectiveExpression::Expression(e) => Some(e),
                _ => None,
            });
        let mut body = Vec::new();
        let node = self.loop_or_node(first, &mut body);
        body.push(self.to.return_(Some(node), SYNTHETIC));
        let block = self.to.block(&body, SYNTHETIC);
        let branch = self.to.arrow(&[], block, false, false, SYNTHETIC);
        let branch = self.transition_branch(branch);
        let Some(test) = test else { return branch };
        let asynchronous = super::super::asynchronous::has_await(&self.input.javascript, test);
        let source = test;
        let mut arguments = Vec::with_capacity(3);
        arguments.push(branch);
        if branches.len() > 1 {
            let otherwise = self.if_chain(&branches[1..]);
            let otherwise = if self.structural(branches[1], DirectiveName::Else).is_some() {
                otherwise
            } else {
                self.to.arrow(&[], otherwise, true, false, SYNTHETIC)
            };
            arguments.push(otherwise);
        }
        if asynchronous {
            self.async_if(source, &arguments)
        } else {
            let test = self.expression(source);
            let test = self.to.arrow(&[], test, true, false, SYNTHETIC);
            arguments.insert(0, test);
            self.call("createIf", &arguments)
        }
    }

    fn loop_or_node(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let special = match &self.input.compiler_syntax_tree.node(identifier).kind {
            NodeKind::Element(element) => matches!(
                element.tag.text(self.source_text),
                "$$Await" | "$$Snippet" | "$$Scope"
            ),
            _ => false,
        };
        if special || self.structural(identifier, DirectiveName::For).is_none() {
            return self.node(identifier, body);
        }
        self.each(identifier, body)
    }

    fn each(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let DirectiveExpression::For(loop_) = &self
            .structural(identifier, DirectiveName::For)
            .expect("a loop directive")
            .exp
        else {
            unreachable!("a translated loop has aliases and a source")
        };
        let source = loop_.source;
        let parameters = &loop_.parameters;
        let source = self.reactive_expression(source, body);
        let source = self.to.arrow(&[], source, true, false, SYNTHETIC);
        let NodeKind::Element(el) = &self.input.compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        let key = self
            .input
            .compiler_syntax_tree
            .props(el.props)
            .iter()
            .find_map(|p| match &p.kind {
                PropertyKind::Directive(d)
                    if d.name == DirectiveName::Bind
                        && d.arg
                            .as_ref()
                            .is_some_and(|a| a.text(self.source_text) == "$$key") =>
                {
                    match d.exp {
                        DirectiveExpression::Expression(e) => Some(e),
                        _ => None,
                    }
                }
                _ => None,
            });
        let output_parameters: Vec<_> = parameters
            .iter()
            .map(|&p| copy(&self.input.javascript, &mut self.to, &mut Verbatim, p))
            .collect();
        let key = key.map(|key| {
            let key = self.expression(key);
            self.to
                .arrow(&output_parameters, key, true, false, SYNTHETIC)
        });
        let mut item_body = Vec::new();
        let (output_parameters, added) = self.scope_parameters(parameters, &mut item_body, false);
        let node = self.node(identifier, &mut item_body);
        item_body.push(self.to.return_(Some(node), SYNTHETIC));
        for binding in added {
            self.loop_bindings.remove(&binding);
        }
        let block = self.to.block(&item_body, SYNTHETIC);
        let render = self
            .to
            .arrow(&output_parameters, block, false, false, SYNTHETIC);
        let render = self.transition_branch(render);
        let mut arguments = vec![source, render];
        arguments.extend(key);
        let call = if self.input.animation_loops.contains(&identifier) {
            self.helpers.insert("createFor");
            let callee = self.to.identifier("$$animated_for");
            self.to.call0(callee, &arguments)
        } else {
            self.call("createFor", &arguments)
        };
        self.declare(call, body)
    }
}
