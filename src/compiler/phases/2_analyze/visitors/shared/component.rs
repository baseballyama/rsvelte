//! Component validation utilities.
//!
//! Functions for validating component usage.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/component.js`.

use std::collections::HashSet;

use super::super::super::AnalysisError;
use super::super::super::errors;
use super::super::VisitorContext;
use super::fragment;
use crate::ast::template::{Attribute, Component};

/// Visit a component and perform full analysis.
///
/// This is the main entry point for component analysis, called by the
/// Component visitor. It handles:
/// - Snippet resolution and tracking
/// - Attribute validation
/// - Fragment analysis
///
/// Corresponds to `visit_component(node, context)` in shared/component.js.
pub fn visit_component(
    component: &mut Component,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // TODO: Set node.metadata.path = [...context.path]
    // This requires adding metadata to Component nodes

    // TODO: Link this node to all snippets it could render
    // node.metadata.snippets = new Set()
    //
    // 'resolved' means we know which snippets this component might render.
    // If false, then node.metadata.snippets is populated with every locally
    // defined snippet once analysis is complete.
    let mut resolved = true;

    // Analyze attributes to determine which snippets might be rendered
    for attr in &component.attributes {
        match attr {
            Attribute::SpreadAttribute(_) | Attribute::BindDirective(_) => {
                // Can't resolve snippets if there are spreads or bindings
                resolved = false;
            }
            Attribute::Attribute(a) => {
                // Check if this is an expression attribute
                if matches!(
                    &a.value,
                    crate::ast::template::AttributeValue::Expression(_)
                ) {
                    // TODO: Analyze the expression to see if it references snippets
                    // For now, we conservatively mark as unresolved
                    // The full implementation would:
                    // 1. Extract the expression
                    // 2. If it's an Identifier, check if it resolves to a snippet
                    // 3. If it's a Literal, it doesn't reference snippets
                    // 4. Otherwise, mark as unresolved
                }
            }
            _ => {}
        }
    }

    // If resolved, collect snippet blocks from children
    if resolved {
        // TODO: Iterate over component.fragment.nodes and add SnippetBlocks
        // to node.metadata.snippets
    }

    // TODO: context.state.analysis.snippet_renderers.set(node, resolved)
    // This requires tracking snippet renderers in the analysis

    // Mark the subtree as dynamic
    super::super::shared::fragment::mark_subtree_dynamic(&context.path);

    // Validate attributes
    for attr in &component.attributes {
        match attr {
            Attribute::Attribute(_) => {
                // TODO: Validate attribute
                // if (context.state.analysis.runes) {
                //     validate_attribute(attribute, node);
                //     if (is_expression_attribute(attribute)) {
                //         disallow_unparenthesized_sequences(
                //             get_attribute_expression(attribute),
                //             context.state.analysis.source
                //         );
                //     }
                // }
                // validate_attribute_name(attribute);
                // if (attribute.name === 'slot') {
                //     validate_slot_attribute(context, attribute, true);
                // }
            }
            Attribute::BindDirective(bind) => {
                // Track component bindings
                if bind.name != "this" {
                    context.analysis.uses_component_bindings = true;
                }
            }
            Attribute::OnDirective(on) => {
                // Validate event handler modifiers
                if on.modifiers.len() > 1 || on.modifiers.iter().any(|m| m.as_str() != "once") {
                    // TODO: Error - invalid modifiers
                    // e.event_handler_invalid_component_modifier(attribute)
                }
            }
            Attribute::AttachTag(_) => {
                // TODO: Validate attach tag
                // disallow_unparenthesized_sequences(attribute.expression, context.state.analysis.source)
            }
            Attribute::LetDirective(_) | Attribute::SpreadAttribute(_) => {
                // These are allowed on components
            }
            _ => {
                // All other directive types are invalid on components
                // (TransitionDirective, AnimateDirective, UseDirective, ClassDirective, StyleDirective)
                return Err(errors::component_invalid_directive());
            }
        }
    }

    // Analyze the component's children
    // TODO: Implement proper slot handling
    // The full implementation would:
    // 1. Group children by slot name
    // 2. Create appropriate scopes for each slot
    // 3. Visit each slot's content with the correct scope
    //
    // For now, just visit the fragment normally
    fragment::analyze(&mut component.fragment, context)?;

    Ok(())
}

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

    // Check for duplicate attributes
    let mut seen_names: HashSet<String> = HashSet::new();

    for attr in &component.attributes {
        let attr_name = match attr {
            Attribute::Attribute(a) => a.name.to_string(),
            Attribute::BindDirective(b) => b.name.to_string(),
            Attribute::ClassDirective(c) => format!("class:{}", c.name),
            Attribute::StyleDirective(s) => format!("style:{}", s.name),
            Attribute::OnDirective(o) => format!("on:{}", o.name),
            Attribute::TransitionDirective(t) => format!("transition:{}", t.name),
            Attribute::AnimateDirective(a) => format!("animate:{}", a.name),
            Attribute::UseDirective(u) => format!("use:{}", u.name),
            Attribute::LetDirective(l) => format!("let:{}", l.name),
            _ => continue,
        };

        if seen_names.contains(&attr_name) {
            return Err(AnalysisError::validation(
                "attribute_duplicate",
                "Attributes need to be unique",
            ));
        }
        seen_names.insert(attr_name);
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
