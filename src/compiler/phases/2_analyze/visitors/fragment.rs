//! Fragment visitor.
//!
//! Analyzes template fragments.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Fragment.js`.

use super::VisitorContext;
use crate::ast::template::Fragment;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Analyze a fragment.
pub fn analyze(fragment: &mut Fragment, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    for node in &mut fragment.nodes {
        super::visit_node(node, context)?;
    }
    Ok(())
}

/// Alias for analyze function.
pub fn visit_fragment(
    fragment: &mut Fragment,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    analyze(fragment, context)
}
