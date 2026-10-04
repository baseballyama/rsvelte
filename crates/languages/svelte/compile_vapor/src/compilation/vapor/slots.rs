use rsvelte_typescript::operators::LogicalOperator;
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_vue::compiler_syntax_tree::{Element, NodeKind, PropertyKind};

use super::{Builder, Namespace, NodeIdentifier, SYNTHETIC};

impl Builder<'_> {
    pub(super) fn slot_context(&mut self, body: &mut Vec<NodeIdentifier>) {
        if self.input.server
            || self
                .input
                .custom_element
                .as_ref()
                .is_none_or(|options| options.shadow_root)
            || !self.input.compiler_syntax_tree.nodes.iter().any(|node| {
                matches!(
                    &node.kind,
                    NodeKind::Element(element) if element.tag.text(self.source_text) == "slot"
                )
            })
        {
            return;
        }
        let helper = self.to.identifier("$$custom_element_host");
        let host = self.to.call0(helper, &[]);
        let children = self.to.dot(host, "childNodes");
        let node = self.to.identifier("$$slot_node");
        let name = self.to.dot(node, "slot");
        let default = self.to.write_string("default");
        let name = self
            .to
            .logical(LogicalOperator::Or, name, default, SYNTHETIC);
        let callback = self.to.arrow(&[node], name, true, false, SYNTHETIC);
        let array = self.to.identifier("Array");
        let from = self.to.dot(array, "from");
        let names = self.to.call0(from, &[children, callback]);
        let binding = self.to.identifier("$$native_slots");
        body.push(self.to.let_(flag::CONST, binding, Some(names)));
    }

    pub(super) fn slot(
        &mut self,
        element: &Element,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let name = self
            .input
            .compiler_syntax_tree
            .props(element.props)
            .iter()
            .find_map(|property| {
                if let PropertyKind::Attribute {
                    name,
                    value: Some(value),
                } = &property.kind
                    && name.text(self.source_text) == "name"
                {
                    Some(value.text(self.source_text))
                } else {
                    None
                }
            })
            .unwrap_or("default");
        let name_value = self.to.write_string(name);
        if self
            .input
            .custom_element
            .as_ref()
            .is_some_and(|options| options.shadow_root)
        {
            return self.native_slot(element, name, name_value, body);
        }
        let names = self.to.identifier("$$native_slots");
        let has = self.to.dot(names, "includes");
        let test = self.to.call0(has, &[name_value]);
        let getter = self.to.arrow(&[], test, true, false, SYNTHETIC);
        let mut content = Vec::new();
        let node = self.native_slot(element, name, name_value, &mut content);
        content.push(self.to.return_(Some(node), SYNTHETIC));
        let block = self.to.block(&content, SYNTHETIC);
        let present = self.to.arrow(&[], block, false, false, SYNTHETIC);
        let mut content = Vec::new();
        let nodes = self.list(
            self.input.compiler_syntax_tree.children(element.children),
            &mut content,
        );
        let nodes = self.to.array(&nodes, SYNTHETIC);
        content.push(self.to.return_(Some(nodes), SYNTHETIC));
        let block = self.to.block(&content, SYNTHETIC);
        let fallback = self.to.arrow(&[], block, false, false, SYNTHETIC);
        let fragment = self.call("createIf", &[getter, present, fallback]);
        self.declare(fragment, body)
    }

    fn native_slot(
        &mut self,
        element: &Element,
        name: &str,
        name_value: NodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let node = self.template("<slot>", Namespace::Html, body);
        if name != "default" {
            let attribute = self.to.write_string("name");
            let set = self.call("setAttr", &[node, attribute, name_value]);
            body.push(self.to.expression_statement(set));
        }
        if self
            .input
            .custom_element
            .as_ref()
            .is_some_and(|options| options.shadow_root)
        {
            let children = self.list(
                self.input.compiler_syntax_tree.children(element.children),
                body,
            );
            if !children.is_empty() {
                let children = self.to.array(&children, SYNTHETIC);
                let insert = self.call("insert", &[children, node]);
                body.push(self.to.expression_statement(insert));
            }
        }
        node
    }
}
