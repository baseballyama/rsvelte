//! Attribute validation utilities.
//!
//! Functions for validating attributes on elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/attribute.js`.

use super::super::super::AnalysisError;
use super::super::VisitorContext;
use crate::ast::template::{AttributeNode, ExpressionTag, RegularElement};

/// Illegal characters in attribute names.
const ILLEGAL_ATTRIBUTE_CHARS: &[char] = &['"', '\'', '>', '/', '='];

/// Validate an attribute.
pub fn validate_attribute(
    attribute: &AttributeNode,
    _element: &RegularElement,
) -> Result<(), AnalysisError> {
    // Check for illegal characters in attribute name
    if attribute
        .name
        .chars()
        .any(|c| ILLEGAL_ATTRIBUTE_CHARS.contains(&c))
    {
        return Err(AnalysisError::Validation(format!(
            "Attribute name '{}' contains illegal characters",
            attribute.name
        )));
    }

    Ok(())
}

/// Validate attribute name format.
pub fn validate_attribute_name(attribute: &AttributeNode) -> Result<(), AnalysisError> {
    // Check for empty attribute name
    if attribute.name.is_empty() {
        return Err(AnalysisError::Validation(
            "Attribute name cannot be empty".to_string(),
        ));
    }

    // Check first character
    let first_char = attribute.name.chars().next().unwrap();
    if first_char.is_ascii_digit() {
        return Err(AnalysisError::Validation(format!(
            "Attribute name '{}' cannot start with a digit",
            attribute.name
        )));
    }

    Ok(())
}

/// Validate slot attribute on an element.
pub fn validate_slot_attribute(
    context: &VisitorContext,
    _attribute: &AttributeNode,
) -> Result<(), AnalysisError> {
    // Check if we're inside a component or special element that accepts slots
    let in_valid_parent = context.path.iter().rev().any(|node| {
        matches!(
            node,
            crate::ast::template::TemplateNode::Component(_)
                | crate::ast::template::TemplateNode::SvelteComponent(_)
                | crate::ast::template::TemplateNode::SvelteSelf(_)
        )
    });

    if !in_valid_parent {
        return Err(AnalysisError::Validation(
            "slot attribute can only be used inside a component".to_string(),
        ));
    }

    Ok(())
}

/// Check if an attribute is an expression attribute.
pub fn is_expression_attribute(attribute: &AttributeNode) -> bool {
    use crate::ast::template::AttributeValue;

    matches!(&attribute.value, AttributeValue::Expression(_))
}

/// Get the expression tag from an attribute value.
pub fn get_attribute_expression(attribute: &AttributeNode) -> Option<&ExpressionTag> {
    use crate::ast::template::AttributeValue;

    match &attribute.value {
        AttributeValue::Expression(expr) => Some(expr),
        _ => None,
    }
}

/// Common React attribute name corrections.
pub fn get_correct_attribute_name(name: &str) -> Option<&'static str> {
    match name {
        "className" => Some("class"),
        "htmlFor" => Some("for"),
        _ => None,
    }
}
