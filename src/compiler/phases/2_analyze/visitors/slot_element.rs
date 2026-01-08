//! SlotElement visitor.
//!
//! Analyzes <slot> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SlotElement.js`.

use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::SlotElement;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a slot element.
pub fn visit(slot: &SlotElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark that we use slots
    context.analysis.uses_slots = true;

    // Analyze fallback children
    fragment::analyze(&slot.fragment, context)?;

    Ok(())
}
