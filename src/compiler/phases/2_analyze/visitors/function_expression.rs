//! FunctionExpression visitor.
//!
//! Analyzes function expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/FunctionExpression.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a function expression.
pub fn visit(_context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Functions create a new scope
    Ok(())
}
