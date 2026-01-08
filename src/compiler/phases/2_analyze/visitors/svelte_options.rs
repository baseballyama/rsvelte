//! SvelteOptions visitor.
//!
//! Analyzes <svelte:options> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteOptions.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use crate::ast::template::SvelteElement;

/// Visit a svelte:options.
pub fn visit(options: &SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for duplicate
    if context.has_svelte_options {
        return Err(AnalysisError::validation(
            "svelte_meta_duplicate",
            "A component can only have one `<svelte:options>` element",
        ));
    }
    context.has_svelte_options = true;

    // svelte:options cannot have children
    if !options.fragment.nodes.is_empty() {
        return Err(AnalysisError::validation(
            "svelte_meta_invalid_content",
            "<svelte:options> cannot have children",
        ));
    }

    // svelte:options is processed during parsing
    // No additional analysis needed here
    Ok(())
}
