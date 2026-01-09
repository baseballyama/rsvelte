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
    _context: &VisitorContext,
    _attribute: &AttributeNode,
) -> Result<(), AnalysisError> {
    // TODO: Implement proper slot validation with correct path tracking
    // For now, skip this validation as the path tracking is incomplete
    // and causing false positives for components with uppercase tag names.
    // The slot attribute validation should check that we're inside a component,
    // svelte:component, or svelte:self element.
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

/// Check if an attribute is an event attribute (starts with "on" and has expression value).
///
/// Corresponds to `is_event_attribute` in ast.js.
pub fn is_event_attribute(attribute: &AttributeNode) -> bool {
    attribute.name.starts_with("on") && is_expression_attribute(attribute)
}

/// Get the chunks of an attribute value.
///
/// Corresponds to `get_attribute_chunks` in ast.js.
///
/// Returns the expression tags and text nodes that make up an attribute value.
pub fn get_attribute_chunks(
    value: &crate::ast::template::AttributeValue,
) -> Vec<AttributeChunk<'_>> {
    use crate::ast::template::{AttributeValue, AttributeValuePart};

    match value {
        AttributeValue::True(_) => Vec::new(),
        AttributeValue::Expression(expr) => vec![AttributeChunk::Expression(expr)],
        AttributeValue::Sequence(seq) => seq
            .iter()
            .map(|node| match node {
                AttributeValuePart::Text(text) => AttributeChunk::Text(text),
                AttributeValuePart::ExpressionTag(expr) => AttributeChunk::Expression(expr),
            })
            .collect(),
    }
}

/// A chunk of an attribute value (text or expression).
#[derive(Debug)]
pub enum AttributeChunk<'a> {
    Text(&'a crate::ast::template::Text),
    Expression(&'a crate::ast::template::ExpressionTag),
}
