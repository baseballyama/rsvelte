use oxc_ast::ast::{Expression, ObjectPropertyKind};

use super::{
    AttributeValue, CompilerNodeIdentifier, Helper, Namespace, NodeKind, Parent, R, Template,
    TypedIndex, clean_nodes, spelled, unsupported, vue,
};
use crate::compilation::string_key;

/// A component's props object: its fields, and the `--` custom properties its wrapper styles.
struct Fields<'t> {
    fields: Vec<ObjectPropertyKind<'t>>,
    styles: Vec<ObjectPropertyKind<'t>>,
}

impl<'t> Template<'_, '_, 't> {
    pub(super) fn component(
        &mut self,
        identifier: CompilerNodeIdentifier,
        parent: Option<vue::CompilerNodeIdentifier>,
        mut properties: Vec<vue::Property>,
        extra: Option<vue::Property>,
    ) -> R<vue::CompilerNodeIdentifier> {
        let b = self.b;
        let tree = self.i.compiler_syntax_tree;
        let node = tree.node(identifier);
        let NodeKind::Element(element) = &node.kind else {
            unreachable!("called on an element")
        };
        if !self.i.server {
            self.helpers.insert(Helper::ComponentProps);
        }
        let boundary = element.name.text(self.i.source_text) == "svelte:boundary";
        let component = if boundary {
            if !self.i.server {
                self.helpers.insert(Helper::Boundary);
            }
            b.id("$$boundary_component")
        } else {
            let expression = tree
                .component_reference(identifier)
                .ok_or_else(|| unsupported("an invalid component name", element.name))?;
            self.template_expression(expression)
        };
        let lead_count = properties.len();
        properties.push(self.bound("$$type", element.name, component, node.span));
        let Fields { mut fields, styles } = self.component_properties(identifier)?;
        let snippets = self.component_children(identifier, parent, &mut fields)?;
        properties.push(self.bound("$$props", element.name, b.object(fields), node.span));
        for attribute in tree.attributes(element.attributes) {
            if attribute.name.text(self.i.source_text) == "this"
                && let AttributeValue::Bind(target) = attribute.value
            {
                self.check_target(target, attribute.span)?;
                if !self.i.server {
                    let assignment = self.binding_write(target, b.id("$$component"));
                    let setter = b.arrow(b.params(["$$component"]), assignment);
                    properties.push(self.bound("$$ref", attribute.span, setter, attribute.span));
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
        let kind = vue::NodeKind::Element(vue::Element {
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
        });
        let origin = super::origin(identifier);
        let result = self.vb.node(kind, node.span, wrapper.or(parent), origin);
        let children = self.vb.children(&snippets);
        self.vb.set_element_children(result, children);
        let Some(wrapper) = wrapper else {
            return Ok(result);
        };
        let children = self.vb.children(&[result]);
        self.vb.set_element_children(wrapper, children);
        Ok(wrapper)
    }

    fn component_properties(&mut self, identifier: CompilerNodeIdentifier) -> R<Fields<'t>> {
        let b = self.b;
        let (tree, source_text) = (self.i.compiler_syntax_tree, self.i.source_text);
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("called on an element")
        };
        let mut fields = Vec::new();
        let mut bindings = Vec::new();
        let mut styles = Vec::new();
        for attribute in tree.attributes(element.attributes) {
            let name = attribute.name.text(source_text);
            let value = match &attribute.value {
                &AttributeValue::Attach(expression) => {
                    if self.i.server {
                        continue;
                    }
                    let key = format!("$$attachment_{}", attribute.span.start_offset);
                    let symbol = self.call("Symbol", [b.string("@attach")]);
                    self.declarations.push(b.const_(&key, symbol));
                    let value = self.template_expression(expression);
                    fields.push(b.property(
                        oxc_ast::ast::PropertyKey::from(b.id(&key)),
                        value,
                        true,
                    ));
                    continue;
                }
                &AttributeValue::Bind(target) => {
                    if name == "this" {
                        continue;
                    }
                    self.check_target(target, attribute.span)?;
                    let setter = self.setter(target);
                    bindings.push(b.property(string_key(b, name), setter, false));
                    self.binding_read(target)
                }
                AttributeValue::Boolean
                | AttributeValue::Static(_)
                | AttributeValue::Expression { .. }
                | AttributeValue::Shorthand(_)
                | AttributeValue::Interpolated(_) => self.plain_value(attribute),
                &AttributeValue::Spread(expression) => {
                    let value = self.template_expression(expression);
                    fields.push(b.spread_property(value));
                    continue;
                }
                _ => return Err(unsupported("this component directive", attribute.span)),
            };
            let field = b.property(string_key(b, name), value, false);
            if name.starts_with("--") {
                styles.push(field);
            } else {
                fields.push(field);
            }
        }
        if !bindings.is_empty() {
            fields.push(b.init("__rsvelte_bindings", b.object(bindings)));
        }
        Ok(Fields { fields, styles })
    }

    fn component_children(
        &mut self,
        identifier: CompilerNodeIdentifier,
        parent: Option<vue::CompilerNodeIdentifier>,
        fields: &mut Vec<ObjectPropertyKind<'t>>,
    ) -> R<Vec<vue::CompilerNodeIdentifier>> {
        let b = self.b;
        let tree = self.i.compiler_syntax_tree;
        let node = tree.node(identifier);
        let NodeKind::Element(element) = &node.kind else {
            unreachable!("called on an element")
        };
        let preserve = self.i.plan.preserve_whitespace;
        let mut snippets = Vec::new();
        let mut children = Vec::new();
        for &child in tree.children(element.children) {
            let child_node = tree.node(child);
            let NodeKind::Snippet(snippet) = &child_node.kind else {
                children.push(child);
                continue;
            };
            let Expression::Identifier(name) = self.source(snippet.name) else {
                unreachable!("a snippet's name is an identifier")
            };
            let symbol = self
                .i
                .resolution
                .snippet(child)
                .expect("a snippet name has a symbol");
            let value = b.id(&self.snippet_names[&symbol]);
            fields.push(b.property(string_key(b, &name.name), value, false));
            snippets.push(self.snippet(child, parent, preserve, child_node.span)?);
        }
        let cleaned = clean_nodes(
            tree,
            self.i.source_text,
            Parent::Block,
            &children,
            preserve,
            false,
        );
        if !cleaned.items.is_empty() || !cleaned.hoisted.is_empty() {
            let name = format!("$$children_{}", identifier.index());
            fields.push(b.init("children", b.id(&name)));
            snippets.push(self.snippet_body(
                b.id(&name),
                None,
                &children,
                parent,
                preserve,
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
        mut styles: Vec<ObjectPropertyKind<'t>>,
    ) -> vue::CompilerNodeIdentifier {
        let b = self.b;
        let node = self.i.compiler_syntax_tree.node(identifier);
        let namespace = self
            .i
            .plan
            .namespaces
            .as_ref()
            .expect("translation uses a checked plan")
            .get(identifier);
        let svg = namespace == Namespace::Svg;
        if !svg {
            styles.insert(0, b.init("display", b.string("contents")));
        }
        properties.push(self.bound("style", node.span, b.object(styles), node.span));
        let props = self.vb.props(properties);
        let kind = vue::NodeKind::Element(vue::Element {
            tag: spelled(if svg { "g" } else { "svelte-css-wrapper" }, node.span),
            tag_type: vue::TagType::Element,
            props,
            children: vue::Children::default(),
        });
        let wrapper = self.vb.node(kind, node.span, parent, 0);
        if svg {
            self.namespaces.insert(wrapper, namespace);
        }
        wrapper
    }
}
