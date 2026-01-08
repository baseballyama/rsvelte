//! TemplateElement visitor.
//!
//! Analyzes template literal elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/TemplateElement.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a template element.
pub fn visit(_context: &mut VisitorContext) -> Result<(), AnalysisError> {
    Ok(())
}
