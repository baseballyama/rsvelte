//! Element validation utilities.
//!
//! Functions for validating elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/element.js`.

use super::super::super::AnalysisError;
use super::super::VisitorContext;
use super::attribute::{
    is_expression_attribute, validate_attribute, validate_attribute_name, validate_slot_attribute,
};
use crate::ast::template::{Attribute, RegularElement, SvelteElement};

/// Event modifiers that are valid for on: directives.
pub const EVENT_MODIFIERS: &[&str] = &[
    "preventDefault",
    "stopPropagation",
    "stopImmediatePropagation",
    "capture",
    "once",
    "passive",
    "nonpassive",
    "self",
    "trusted",
];

/// Validate an element and its attributes.
pub fn validate_element(
    element: &RegularElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let mut has_animate_directive = false;
    let mut in_transition = false;
    let mut out_transition = false;

    for attribute in &element.attributes {
        match attribute {
            Attribute::Attribute(attr) => {
                // Validate the attribute
                if context.analysis.runes {
                    validate_attribute(attr, element)?;
                }

                validate_attribute_name(attr)?;

                // Check for slot attribute
                if attr.name == "slot" {
                    validate_slot_attribute(context, attr)?;
                }

                // Check for React-style attributes
                if let Some(_correct_name) =
                    super::attribute::get_correct_attribute_name(&attr.name)
                {
                    // Would generate a warning here
                }

                // Check for event handlers
                if attr.name.starts_with("on")
                    && attr.name.len() > 2
                    && !is_expression_attribute(attr)
                {
                    return Err(AnalysisError::Validation(format!(
                        "Event handler '{}' must be an expression",
                        attr.name
                    )));
                }
            }
            Attribute::AnimateDirective(_directive) => {
                // Check animate directive placement
                let in_each =
                    context.path.iter().rev().any(|node| {
                        matches!(node, crate::ast::template::TemplateNode::EachBlock(_))
                    });

                if !in_each {
                    return Err(AnalysisError::Validation(
                        "animate directive can only be used inside an {#each} block".to_string(),
                    ));
                }

                if has_animate_directive {
                    return Err(AnalysisError::Validation(
                        "An element can only have one animate directive".to_string(),
                    ));
                }

                has_animate_directive = true;
            }
            Attribute::TransitionDirective(directive) => {
                // Check for duplicate transitions
                let is_in = directive.intro;
                let is_out = directive.outro;

                if (is_in && in_transition) || (is_out && out_transition) {
                    return Err(AnalysisError::Validation(
                        "An element can only have one in/out/transition directive".to_string(),
                    ));
                }

                if is_in {
                    in_transition = true;
                }
                if is_out {
                    out_transition = true;
                }
            }
            Attribute::OnDirective(directive) => {
                // Validate event modifiers
                for modifier in &directive.modifiers {
                    if !EVENT_MODIFIERS.contains(&modifier.as_str()) {
                        return Err(AnalysisError::Validation(format!(
                            "Invalid event modifier '{}'. Valid modifiers are: {}",
                            modifier,
                            EVENT_MODIFIERS.join(", ")
                        )));
                    }
                }

                // Check for conflicting modifiers
                let has_passive = directive.modifiers.iter().any(|m| m == "passive");
                let has_nonpassive = directive.modifiers.iter().any(|m| m == "nonpassive");
                let has_prevent_default = directive.modifiers.iter().any(|m| m == "preventDefault");

                if has_passive && (has_nonpassive || has_prevent_default) {
                    return Err(AnalysisError::Validation(
                        "The 'passive' modifier cannot be combined with 'nonpassive' or 'preventDefault'".to_string(),
                    ));
                }
            }
            _ => {}
        }
    }

    Ok(())
}

/// Validate a svelte:element.
pub fn validate_svelte_element(
    _element: &SvelteElement,
    _context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // svelte:element requires a `this` expression
    // This is checked during parsing, but we can validate it here too

    Ok(())
}
