//! Component validation utilities.
//!
//! Functions for validating component usage.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/component.js`.

use rustc_hash::FxHashSet;

use super::super::super::AnalysisError;
use super::super::super::errors;
use super::super::VisitorContext;
use super::fragment;
use super::utils::validate_assignment;
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
                // Validate the binding expression (checks for const/import bindings)
                validate_assignment(bind.expression.as_json(), context, true)?;
            }
            Attribute::OnDirective(on) => {
                // Validate event handler modifiers
                // Only 'once' modifier is allowed on component events
                let has_invalid_modifiers = on.modifiers.iter().any(|m| m.as_str() != "once");
                if has_invalid_modifiers {
                    return Err(errors::event_handler_invalid_component_modifier());
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

    // Validate slot attributes for duplicate names
    validate_slot_attributes(component)?;

    // Analyze the component's children
    // TODO: Implement proper slot handling
    // The full implementation would:
    // 1. Group children by slot name
    // 2. Create appropriate scopes for each slot
    // 3. Visit each slot's content with the correct scope
    //
    // For now, just visit the fragment normally
    // Set is_direct_child_of_component for svelte:fragment validation
    let was_direct_child = context.is_direct_child_of_component;
    context.is_direct_child_of_component = true;
    // Track component depth for slot attribute validation
    context.component_depth += 1;
    fragment::analyze(&mut component.fragment, context)?;
    context.component_depth -= 1;
    context.is_direct_child_of_component = was_direct_child;

    Ok(())
}

/// Validate that slot attributes are not duplicated.
///
/// This checks for:
/// 1. Duplicate slot names in component children
/// 2. Both explicit slot="default" and implicit default content
fn validate_slot_attributes(component: &Component) -> Result<(), AnalysisError> {
    use crate::ast::template::TemplateNode;

    let mut seen_slots: FxHashSet<String> = FxHashSet::default();
    let mut has_explicit_default = false;
    let mut has_implicit_default = false;

    for node in &component.fragment.nodes {
        let slot_name = get_slot_name(node);

        if let Some(ref name) = slot_name {
            if name == "default" {
                has_explicit_default = true;
            }

            if seen_slots.contains(name) {
                return Err(errors::slot_attribute_duplicate(name, &component.name));
            }
            seen_slots.insert(name.clone());
        } else {
            // Check if this is implicit default slot content
            // (not a whitespace-only Text node and not a snippet/const/debug tag)
            match node {
                TemplateNode::Text(text) => {
                    if !text.data.trim().is_empty() {
                        has_implicit_default = true;
                    }
                }
                TemplateNode::SnippetBlock(_)
                | TemplateNode::ConstTag(_)
                | TemplateNode::DebugTag(_)
                | TemplateNode::Comment(_) => {
                    // These don't count as implicit default content
                }
                _ => {
                    has_implicit_default = true;
                }
            }
        }
    }

    // Check for slot_default_duplicate error
    if has_explicit_default && has_implicit_default {
        return Err(errors::slot_default_duplicate());
    }

    Ok(())
}

/// Get the slot name from a node's slot attribute.
fn get_slot_name(node: &crate::ast::template::TemplateNode) -> Option<String> {
    use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, TemplateNode};

    let attrs = match node {
        TemplateNode::RegularElement(el) => Some(&el.attributes),
        TemplateNode::SvelteFragment(frag) => Some(&frag.attributes),
        TemplateNode::Component(comp) => Some(&comp.attributes),
        TemplateNode::SvelteComponent(comp) => Some(&comp.attributes),
        TemplateNode::SvelteSelf(self_) => Some(&self_.attributes),
        _ => None,
    };

    if let Some(attributes) = attrs {
        for attr in attributes {
            if let Attribute::Attribute(a) = attr
                && a.name == "slot"
            {
                // Extract the slot name from the value
                match &a.value {
                    AttributeValue::Sequence(parts) if parts.len() == 1 => {
                        if let AttributeValuePart::Text(text) = &parts[0] {
                            return Some(text.data.to_string());
                        }
                    }
                    _ => {}
                }
            }
        }
    }

    None
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
    let mut seen_names: FxHashSet<String> = FxHashSet::default();

    for attr in &component.attributes {
        // Only check for duplicates on:
        // - Attribute and BindDirective (treated the same)
        // - ClassDirective
        // - StyleDirective
        // OnDirective can have multiple handlers for the same event
        let attr_name = match attr {
            Attribute::Attribute(a) => Some(format!("Attribute{}", a.name)),
            Attribute::BindDirective(b) => Some(format!("Attribute{}", b.name)), // bind:x and x are duplicates
            Attribute::ClassDirective(c) => Some(format!("class:{}", c.name)),
            Attribute::StyleDirective(s) => Some(format!("style:{}", s.name)),
            _ => None, // Other directives can have duplicates
        };

        if let Some(name) = attr_name {
            if seen_names.contains(&name) {
                return Err(AnalysisError::validation(
                    "attribute_duplicate",
                    "Attributes need to be unique",
                ));
            }
            seen_names.insert(name);
        }
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
