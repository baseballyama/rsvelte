//! RegularElement visitor for client-side transformation.
//!
//! Corresponds to `RegularElement.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/RegularElement.js`.
//!
//! This visitor handles regular HTML elements like `<div>`, `<span>`, etc.
//!
//! # Implementation Status
//!
//! This is a skeleton implementation. The full implementation requires:
//!
//! 1. Proper handling of all attribute types (regular attributes, directives, spread)
//! 2. Class and style directive merging
//! 3. Special handling for input/textarea/select elements
//! 4. Child node processing with whitespace trimming
//! 5. Template optimization (static vs dynamic attributes)
//! 6. Event handler attachment
//! 7. Binding directive processing
//! 8. Custom element support
//!
//! See the JavaScript implementation at:
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/RegularElement.js`

use crate::ast::template::{AttributeNode, AttributeValue, RegularElement as RegularElementNode};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;

/// Visit a regular element node.
///
/// Corresponds to `RegularElement()` function in RegularElement.js.
///
/// # Current Implementation
///
/// This is a minimal skeleton that:
/// - Pushes the element tag to the template
/// - Handles the <noscript> special case
/// - Pops the element from the template
///
/// # TODO
///
/// - Categorize and process attributes (regular, class:, style:, bind:, on:, use:, etc.)
/// - Handle spread attributes
/// - Optimize static vs dynamic attributes
/// - Process child nodes
/// - Handle special cases (input defaults, textarea content, select synchronization)
/// - Generate element attribute update calls
/// - Handle custom elements
pub fn visit_regular_element(
    node: &RegularElementNode,
    context: &mut ComponentContext,
) -> TransformResult {
    // Push element to template
    context.state.template.push_element(&node.name, node.start);

    // Handle <noscript> - it's skipped entirely
    if node.name == "noscript" {
        context.state.template.pop_element();
        return TransformResult::None;
    }

    // TODO: Track needs_import_node for custom elements and video
    // context.state.template.needs_import_node ||= node.name == "video" || is_custom_element;

    // TODO: Track script tags
    // context.state.template.contains_script_tag ||= node.name == "script";

    // TODO: Categorize attributes into different groups:
    // - Regular attributes
    // - Class directives
    // - Style directives
    // - Bind directives
    // - On directives
    // - Spread attributes
    // - Let directives
    // - Use directives
    // - Transition/Animate directives

    // TODO: Process let directives first

    // TODO: Handle special cases for input/textarea/select elements

    // TODO: Build attributes (static in template, dynamic with effects)

    // TODO: Process child nodes

    // TODO: Handle special value attributes for option/select elements

    context.state.template.pop_element();
    TransformResult::None
}

/// Check if a node is a custom element.
///
/// Custom elements have hyphenated names or are configured via compiler options.
#[allow(dead_code)]
fn is_custom_element_node(_node: &RegularElementNode) -> bool {
    // TODO: Implement custom element detection
    // This would check:
    // 1. If the tag name contains a hyphen
    // 2. If it's in the customElements registry
    // 3. If customElement compiler option is set
    false
}

/// Check if an element is a load/error event target.
///
/// These elements need special handling to replay events during hydration.
#[allow(dead_code)]
fn is_load_error_element(name: &str) -> bool {
    matches!(name, "img" | "iframe" | "link" | "script")
}

/// Check if an attribute is a text attribute (static string).
///
/// Text attributes can be set directly in the template HTML.
#[allow(dead_code)]
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

/// Extract text value from a text attribute.
#[allow(dead_code)]
fn extract_text_value(attr: &AttributeNode) -> String {
    use crate::ast::template::AttributeValuePart;

    match &attr.value {
        AttributeValue::True(_) => "true".to_string(),
        AttributeValue::Sequence(parts) => parts
            .iter()
            .filter_map(|p| match p {
                AttributeValuePart::Text(t) => Some(t.data.as_str()),
                _ => None,
            })
            .collect::<Vec<_>>()
            .join(""),
        _ => String::new(),
    }
}

/// Get the attribute name (normalized).
///
/// For most attributes, this is just the attribute name.
/// For some attributes (like xlink:href), normalization may be needed.
#[allow(dead_code)]
fn get_attribute_name(_node: &RegularElementNode, attr: &AttributeNode) -> String {
    // TODO: Implement proper attribute name normalization
    // - Handle xlink:* attributes
    // - Handle xmlns attributes
    // - Lowercase for HTML mode
    attr.name.to_string()
}

/// Check if an attribute cannot be set statically in the template.
///
/// These attributes must be set via JavaScript because they have
/// special behavior or side effects.
#[allow(dead_code)]
fn cannot_be_set_statically(name: &str) -> bool {
    matches!(
        name,
        "value" | "checked" | "selected" | "innerHTML" | "innerText" | "textContent"
    )
}

/// Check if an attribute is a boolean attribute.
///
/// Boolean attributes are set by presence/absence rather than value.
#[allow(dead_code)]
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
///
/// DOM properties are set via element.property = value
/// rather than element.setAttribute(name, value).
#[allow(dead_code)]
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
#[allow(dead_code)]
fn is_event_attribute(attr: &AttributeNode) -> bool {
    attr.name.starts_with("on")
}

/// Determine namespace for child elements.
///
/// SVG and foreignObject elements change the namespace.
#[allow(dead_code)]
fn determine_namespace_for_children(node: &RegularElementNode, parent_namespace: &str) -> String {
    match node.name.as_str() {
        "svg" => "svg".to_string(),
        "foreignObject" => "html".to_string(),
        _ => parent_namespace.to_string(),
    }
}

// ============================================================================
// Helper functions for building JavaScript AST nodes
// ============================================================================

/// Build element attribute update expression.
///
/// This generates the appropriate call to set an attribute:
/// - Special handling for muted, value, checked, selected
/// - Special handling for defaultValue, defaultChecked
/// - DOM property assignment for known properties
/// - $.set_attribute() or $.set_xlink_attribute() for others
#[allow(dead_code)]
fn build_element_attribute_update(
    _element: &RegularElementNode,
    node_id: &str,
    name: &str,
    value: JsExpr,
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

    // TODO: Handle defaultValue and defaultChecked

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

/// Extract node name from an identifier expression.
#[allow(dead_code)]
fn extract_node_name(expr: &JsExpr) -> String {
    match expr {
        JsExpr::Identifier(name) => name.clone(),
        _ => "node".to_string(),
    }
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

    #[test]
    fn test_is_load_error_element() {
        assert!(is_load_error_element("img"));
        assert!(is_load_error_element("iframe"));
        assert!(is_load_error_element("script"));
        assert!(!is_load_error_element("div"));
        assert!(!is_load_error_element("span"));
    }
}
