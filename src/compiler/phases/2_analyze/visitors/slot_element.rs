//! SlotElement visitor.
//!
//! Analyzes <slot> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SlotElement.js`.

use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::SlotElement;
use crate::compiler::phases::phase2_analyze::{AnalysisError, warnings};

/// Visit a slot element.
pub fn visit(slot: &mut SlotElement, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // In runes mode (without custom elements), emit a deprecation warning
    if context.analysis.runes && context.analysis.custom_element.is_none() {
        context.emit_warning(warnings::slot_element_deprecated());
    }

    // Mark that we use slots
    context.analysis.uses_slots = true;

    // Mark that we have control flow affecting sibling relationships
    // (slots inject content from parent components)
    context.analysis.css.has_control_flow = true;

    // Analyze fallback children
    fragment::analyze(&mut slot.fragment, context)?;

    Ok(())
}
