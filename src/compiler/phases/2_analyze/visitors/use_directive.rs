//! UseDirective visitor.
//!
//! Analyzes use: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/UseDirective.js`.

use super::VisitorContext;
use crate::ast::template::UseDirective;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a use directive.
pub fn visit(
    _directive: &UseDirective,
    _context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // use: directives attach actions to elements
    // Actions receive the element and optionally parameters
    // They return an object with update and destroy methods

    Ok(())
}
