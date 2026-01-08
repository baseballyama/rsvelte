//! AttachTag visitor.
//!
//! Analyzes {@attach} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/AttachTag.js`.

use super::VisitorContext;
use crate::ast::template::AttachTag;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an attach tag.
pub fn visit(_tag: &AttachTag, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // {@attach} tags are for attaching actions/behaviors
    // Analyze the expression for references
    Ok(())
}
