//! SvelteSelf visitor.
//!
//! Analyzes <svelte:self> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteSelf.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::fragment;
use super::shared::special_element::validate_special_element_placement;
use crate::ast::template::SvelteElement;

/// Visit a svelte:self.
pub fn visit(self_: &mut SvelteElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate placement
    validate_special_element_placement("svelte:self", context)?;

    // Analyze children
    fragment::analyze(&mut self_.fragment, context)?;

    Ok(())
}
