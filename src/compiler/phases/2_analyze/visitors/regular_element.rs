//! RegularElement visitor.
//!
//! Analyzes regular HTML elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/RegularElement.js`.

use super::super::AnalysisError;
use super::super::types::{CssDomElement, ElementInfo};
use super::VisitorContext;
use super::shared::a11y::check_element as a11y_check;
use super::shared::element::validate_element;
use super::shared::fragment;
use crate::ast::template::{Attribute, RegularElement};
use std::collections::HashSet;

/// Visit a regular element.
pub fn visit(element: &RegularElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate the element
    validate_element(element, context)?;

    // Check accessibility
    let path_refs: Vec<&_> = context.path.to_vec();
    a11y_check(element, &path_refs);

    // Track element info for CSS analysis
    let has_spread = element
        .attributes
        .iter()
        .any(|attr| matches!(attr, Attribute::SpreadAttribute(_)));

    // If element has spread attributes, classes could come from spread
    if has_spread {
        context.analysis.css.has_dynamic_classes = true;
    }

    let has_dynamic_attributes = element.attributes.iter().any(|attr| match attr {
        Attribute::Attribute(a) => {
            matches!(
                &a.value,
                crate::ast::template::AttributeValue::Expression(_)
            )
        }
        _ => false,
    });

    context.analysis.template.elements.push(ElementInfo {
        name: element.name.to_string(),
        start: element.start as usize,
        end: element.end as usize,
        has_dynamic_attributes,
        has_spread,
    });

    // Track element name for CSS selector matching
    context
        .analysis
        .css
        .used_elements
        .insert(element.name.to_string());

    // Collect class names and id for DOM structure
    let mut classes = HashSet::new();
    let mut id = None;

    // Extract class and id values from attributes
    for attr in &element.attributes {
        match attr {
            Attribute::Attribute(attr_node) => {
                if attr_node.name == "class" {
                    extract_classes_from_value(&attr_node.value, context);
                    // Also collect for DOM structure
                    collect_classes_from_value(&attr_node.value, &mut classes);
                } else if attr_node.name == "id" {
                    extract_id_from_value(&attr_node.value, context);
                    // Also collect for DOM structure
                    id = collect_id_from_value(&attr_node.value);
                }
            }
            Attribute::ClassDirective(class_dir) => {
                context
                    .analysis
                    .css
                    .used_classes
                    .insert(class_dir.name.to_string());
                classes.insert(class_dir.name.to_string());
            }
            _ => {}
        }
    }

    // Add element to DOM structure for CSS selector matching
    let parent_idx = context.current_parent_idx();
    let is_root_child = parent_idx.is_none();

    let dom_element = CssDomElement {
        tag_name: element.name.to_string(),
        classes,
        id,
        parent_idx,
        children_idx: Vec::new(),
        is_root_child,
        possible_prev_adjacent: Vec::new(),
        possible_next_adjacent: Vec::new(),
        possible_prev_general: Vec::new(),
        possible_next_general: Vec::new(),
    };

    let element_idx = context.add_dom_element(dom_element);

    // Update parent's children list
    if let Some(parent_idx) = parent_idx {
        context.analysis.css.dom_structure.elements[parent_idx]
            .children_idx
            .push(element_idx);
    }

    // Save parent element and set new one
    let old_parent = context.parent_element.clone();
    context.parent_element = Some(element.name.to_string());

    // Push current element to stack for children
    context.dom_element_stack.push(element_idx);

    // Increment element depth for child analysis
    context.element_depth += 1;

    // Analyze children
    fragment::analyze(&element.fragment, context)?;

    // Decrement element depth
    context.element_depth -= 1;

    // Pop from stack
    context.dom_element_stack.pop();

    // Restore parent element
    context.parent_element = old_parent;

    Ok(())
}

/// Alias for visit function.
pub fn visit_regular_element(
    element: &RegularElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(element, context)
}

fn extract_classes_from_value(
    value: &crate::ast::template::AttributeValue,
    context: &mut VisitorContext,
) {
    use crate::ast::template::{AttributeValue, AttributeValuePart};

    match value {
        AttributeValue::Sequence(parts) => {
            for part in parts {
                match part {
                    AttributeValuePart::Text(text) => {
                        for class in text.data.split_whitespace() {
                            context.analysis.css.used_classes.insert(class.to_string());
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
        AttributeValue::True(_) => {}
    }
}

fn extract_id_from_value(
    value: &crate::ast::template::AttributeValue,
    context: &mut VisitorContext,
) {
    use crate::ast::template::{AttributeValue, AttributeValuePart};

    if let AttributeValue::Sequence(parts) = value {
        for part in parts {
            if let AttributeValuePart::Text(text) = part {
                let id = text.data.trim();
                if !id.is_empty() {
                    context.analysis.css.used_ids.insert(id.to_string());
                }
            }
        }
    }
}

/// Collect class names from attribute value for DOM structure.
fn collect_classes_from_value(
    value: &crate::ast::template::AttributeValue,
    classes: &mut HashSet<String>,
) {
    use crate::ast::template::{AttributeValue, AttributeValuePart};

    if let AttributeValue::Sequence(parts) = value {
        for part in parts {
            if let AttributeValuePart::Text(text) = part {
                for class in text.data.split_whitespace() {
                    classes.insert(class.to_string());
                }
            }
        }
    }
}

/// Collect ID from attribute value for DOM structure.
fn collect_id_from_value(value: &crate::ast::template::AttributeValue) -> Option<String> {
    use crate::ast::template::{AttributeValue, AttributeValuePart};

    if let AttributeValue::Sequence(parts) = value {
        for part in parts {
            if let AttributeValuePart::Text(text) = part {
                let id = text.data.trim();
                if !id.is_empty() {
                    return Some(id.to_string());
                }
            }
        }
    }
    None
}
