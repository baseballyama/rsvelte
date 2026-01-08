//! RegularElement visitor.
//!
//! Analyzes regular HTML elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/RegularElement.js`.

use super::super::AnalysisError;
use super::super::types::ElementInfo;
use super::VisitorContext;
use super::shared::a11y::check_element as a11y_check;
use super::shared::element::validate_element;
use super::shared::fragment;
use crate::ast::template::{Attribute, RegularElement};

/// Visit a regular element.
pub fn visit(element: &RegularElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate the element
    validate_element(element, context)?;

    // Check accessibility
    a11y_check(element, context)?;

    // Track element info for CSS analysis
    let has_spread = element
        .attributes
        .iter()
        .any(|attr| matches!(attr, Attribute::SpreadAttribute(_)));

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

    // Extract class and id values from attributes
    for attr in &element.attributes {
        match attr {
            Attribute::Attribute(attr_node) => {
                if attr_node.name == "class" {
                    extract_classes_from_value(&attr_node.value, context);
                } else if attr_node.name == "id" {
                    extract_id_from_value(&attr_node.value, context);
                }
            }
            Attribute::ClassDirective(class_dir) => {
                context
                    .analysis
                    .css
                    .used_classes
                    .insert(class_dir.name.to_string());
            }
            _ => {}
        }
    }

    // Save parent element and set new one
    let old_parent = context.parent_element.clone();
    context.parent_element = Some(element.name.to_string());

    // Analyze children
    fragment::analyze(&element.fragment, context)?;

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
