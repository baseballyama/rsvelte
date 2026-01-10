//! FunctionDeclaration visitor.
//!
//! Analyzes function declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/FunctionDeclaration.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit a function declaration.
pub fn visit(_node: &Value, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Create a binding for the function name
    // Functions create a new scope

    Ok(())
}
