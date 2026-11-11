use oxc_ast::ast::{Expression, LogicalOperator};
use oxc_span::SPAN;
use rsvelte_typescript_tree::ExpressionIdentifier;
use rsvelte_vue_semantic::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind};

use super::{Body, Emitter};
use crate::compilation::asynchronous::has_await;

impl<'a, 'o> Emitter<'a, 'o> {
    fn component_value(
        &self,
        identifier: CompilerNodeIdentifier,
        name: &str,
    ) -> ExpressionIdentifier {
        self.bound(identifier, Some(name))
            .expect("a component has its type and props")
    }

    fn snippets(&self, identifier: CompilerNodeIdentifier) -> &'a [CompilerNodeIdentifier] {
        let NodeKind::Element(element) = &self.tree.node(identifier).kind else {
            unreachable!("a component is an element")
        };
        self.tree.children(element.children)
    }

    pub(super) fn component(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Body<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        for &child in self.snippets(identifier) {
            let declaration = self.snippet_declaration(child, false);
            body.push(declaration);
        }
        let mut component =
            self.expression(self.source(self.component_value(identifier, "$$type")));
        let source = self.source(self.component_value(identifier, "$$props"));
        let props = self.render_expression(source, body);
        if has_await(source) {
            component = Expression::new_conditional_expression(
                SPAN,
                self.copy_output(&props),
                component,
                b.null(),
                b,
            );
        }
        let props = b.call(b.id("$$component_props"), [props]);
        let sources = b.array([self.arrow(props)]);
        let value = self.call(
            "createDynamicComponent",
            [self.arrow(component), b.object([b.init("$", sources)])],
        );
        let fragment = self.declare(value, body);
        if let Some(setter) = self.bound(identifier, Some("$$ref")) {
            let setter = self.expression(self.source(setter));
            let call = self.call(
                "setTemplateRefBinding",
                [b.id(&fragment), self.arrow(setter)],
            );
            body.push(b.statement(call));
        }
        b.id(&fragment)
    }

    pub(super) fn server_boundary(&mut self, identifier: CompilerNodeIdentifier) -> Expression<'o> {
        let b = self.b;
        let mut body = Vec::new();
        for &child in self.snippets(identifier) {
            body.push(self.snippet_declaration(child, true));
        }
        let props = self.expression(self.source(self.component_value(identifier, "$$props")));
        let name = self.name();
        body.push(b.const_(&name, props));
        let children = || {
            b.logical(
                b.member(b.id(&name), "pending"),
                LogicalOperator::Or,
                b.member(b.id(&name), "children"),
            )
        };
        let value = Expression::new_conditional_expression(
            SPAN,
            children(),
            b.call(children(), []),
            b.string(""),
            b,
        );
        body.push(b.return_(Some(value)));
        self.run(body, false)
    }

    pub(super) fn server_component(
        &mut self,
        identifier: CompilerNodeIdentifier,
    ) -> Expression<'o> {
        let b = self.b;
        let component = self.expression(self.source(self.component_value(identifier, "$$type")));
        let source = self.source(self.component_value(identifier, "$$props"));
        let props = self.expression(source);
        let result = b.call(
            b.id("$$ssr_component"),
            [component, props, b.null(), b.id("$$ssr_parent")],
        );
        let result = self.server_async(result, has_await(source));
        let children = self.snippets(identifier);
        if children.is_empty() {
            return result;
        }
        let mut body: Vec<_> = children
            .iter()
            .map(|&child| self.snippet_declaration(child, true))
            .collect();
        body.push(b.return_(Some(result)));
        self.run(body, false)
    }
}
