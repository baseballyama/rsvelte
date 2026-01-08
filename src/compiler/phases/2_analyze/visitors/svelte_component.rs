//! SvelteComponent visitor.
//!
//! Analyzes <svelte:component> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteComponent.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::SvelteComponentElement;

/// Visit a svelte:component.
pub fn visit(
    component: &SvelteComponentElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // svelte:component requires a `this` expression
    // The expression is analyzed for references

    // Analyze children
    fragment::analyze(&component.fragment, context)?;

    Ok(())
}
