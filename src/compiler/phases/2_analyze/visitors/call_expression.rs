//! CallExpression visitor.
//!
//! Analyzes function call expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/CallExpression.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a call expression.
pub fn visit(_context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for rune calls ($state, $derived, $effect, etc.)
    // Validate rune usage context

    Ok(())
}
