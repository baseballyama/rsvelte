use oxc_ast::ast::{Expression, LogicalOperator};
use rsvelte_svelte_compile::render_plan::Namespace;
use rsvelte_vue_semantic::compiler_syntax_tree::{Element, PropertyKind};

use super::{Body, Emitter};

impl<'o> Emitter<'_, 'o> {
    /// `const $$native_slots = …`: the slots a light-DOM custom element's children fill.
    pub(super) fn slot_context(&self, body: &mut Body<'o>) {
        let b = self.b;
        let light = self
            .t
            .template
            .custom_element
            .as_ref()
            .is_some_and(|options| !options.shadow_root);
        if self.t.server || !light || !self.tree.nodes.iter().any(|node| self.tag_is(node, "slot"))
        {
            return;
        }
        let children = b.member(b.call(b.id("$$custom_element_host"), []), "childNodes");
        let name = b.logical(
            b.member(b.id("$$slot_node"), "slot"),
            LogicalOperator::Or,
            b.string("default"),
        );
        let callback = b.arrow(b.parameters(["$$slot_node"]), name);
        let names = b.call(b.member(b.id("Array"), "from"), [children, callback]);
        body.push(b.const_("$$native_slots", names));
    }

    pub(super) fn slot(&mut self, element: &Element, body: &mut Body<'o>) -> Expression<'o> {
        let b = self.b;
        let name = self
            .tree
            .props(element.props)
            .iter()
            .find_map(|property| match &property.kind {
                PropertyKind::Attribute {
                    name,
                    value: Some(value),
                } if name.text(self.source_text) == "name" => Some(value.text(self.source_text)),
                _ => None,
            })
            .unwrap_or("default");
        let shadow = self
            .t
            .template
            .custom_element
            .as_ref()
            .is_some_and(|options| options.shadow_root);
        if shadow {
            return self.native_slot(element, name, body);
        }
        let test = b.call(
            b.member(b.id("$$native_slots"), "includes"),
            [b.string(name)],
        );
        let mut content = Body::default();
        let node = self.native_slot(element, name, &mut content);
        let present = self.render_block(content, node, b.parameters([]));
        let mut content = Body::default();
        let nodes = self.list(self.tree.children(element.children), &mut content);
        let fallback = self.render_block(content, b.array(nodes), b.parameters([]));
        let fragment = self.call("createIf", [self.arrow(test), present, fallback]);
        b.id(&self.declare(fragment, body))
    }

    fn native_slot(
        &mut self,
        element: &Element,
        name: &str,
        body: &mut Body<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        let node = self.template("<slot>", Namespace::Html, body);
        if name != "default" {
            let set = self.call("setAttr", [b.id(&node), b.string("name"), b.string(name)]);
            body.push(b.statement(set));
        }
        let shadow = self
            .t
            .template
            .custom_element
            .as_ref()
            .is_some_and(|options| options.shadow_root);
        if shadow {
            let children = self.list(self.tree.children(element.children), body);
            if !children.is_empty() {
                let insert = self.call("insert", [b.array(children), b.id(&node)]);
                body.push(b.statement(insert));
            }
        }
        b.id(&node)
    }
}
