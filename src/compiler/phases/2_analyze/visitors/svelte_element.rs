//! SvelteElement visitor.
//!
//! Analyzes <svelte:element> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteElement.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::js::Expression;
use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, SvelteDynamicElement};

const NAMESPACE_SVG: &str = "http://www.w3.org/2000/svg";
const NAMESPACE_MATHML: &str = "http://www.w3.org/1998/Math/MathML";

/// Check if an attribute is a text-only attribute (all parts are Text).
fn is_text_attribute(attr: &crate::ast::template::AttributeNode) -> bool {
    match &attr.value {
        AttributeValue::True(_) | AttributeValue::Expression(_) => false,
        AttributeValue::Sequence(parts) => parts
            .iter()
            .all(|p| matches!(p, AttributeValuePart::Text(_))),
    }
}

/// Visit a svelte:element.
pub fn visit(
    element: &mut SvelteDynamicElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Mark that we have dynamic elements (can't safely prune type selectors)
    context.analysis.css.has_dynamic_elements = true;

    // Check that svelte:element has a 'this' attribute with a value
    // The 'tag' field is populated from the 'this' attribute during parsing
    // If it's null/undefined or empty, the 'this' attribute is missing or has no value
    let has_valid_this = match &element.tag {
        Expression::Value(value) => {
            // Check if it's a non-null value
            !value.is_null()
        }
    };

    if !has_valid_this {
        return Err(errors::svelte_element_missing_this());
    }

    // Analyze the 'this' expression to track template references
    // This is crucial for legacy state promotion to work correctly
    let Expression::Value(tag_value) = &element.tag;
    super::script::walk_js_node(tag_value, context)?;

    // Determine SVG/MathML metadata based on xmlns attribute or ancestor context.
    // This follows the official Svelte compiler's SvelteElement.js analysis logic.
    //
    // 1. If the element has a static xmlns attribute, use its value to determine namespace
    // 2. Otherwise, walk ancestors to find the nearest element or component boundary
    let xmlns_attr = element.attributes.iter().find_map(|attr| {
        if let Attribute::Attribute(a) = attr
            && a.name == "xmlns"
            && is_text_attribute(a)
            && let AttributeValue::Sequence(parts) = &a.value
            && let Some(AttributeValuePart::Text(t)) = parts.first()
        {
            return Some(t.data.to_string());
        }
        None
    });

    if let Some(xmlns_value) = xmlns_attr {
        element.metadata.svg = xmlns_value == NAMESPACE_SVG;
        element.metadata.mathml = xmlns_value == NAMESPACE_MATHML;
    } else {
        // Walk element_ancestors (tag names) to determine namespace context.
        // Use element_ancestors instead of context.path to avoid unsafe pointer casts.
        // Walk from innermost to outermost.
        use super::regular_element::is_svg;
        let mut found = false;
        for ancestor_name in context.element_ancestors.iter().rev() {
            if ancestor_name == "foreignObject" {
                element.metadata.svg = false;
                element.metadata.mathml = false;
                found = true;
                break;
            }
            if is_svg(ancestor_name) {
                element.metadata.svg = true;
                element.metadata.mathml = false;
                found = true;
                break;
            }
            if super::regular_element::is_mathml(ancestor_name) {
                element.metadata.svg = false;
                element.metadata.mathml = true;
                found = true;
                break;
            }
        }

        if !found {
            // No SVG/MathML ancestor found, use component namespace defaults
            element.metadata.svg = context.analysis.component_namespace_is_svg;
            element.metadata.mathml = context.analysis.component_namespace_is_mathml;
        }
    }

    // Check for invalid bindings on svelte:element
    // bind:value, bind:files, bind:group can only be used with specific elements
    for attr in &element.attributes {
        if let Attribute::BindDirective(bind) = attr {
            let name = bind.name.as_str();
            match name {
                "value" => {
                    return Err(AnalysisError::validation(
                        "bind_invalid_target",
                        "`bind:value` can only be used with `<input>`, `<textarea>`, `<select>`",
                    ));
                }
                "files" => {
                    return Err(AnalysisError::validation(
                        "bind_invalid_target",
                        "`bind:files` can only be used with `<input type=\"file\">`",
                    ));
                }
                "group" => {
                    return Err(AnalysisError::validation(
                        "bind_invalid_target",
                        "`bind:group` can only be used with `<input type=\"checkbox\">` or `<input type=\"radio\">`",
                    ));
                }
                "checked" => {
                    return Err(AnalysisError::validation(
                        "bind_invalid_target",
                        "`bind:checked` can only be used with `<input type=\"checkbox\">` or `<input type=\"radio\">`",
                    ));
                }
                _ => {}
            }
        }
    }

    // Set up slot ownership context for slot attribute validation.
    // <svelte:element> can dynamically resolve to any element including custom elements,
    // so children with slot attributes should be allowed (they may be valid at runtime).
    // This matches how <svelte:component> allows slot attributes on its children.
    let was_direct_child = context.is_direct_child_of_component;
    context.is_direct_child_of_component = true;
    context
        .slot_owner_ancestors
        .push(super::SlotOwnerType::Component);
    context
        .fragment_owner_stack
        .push(super::FragmentOwnerType::SvelteElement);

    // Save and update the SVG/MathML namespace state for child analysis.
    // Child svelte:element nodes will check these fields to determine their namespace.
    let saved_svg = context.analysis.component_namespace_is_svg;
    let saved_mathml = context.analysis.component_namespace_is_mathml;
    context.analysis.component_namespace_is_svg = element.metadata.svg;
    context.analysis.component_namespace_is_mathml = element.metadata.mathml;

    // Analyze children
    fragment::analyze(&mut element.fragment, context)?;

    // Restore namespace state
    context.analysis.component_namespace_is_svg = saved_svg;
    context.analysis.component_namespace_is_mathml = saved_mathml;

    // Restore context
    context.fragment_owner_stack.pop();
    context.slot_owner_ancestors.pop();
    context.is_direct_child_of_component = was_direct_child;

    Ok(())
}
