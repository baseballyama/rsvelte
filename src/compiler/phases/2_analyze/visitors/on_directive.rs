//! OnDirective visitor.
//!
//! Analyzes on: directives (event handlers).
//!
//! Corresponds to Svelte's `2-analyze/visitors/OnDirective.js`.

use super::super::AnalysisError;
use super::super::types::EventDirectiveInfo;
use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::utils::walk_js_expression;
use crate::ast::template::{OnDirective, TemplateNode};

/// Visit an on: directive.
///
/// In Svelte 5 (runes mode), on: directives are deprecated in favor of event attributes.
/// This visitor:
/// 1. Tracks the first event directive (for detecting mixed syntax)
/// 2. Marks the subtree as dynamic
/// 3. Walks the expression to track dependencies
///
/// Note: The event_directive_deprecated warning is emitted by the parent element visitor
/// (RegularElement, SvelteElement) because this visitor doesn't have access to the parent type.
///
/// Corresponds to `OnDirective(node, context)` in OnDirective.js.
pub fn visit(
    directive: &mut OnDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Track the first event directive node (for error reporting about mixed syntax)
    // This is used to detect when both on: directives and event attributes are used
    let parent = context.path.last();
    if let Some(parent) = parent {
        let is_element = matches!(
            parent,
            TemplateNode::SvelteElement(_) | TemplateNode::RegularElement(_)
        );

        if is_element {
            // Track in context for mixed_event_handler_syntaxes check
            if context.event_directive_node.is_none() {
                context.event_directive_node = Some(directive.name.to_string());
            }
            // Also track in analysis for other purposes
            if context.analysis.event_directive_node.is_none() {
                context.analysis.event_directive_node = Some(EventDirectiveInfo {
                    name: directive.name.to_string(),
                    start: directive.start,
                    end: directive.end,
                });
            }
        }
    }

    // Mark the subtree as dynamic (event handlers require runtime evaluation)
    mark_subtree_dynamic(&context.path);

    // Walk the expression to track dependencies and references
    if let Some(ref expression) = directive.expression {
        // Create metadata for tracking expression dependencies
        // Note: In the full implementation, this metadata would be attached to
        // the parent element's metadata.expression field
        let mut metadata = crate::ast::template::ExpressionMetadata::default();

        let crate::ast::js::Expression::Value(value) = expression;
        walk_js_expression(value, context, &mut metadata)?;

        // The metadata tracking is handled by the parent element visitor
        // (RegularElement, SvelteElement, etc.) which creates and manages
        // the metadata.expression field
    }

    Ok(())
}
