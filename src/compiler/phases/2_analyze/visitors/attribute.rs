//! Attribute visitor.
//!
//! Analyzes regular attributes.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Attribute.js`.

use super::VisitorContext;
use crate::ast::template::AttributeNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an attribute.
pub fn visit(
    _attribute: &AttributeNode,
    _context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Analyze attribute value expression if present
    // Track class and id values for CSS analysis

    Ok(())
}
