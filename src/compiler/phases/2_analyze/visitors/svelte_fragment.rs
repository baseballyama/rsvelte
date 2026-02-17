//! SvelteFragment visitor.
//!
//! Analyzes <svelte:fragment> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteFragment.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::SvelteElement;

/// Visit a svelte:fragment.
pub fn visit(frag: &mut SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // svelte:fragment must be a direct child of a component
    if !context.is_direct_child_of_component {
        return Err(errors::svelte_fragment_invalid_placement());
    }

    // Note: <svelte:fragment> does NOT set uses_slots on the parent component.
    // uses_slots is for components that contain <slot> elements.

    // Push fragment owner type for const_tag placement validation
    context
        .fragment_owner_stack
        .push(super::FragmentOwnerType::SvelteFragment);

    // Analyze children
    fragment::analyze(&mut frag.fragment, context)?;

    // Pop fragment owner type
    context.fragment_owner_stack.pop();

    Ok(())
}
