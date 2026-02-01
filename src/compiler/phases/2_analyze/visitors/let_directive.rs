//! LetDirective visitor.
//!
//! Analyzes let: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/LetDirective.js`.

use super::VisitorContext;
use super::super::errors;
use crate::ast::template::{LetDirective, TemplateNode};
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a let directive.
///
/// Validates that let: directives are only used on valid parent elements.
/// Valid parents are: Component, RegularElement, SlotElement, SvelteElement,
/// SvelteComponent, SvelteSelf, SvelteFragment.
///
/// Corresponds to `LetDirective(node, context)` in LetDirective.js.
pub fn visit(
    _directive: &LetDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Check if parent is a valid element for let: directive
    let parent = context.path.last();

    let is_valid_parent = match parent {
        Some(TemplateNode::Component(_)) => true,
        Some(TemplateNode::RegularElement(_)) => true,
        Some(TemplateNode::SlotElement(_)) => true,
        Some(TemplateNode::SvelteElement(_)) => true,
        Some(TemplateNode::SvelteComponent(_)) => true,
        Some(TemplateNode::SvelteSelf(_)) => true,
        Some(TemplateNode::SvelteFragment(_)) => true,
        _ => false,
    };

    if !is_valid_parent {
        return Err(errors::let_directive_invalid_placement());
    }

    // let: directives receive slot props
    // They create a local binding in the component scope

    // In a full implementation, we would:
    // - Create a binding for the let name
    // - Track the slot prop reference

    Ok(())
}

/// Check if a parent node is valid for let directive.
/// This is used by element visitors to validate let directives on their attributes.
pub fn is_valid_let_directive_parent(parent_type: &str) -> bool {
    matches!(
        parent_type,
        "Component"
            | "RegularElement"
            | "SlotElement"
            | "SvelteElement"
            | "SvelteComponent"
            | "SvelteSelf"
            | "SvelteFragment"
    )
}
