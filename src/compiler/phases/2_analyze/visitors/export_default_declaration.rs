//! ExportDefaultDeclaration visitor.
//!
//! Analyzes export default declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExportDefaultDeclaration.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit an export default declaration.
pub fn visit(_node: &Value, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Export default is not allowed in Svelte components
    Err(AnalysisError::Validation(
        "Export default is not allowed in Svelte components".to_string(),
    ))
}
