//! SvelteElement visitor.
//!
//! Analyzes <svelte:element> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteElement.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, SvelteDynamicElement};
use rustc_hash::FxHashSet;

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

    // Extract class names and ID from svelte:element attributes for CSS selector detection.
    // Since svelte:element can resolve to any element, we still need to know which classes
    // are used so the CSS pruner can keep the right selectors.
    let mut element_classes = rustc_hash::FxHashSet::default();
    let mut element_id = None;

    for attr in &element.attributes {
        match attr {
            Attribute::Attribute(attr_node) if attr_node.name == "class" => {
                match &attr_node.value {
                    AttributeValue::Sequence(parts) => {
                        for part in parts {
                            match part {
                                AttributeValuePart::Text(text) => {
                                    for class_name in text.data.split_whitespace() {
                                        context
                                            .analysis
                                            .css
                                            .used_classes
                                            .insert(class_name.to_string());
                                        element_classes.insert(class_name.to_string());
                                    }
                                }
                                AttributeValuePart::ExpressionTag(_) => {
                                    context.analysis.css.has_dynamic_classes = true;
                                }
                            }
                        }
                    }
                    AttributeValue::Expression(_) => {
                        context.analysis.css.has_dynamic_classes = true;
                    }
                    _ => {}
                }
            }
            Attribute::Attribute(attr_node) if attr_node.name == "id" => {
                if let AttributeValue::Sequence(parts) = &attr_node.value
                    && parts.len() == 1
                    && let Some(AttributeValuePart::Text(text)) = parts.first()
                {
                    element_id = Some(text.data.to_string());
                }
            }
            Attribute::ClassDirective(cd) => {
                context
                    .analysis
                    .css
                    .used_classes
                    .insert(cd.name.to_string());
                element_classes.insert(cd.name.to_string());
            }
            _ => {}
        }
    }

    // Create DOM element for CSS sibling combinator detection
    let parent_idx = context.current_parent_idx();
    let is_root_child = context.dom_element_stack.is_empty();
    let dom_element = super::super::types::CssDomElement {
        tag_name: String::new(), // Dynamic tag, will use is_dynamic_tag
        classes: element_classes,
        id: element_id,
        static_attributes: Vec::new(), // Dynamic element, no static attributes
        dynamic_attribute_names: FxHashSet::default(),
        has_spread: false,
        has_class_directive: false,
        has_style_directive: false,
        parent_idx,
        children_idx: Vec::new(),
        is_root_child,
        possible_prev_adjacent: Vec::new(),
        possible_next_adjacent: Vec::new(),
        possible_prev_general: Vec::new(),
        possible_next_general: Vec::new(),
        has_content: !element.fragment.nodes.is_empty(),
        has_opaque_content: false, // Dynamic element, conservatively handled via is_dynamic_tag
        is_dynamic_tag: true,
        prev_is_opaque_boundary: false,
        prev_has_opaque_boundary: false,
    };

    let element_idx = context.add_dom_element(dom_element);

    // Update parent's children list
    if let Some(parent_idx) = parent_idx
        && parent_idx < context.analysis.css.dom_structure.elements.len()
    {
        context.analysis.css.dom_structure.elements[parent_idx]
            .children_idx
            .push(element_idx);
    }

    // Check that svelte:element has a 'this' attribute with a value
    // The 'tag' field is populated from the 'this' attribute during parsing
    // If it's null/undefined or empty, the 'this' attribute is missing or has no value
    let has_valid_this = {
        let value = element.tag.as_json();
        // Check if it's a non-null value
        !value.is_null()
    };

    if !has_valid_this {
        return Err(errors::svelte_element_missing_this());
    }

    // Analyze the 'this' expression to track template references
    // This is crucial for legacy state promotion to work correctly
    let tag_value = element.tag.as_json();
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

    // Push this element index to DOM element stack for tracking children
    context.dom_element_stack.push(element_idx);

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

    // Pop this element from DOM element stack
    context.dom_element_stack.pop();

    // Restore context
    context.fragment_owner_stack.pop();
    context.slot_owner_ancestors.pop();
    context.is_direct_child_of_component = was_direct_child;

    Ok(())
}
