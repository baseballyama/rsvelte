//! TitleElement visitor.
//!
//! Analyzes <title> elements inside <svelte:head>.
//!
//! Corresponds to Svelte's `2-analyze/visitors/TitleElement.js`.

use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::TitleElement;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a title element.
pub fn visit(title: &mut TitleElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Analyze children
    fragment::analyze(&mut title.fragment, context)?;

    Ok(())
}
