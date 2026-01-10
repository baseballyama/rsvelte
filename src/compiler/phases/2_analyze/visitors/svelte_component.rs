//! SvelteComponent visitor.
//!
//! Analyzes <svelte:component> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteComponent.js`.

use super::super::{AnalysisError, warnings};
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::SvelteComponentElement;

/// Visit a svelte:component.
pub fn visit(
    component: &mut SvelteComponentElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // In runes mode, <svelte:component> is deprecated because components are dynamic by default
    if context.analysis.runes {
        context.emit_warning(warnings::svelte_component_deprecated());
    }

    // svelte:component requires a `this` expression
    // The expression is analyzed for references

    // Analyze children
    fragment::analyze(&mut component.fragment, context)?;

    Ok(())
}
