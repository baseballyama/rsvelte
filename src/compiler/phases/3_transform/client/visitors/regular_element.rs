//! RegularElement visitor for client-side transformation.
//!
//! Corresponds to `RegularElement.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/RegularElement.js`.
//!
//! This visitor handles regular HTML elements like `<div>`, `<span>`, etc.

// Allow dead code for TODO event handler stubs
#![allow(dead_code)]

use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, RegularElement as RegularElementNode, TemplateNode,
    TransitionDirective,
};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::shared::element::{
    build_attribute_effect, build_attribute_value, build_set_class_call, build_set_style_call,
};
use crate::compiler::phases::phase3_transform::client::visitors::shared::fragment::process_children;
use crate::compiler::phases::phase3_transform::client::visitors::transition_directive::transition_directive;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;
use crate::compiler::phases::phase3_transform::utils::clean_nodes;

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
    let mut on_directives = Vec::new();
    let mut transition_directives: Vec<TransitionDirective> = Vec::new();
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
            Attribute::OnDirective(dir) => {
                on_directives.push(dir.clone());
            }
            Attribute::TransitionDirective(dir) => {
                transition_directives.push(dir.clone());
            }
            Attribute::SpreadAttribute(_) => {
                attributes.push(attribute.clone());
            }
            _ => {}
        }
    }

    // Process attributes (excluding directives)
    if has_spread {
        // Use build_attribute_effect for spread attributes
        // This combines all attributes (including event handlers) into a single $.attribute_effect call
        let node_id = extract_node_id(&context.state.node);
        let node_expr = b::id(&node_id);
        let css_hash = context.state.analysis.css.hash.clone();

        build_attribute_effect(
            &attributes,
            &class_directives,
            &style_directives,
            context,
            node_expr,
            &css_hash,
        );
    } else {
        for attribute in &attributes {
            if let Attribute::Attribute(attr) = attribute {
                // Skip event attributes - they're handled separately below
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

        // Handle class directives
        if !class_directives.is_empty() {
            let node_id = extract_node_id(&context.state.node);
            let node_expr = b::id(&node_id);
            let is_html = context.state.metadata.namespace != "svg";

            let set_class = build_set_class_call(
                node,
                node_expr,
                &class_directives,
                context,
                is_html,
                &context.state.analysis.css.hash.clone(),
            );
            context.state.init.push(b::stmt(set_class));
        }

        // Handle style directives
        if !style_directives.is_empty() {
            let node_id = extract_node_id(&context.state.node);
            let node_expr = b::id(&node_id);

            let set_style = build_set_style_call(node_expr, &style_directives, context);
            context.state.init.push(b::stmt(set_style));
        }
    }

    // Clean child nodes - trim whitespace
    let preserve_whitespace =
        context.state.preserve_whitespace || node.name == "pre" || node.name == "textarea";

    let parent_node = TemplateNode::RegularElement(node.clone());
    let cleaned = clean_nodes(
        Some(&parent_node),
        &node.fragment.nodes,
        &[], // path - not needed for our implementation
        &context.state.metadata.namespace,
        context.state.scope,
        context.state.analysis,
        preserve_whitespace || node.name == "script",
        context.state.options.preserve_comments,
    );

    // Process trimmed child nodes
    let current_node = context.state.node.clone();
    process_children(
        &cleaned.trimmed,
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
    let needs_reset = cleaned
        .trimmed
        .iter()
        .any(|n| !matches!(n, TemplateNode::Text(_)));

    if needs_reset {
        context.state.init.push(b::stmt(b::call(
            b::member_path("$.reset"),
            vec![context.state.node.clone()],
        )));
    }

    // Process event handlers (OnDirective) - only if not using spread
    // When we have a spread, event handlers from on:* directives are still processed separately,
    // but event handlers from attributes (onclick, etc.) are already included in attribute_effect
    if !has_spread {
        for on_directive in &on_directives {
            if let TransformResult::Expression(event_call) =
                context.visit_on_directive(on_directive)
            {
                // Event handlers go into after_update for regular elements
                context.state.after_update.push(b::stmt(event_call));
            }
        }
    } else {
        // With spread, on: directives are still processed separately (they're not in attribute_effect)
        for on_directive in &on_directives {
            if let TransformResult::Expression(event_call) =
                context.visit_on_directive(on_directive)
            {
                // Event handlers go into after_update for regular elements
                context.state.after_update.push(b::stmt(event_call));
            }
        }
    }

    // Process transition directives
    for trans_directive in &transition_directives {
        transition_directive(trans_directive, context);
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
