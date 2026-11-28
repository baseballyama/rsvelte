//! `<svelte:options>`, as svelte's `read_options` reads it.

use oxc_ast::ast::{Expression, ObjectExpression, ObjectPropertyKind, PropertyKey};
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Part, TemplateNode,
};

use super::Printer;

impl<'a> Printer<'a> {
    pub(super) fn options(&mut self) {
        let component = self.component;
        let Some(&node) = component
            .children(component.root)
            .iter()
            .find(|&&node| self.is_options(node))
        else {
            self.out.null();
            return;
        };
        let TemplateNode::Element {
            attributes, span, ..
        } = component.node(node)
        else {
            unreachable!("svelte:options is an element");
        };
        self.out.object();
        self.span(*span);
        self.out.key("attributes");
        self.attributes(*attributes, "svelte:options");
        for attribute in component.attributes(*attributes) {
            if attribute.kind != AttributeKind::Attribute {
                continue;
            }
            let name = self.text(attribute.name);
            match name {
                "runes" | "immutable" | "accessors" | "preserveWhitespace" => {
                    let value = component
                        .svelte_option_flag(self.source, name)
                        .unwrap_or(true);
                    self.out.key(name).boolean(value);
                }
                "namespace" | "css" => {
                    if let Some(text) = self.static_value(attribute) {
                        self.out.key(name).string(text);
                    }
                }
                "customRenderer" => self.custom_renderer(attribute),
                "customElement" => self.custom_element(attribute),
                _ => {}
            }
        }
        self.out.end();
    }

    /// The text of an attribute whose value is one text, as written.
    fn static_value(&self, attribute: &Attribute) -> Option<&'a str> {
        let AttributeValue::Parts(parts) = attribute.value else {
            return None;
        };
        match self.component.parts(parts) {
            [Part::Text(span)] => Some(self.text(*span)),
            [] => Some(""),
            _ => None,
        }
    }

    fn custom_renderer(&mut self, attribute: &Attribute) {
        if let Some(text) = self.static_value(attribute) {
            self.out.key("customRenderer").string(text);
        } else if let Some(expression) = self.value_expression(attribute) {
            let expression = self.component.javascript.get_expression(expression);
            if let Some(text) = string(expression) {
                self.out.key("customRenderer").string(text);
            } else if matches!(expression, Expression::NullLiteral(_)) {
                self.out.key("customRenderer").null();
            }
        }
    }

    fn custom_element(&mut self, attribute: &Attribute) {
        if let Some(tag) = self.static_value(attribute) {
            self.out.key("customElement").object();
            self.out.key("tag").string(tag);
            self.out.end();
            return;
        }
        let Some(expression) = self.value_expression(attribute) else {
            return;
        };
        let Expression::ObjectExpression(object) =
            self.component.javascript.get_expression(expression)
        else {
            return;
        };
        self.out.key("customElement").object();
        if let Some(tag) = property(object, "tag") {
            if let Some(text) = string(tag) {
                self.out.key("tag").string(text);
            } else if matches!(tag, Expression::NullLiteral(_)) {
                self.out.key("tag").null();
            }
        }
        if let Some(Expression::ObjectExpression(props)) = property(object, "props") {
            self.out.key("props").object();
            for (name, value) in properties(props) {
                let Expression::ObjectExpression(prop) = value else {
                    continue;
                };
                self.out.key(name).object();
                for (key, value) in properties(prop) {
                    match key {
                        "type" | "attribute" => {
                            if let Some(text) = string(value) {
                                self.out.key(key).string(text);
                            }
                        }
                        "reflect" => {
                            if let Expression::BooleanLiteral(literal) = value {
                                self.out.key(key).boolean(literal.value);
                            }
                        }
                        _ => {}
                    }
                }
                self.out.end();
            }
            self.out.end();
        }
        if let Some(shadow) = property(object, "shadow") {
            if let Some(text) = string(shadow) {
                self.out.key("shadow").string(text);
            } else if matches!(shadow, Expression::ObjectExpression(_)) {
                self.out.key("shadow");
                self.javascript(shadow);
            }
        }
        if let Some(extend) = property(object, "extend") {
            self.out.key("extend");
            self.javascript(extend);
        }
        self.out.end();
    }
}

/// The properties of an object literal with a plain name, as `name: value`.
fn properties<'o, 'a>(
    object: &'o ObjectExpression<'a>,
) -> impl Iterator<Item = (&'o str, &'o Expression<'a>)> {
    object
        .properties
        .iter()
        .filter_map(|property| match property {
            ObjectPropertyKind::ObjectProperty(property) => match &property.key {
                PropertyKey::StaticIdentifier(name) => Some((name.name.as_str(), &property.value)),
                _ => None,
            },
            ObjectPropertyKind::SpreadProperty(_) => None,
        })
}

/// The value of a string literal.
fn string<'o>(expression: &'o Expression<'_>) -> Option<&'o str> {
    match expression {
        Expression::StringLiteral(literal) => literal.value.as_str(),
        _ => None,
    }
}

/// The value of the first property named `name`, as svelte finds it.
fn property<'o, 'a>(object: &'o ObjectExpression<'a>, name: &str) -> Option<&'o Expression<'a>> {
    properties(object)
        .find(|&(key, _)| key == name)
        .map(|(_, value)| value)
}
