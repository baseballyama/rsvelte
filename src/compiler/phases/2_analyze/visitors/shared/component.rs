//! Component validation utilities.
//!
//! Functions for validating component usage.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/component.js`.

use super::super::super::AnalysisError;
use super::super::VisitorContext;
use crate::ast::template::{Attribute, Component};

/// Validate a component and its attributes.
pub fn validate_component(
    component: &Component,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Check for valid component name (should start with uppercase or contain a dot)
    let name = &component.name;
    let first_char = name.chars().next().unwrap_or('a');

    if !first_char.is_uppercase() && !name.contains('.') && !name.contains(':') {
        return Err(AnalysisError::Validation(format!(
            "Component name '{}' should start with an uppercase letter",
            name
        )));
    }

    // Track component bindings
    let has_bindings = component
        .attributes
        .iter()
        .any(|attr| matches!(attr, Attribute::BindDirective(_)));

    if has_bindings {
        context.analysis.uses_component_bindings = true;
    }

    Ok(())
}

/// Check if a component uses two-way binding.
pub fn has_two_way_binding(component: &Component) -> bool {
    component
        .attributes
        .iter()
        .any(|attr| matches!(attr, Attribute::BindDirective(_)))
}

/// Get the names of props passed to a component.
pub fn get_prop_names(component: &Component) -> Vec<String> {
    let mut props = Vec::new();

    for attr in &component.attributes {
        match attr {
            Attribute::Attribute(a) => {
                props.push(a.name.to_string());
            }
            Attribute::BindDirective(b) => {
                props.push(b.name.to_string());
            }
            _ => {}
        }
    }

    props
}
