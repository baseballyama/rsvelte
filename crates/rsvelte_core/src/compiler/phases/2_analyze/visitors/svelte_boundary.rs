//! SvelteBoundary visitor.
//!
//! Analyzes <svelte:boundary> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteBoundary.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::{Attribute, SvelteElement};

/// Visit a svelte:boundary.
pub fn visit<'a, 'b: 'a>(
    boundary: &mut SvelteElement<'b>,
    context: &mut VisitorContext<'a>,
) -> Result<(), AnalysisError> {
    for attribute in &mut boundary.attributes {
        if let Attribute::Attribute(attribute) = attribute {
            super::attribute::visit(attribute, context)?;
        }
    }

    // Push fragment owner type for const_tag placement validation
    context
        .fragment_owner_stack
        .push(super::FragmentOwnerType::SvelteBoundary);

    // Set context.scope to the scope created by scope_builder for this boundary.
    // This ensures that {@const} bindings declared in scope_builder are visible
    // when analyzing children.
    let scope_before_boundary = context.scope;
    if let Some(&boundary_scope) = context
        .analysis
        .root
        .template_scope_map
        .get(&boundary.start)
    {
        context.scope = boundary_scope;
    }

    // Analyze children
    fragment::analyze(&mut boundary.fragment, context)?;

    // Restore scope
    context.scope = scope_before_boundary;

    // Pop fragment owner type
    context.fragment_owner_stack.pop();

    // Note: svelte:boundary in the actual implementation has a 'failed' snippet
    // but our SvelteElement struct doesn't have that field.
    // This would need to be handled differently if that feature is needed.

    Ok(())
}
