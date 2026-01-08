//! HtmlTag visitor.
//!
//! Analyzes {@html} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/HtmlTag.js`.

use super::VisitorContext;
use crate::ast::template::HtmlTag;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an HTML tag.
pub fn visit(_tag: &HtmlTag, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // {@html} tags render raw HTML
    // We should analyze the expression for references
    Ok(())
}
