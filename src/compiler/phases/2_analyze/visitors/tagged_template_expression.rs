//! TaggedTemplateExpression visitor.
//!
//! Analyzes tagged template expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/TaggedTemplateExpression.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a tagged template expression.
pub fn visit(_context: &mut VisitorContext) -> Result<(), AnalysisError> {
    Ok(())
}
