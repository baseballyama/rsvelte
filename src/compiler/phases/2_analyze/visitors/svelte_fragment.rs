//! SvelteFragment visitor.
//!
//! Analyzes <svelte:fragment> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteFragment.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::SvelteElement;

/// Visit a svelte:fragment.
pub fn visit(frag: &mut SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // svelte:fragment is used for named slots
    context.analysis.uses_slots = true;

    // Analyze children
    fragment::analyze(&mut frag.fragment, context)?;

    Ok(())
}
