//! ExpressionStatement visitor.
//!
//! Analyzes expression statements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExpressionStatement.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an expression statement.
pub fn visit(_context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Analyze the expression
    Ok(())
}
