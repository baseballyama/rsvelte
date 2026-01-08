//! BindDirective visitor.
//!
//! Analyzes bind: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/BindDirective.js`.

use super::VisitorContext;
use crate::ast::template::BindDirective;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a bind directive.
pub fn visit(
    _directive: &BindDirective,
    _context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Validate the binding name for the element type
    // Different elements support different bindings

    // Common bindings: this, value, checked, group, files
    // Input-specific: value, checked
    // Select-specific: value
    // Textarea-specific: value
    // Details-specific: open
    // Media elements: currentTime, duration, paused, volume, etc.
    // Window: innerWidth, innerHeight, scrollX, scrollY, online
    // Document: activeElement

    Ok(())
}
