//! SlotElement visitor.
//!
//! Analyzes `<slot>` elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SlotElement.js`.

use super::super::errors;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, SlotElement};
use crate::compiler::phases::phase2_analyze::{AnalysisError, warnings};

/// Check if an attribute value is a static text value.
fn is_text_attribute(value: &AttributeValue) -> bool {
    match value {
        AttributeValue::Sequence(parts) => {
            parts.len() == 1 && matches!(&parts[0], AttributeValuePart::Text(_))
        }
        _ => false,
    }
}

/// Visit a slot element.
pub fn visit(slot: &mut SlotElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // In runes mode (without custom elements), emit a deprecation warning
    if context.analysis.runes && context.analysis.custom_element.is_none() {
        context.emit_warning(warnings::slot_element_deprecated());
    }

    // Mark that we have control flow affecting sibling relationships
    // (slots inject content from parent components)
    context.analysis.css.has_control_flow = true;
    context.analysis.css.has_opaque_elements = true;

    // Determine the slot name from attributes
    let mut name = "default".to_string();

    // Validate attributes
    for attr in &slot.attributes {
        match attr {
            Attribute::Attribute(a) => {
                if a.name == "name" {
                    // The 'name' attribute must be static text
                    if !is_text_attribute(&a.value) {
                        return Err(errors::slot_element_invalid_name());
                    }

                    // Extract the name value
                    if let AttributeValue::Sequence(parts) = &a.value
                        && let Some(AttributeValuePart::Text(text)) = parts.first()
                    {
                        // "default" is a reserved word
                        if text.data.as_str() == "default" {
                            return Err(errors::slot_element_invalid_name_default());
                        }
                        name = text.data.to_string();
                    }
                }
                // Other attributes are allowed (except for the ones checked below)
            }
            Attribute::SpreadAttribute(_) | Attribute::LetDirective(_) => {
                // SpreadAttribute and LetDirective are allowed
            }
            _ => {
                // All other directives are invalid on slots
                return Err(errors::slot_element_invalid_attribute());
            }
        }
    }

    // Register the slot name - this does NOT set uses_slots
    // uses_slots is only set when $$slots is referenced in JS code (Identifier visitor)
    // This matches the official Svelte compiler (SlotElement.js line 39)
    context.analysis.slot_names.insert(name, String::new());

    // Visit attribute expressions to register template references
    // (e.g., <slot dummy={dummy}> needs `dummy` tracked as template reference)
    // This corresponds to context.next() in the official SlotElement.js visitor
    for attr in &mut slot.attributes {
        match attr {
            Attribute::Attribute(a) => {
                super::attribute::visit_attribute_value_expressions(&mut a.value, context)?;
            }
            Attribute::SpreadAttribute(spread) => {
                super::script::walk_expression(&spread.expression, context)?;
            }
            _ => {}
        }
    }

    // Analyze fallback children
    fragment::analyze(&mut slot.fragment, context)?;

    Ok(())
}
