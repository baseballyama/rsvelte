//! SvelteBoundary visitor.
//!
//! Analyzes <svelte:boundary> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteBoundary.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::SvelteElement;

/// Visit a svelte:boundary.
pub fn visit(
    boundary: &mut SvelteElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Push fragment owner type for const_tag placement validation
    context.fragment_owner_stack.push(super::FragmentOwnerType::SvelteBoundary);

    // Analyze children
    fragment::analyze(&mut boundary.fragment, context)?;

    // Pop fragment owner type
    context.fragment_owner_stack.pop();

    // Note: svelte:boundary in the actual implementation has a 'failed' snippet
    // but our SvelteElement struct doesn't have that field.
    // This would need to be handled differently if that feature is needed.

    Ok(())
}
