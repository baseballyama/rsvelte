//! SvelteHead visitor.
//!
//! Analyzes <svelte:head> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteHead.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::fragment;
use super::shared::special_element::validate_special_element_placement;
use crate::ast::template::SvelteElement;

/// Visit a svelte:head.
pub fn visit(head: &SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for duplicate
    if context.has_svelte_head {
        return Err(AnalysisError::validation(
            "svelte_meta_duplicate",
            "A component can only have one `<svelte:head>` element",
        ));
    }
    context.has_svelte_head = true;

    // Validate placement
    validate_special_element_placement("svelte:head", context)?;

    // Analyze children
    fragment::analyze(&head.fragment, context)?;

    Ok(())
}
