//! Text visitor.
//!
//! Analyzes text nodes.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Text.js`.

use super::VisitorContext;
use crate::ast::template::Text;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a text node.
pub fn visit(_text: &Text, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Text nodes don't need any analysis
    // They're purely static content
    Ok(())
}

/// Alias for visit function.
pub fn visit_text(text: &Text, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    visit(text, context)
}
