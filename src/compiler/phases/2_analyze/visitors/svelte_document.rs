//! SvelteDocument visitor.
//!
//! Analyzes <svelte:document> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteDocument.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use super::bind_directive;
use crate::ast::template::{Attribute, SvelteElement};

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

    // Validate attributes - check for invalid ones
    for attr in &document.attributes {
        match attr {
            Attribute::BindDirective(bind) => {
                bind_directive::visit_with_svelte_element(bind, "svelte:document", context)?;
            }
            Attribute::OnDirective(_) => {
                // on: directives are allowed
            }
            Attribute::LetDirective(_) => {
                // let: directives are NOT allowed on svelte:document
                return Err(errors::let_directive_invalid_placement());
            }
            Attribute::SpreadAttribute(_) => {
                // Spread attributes are NOT allowed on svelte:document
                return Err(errors::illegal_element_attribute("svelte:document"));
            }
            _ => {}
        }
    }

    Ok(())
}
