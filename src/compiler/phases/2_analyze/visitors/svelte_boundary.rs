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
pub fn visit(boundary: &SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Analyze children
    fragment::analyze(&boundary.fragment, context)?;

    // Note: svelte:boundary in the actual implementation has a 'failed' snippet
    // but our SvelteElement struct doesn't have that field.
    // This would need to be handled differently if that feature is needed.

    Ok(())
}
