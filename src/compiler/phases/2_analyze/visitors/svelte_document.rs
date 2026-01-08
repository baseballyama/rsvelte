//! SvelteDocument visitor.
//!
//! Analyzes <svelte:document> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteDocument.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::special_element::validate_special_element_placement;
use crate::ast::template::SvelteElement;

/// Visit a svelte:document.
pub fn visit(_document: &SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate placement
    validate_special_element_placement("svelte:document", context)?;

    // svelte:document only has event handlers and bind: directives
    // No children to analyze
    Ok(())
}
