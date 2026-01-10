//! Identifier visitor.
//!
//! Analyzes identifier references.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Identifier.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit an identifier.
pub fn visit(_node: &Value, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Track references to bindings
    // Resolve scope chain to find the binding

    Ok(())
}
