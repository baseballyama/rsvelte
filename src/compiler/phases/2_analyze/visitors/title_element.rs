//! TitleElement visitor.
//!
//! Analyzes <title> elements inside <svelte:head>.
//!
//! Corresponds to Svelte's `2-analyze/visitors/TitleElement.js`.

use super::super::errors;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::TitleElement;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a title element.
pub fn visit(title: &mut TitleElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for illegal attributes - title cannot have any attributes or directives
    if !title.attributes.is_empty() {
        return Err(errors::title_illegal_attribute());
    }

    // Analyze children
    fragment::analyze(&mut title.fragment, context)?;

    Ok(())
}
