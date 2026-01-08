//! SvelteWindow visitor.
//!
//! Analyzes <svelte:window> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteWindow.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::special_element::validate_special_element_placement;
use crate::ast::template::SvelteElement;

/// Visit a svelte:window.
pub fn visit(_window: &SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate placement
    validate_special_element_placement("svelte:window", context)?;

    // svelte:window only has event handlers and bind: directives
    // No children to analyze
    Ok(())
}
