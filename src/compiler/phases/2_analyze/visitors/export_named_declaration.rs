//! ExportNamedDeclaration visitor.
//!
//! Analyzes export named declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExportNamedDeclaration.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an export named declaration.
pub fn visit(_context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // In legacy mode, exports become props
    // Track exported bindings

    Ok(())
}
