//! RenderTag visitor.
//!
//! Analyzes {@render} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/RenderTag.js`.

use super::VisitorContext;
use crate::ast::template::RenderTag;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a render tag.
pub fn visit(_tag: &RenderTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark that this component uses render tags
    context.analysis.uses_render_tags = true;

    // Mark that we have control flow affecting sibling relationships
    // (render tags inject content from snippets)
    context.analysis.css.has_control_flow = true;

    // Analyze the expression for references
    // The expression should be a snippet call
    Ok(())
}

/// Alias for visit function.
pub fn visit_render_tag(
    tag: &RenderTag,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(tag, context)
}
