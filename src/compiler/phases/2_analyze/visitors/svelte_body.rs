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
pub fn visit(body: &SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for duplicate
    if context.has_svelte_body {
        return Err(AnalysisError::validation(
            "svelte_meta_duplicate",
            "A component can only have one `<svelte:body>` element",
        ));
    }
    context.has_svelte_body = true;

    // Validate placement
    validate_special_element_placement("svelte:body", context)?;

    // svelte:body cannot have children
    if !body.fragment.nodes.is_empty() {
        return Err(AnalysisError::validation(
            "svelte_meta_invalid_content",
            "<svelte:body> cannot have children",
        ));
    }

    // svelte:body only has event handlers and use: directives
    // No children to analyze
    Ok(())
}
