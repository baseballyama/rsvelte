//! HtmlTag visitor.
//!
//! Analyzes {@html} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/HtmlTag.js`.

use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::utils::{validate_opening_tag, walk_js_expression_node};
use crate::ast::template::HtmlTag;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an HTML tag.
///
/// Validates the opening tag syntax in runes mode and marks the subtree as dynamic.
/// Populates expression metadata (has_call, has_member_expression, references, dependencies)
/// for use by the phase 3 transform (build_expression needs this for deep_read_state/untrack).
///
/// # Arguments
///
/// * `tag` - The {@html} tag node
/// * `context` - The visitor context
pub fn visit(tag: &mut HtmlTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if context.analysis.runes {
        validate_opening_tag(tag.start as usize, &context.analysis.source, '@')?;
    }

    // Mark the subtree as dynamic
    // This is necessary to fix invalid HTML
    mark_subtree_dynamic(&context.path);

    // Walk the JavaScript expression and populate metadata.
    // In the official Svelte compiler, this is done via:
    //   context.next({ ...context.state, expression: node.metadata.expression })
    // which causes the phase 2 walk to populate node.metadata.expression with
    // has_call, has_member_expression, references, dependencies etc.
    let node = tag.expression.as_node();
    walk_js_expression_node(&node, context, &mut tag.metadata.expression)?;

    Ok(())
}
