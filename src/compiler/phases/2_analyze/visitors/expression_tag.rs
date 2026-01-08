//! ExpressionTag visitor.
//!
//! Analyzes {expression} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExpressionTag.js`.

use super::VisitorContext;
use crate::ast::template::ExpressionTag;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an expression tag.
pub fn visit(_tag: &ExpressionTag, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Analyze the expression for references
    // In a full implementation, we would:
    // - Track variable references
    // - Mark bindings as used
    // - Detect reactive dependencies
    Ok(())
}

/// Alias for visit function.
pub fn visit_expression_tag(
    tag: &ExpressionTag,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(tag, context)
}
