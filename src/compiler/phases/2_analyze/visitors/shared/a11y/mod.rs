//! Accessibility (a11y) checking.
//!
//! Validates elements for accessibility best practices.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/a11y/` directory.

mod constants;

pub use constants::*;

use super::super::super::AnalysisError;
use super::super::VisitorContext;
use crate::ast::template::RegularElement;

/// Check an element for accessibility issues.
pub fn check_element(
    element: &RegularElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Check for missing alt on images
    if element.name == "img" {
        check_img_alt(element, context)?;
    }

    // Check for missing labels on form elements
    if is_form_element(&element.name) {
        check_form_label(element, context)?;
    }

    // Check for valid ARIA attributes
    check_aria_attributes(element, context)?;

    // Check for valid roles
    check_role(element, context)?;

    // Check for interactive element nesting
    check_interactive_nesting(element, context)?;

    Ok(())
}

fn check_img_alt(
    element: &RegularElement,
    _context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    use crate::ast::template::Attribute;

    let has_alt = element.attributes.iter().any(|attr| {
        if let Attribute::Attribute(a) = attr {
            a.name == "alt"
        } else {
            false
        }
    });

    // For now, we just track this; actual warning generation would happen elsewhere
    if !has_alt {
        // TODO: Generate a11y-missing-alt warning
    }

    Ok(())
}

fn check_form_label(
    _element: &RegularElement,
    _context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // TODO: Implement label checking
    Ok(())
}

fn check_aria_attributes(
    element: &RegularElement,
    _context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    use crate::ast::template::Attribute;

    for attr in &element.attributes {
        if let Attribute::Attribute(a) = attr {
            if a.name.starts_with("aria-") {
                let aria_name = &a.name[5..];
                if !VALID_ARIA_ATTRIBUTES.contains(&aria_name) {
                    // TODO: Generate a11y-unknown-aria-attribute warning
                }
            }
        }
    }

    Ok(())
}

fn check_role(
    element: &RegularElement,
    _context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    use crate::ast::template::Attribute;

    for attr in &element.attributes {
        if let Attribute::Attribute(a) = attr {
            if a.name == "role" {
                // TODO: Validate role value against VALID_ROLES
            }
        }
    }

    Ok(())
}

fn check_interactive_nesting(
    element: &RegularElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Check if this is an interactive element nested inside another
    if is_interactive_element(&element.name) {
        for node in &context.path {
            if let crate::ast::template::TemplateNode::RegularElement(parent) = node {
                if is_interactive_element(&parent.name) {
                    // TODO: Generate a11y-no-interactive-element-to-noninteractive-role warning
                }
            }
        }
    }

    Ok(())
}

fn is_form_element(name: &str) -> bool {
    matches!(name, "input" | "select" | "textarea" | "button")
}

fn is_interactive_element(name: &str) -> bool {
    matches!(
        name,
        "a" | "button"
            | "input"
            | "select"
            | "textarea"
            | "details"
            | "summary"
            | "audio"
            | "video"
    )
}
