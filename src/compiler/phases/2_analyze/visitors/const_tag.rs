//! ConstTag visitor.
//!
//! Analyzes {@const} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ConstTag.js`.

use super::VisitorContext;
use crate::ast::template::ConstTag;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a const tag.
pub fn visit(_tag: &ConstTag, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // {@const} tags create local bindings
    // We should:
    // - Create a binding in the current scope
    // - Analyze the expression for references
    Ok(())
}
