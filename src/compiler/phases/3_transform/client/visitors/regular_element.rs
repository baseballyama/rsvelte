//! RegularElement visitor for client-side transformation.
//!
//! Corresponds to `RegularElement.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/RegularElement.js`.
//!
//! This visitor handles regular HTML elements like `<div>`, `<span>`, etc.

// Allow dead code for TODO event handler stubs
#![allow(dead_code)]

use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, RegularElement as RegularElementNode,
};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::shared::element::build_attribute_value;
use crate::compiler::phases::phase3_transform::client::visitors::shared::fragment::process_children;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;

/// Visit a regular element node.
///
/// Corresponds to `RegularElement()` function in RegularElement.js.
pub fn visit_regular_element(
    node: &RegularElementNode,
    context: &mut ComponentContext,
) -> TransformResult {
    // Push element to template
    context
        .state
        .template
        .push_element(node.name.to_string(), node.start);

    // Handle <noscript> - it's skipped entirely
    if node.name == "noscript" {
        context.state.template.pop_element();
        return TransformResult::None;
    }

    let is_custom_element = is_custom_element_node(node);

    // Track needs_import_node for custom elements and video
    if node.name == "video" || is_custom_element {
        context.state.template.needs_import_node = true;
    }

    // Track script tags
    if node.name == "script" {
        context.state.template.contains_script_tag = true;
    }

    // Categorize attributes
    let mut attributes = Vec::new();
    let mut class_directives = Vec::new();
    let mut style_directives = Vec::new();
    let has_spread = node
        .attributes
        .iter()
        .any(|attr| matches!(attr, Attribute::SpreadAttribute(_)));

    for attribute in &node.attributes {
        match attribute {
            Attribute::Attribute(_attr) => {
                attributes.push(attribute.clone());
            }
            Attribute::ClassDirective(dir) => {
                class_directives.push(dir.clone());
            }
            Attribute::StyleDirective(dir) => {
                style_directives.push(dir.clone());
            }
            Attribute::SpreadAttribute(_) => {
                attributes.push(attribute.clone());
            }
            _ => {}
        }
    }

    // Process attributes (excluding directives)
    if !has_spread {
        for attribute in &attributes {
            if let Attribute::Attribute(attr) = attribute {
                // Skip event attributes
                if is_event_attribute(attr) {
                    continue;
                }

                let name = get_attribute_name(node, attr);

                // Static text attributes can go in the template
                let is_true_value = matches!(&attr.value, AttributeValue::True(true));
                if !is_custom_element
                    && !cannot_be_set_statically(&attr.name)
                    && (is_true_value || is_text_attribute(attr))
                    && (name != "class" || class_directives.is_empty())
                    && (name != "style" || style_directives.is_empty())
                {
                    let mut value = if is_text_attribute(attr) {
                        if let AttributeValue::Sequence(parts) = &attr.value {
                            if let crate::ast::template::AttributeValuePart::Text(text) = &parts[0]
                            {
                                text.data.to_string()
                            } else {
                                String::new()
                            }
                        } else {
                            String::new()
                        }
                    } else {
                        String::new()
                    };

                    // Add scoped class if needed
                    if name == "class"
                        && context.state.analysis.css.has_css
                        && !context.state.analysis.css.hash.is_empty()
                    {
                        let hash = &context.state.analysis.css.hash;
                        if value.is_empty() {
                            value = hash.clone();
                        } else {
                            value.push(' ');
                            value.push_str(hash);
                        }
                    }

                    if name != "class" || !value.is_empty() {
                        let prop_value = if is_boolean_attribute(&name) && is_true_value {
                            None
                        } else if is_true_value {
                            Some(String::new())
                        } else {
                            Some(value)
                        };

                        context
                            .state
                            .template
                            .set_prop(attr.name.to_string(), prop_value);
                    }
                } else {
                    // Dynamic attribute - needs runtime handling
                    let result =
                        build_attribute_value(&attr.value, context, |expr, _metadata| expr);

                    let update = build_element_attribute_update(
                        node,
                        &extract_node_id(&context.state.node),
                        &name,
                        result.value,
                        &attributes,
                    );

                    if result.has_state {
                        context.state.update.push(b::stmt(update));
                    } else {
                        context.state.init.push(b::stmt(update));
                    }
                }
            }
        }
    }

    // Process child nodes
    let current_node = context.state.node.clone();
    process_children(
        &node.fragment.nodes,
        |is_text| {
            b::call(
                b::member_path("$.child"),
                vec![
                    current_node.clone(),
                    if is_text {
                        b::boolean(true)
                    } else {
                        b::boolean(false)
                    },
                ],
            )
        },
        true, // is_element
        context,
    );

    // Reset after processing children if needed
    if !node.fragment.nodes.is_empty()
        && node
            .fragment
            .nodes
            .iter()
            .any(|n| !matches!(n, crate::ast::template::TemplateNode::Text(_)))
    {
        context.state.init.push(b::stmt(b::call(
            b::member_path("$.reset"),
            vec![context.state.node.clone()],
        )));
    }

    context.state.template.pop_element();
    TransformResult::None
}

/// Check if a node is a custom element.
fn is_custom_element_node(node: &RegularElementNode) -> bool {
    node.name.contains('-')
        || node.attributes.iter().any(|attr| {
            if let Attribute::Attribute(a) = attr {
                a.name == "is"
            } else {
                false
            }
        })
}

/// Check if an attribute is a text attribute (static string).
fn is_text_attribute(attr: &AttributeNode) -> bool {
    use crate::ast::template::AttributeValuePart;

    match &attr.value {
        AttributeValue::True(_) => false,
        AttributeValue::Expression(_) => false,
        AttributeValue::Sequence(parts) => parts
            .iter()
            .all(|p| matches!(p, AttributeValuePart::Text(_))),
    }
}

/// Get the attribute name (normalized).
fn get_attribute_name(_node: &RegularElementNode, attr: &AttributeNode) -> String {
    attr.name.to_string()
}

/// Check if an attribute cannot be set statically in the template.
fn cannot_be_set_statically(name: &str) -> bool {
    matches!(
        name,
        "value"
            | "checked"
            | "selected"
            | "innerHTML"
            | "innerText"
            | "textContent"
            | "autofocus"
            | "muted"
            | "defaultValue"
            | "defaultChecked"
    )
}

/// Check if an attribute is a boolean attribute.
fn is_boolean_attribute(name: &str) -> bool {
    matches!(
        name,
        "allowfullscreen"
            | "async"
            | "autofocus"
            | "autoplay"
            | "checked"
            | "controls"
            | "default"
            | "defer"
            | "disabled"
            | "formnovalidate"
            | "hidden"
            | "indeterminate"
            | "ismap"
            | "loop"
            | "multiple"
            | "muted"
            | "nomodule"
            | "novalidate"
            | "open"
            | "playsinline"
            | "readonly"
            | "required"
            | "reversed"
            | "selected"
    )
}

/// Check if a name is a DOM property (vs attribute).
fn is_dom_property(name: &str) -> bool {
    matches!(
        name,
        "value"
            | "checked"
            | "selected"
            | "muted"
            | "volume"
            | "currentTime"
            | "playbackRate"
            | "paused"
            | "innerHTML"
            | "innerText"
            | "textContent"
    )
}

/// Check if an attribute is an event attribute (onclick, etc.).
fn is_event_attribute(attr: &AttributeNode) -> bool {
    attr.name.starts_with("on")
}

/// Extract node ID from a JsExpr (identifier name or "node" as fallback).
fn extract_node_id(expr: &JsExpr) -> String {
    match expr {
        JsExpr::Identifier(name) => name.clone(),
        _ => "node".to_string(),
    }
}

/// Build element attribute update expression.
fn build_element_attribute_update(
    element: &RegularElementNode,
    node_id: &str,
    name: &str,
    value: JsExpr,
    attributes: &[Attribute],
) -> JsExpr {
    // Special case: muted (Firefox needs property assignment)
    if name == "muted" {
        return b::assign(b::member(b::id(node_id), "muted"), value);
    }

    // Special case: value
    if name == "value" {
        return b::call(b::member_path("$.set_value"), vec![b::id(node_id), value]);
    }

    // Special case: checked
    if name == "checked" {
        return b::call(b::member_path("$.set_checked"), vec![b::id(node_id), value]);
    }

    // Special case: selected
    if name == "selected" {
        return b::call(
            b::member_path("$.set_selected"),
            vec![b::id(node_id), value],
        );
    }

    // Special case: defaultValue
    if name == "defaultValue" {
        let has_value_attr = attributes.iter().any(|attr| {
            if let Attribute::Attribute(a) = attr {
                a.name == "value" && is_text_attribute(a)
            } else {
                false
            }
        });

        if has_value_attr || (element.name == "textarea" && !element.fragment.nodes.is_empty()) {
            return b::call(
                b::member_path("$.set_default_value"),
                vec![b::id(node_id), value],
            );
        }
    }

    // Special case: defaultChecked
    if name == "defaultChecked" {
        let has_checked_attr = attributes.iter().any(|attr| {
            if let Attribute::Attribute(a) = attr {
                matches!(&a.value, AttributeValue::True(true)) && a.name == "checked"
            } else {
                false
            }
        });

        if has_checked_attr {
            return b::call(
                b::member_path("$.set_default_checked"),
                vec![b::id(node_id), value],
            );
        }
    }

    // DOM property
    if is_dom_property(name) {
        return b::assign(b::member(b::id(node_id), name), value);
    }

    // Regular attribute
    let set_fn = if name.starts_with("xlink") {
        "$.set_xlink_attribute"
    } else {
        "$.set_attribute"
    };

    b::call(
        b::member_path(set_fn),
        vec![b::id(node_id), b::string(name), value],
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_boolean_attribute() {
        assert!(is_boolean_attribute("checked"));
        assert!(is_boolean_attribute("disabled"));
        assert!(is_boolean_attribute("readonly"));
        assert!(!is_boolean_attribute("value"));
        assert!(!is_boolean_attribute("class"));
    }

    #[test]
    fn test_is_dom_property() {
        assert!(is_dom_property("value"));
        assert!(is_dom_property("checked"));
        assert!(is_dom_property("innerHTML"));
        assert!(!is_dom_property("class"));
        assert!(!is_dom_property("id"));
    }
}
