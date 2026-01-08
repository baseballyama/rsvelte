//! SpreadAttribute visitor.
//!
//! Analyzes spread attributes {...obj}.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SpreadAttribute.js`.

use super::VisitorContext;
use crate::ast::template::SpreadAttribute;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a spread attribute.
pub fn visit(
    _attribute: &SpreadAttribute,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Spreads can contain class/style, so we can't safely prune CSS
    context.analysis.css.has_dynamic_classes = true;

    Ok(())
}
