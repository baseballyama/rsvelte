//! NewExpression visitor.
//!
//! Analyzes new expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/NewExpression.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit a new expression.
pub fn visit(_node: &Value, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    Ok(())
}
