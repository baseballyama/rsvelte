//! SvelteBody visitor.
//!
//! Analyzes <svelte:body> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteBody.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::special_element::validate_special_element_placement;
use crate::ast::template::SvelteElement;

/// Visit a svelte:body.
pub fn visit(_body: &SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate placement
    validate_special_element_placement("svelte:body", context)?;

    // svelte:body only has event handlers and use: directives
    // No children to analyze
    Ok(())
}
