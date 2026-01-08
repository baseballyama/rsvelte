//! SpreadElement visitor.
//!
//! Analyzes spread elements in arrays/objects.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SpreadElement.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a spread element.
pub fn visit(_context: &mut VisitorContext) -> Result<(), AnalysisError> {
    Ok(())
}
