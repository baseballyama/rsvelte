//! ClassBody visitor.
//!
//! Analyzes class bodies.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ClassBody.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a class body.
pub fn visit(_context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Track state fields in classes
    Ok(())
}
