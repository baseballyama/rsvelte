//! ExpressionStatement visitor.
//!
//! Analyzes expression statements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExpressionStatement.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit an expression statement.
pub fn visit(_node: &Value, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Analyze the expression
    Ok(())
}
