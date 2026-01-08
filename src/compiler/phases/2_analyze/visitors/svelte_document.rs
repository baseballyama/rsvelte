//! SvelteDocument visitor.
//!
//! Analyzes <svelte:document> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteDocument.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use crate::ast::template::SvelteElement;

/// Visit a svelte:document.
pub fn visit(document: &SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for duplicate
    if context.has_svelte_document {
        return Err(errors::svelte_meta_duplicate("svelte:document"));
    }
    context.has_svelte_document = true;

    // Validate placement (must be at top level)
    if context.is_inside_element_or_block() {
        return Err(errors::svelte_meta_invalid_placement("svelte:document"));
    }

    // svelte:document cannot have children
    if !document.fragment.nodes.is_empty() {
        return Err(AnalysisError::validation(
            "svelte_meta_invalid_content",
            "<svelte:document> cannot have children",
        ));
    }

    Ok(())
}
