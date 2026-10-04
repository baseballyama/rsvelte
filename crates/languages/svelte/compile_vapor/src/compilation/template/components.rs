use super::{
    AttributeValue, Builder, CompilerNodeIdentifier, NodeKind, Parent, R, SourceLocation,
    TypedIndex, bound, spelled, unsupported, vue,
};

impl Builder<'_, '_> {
    pub(super) fn component(
        &mut self,
        identifier: CompilerNodeIdentifier,
        parent: Option<vue::CompilerNodeIdentifier>,
        mut properties: Vec<vue::Property>,
        extra: Option<vue::Property>,
    ) -> R<vue::CompilerNodeIdentifier> {
        let tree = self.i.compiler_syntax_tree;
        let node = tree.node(identifier);
        let NodeKind::Element(element) = &node.kind else {
            unreachable!()
        };
        if !self.i.server {
            self.helpers.insert(super::Helper::ComponentProps);
        }
        let name = element.name.text(self.i.source_text);
        let boundary = name == "svelte:boundary";
        let component = if boundary {
            if !self.i.server {
                self.helpers.insert(super::Helper::Boundary);
            }
            self.to.identifier("$$boundary_component")
        } else {
            let expression = tree
                .component_reference(identifier)
                .ok_or_else(|| unsupported("an invalid component name", element.name))?;
            self.render_read(expression)?;
            self.template_expression(expression)
        };
        let lead_count = properties.len();
        properties.push(bound("$$type", element.name, component, node.span));
        let (mut fields, styles) = self.component_properties(identifier)?;
        let snippets = self.component_children(identifier, parent, &mut fields)?;
        let props = self.to.object(&fields, SourceLocation::SYNTHETIC);
        properties.push(bound("$$props", element.name, props, node.span));
        for attribute in tree.attributes(element.attributes) {
            if attribute.name.text(self.i.source_text) == "this"
                && let AttributeValue::Bind(target) = attribute.value
            {
                self.check_target(target, attribute.span)?;
                if !self.i.server {
                    let value = self.to.identifier("$$component");
                    let assignment = self.binding_write(target, value);
                    let setter =
                        self.to
                            .arrow(&[value], assignment, true, false, SourceLocation::SYNTHETIC);
                    properties.push(bound("$$ref", attribute.span, setter, attribute.span));
                }
            }
        }
        let wrapper = if styles.is_empty() {
            properties.extend(extra);
            None
        } else {
            let component_properties = properties.split_off(lead_count);
            let mut wrapper_properties = std::mem::replace(&mut properties, component_properties);
            wrapper_properties.extend(extra);
            Some(self.component_style_wrapper(identifier, parent, wrapper_properties, styles))
        };
        let props = self.vb.props(properties);
        let element = vue::Element {
            tag: spelled(
                if boundary {
                    "$$Boundary"
                } else {
                    "$$Component"
                },
                element.name,
            ),
            tag_type: vue::TagType::Template,
            props,
            children: vue::Children::default(),
        };
        let result = self.vb.node(
            vue::NodeKind::Element(element),
            node.span,
            wrapper.or(parent),
            identifier.index() as u32,
        );
        let children = self.vb.children(&snippets);
        self.vb.set_element_children(result, children);
        if let Some(wrapper) = wrapper {
            let children = self.vb.children(&[result]);
            self.vb.set_element_children(wrapper, children);
            Ok(wrapper)
        } else {
            Ok(result)
        }
    }

    fn component_properties(
        &mut self,
        identifier: CompilerNodeIdentifier,
    ) -> R<(Vec<super::NodeIdentifier>, Vec<super::NodeIdentifier>)> {
        let tree = self.i.compiler_syntax_tree;
        let node = tree.node(identifier);
        let NodeKind::Element(element) = &node.kind else {
            unreachable!()
        };
        let mut fields = Vec::new();
        let mut bindings = Vec::new();
        let mut styles = Vec::new();
        for attribute in tree.attributes(element.attributes) {
            let value = match &attribute.value {
                AttributeValue::Attach(expression) => {
                    if self.i.server {
                        continue;
                    }
                    let key = self
                        .to
                        .identifier(&format!("$$attachment_{}", attribute.span.start_offset));
                    let description = self.to.write_string("@attach");
                    let symbol = self.call("Symbol", &[description]);
                    self.declarations.push(self.to.let_(
                        rsvelte_typescript::syntax_tree::flag::CONST,
                        key,
                        Some(symbol),
                    ));
                    let value = self.template_expression(*expression);
                    fields.push(self.to.property(
                        key,
                        value,
                        rsvelte_typescript::syntax_tree::flag::COMPUTED,
                        attribute.span,
                    ));
                    continue;
                }
                AttributeValue::Bind(target) => {
                    if attribute.name.text(self.i.source_text) == "this" {
                        continue;
                    }
                    self.check_target(*target, attribute.span)?;
                    let value = self.to.identifier("$$value");
                    let assignment = self.binding_write(*target, value);
                    let setter =
                        self.to
                            .arrow(&[value], assignment, true, false, SourceLocation::SYNTHETIC);
                    let key = self
                        .to
                        .write_string(attribute.name.text(self.i.source_text));
                    bindings.push(self.to.property(key, setter, 0, attribute.span));
                    self.binding_read(*target)
                }
                AttributeValue::Boolean => self.to.write_boolean(true, SourceLocation::SYNTHETIC),
                AttributeValue::Static(value) => self.to.write_string(value),
                AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression) => {
                    self.render_read(*expression)?;
                    self.template_expression(*expression)
                }
                AttributeValue::Interpolated(parts) => self.interpolated(parts),
                AttributeValue::Spread(expression) => {
                    let value = self.template_expression(*expression);
                    fields.push(self.to.spread(value, attribute.span));
                    continue;
                }
                _ => return Err(unsupported("this component directive", attribute.span)),
            };
            let key = self
                .to
                .write_string(attribute.name.text(self.i.source_text));
            let field = self.to.property(key, value, 0, attribute.span);
            if attribute.name.text(self.i.source_text).starts_with("--") {
                styles.push(field);
            } else {
                fields.push(field);
            }
        }
        if !bindings.is_empty() {
            let key = self.to.write_string("__rsvelte_bindings");
            let value = self.to.object(&bindings, SourceLocation::SYNTHETIC);
            fields.push(self.to.property(key, value, 0, node.span));
        }
        Ok((fields, styles))
    }

    fn component_children(
        &mut self,
        identifier: CompilerNodeIdentifier,
        parent: Option<vue::CompilerNodeIdentifier>,
        fields: &mut Vec<super::NodeIdentifier>,
    ) -> R<Vec<vue::CompilerNodeIdentifier>> {
        let tree = self.i.compiler_syntax_tree;
        let node = tree.node(identifier);
        let NodeKind::Element(element) = &node.kind else {
            unreachable!()
        };
        let mut snippets = Vec::new();
        let mut children = Vec::new();
        for &child in tree.children(element.children) {
            let child_node = tree.node(child);
            if let NodeKind::Snippet(snippet) = &child_node.kind {
                let key = self.to.write_string(self.i.javascript.name(snippet.name));
                let value = self.template_expression(snippet.name);
                fields.push(self.to.property(key, value, 0, child_node.span));
                snippets.push(self.snippet(
                    snippet,
                    parent,
                    self.i.plan.preserve_whitespace,
                    child_node.span,
                )?);
            } else {
                children.push(child);
            }
        }
        let cleaned = super::clean_nodes(
            tree,
            self.i.source_text,
            Parent::Block,
            &children,
            self.i.plan.preserve_whitespace,
        );
        if !cleaned.items.is_empty() || !cleaned.hoisted.is_empty() {
            let name = self
                .to
                .identifier(&format!("$$children_{}", identifier.index()));
            let key = self.to.write_string("children");
            fields.push(self.to.property(key, name, 0, node.span));
            snippets.push(self.snippet_body(
                name,
                Vec::new(),
                &children,
                parent,
                self.i.plan.preserve_whitespace,
                node.span,
            )?);
        }
        Ok(snippets)
    }

    fn component_style_wrapper(
        &mut self,
        identifier: CompilerNodeIdentifier,
        parent: Option<vue::CompilerNodeIdentifier>,
        mut properties: Vec<vue::Property>,
        mut styles: Vec<super::NodeIdentifier>,
    ) -> vue::CompilerNodeIdentifier {
        let node = self.i.compiler_syntax_tree.node(identifier);
        let namespace = self
            .i
            .plan
            .namespaces
            .as_ref()
            .expect("translation uses a checked plan")
            .get(identifier);
        let svg = namespace == rsvelte_svelte_compile::render_plan::Namespace::Svg;
        if !svg {
            let key = self.to.write_string("display");
            let value = self.to.write_string("contents");
            styles.insert(0, self.to.property(key, value, 0, node.span));
        }
        let value = self.to.object(&styles, SourceLocation::SYNTHETIC);
        properties.push(bound("style", node.span, value, node.span));
        let props = self.vb.props(properties);
        let element = vue::Element {
            tag: spelled(if svg { "g" } else { "svelte-css-wrapper" }, node.span),
            tag_type: vue::TagType::Element,
            props,
            children: vue::Children::default(),
        };
        let wrapper = self
            .vb
            .node(vue::NodeKind::Element(element), node.span, parent, 0);
        if svg {
            self.namespaces.insert(wrapper, namespace);
        }
        wrapper
    }
}
