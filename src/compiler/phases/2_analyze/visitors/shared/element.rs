//! Element validation utilities.
//!
//! Functions for validating elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/element.js`.

use super::super::super::AnalysisError;
use super::super::VisitorContext;
use super::attribute::{
    get_attribute_expression, is_expression_attribute, validate_attribute, validate_attribute_name,
    validate_slot_attribute,
};
use crate::ast::template::{Attribute, RegularElement, SvelteElement};
use crate::compiler::phases::phase2_analyze::errors;
use regex::Regex;
use std::sync::LazyLock;

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

/// Regex for illegal attribute characters.
/// Corresponds to `regex_illegal_attribute_character` in patterns.js.
static REGEX_ILLEGAL_ATTRIBUTE_CHARACTER: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(^[0-9-.])|[\^$@%&#?!|()\[\]{}^*+~;]").unwrap());

/// React attributes that should be corrected to Svelte equivalents.
fn get_react_attribute_correction(name: &str) -> Option<&'static str> {
    match name {
        "className" => Some("class"),
        "htmlFor" => Some("for"),
        _ => None,
    }
}

/// Validate an element and its attributes.
///
/// Corresponds to `validate_element` in the JavaScript implementation.
pub fn validate_element(
    node: &RegularElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let mut has_animate_directive = false;
    let mut in_transition: Option<usize> = None;
    let mut out_transition: Option<usize> = None;

    for (idx, attribute) in node.attributes.iter().enumerate() {
        match attribute {
            Attribute::Attribute(attr) => {
                let is_expression = is_expression_attribute(attr);

                if context.analysis.runes {
                    validate_attribute(attr, node)?;

                    if is_expression && let Some(expression_tag) = get_attribute_expression(attr) {
                        // Check for SequenceExpression
                        if let Some(expr_type) = expression_tag.expression.node_type()
                            && expr_type == "SequenceExpression"
                        {
                            // Check if it's parenthesized
                            if let Some(start) = expression_tag.expression.start() {
                                let mut i = start as usize;
                                let mut is_parenthesized = false;

                                while i > 0 {
                                    i -= 1;
                                    if i >= context.analysis.source.len() {
                                        break;
                                    }
                                    let ch = context.analysis.source.chars().nth(i);
                                    match ch {
                                        Some('(') => {
                                            is_parenthesized = true;
                                            break;
                                        }
                                        Some('{') => {
                                            break;
                                        }
                                        _ => {}
                                    }
                                }

                                if !is_parenthesized {
                                    return Err(errors::attribute_invalid_sequence_expression());
                                }
                            }
                        }
                    }
                }

                // Check for illegal characters in attribute name
                if REGEX_ILLEGAL_ATTRIBUTE_CHARACTER.is_match(&attr.name) {
                    return Err(errors::attribute_invalid_name(&attr.name));
                }

                // Check for event handlers
                if attr.name.starts_with("on") && attr.name.len() > 2 && !is_expression {
                    return Err(errors::attribute_invalid_event_handler());
                }

                // Check for global event reference
                // TODO: Implement proper scope lookup
                // In JavaScript: context.state.scope.get(value.name)
                // In Rust, we need to look up bindings in the scope tree
                // For now, this warning is skipped
                //
                // if let Some(expression_tag) = get_attribute_expression(attr) {
                //     if let Some(expr_type) = expression_tag.expression.node_type() {
                //         if expr_type == "Identifier" {
                //             let expr_value = expression_tag.expression.as_json();
                //             if let Some(name) = expr_value.get("name").and_then(|n| n.as_str()) {
                //                 if name == attr.name {
                //                     // Check if binding exists in scope
                //                     // w.attribute_global_event_reference(attribute, attribute.name)
                //                 }
                //             }
                //         }
                //     }
                // }

                // Validate slot attribute
                if attr.name == "slot" {
                    validate_slot_attribute(context, attr)?;
                }

                // Warn about 'is' attribute (would be a warning in full implementation)
                if attr.name == "is" {
                    // w.attribute_avoid_is(attribute);
                }

                // Check for React-style attributes
                if let Some(_correct_name) = get_react_attribute_correction(&attr.name) {
                    // Would generate warning here:
                    // w.attribute_invalid_property_name(attribute, attribute.name, correct_name)
                }

                validate_attribute_name(attr)?;
            }
            Attribute::AnimateDirective(_directive) => {
                // Check that we're inside an EachBlock
                let parent_idx = context.path.len().saturating_sub(2);
                if parent_idx < context.path.len()
                    && let Some(parent) = context.path.get(parent_idx)
                {
                    let is_each_block =
                        matches!(parent, crate::ast::template::TemplateNode::EachBlock(_));

                    if !is_each_block {
                        return Err(errors::animation_invalid_placement());
                    }

                    // Check for key on the EachBlock
                    if let crate::ast::template::TemplateNode::EachBlock(each) = parent {
                        if each.key.is_none() {
                            return Err(errors::animation_missing_key());
                        }

                        // Check that there's only one child element (excluding comments, empty text, const tags)
                        let non_empty_children = each
                            .body
                            .nodes
                            .iter()
                            .filter(|n| match n {
                                crate::ast::template::TemplateNode::Comment(_) => false,
                                crate::ast::template::TemplateNode::ConstTag(_) => false,
                                crate::ast::template::TemplateNode::Text(text) => {
                                    !text.data.trim().is_empty()
                                }
                                _ => true,
                            })
                            .count();

                        if non_empty_children > 1 {
                            return Err(errors::animation_invalid_placement());
                        }
                    }
                }

                if has_animate_directive {
                    return Err(errors::animation_duplicate());
                } else {
                    has_animate_directive = true;
                }
            }
            Attribute::TransitionDirective(directive) => {
                // Check for duplicate transitions
                let existing = if directive.intro && in_transition.is_some() {
                    in_transition
                } else if directive.outro && out_transition.is_some() {
                    out_transition
                } else {
                    None
                };

                if let Some(existing_idx) = existing {
                    // Get the existing directive to determine conflict type
                    if let Some(Attribute::TransitionDirective(existing_dir)) =
                        node.attributes.get(existing_idx)
                    {
                        let a = if existing_dir.intro {
                            if existing_dir.outro {
                                "transition"
                            } else {
                                "in"
                            }
                        } else {
                            "out"
                        };

                        let b = if directive.intro {
                            if directive.outro { "transition" } else { "in" }
                        } else {
                            "out"
                        };

                        if a == b {
                            return Err(errors::transition_duplicate(a));
                        } else {
                            return Err(errors::transition_conflict(a, b));
                        }
                    }
                }

                if directive.intro {
                    in_transition = Some(idx);
                }
                if directive.outro {
                    out_transition = Some(idx);
                }
            }
            Attribute::OnDirective(directive) => {
                // Validate event modifiers
                let mut has_passive_modifier = false;
                let mut conflicting_passive_modifier = "";

                for modifier in &directive.modifiers {
                    if !EVENT_MODIFIERS.contains(&modifier.as_str()) {
                        let list = format!(
                            "{} or {}",
                            EVENT_MODIFIERS[..EVENT_MODIFIERS.len() - 1].join(", "),
                            EVENT_MODIFIERS.last().unwrap()
                        );
                        return Err(AnalysisError::Validation(format!(
                            "Invalid event modifier '{}'. Valid modifiers are: {}",
                            modifier, list
                        )));
                    }

                    if modifier == "passive" {
                        has_passive_modifier = true;
                    } else if modifier == "nonpassive" || modifier == "preventDefault" {
                        conflicting_passive_modifier = modifier;
                    }

                    if has_passive_modifier && !conflicting_passive_modifier.is_empty() {
                        return Err(AnalysisError::Validation(format!(
                            "The 'passive' modifier cannot be used with '{}' modifier",
                            conflicting_passive_modifier
                        )));
                    }
                }
            }
            _ => {
                // Other directives don't need validation here
            }
        }
    }

    Ok(())
}

/// Validate a svelte:element.
///
/// Corresponds to validation for SvelteElement in the JavaScript implementation.
pub fn validate_svelte_element(
    _element: &SvelteElement,
    _context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // svelte:element requires a `this` expression
    // This is checked during parsing, so no additional validation is needed here
    Ok(())
}
