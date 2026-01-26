//! Server-side element rendering utilities.
//!
//! This module contains functions for building element attributes and spread
//! handling during SSR. It corresponds to
//! `svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/shared/element.js`.

use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, ClassDirective, RegularElement, StyleDirective,
    SvelteDynamicElement,
};
use crate::compiler::constants::{
    ELEMENT_IS_INPUT, ELEMENT_IS_NAMESPACED, ELEMENT_PRESERVE_ATTRIBUTE_CASE,
};
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use crate::compiler::phases::phase3_transform::server::types::{
    ComponentServerTransformState, TemplateItem,
};
use crate::compiler::phases::phase3_transform::shared::{
    escape_attr, is_boolean_attribute, is_custom_element_node,
};

use super::utils::build_attribute_value;

/// Whitespace-insensitive attributes (can be normalized).
const WHITESPACE_INSENSITIVE_ATTRIBUTES: &[&str] = &["class", "style"];

/// Builds element attributes for server-side rendering.
///
/// This function processes all attributes on an element and adds them to the
/// template output. It handles:
/// - Regular attributes
/// - Spread attributes
/// - Class and style directives
/// - Bind directives
/// - Event handlers (special cases only)
///
/// Some attributes (like `value` for textarea) are returned as content instead
/// of being added as attributes.
///
/// Corresponds to `build_element_attributes()` in `element.js`.
///
/// # Arguments
///
/// * `node` - The element node
/// * `state` - The component server transform state
/// * `transform` - A function to transform expressions (e.g., for async optimization)
///
/// # Returns
///
/// Optional content expression (for textarea value or contenteditable bindings)
pub fn build_element_attributes<F>(
    node: &dyn ElementNode,
    state: &mut ComponentServerTransformState,
    transform: F,
) -> Option<JsExpr>
where
    F: Fn(JsExpr) -> JsExpr + Clone,
{
    let mut attributes: Vec<&AttributeNode> = Vec::new();
    let mut class_directives: Vec<&ClassDirective> = Vec::new();
    let mut style_directives: Vec<&StyleDirective> = Vec::new();
    let mut content: Option<JsExpr> = None;
    let mut has_spread = false;
    let mut events_to_capture: std::collections::HashSet<String> = std::collections::HashSet::new();

    // Collect attributes by type
    for attribute in node.get_attributes() {
        match attribute {
            Attribute::Attribute(attr) => {
                // Handle special cases
                if attr.name == "value" {
                    if node.get_name() == "textarea" {
                        // Textarea value becomes content
                        let value =
                            build_attribute_value(&attr.value, transform.clone(), false, false);
                        content = Some(JsExpr::Call(JsCallExpression {
                            callee: Box::new(JsExpr::Member(JsMemberExpression {
                                object: Box::new(JsExpr::Identifier("$".to_string())),
                                property: JsMemberProperty::Identifier("escape".to_string()),
                                computed: false,
                                optional: false,
                            })),
                            arguments: vec![value],
                            optional: false,
                        }));
                    } else if node.get_name() != "select" {
                        // For select, value attribute is omitted
                        attributes.push(attr);
                    }
                } else if is_event_attribute(&attr.name) {
                    // Event handlers are generally omitted in SSR
                    // Special case: onload/onerror for certain elements
                    if (attr.name == "onload" || attr.name == "onerror")
                        && is_load_error_element(node.get_name())
                    {
                        events_to_capture.insert(attr.name.to_string());
                    }
                } else if attr.name != "defaultValue" && attr.name != "defaultChecked" {
                    // Regular attributes
                    attributes.push(attr);
                }
            }
            Attribute::BindDirective(bind) => {
                if bind.name == "value" && node.get_name() == "select" {
                    continue;
                }
                if bind.name == "this" {
                    continue;
                }

                // Check if this binding should be omitted in SSR
                // TODO: Implement binding_properties check
                let omit_in_ssr = false;
                if omit_in_ssr {
                    continue;
                }

                // TODO: Handle bind directives properly
                // For now, just extract the expression
            }
            Attribute::SpreadAttribute(_) => {
                has_spread = true;
                if is_load_error_element(node.get_name()) {
                    events_to_capture.insert("onload".to_string());
                    events_to_capture.insert("onerror".to_string());
                }
            }
            Attribute::ClassDirective(class_dir) => {
                class_directives.push(class_dir);
            }
            Attribute::StyleDirective(style_dir) => {
                style_directives.push(style_dir);
            }
            Attribute::UseDirective(_) => {
                if is_load_error_element(node.get_name()) {
                    events_to_capture.insert("onload".to_string());
                    events_to_capture.insert("onerror".to_string());
                }
            }
            _ => {}
        }
    }

    if has_spread {
        // Use spread attributes path
        build_element_spread_attributes(
            node,
            &attributes,
            &style_directives,
            &class_directives,
            state,
            transform.clone(),
        );
    } else {
        // Simple attributes path - more efficient
        let css_hash = if node.is_scoped() {
            Some(state.analysis.css.hash.as_str())
        } else {
            None
        };

        for attr in attributes {
            let name = get_attribute_name(node, &attr.name);
            let can_use_literal = (name != "class" || class_directives.is_empty())
                && (name != "style" || style_directives.is_empty());

            if can_use_literal
                && (matches!(attr.value, AttributeValue::True(_)) || is_text_attribute(&attr.value))
            {
                // Static attribute - can be inlined
                let mut literal_value = if let JsExpr::Literal(lit) = build_attribute_value(
                    &attr.value,
                    transform.clone(),
                    WHITESPACE_INSENSITIVE_ATTRIBUTES.contains(&name.as_str()),
                    false,
                ) {
                    match lit {
                        JsLiteral::String(s) => s,
                        JsLiteral::Boolean(b) => b.to_string(),
                        JsLiteral::Number(n) => n.to_string(),
                        _ => String::new(),
                    }
                } else {
                    String::new()
                };

                // Add CSS hash to class
                if name == "class"
                    && let Some(hash) = css_hash
                {
                    literal_value = format!("{} {}", literal_value, hash).trim().to_string();
                }

                if name != "class" || !literal_value.is_empty() {
                    let attr_str = if is_boolean_attribute(&name) && literal_value == "true" {
                        format!(" {}", attr.name)
                    } else if literal_value == "true" {
                        format!(" {}=\"\"", attr.name)
                    } else {
                        format!(" {}=\"{}\"", attr.name, literal_value)
                    };

                    state
                        .template
                        .push(TemplateItem::Expression(JsExpr::Literal(
                            JsLiteral::String(attr_str.clone()),
                        )));
                }

                continue;
            }

            let value = build_attribute_value(
                &attr.value,
                transform.clone(),
                WHITESPACE_INSENSITIVE_ATTRIBUTES.contains(&name.as_str()),
                false,
            );

            // Pre-escape and inline literal attributes
            if can_use_literal && let JsExpr::Literal(lit) = &value {
                let lit_value = match lit {
                    JsLiteral::String(s) => s.clone(),
                    JsLiteral::Boolean(b) => b.to_string(),
                    JsLiteral::Number(n) => n.to_string(),
                    _ => String::new(),
                };
                let mut escaped = escape_attr(&lit_value);
                if name == "class"
                    && let Some(hash) = css_hash
                {
                    escaped = format!("{} {}", escaped, hash).trim().to_string();
                }
                let attr_str = format!(" {}=\"{}\"", name, escaped);
                state
                    .template
                    .push(TemplateItem::Expression(JsExpr::Literal(
                        JsLiteral::String(attr_str.clone()),
                    )));
                continue;
            }

            if name == "class" {
                state
                    .template
                    .push(TemplateItem::Expression(build_attr_class(
                        &class_directives,
                        value,
                        css_hash,
                        transform.clone(),
                    )));
            } else if name == "style" {
                state
                    .template
                    .push(TemplateItem::Expression(build_attr_style(
                        &style_directives,
                        value,
                        transform.clone(),
                    )));
            } else {
                state
                    .template
                    .push(TemplateItem::Expression(JsExpr::Call(JsCallExpression {
                        callee: Box::new(JsExpr::Member(JsMemberExpression {
                            object: Box::new(JsExpr::Identifier("$".to_string())),
                            property: JsMemberProperty::Identifier("attr".to_string()),
                            computed: false,
                            optional: false,
                        })),
                        arguments: if is_boolean_attribute(&name) {
                            vec![
                                JsExpr::Literal(JsLiteral::String(name.clone())),
                                value,
                                JsExpr::Literal(JsLiteral::Boolean(true)),
                            ]
                        } else {
                            vec![JsExpr::Literal(JsLiteral::String(name.clone())), value]
                        },
                        optional: false,
                    })));
            }
        }
    }

    // Add captured event handlers
    for event in events_to_capture {
        let attr_str = format!(" {}=\"this.__e=event\"", event);
        state
            .template
            .push(TemplateItem::Expression(JsExpr::Literal(
                JsLiteral::String(attr_str.clone()),
            )));
    }

    content
}

/// Builds element spread attributes using $.attributes().
///
/// This path is taken when the element has spread attributes, which require
/// runtime merging of attributes.
fn build_element_spread_attributes<F>(
    element: &dyn ElementNode,
    attributes: &[&AttributeNode],
    style_directives: &[&StyleDirective],
    class_directives: &[&ClassDirective],
    state: &mut ComponentServerTransformState,
    transform: F,
) where
    F: Fn(JsExpr) -> JsExpr + Clone,
{
    let args = prepare_element_spread(
        element,
        attributes,
        style_directives,
        class_directives,
        state,
        transform,
    );

    let call = JsExpr::Call(JsCallExpression {
        callee: Box::new(JsExpr::Member(JsMemberExpression {
            object: Box::new(JsExpr::Identifier("$".to_string())),
            property: JsMemberProperty::Identifier("attributes".to_string()),
            computed: false,
            optional: false,
        })),
        arguments: args,
        optional: false,
    });

    state.template.push(TemplateItem::Expression(call));
}

/// Prepares arguments for $.attributes() call.
///
/// Returns: [object, css_hash, classes, styles, flags]
fn prepare_element_spread<F>(
    element: &dyn ElementNode,
    attributes: &[&AttributeNode],
    style_directives: &[&StyleDirective],
    class_directives: &[&ClassDirective],
    state: &ComponentServerTransformState,
    transform: F,
) -> Vec<JsExpr>
where
    F: Fn(JsExpr) -> JsExpr + Clone,
{
    let mut flags = 0;

    // Calculate flags
    if element.is_svg() || element.is_mathml() {
        flags |= ELEMENT_IS_NAMESPACED | ELEMENT_PRESERVE_ATTRIBUTE_CASE;
    } else if is_custom_element_node(element.get_name()) {
        flags |= ELEMENT_PRESERVE_ATTRIBUTE_CASE;
    } else if element.get_name() == "input" {
        flags |= ELEMENT_IS_INPUT;
    }

    // Build attribute object
    let mut properties: Vec<JsObjectMember> = Vec::new();
    for attr in attributes {
        let name = get_attribute_name(element, &attr.name);
        let value = build_attribute_value(
            &attr.value,
            transform.clone(),
            WHITESPACE_INSENSITIVE_ATTRIBUTES.contains(&name.as_str()),
            false,
        );

        properties.push(JsObjectMember::Property(JsProperty {
            key: JsPropertyKey::Identifier(name.clone()),
            value: Box::new(value),
            kind: JsPropertyKind::Init,
            computed: false,
            shorthand: false,
        }));
    }

    let object = JsExpr::Object(JsObjectExpression { properties });

    let mut args = vec![object];

    // CSS hash
    let css_hash = if element.is_scoped() {
        Some(JsExpr::Literal(JsLiteral::String(
            state.analysis.css.hash.clone(),
        )))
    } else {
        None
    };
    args.push(css_hash.unwrap_or_else(|| JsExpr::Identifier("undefined".to_string())));

    // Classes
    let classes = if !class_directives.is_empty() {
        let properties = class_directives
            .iter()
            .map(|dir| {
                JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Identifier(dir.name.to_string()),
                    value: Box::new(JsExpr::Identifier(dir.name.to_string())), // TODO: Visit expression
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                })
            })
            .collect();
        Some(JsExpr::Object(JsObjectExpression { properties }))
    } else {
        None
    };
    args.push(classes.unwrap_or_else(|| JsExpr::Identifier("undefined".to_string())));

    // Styles
    let styles = if !style_directives.is_empty() {
        let properties = style_directives
            .iter()
            .map(|dir| {
                let value = if matches!(dir.value, AttributeValue::True(_)) {
                    JsExpr::Identifier(dir.name.to_string())
                } else {
                    build_attribute_value(&dir.value, transform.clone(), true, false)
                };

                JsObjectMember::Property(JsProperty {
                    key: make_property_key(dir.name.to_string()),
                    value: Box::new(value),
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                })
            })
            .collect();
        Some(JsExpr::Object(JsObjectExpression { properties }))
    } else {
        None
    };
    args.push(styles.unwrap_or_else(|| JsExpr::Identifier("undefined".to_string())));

    // Flags
    if flags != 0 {
        args.push(JsExpr::Literal(JsLiteral::Number(flags as f64)));
    }

    args
}

/// Builds a class attribute with directives.
fn build_attr_class<F>(
    class_directives: &[&ClassDirective],
    expression: JsExpr,
    css_hash: Option<&str>,
    _transform: F,
) -> JsExpr
where
    F: Fn(JsExpr) -> JsExpr + Clone,
{
    let directives = if !class_directives.is_empty() {
        let properties = class_directives
            .iter()
            .map(|dir| {
                JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Literal(JsLiteral::String(dir.name.to_string())),
                    value: Box::new(JsExpr::Identifier(dir.name.to_string())), // TODO: Visit expression
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                })
            })
            .collect();
        Some(JsExpr::Object(JsObjectExpression { properties }))
    } else {
        None
    };

    let css_hash_expr = css_hash.map(|hash| JsExpr::Literal(JsLiteral::String(hash.to_string())));

    JsExpr::Call(JsCallExpression {
        callee: Box::new(JsExpr::Member(JsMemberExpression {
            object: Box::new(JsExpr::Identifier("$".to_string())),
            property: JsMemberProperty::Identifier("attr_class".to_string()),
            computed: false,
            optional: false,
        })),
        arguments: vec![
            expression,
            css_hash_expr.unwrap_or_else(|| JsExpr::Identifier("undefined".to_string())),
            directives.unwrap_or_else(|| JsExpr::Identifier("undefined".to_string())),
        ],
        optional: false,
    })
}

/// Builds a style attribute with directives.
fn build_attr_style<F>(
    style_directives: &[&StyleDirective],
    expression: JsExpr,
    transform: F,
) -> JsExpr
where
    F: Fn(JsExpr) -> JsExpr + Clone,
{
    let directives = if !style_directives.is_empty() {
        // Separate normal and important properties
        let mut normal_properties = Vec::new();
        let mut important_properties = Vec::new();

        for dir in style_directives {
            let value = if matches!(dir.value, AttributeValue::True(_)) {
                JsExpr::Identifier(dir.name.to_string())
            } else {
                build_attribute_value(&dir.value, transform.clone(), true, false)
            };

            let mut name = dir.name.to_string();
            // Lowercase unless it's a custom property (--var)
            if !name.starts_with("--") {
                name = name.to_lowercase();
            }

            let property = JsObjectMember::Property(JsProperty {
                key: make_property_key(name),
                value: Box::new(value),
                kind: JsPropertyKind::Init,
                computed: false,
                shorthand: false,
            });

            if dir.modifiers.iter().any(|m| m.as_str() == "important") {
                important_properties.push(property);
            } else {
                normal_properties.push(property);
            }
        }

        if !important_properties.is_empty() {
            Some(JsExpr::Array(JsArrayExpression {
                elements: vec![
                    Some(JsExpr::Object(JsObjectExpression {
                        properties: normal_properties,
                    })),
                    Some(JsExpr::Object(JsObjectExpression {
                        properties: important_properties,
                    })),
                ],
            }))
        } else {
            Some(JsExpr::Object(JsObjectExpression {
                properties: normal_properties,
            }))
        }
    } else {
        None
    };

    JsExpr::Call(JsCallExpression {
        callee: Box::new(JsExpr::Member(JsMemberExpression {
            object: Box::new(JsExpr::Identifier("$".to_string())),
            property: JsMemberProperty::Identifier("attr_style".to_string()),
            computed: false,
            optional: false,
        })),
        arguments: vec![
            expression,
            directives.unwrap_or_else(|| JsExpr::Identifier("undefined".to_string())),
        ],
        optional: false,
    })
}

// =============================================================================
// Helper functions
// =============================================================================

/// Check if a string is a valid JavaScript identifier.
fn is_valid_js_identifier(s: &str) -> bool {
    if s.is_empty() {
        return false;
    }
    let mut chars = s.chars();
    // First character must be a letter, underscore, or dollar sign
    let first = chars.next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }
    // Rest can also include digits
    chars.all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// Creates a JsPropertyKey, using Literal for invalid identifiers (e.g., kebab-case).
fn make_property_key(name: String) -> JsPropertyKey {
    if is_valid_js_identifier(&name) {
        JsPropertyKey::Identifier(name)
    } else {
        JsPropertyKey::Literal(JsLiteral::String(name))
    }
}

/// Gets the normalized attribute name for an element.
fn get_attribute_name(element: &dyn ElementNode, name: &str) -> String {
    if !element.is_svg() && !element.is_mathml() {
        name.to_lowercase()
    } else {
        name.to_string()
    }
}

/// Checks if an attribute is an event attribute.
fn is_event_attribute(name: &str) -> bool {
    name.starts_with("on")
}

/// Checks if an element supports load/error events.
fn is_load_error_element(name: &str) -> bool {
    matches!(
        name,
        "body" | "embed" | "iframe" | "img" | "link" | "object" | "script" | "style" | "track"
    )
}

/// Checks if an attribute value is text-only.
fn is_text_attribute(value: &AttributeValue) -> bool {
    matches!(value, AttributeValue::Sequence(_) | AttributeValue::True(_))
}

// =============================================================================
// Element node trait
// =============================================================================

/// Trait for element-like nodes.
pub trait ElementNode {
    fn get_name(&self) -> &str;
    fn get_attributes(&self) -> &[Attribute];
    fn is_scoped(&self) -> bool;
    fn is_svg(&self) -> bool;
    fn is_mathml(&self) -> bool;
}

impl ElementNode for RegularElement {
    fn get_name(&self) -> &str {
        &self.name
    }

    fn get_attributes(&self) -> &[Attribute] {
        &self.attributes
    }

    fn is_scoped(&self) -> bool {
        // TODO: Check metadata.scoped
        false
    }

    fn is_svg(&self) -> bool {
        // TODO: Check metadata.svg
        false
    }

    fn is_mathml(&self) -> bool {
        // TODO: Check metadata.mathml
        false
    }
}

impl ElementNode for SvelteDynamicElement {
    fn get_name(&self) -> &str {
        "svelte:element"
    }

    fn get_attributes(&self) -> &[Attribute] {
        &self.attributes
    }

    fn is_scoped(&self) -> bool {
        // TODO: Check metadata.scoped
        false
    }

    fn is_svg(&self) -> bool {
        // TODO: Check metadata.svg
        false
    }

    fn is_mathml(&self) -> bool {
        // TODO: Check metadata.mathml
        false
    }
}
