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

    // Set context.scope to the scope created by scope_builder for this svelte:fragment.
    // This ensures that Let directive bindings declared in scope_builder are visible
    // when analyzing children (e.g., {@const} tags that reference let: variables).
    let old_scope = context.scope;
    if let Some(&frag_scope) = context.analysis.root.template_scope_map.get(&frag.start) {
        context.scope = frag_scope;
    }

    // Analyze children
    fragment::analyze(&mut frag.fragment, context)?;

    // Restore scope
    context.scope = old_scope;

    // Pop fragment owner type
    context.fragment_owner_stack.pop();

    Ok(())
}
