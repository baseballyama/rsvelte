//! StyleDirective visitor.
//!
//! Analyzes style: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/StyleDirective.js`.

use super::VisitorContext;
use crate::ast::template::StyleDirective;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a style directive.
pub fn visit(
    _directive: &StyleDirective,
    _context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // style: directives set individual CSS properties
    // Analyze the expression if present

    Ok(())
}
