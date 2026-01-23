//! SvelteHead visitor.
//!
//! Analyzes <svelte:head> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteHead.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::SvelteElement;

/// Visit a svelte:head.
pub fn visit(head: &mut SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for illegal attributes - svelte:head cannot have any attributes or directives
    if !head.attributes.is_empty() {
        return Err(errors::svelte_head_illegal_attribute());
    }

    // Check for duplicate
    if context.has_svelte_head {
        return Err(errors::svelte_meta_duplicate("svelte:head"));
    }
    context.has_svelte_head = true;

    // Validate placement (must be at top level)
    if context.is_inside_element_or_block() {
        return Err(errors::svelte_meta_invalid_placement("svelte:head"));
    }

    // Analyze children
    fragment::analyze(&mut head.fragment, context)?;

    Ok(())
}
