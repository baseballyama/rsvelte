//! SvelteOptions visitor.
//!
//! Analyzes <svelte:options> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteOptions.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use crate::ast::template::SvelteElement;

/// Visit a svelte:options.
pub fn visit(options: &SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for duplicate
    if context.has_svelte_options {
        return Err(errors::svelte_meta_duplicate("svelte:options").at(options.start, options.end));
    }
    context.has_svelte_options = true;

    // Validate placement (must be at top level)
    if context.is_inside_element_or_block() {
        return Err(
            errors::svelte_meta_invalid_placement("svelte:options").at(options.start, options.end)
        );
    }

    // svelte:options cannot have children
    if !options.fragment.nodes.is_empty() {
        let (start, _) = options.fragment.nodes.first().unwrap().span();
        let (_, end) = options.fragment.nodes.last().unwrap().span();
        return Err(errors::svelte_meta_invalid_content("svelte:options").at(start, end));
    }

    Ok(())
}
