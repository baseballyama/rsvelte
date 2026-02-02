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
///
/// The slot attribute is only valid:
/// 1. As a direct child of a component (Component, SvelteComponent, SvelteSelf)
/// 2. As a descendant of a custom element (with no component in between)
///
/// The key insight is that we need to find the NEAREST "slot owner" (component or custom element).
/// If the nearest owner is a component, we must be its direct child.
/// If the nearest owner is a custom element, we're always OK.
///
/// Corresponds to `validate_slot_attribute` in shared/attribute.js.
pub fn validate_slot_attribute(
    context: &VisitorContext,
    _attribute: &AttributeNode,
) -> Result<(), AnalysisError> {
    // Check if we're a direct child of a component
    if context.is_direct_child_of_component {
        return Ok(());
    }

    // Find the nearest slot owner (last item in the stack)
    if let Some(nearest_owner) = context.slot_owner_ancestors.last() {
        match nearest_owner {
            super::super::SlotOwnerType::CustomElement => {
                // Custom element owner - slots are always valid inside custom elements
                return Ok(());
            }
            super::super::SlotOwnerType::Component => {
                // Component owner - we must be a direct child, but we're not (checked above)
                return Err(super::super::super::errors::slot_attribute_invalid_placement());
            }
        }
    }

    // No slot owner found - not in a valid position for slot attribute
    Err(super::super::super::errors::slot_attribute_invalid_placement())
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

/// Check if an expression is an unparenthesized sequence expression.
///
/// In runes mode, sequence expressions like `foo={x, y, z}` are not allowed
/// unless they are wrapped in parentheses: `foo={(x, y, z)}`.
///
/// Corresponds to `disallow_unparenthesized_sequences` in utils/ast.js.
pub fn is_unparenthesized_sequence_expression(
    expression_tag: &ExpressionTag,
    source: &str,
) -> bool {
    // Check if it's a SequenceExpression
    if let Some(expr_type) = expression_tag.expression.node_type()
        && expr_type == "SequenceExpression"
    {
        // Check if it's parenthesized by looking at the source before the expression start
        if let Some(start) = expression_tag.expression.start() {
            let mut i = start as usize;
            // Walk backwards from the expression start to find '(' or '{'
            while i > 0 {
                i -= 1;
                if i >= source.len() {
                    break;
                }
                let ch = source.chars().nth(i);
                match ch {
                    Some('(') => {
                        // Expression is parenthesized
                        return false;
                    }
                    Some('{') => {
                        // Found opening brace without parenthesis - unparenthesized
                        return true;
                    }
                    Some(c) if c.is_whitespace() => {
                        // Skip whitespace
                        continue;
                    }
                    _ => {
                        // Some other character - continue looking
                        continue;
                    }
                }
            }
        }
    }
    false
}
