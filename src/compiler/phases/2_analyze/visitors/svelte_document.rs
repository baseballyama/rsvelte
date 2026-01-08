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
pub fn visit(document: &SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for duplicate
    if context.has_svelte_document {
        return Err(AnalysisError::validation(
            "svelte_meta_duplicate",
            "A component can only have one `<svelte:document>` element",
        ));
    }
    context.has_svelte_document = true;

    // Validate placement
    validate_special_element_placement("svelte:document", context)?;

    // svelte:document cannot have children
    if !document.fragment.nodes.is_empty() {
        return Err(AnalysisError::validation(
            "svelte_meta_invalid_content",
            "<svelte:document> cannot have children",
        ));
    }

    // svelte:document only has event handlers and bind: directives
    // No children to analyze
    Ok(())
}
