//! DebugTag visitor.
//!
//! Analyzes {@debug} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/DebugTag.js`.

use super::VisitorContext;
use crate::ast::template::DebugTag;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a debug tag.
pub fn visit(_tag: &DebugTag, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // {@debug} tags are for debugging
    // We should analyze the identifiers for references
    Ok(())
}
