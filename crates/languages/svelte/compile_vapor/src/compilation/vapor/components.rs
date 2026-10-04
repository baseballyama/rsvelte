use rsvelte_vue::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind, PropertyKind};
use rsvelte_vue::syntax_tree::DirectiveExpression;

use super::{Builder, NodeIdentifier, SYNTHETIC};

impl Builder<'_> {
    pub(super) fn component_value(
        &self,
        identifier: CompilerNodeIdentifier,
        name: &str,
    ) -> NodeIdentifier {
        self.component_property(identifier, name)
            .expect("a component has its type and props")
    }

    fn component_property(
        &self,
        identifier: CompilerNodeIdentifier,
        name: &str,
    ) -> Option<NodeIdentifier> {
        let tree = &self.input.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!()
        };
        tree.props(element.props).iter().find_map(|property| {
            let PropertyKind::Directive(directive) = &property.kind else {
                return None;
            };
            if directive
                .arg
                .as_ref()
                .is_some_and(|arg| arg.text(self.source_text) == name)
                && let DirectiveExpression::Expression(value) = directive.exp
            {
                Some(value)
            } else {
                None
            }
        })
    }

    pub(super) fn component(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let NodeKind::Element(element) = &self.input.compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!()
        };
        for &child in self.input.compiler_syntax_tree.children(element.children) {
            body.push(self.snippet_declaration(child, false));
        }
        let mut component = self.expression(self.component_value(identifier, "$$type"));
        let source = self.component_value(identifier, "$$props");
        let asynchronous = super::super::asynchronous::has_await(&self.input.javascript, source);
        let props = self.reactive_expression(source, body);
        if asynchronous {
            let empty = self.to.null(SYNTHETIC);
            component = self.to.cond(props, component, empty, SYNTHETIC);
        }
        let wrap = self.to.identifier("$$component_props");
        let props = self.to.call0(wrap, &[props]);
        let getter = self.to.arrow(&[], component, true, false, SYNTHETIC);
        let source = self.to.arrow(&[], props, true, false, SYNTHETIC);
        let sources = self.to.array(&[source], SYNTHETIC);
        let key = self.to.identifier("$");
        let field = self.to.property(key, sources, 0, SYNTHETIC);
        let props = self.to.object(&[field], SYNTHETIC);
        let value = self.call("createDynamicComponent", &[getter, props]);
        let fragment = self.declare(value, body);
        if let Some(setter) = self.component_property(identifier, "$$ref") {
            let setter = self.expression(setter);
            let getter = self.to.arrow(&[], setter, true, false, SYNTHETIC);
            let call = self.call("setTemplateRefBinding", &[fragment, getter]);
            body.push(self.to.expression_statement(call));
        }
        fragment
    }

    pub(super) fn server_boundary(&mut self, identifier: CompilerNodeIdentifier) -> NodeIdentifier {
        let NodeKind::Element(element) = &self.input.compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!()
        };
        let mut body = Vec::new();
        for &child in self.input.compiler_syntax_tree.children(element.children) {
            body.push(self.snippet_declaration(child, true));
        }
        let props = self.expression(self.component_value(identifier, "$$props"));
        let name = self.name();
        body.push(self.to.let_(
            rsvelte_typescript::syntax_tree::flag::CONST,
            name,
            Some(props),
        ));
        let pending = self.to.dot(name, "pending");
        let children = self.to.dot(name, "children");
        let children = self.to.logical(
            rsvelte_typescript::operators::LogicalOperator::Or,
            pending,
            children,
            SYNTHETIC,
        );
        let call = self.to.call0(children, &[]);
        let empty = self.to.write_string("");
        let value = self.to.cond(children, call, empty, SYNTHETIC);
        body.push(self.to.return_(Some(value), SYNTHETIC));
        let block = self.to.block(&body, SYNTHETIC);
        let render = self.to.arrow(&[], block, false, false, SYNTHETIC);
        self.to.call0(render, &[])
    }

    pub(super) fn server_component(
        &mut self,
        identifier: CompilerNodeIdentifier,
    ) -> NodeIdentifier {
        let component = self.expression(self.component_value(identifier, "$$type"));
        let source = self.component_value(identifier, "$$props");
        let asynchronous = super::super::asynchronous::has_await(&self.input.javascript, source);
        let props = self.expression(source);
        let parent = self.to.identifier("$$ssr_parent");
        let renderer = self.to.identifier("$$ssr_component");
        let slots = self.to.null(SYNTHETIC);
        let result = self.to.call0(renderer, &[component, props, slots, parent]);
        let result = self.server_async(result, asynchronous);
        let NodeKind::Element(element) = &self.input.compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!()
        };
        let children = self.input.compiler_syntax_tree.children(element.children);
        if children.is_empty() {
            return result;
        }
        let mut body: Vec<_> = children
            .iter()
            .map(|&child| self.snippet_declaration(child, true))
            .collect();
        body.push(self.to.return_(Some(result), SYNTHETIC));
        let block = self.to.block(&body, SYNTHETIC);
        let function = self.to.arrow(&[], block, false, false, SYNTHETIC);
        self.to.call0(function, &[])
    }
}
