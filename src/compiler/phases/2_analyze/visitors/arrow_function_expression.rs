//! ArrowFunctionExpression visitor.
//!
//! Analyzes arrow function expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ArrowFunctionExpression.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an arrow function expression.
pub fn visit(_context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Arrow functions create a new scope
    // Track function depth for $effect analysis

    Ok(())
}
