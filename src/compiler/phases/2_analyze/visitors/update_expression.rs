//! UpdateExpression visitor.
//!
//! Analyzes update expressions (++, --).
//!
//! Corresponds to Svelte's `2-analyze/visitors/UpdateExpression.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit an update expression.
pub fn visit(_node: &Value, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Track mutations to bindings
    Ok(())
}
