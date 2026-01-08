//! Component visitor.
//!
//! Analyzes component usage.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Component.js`.

use super::super::AnalysisError;
use super::super::types::ComponentInfo;
use super::VisitorContext;
use super::shared::component::validate_component;
use super::shared::fragment;
use crate::ast::template::{Attribute, Component};

/// Visit a component.
pub fn visit(component: &Component, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate the component
    validate_component(component, context)?;

    // Track component info
    let has_bindings = component
        .attributes
        .iter()
        .any(|attr| matches!(attr, Attribute::BindDirective(_)));

    context.analysis.template.components.push(ComponentInfo {
        name: component.name.to_string(),
        start: component.start as usize,
        end: component.end as usize,
        has_bindings,
    });

    if has_bindings {
        context.analysis.uses_component_bindings = true;
    }

    // Check for slot usage
    for attr in &component.attributes {
        if let Attribute::Attribute(a) = attr {
            if a.name == "slot" {
                context.analysis.uses_slots = true;
            }
        }
    }

    // Save parent element (components don't count as elements)
    let old_parent = context.parent_element.clone();
    context.parent_element = None;

    // Analyze children
    fragment::analyze(&component.fragment, context)?;

    // Restore parent element
    context.parent_element = old_parent;

    Ok(())
}

/// Alias for visit function.
pub fn visit_component(
    component: &Component,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(component, context)
}
