//! Component visitor.
//!
//! Analyzes component usage.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Component.js`.

use std::collections::HashSet;

use super::super::AnalysisError;
use super::super::types::ComponentInfo;
use super::VisitorContext;
use super::shared::component::validate_component;
use super::shared::fragment;
use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, Component, TemplateNode,
};

/// Visit a component.
pub fn visit(component: &Component, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate the component
    validate_component(component, context)?;

    // Check for duplicate slot names in children (only for non-custom elements)
    // Custom elements (lowercase names with hyphens) are allowed to have duplicate slots
    if !is_custom_element(&component.name) {
        check_duplicate_slots(&component.name, &component.fragment.nodes)?;
    }

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
        if let Attribute::Attribute(a) = attr
            && a.name == "slot"
        {
            context.analysis.uses_slots = true;
        }
    }

    // Save parent element (components don't count as elements)
    let old_parent = context.parent_element.clone();
    context.parent_element = None;

    // Increment component depth for child analysis
    context.component_depth += 1;

    // Analyze children
    fragment::analyze(&component.fragment, context)?;

    // Decrement component depth
    context.component_depth -= 1;

    // Restore parent element
    context.parent_element = old_parent;

    Ok(())
}

/// Check if a component name represents a custom element (contains hyphen and is lowercase).
fn is_custom_element(name: &str) -> bool {
    name.contains('-') && name.chars().all(|c| !c.is_ascii_uppercase())
}

/// Check for duplicate slot names in component children.
fn check_duplicate_slots(
    component_name: &str,
    nodes: &[TemplateNode],
) -> Result<(), AnalysisError> {
    let mut seen_slots: HashSet<String> = HashSet::new();
    let mut has_default_slot = false;

    for node in nodes {
        // Extract slot name from the node
        let slot_name = get_slot_name(node);

        if let Some(name) = slot_name {
            if name.is_empty() || name == "default" {
                // Check for duplicate default slot
                if has_default_slot {
                    return Err(AnalysisError::validation(
                        "slot_default_duplicate",
                        format!("`default` slot was already filled in <{}>", component_name),
                    ));
                }
                has_default_slot = true;
            } else {
                // Check for duplicate named slot
                if seen_slots.contains(&name) {
                    return Err(AnalysisError::validation(
                        "slot_attribute_duplicate",
                        format!("Duplicate slot name '{}' in <{}>", name, component_name),
                    ));
                }
                seen_slots.insert(name);
            }
        } else {
            // Content without explicit slot attribute goes to default slot
            // If we already have an explicit default slot, this is a duplicate
            if is_meaningful_content(node) && has_default_slot {
                return Err(AnalysisError::validation(
                    "slot_default_duplicate",
                    format!("`default` slot was already filled in <{}>", component_name),
                ));
            }
            // Don't set has_default_slot for implicit content (allow multiple implicit nodes)
        }
    }

    Ok(())
}

/// Get the slot name from a node's attributes.
fn get_slot_name(node: &TemplateNode) -> Option<String> {
    let attributes = match node {
        TemplateNode::RegularElement(e) => Some(&e.attributes),
        TemplateNode::Component(c) => Some(&c.attributes),
        TemplateNode::SvelteFragment(e) => Some(&e.attributes),
        _ => None,
    }?;

    for attr in attributes {
        if let Attribute::Attribute(a) = attr
            && a.name == "slot"
        {
            return Some(get_static_value(&a.value).unwrap_or_default());
        }
    }

    None
}

/// Get a static string value from an attribute value.
fn get_static_value(value: &AttributeValue) -> Option<String> {
    match value {
        AttributeValue::Sequence(parts) => {
            let mut result = String::new();
            for part in parts {
                if let AttributeValuePart::Text(text) = part {
                    result.push_str(&text.data);
                }
            }
            Some(result)
        }
        AttributeValue::True(_) => Some(String::new()),
        AttributeValue::Expression(_) => None,
    }
}

/// Check if a node represents meaningful content (not just whitespace).
fn is_meaningful_content(node: &TemplateNode) -> bool {
    match node {
        TemplateNode::Text(t) => !t.data.trim().is_empty(),
        TemplateNode::Comment(_) => false,
        _ => true,
    }
}

/// Alias for visit function.
pub fn visit_component(
    component: &Component,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(component, context)
}
