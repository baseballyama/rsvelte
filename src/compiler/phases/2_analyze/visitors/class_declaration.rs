//! ClassDeclaration visitor.
//!
//! Analyzes class declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ClassDeclaration.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a class declaration.
pub fn visit(_context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Create a binding for the class name
    Ok(())
}
