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
pub fn visit(window: &SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for duplicate
    if context.has_svelte_window {
        return Err(AnalysisError::validation(
            "svelte_meta_duplicate",
            "A component can only have one `<svelte:window>` element",
        ));
    }
    context.has_svelte_window = true;

    // Validate placement
    validate_special_element_placement("svelte:window", context)?;

    // svelte:window cannot have children
    if !window.fragment.nodes.is_empty() {
        return Err(AnalysisError::validation(
            "svelte_meta_invalid_content",
            "<svelte:window> cannot have children",
        ));
    }

    // svelte:window only has event handlers and bind: directives
    // No children to analyze
    Ok(())
}
