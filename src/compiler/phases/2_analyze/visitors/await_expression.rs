//! AwaitExpression visitor.
//!
//! Analyzes await expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/AwaitExpression.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an await expression.
pub fn visit(_context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Track that the script contains async code
    Ok(())
}
