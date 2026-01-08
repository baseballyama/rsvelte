//! Literal visitor.
//!
//! Analyzes literal values.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Literal.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a literal.
pub fn visit(_context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Literals don't need special analysis
    Ok(())
}
