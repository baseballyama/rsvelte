//! Fragment visitor.
//!
//! Analyzes template fragments.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Fragment.js`.

use super::VisitorContext;
use crate::ast::template::Fragment;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Analyze a fragment.
///
/// This is the main entry point for fragment analysis from the root level.
/// It delegates to shared/fragment.rs for the actual node processing, which
/// includes const_tag_cycle checking.
pub fn analyze(fragment: &mut Fragment, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // The shared::fragment::analyze function handles:
    // - Checking for cyclical dependencies between ConstTag nodes
    // - Visiting each child node
    // - Extracting svelte-ignore codes and emitting legacy_code/unknown_code warnings
    super::shared::fragment::analyze(fragment, context)?;

    Ok(())
}
