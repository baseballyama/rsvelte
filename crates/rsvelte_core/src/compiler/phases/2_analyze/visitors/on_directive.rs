//! OnDirective visitor.
//!
//! Analyzes on: directives (event handlers).
//!
//! Corresponds to Svelte's `2-analyze/visitors/OnDirective.js`.

use super::super::AnalysisError;
use super::super::types::EventDirectiveInfo;
use super::super::warnings;
use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::utils::walk_js_expression_node;
use crate::ast::template::{OnDirective, TemplateNode};

/// Visit an on: directive.
///
/// In Svelte 5 (runes mode), on: directives are deprecated in favor of event attributes.
/// This visitor:
/// 1. Warns `event_directive_deprecated` in runes mode
/// 2. Tracks the first event directive (for detecting mixed syntax)
/// 3. Marks the subtree as dynamic
/// 4. Walks the expression to track dependencies
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
            // Component events might not be under the author's control, so they don't warn
            if context.analysis.runes {
                context.emit_warning(warnings::event_directive_deprecated(&directive.name));
            }

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

    // If there's no expression, this is an event forwarding/bubbling directive (on:click).
    // Note: The official compiler sets needs_props in the CLIENT transform phase, not here,
    // so that only the client output gets $$props injected, not the server output.
    // See: 3-transform/client/visitors/OnDirective.js line 21

    // Mark the subtree as dynamic (event handlers require runtime evaluation)
    mark_subtree_dynamic(&context.path);

    // Walk the expression to track dependencies and references and populate
    // `directive.metadata.expression` so Phase 3 can read `has_call` /
    // `has_state` without re-walking the expression.
    if let Some(ref expression) = directive.expression {
        let node = expression.as_node();
        walk_js_expression_node(&node, context, &mut directive.metadata.expression)?;
    }

    Ok(())
}
