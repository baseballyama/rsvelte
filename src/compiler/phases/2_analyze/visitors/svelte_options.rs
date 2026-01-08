//! SvelteOptions visitor.
//!
//! Analyzes <svelte:options> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteOptions.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use crate::ast::template::SvelteElement;

/// Visit a svelte:options.
pub fn visit(_options: &SvelteElement, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // svelte:options is processed during parsing
    // No additional analysis needed here
    Ok(())
}
