//! PropertyDefinition visitor.
//!
//! Analyzes class property definitions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/PropertyDefinition.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit a property definition.
pub fn visit(_node: &Value, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Track state fields in classes
    Ok(())
}
