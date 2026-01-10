//! FunctionExpression visitor.
//!
//! Analyzes function expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/FunctionExpression.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit a function expression.
pub fn visit(_node: &Value, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Functions create a new scope
    Ok(())
}
