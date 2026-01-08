//! SvelteBody visitor.
//!
//! Analyzes <svelte:body> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteBody.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use crate::ast::template::SvelteElement;

/// Visit a svelte:body.
pub fn visit(body: &SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for duplicate
    if context.has_svelte_body {
        return Err(errors::svelte_meta_duplicate("svelte:body"));
    }
    context.has_svelte_body = true;

    // Validate placement (must be at top level)
    if context.is_inside_element_or_block() {
        return Err(errors::svelte_meta_invalid_placement("svelte:body"));
    }

    // svelte:body cannot have children
    if !body.fragment.nodes.is_empty() {
        return Err(AnalysisError::validation(
            "svelte_meta_invalid_content",
            "<svelte:body> cannot have children",
        ));
    }

    Ok(())
}
