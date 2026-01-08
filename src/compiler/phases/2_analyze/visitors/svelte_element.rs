//! SvelteElement visitor.
//!
//! Analyzes <svelte:element> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteElement.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::SvelteDynamicElement;

/// Visit a svelte:element.
pub fn visit(
    element: &SvelteDynamicElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Mark that we have dynamic elements (can't safely prune type selectors)
    context.analysis.css.has_dynamic_elements = true;

    // Analyze children
    fragment::analyze(&element.fragment, context)?;

    Ok(())
}
