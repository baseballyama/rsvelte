//! SvelteFragment visitor.
//!
//! Analyzes <svelte:fragment> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteFragment.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::{Attribute, SvelteElement};

/// Visit a svelte:fragment.
pub fn visit<'a, 'b: 'a>(
    frag: &mut SvelteElement<'b>,
    context: &mut VisitorContext<'a>,
) -> Result<(), AnalysisError> {
    // svelte:fragment must be a direct child of a component
    if !context.is_direct_child_of_component {
        return Err(errors::svelte_fragment_invalid_placement().at(frag.start, frag.end));
    }

    for attribute in &mut frag.attributes {
        match attribute {
            Attribute::Attribute(attribute) => {
                if attribute.name == "slot" {
                    super::shared::attribute::validate_slot_attribute(context, attribute)?;
                }
                super::attribute::visit(attribute, context)?;
            }
            Attribute::LetDirective(_) => {}
            _ => {
                let (start, end) = attribute.span();
                return Err(errors::svelte_fragment_invalid_attribute().at(start, end));
            }
        }
    }

    // Note: <svelte:fragment> does NOT set uses_slots on the parent component.
    // uses_slots is for components that contain <slot> elements.

    // Push fragment owner type for const_tag placement validation
    context
        .fragment_owner_stack
        .push(super::FragmentOwnerType::SvelteFragment);

    // Set context.scope to the scope created by scope_builder for this svelte:fragment.
    // This ensures that Let directive bindings declared in scope_builder are visible
    // when analyzing children (e.g., {@const} tags that reference let: variables).
    let old_scope = context.scope;
    if let Some(&frag_scope) = context.analysis.root.template_scope_map.get(&frag.start) {
        context.scope = frag_scope;
    }

    // Children are the fragment's, not the component's, so a `slot="…"` on one
    // is `slot_attribute_invalid_placement` upstream (`owner !== parent`) and a
    // nested `<svelte:fragment>` is invalid too.
    let was_direct_child = context.is_direct_child_of_component;
    context.is_direct_child_of_component = false;

    // Analyze children
    fragment::analyze(&mut frag.fragment, context)?;

    context.is_direct_child_of_component = was_direct_child;

    // Restore scope
    context.scope = old_scope;

    // Pop fragment owner type
    context.fragment_owner_stack.pop();

    Ok(())
}
