//! SvelteWindow visitor.
//!
//! Analyzes <svelte:window> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteWindow.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use super::bind_directive;
use crate::ast::template::{Attribute, SvelteElement};

/// Visit a svelte:window.
pub fn visit(window: &SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for duplicate
    if context.has_svelte_window {
        return Err(errors::svelte_meta_duplicate("svelte:window"));
    }
    context.has_svelte_window = true;

    // Validate placement (must be at top level)
    if context.is_inside_element_or_block() {
        return Err(errors::svelte_meta_invalid_placement("svelte:window"));
    }

    // svelte:window cannot have children
    if !window.fragment.nodes.is_empty() {
        return Err(AnalysisError::validation(
            "svelte_meta_invalid_content",
            "<svelte:window> cannot have children",
        ));
    }

    // Validate bind directives
    for attr in &window.attributes {
        if let Attribute::BindDirective(bind) = attr {
            bind_directive::visit_with_svelte_element(bind, "svelte:window", context)?;
        }
    }

    Ok(())
}
