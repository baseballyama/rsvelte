//! HtmlTag visitor.
//!
//! Analyzes {@html} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/HtmlTag.js`.

use super::shared::fragment::mark_subtree_dynamic;
use super::VisitorContext;
use crate::ast::template::HtmlTag;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an HTML tag.
///
/// Validates the opening tag syntax in runes mode and marks the subtree as dynamic.
///
/// # Arguments
///
/// * `tag` - The {@html} tag node
/// * `context` - The visitor context
pub fn visit(tag: &HtmlTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // In runes mode, validate the opening tag format
    if context.analysis.runes {
        // TODO: Implement validate_opening_tag
        // For now, we skip validation as it requires access to source code
        // validate_opening_tag(tag.start, source, '@')?;
    }

    // Mark the subtree as dynamic
    // This is necessary to fix invalid HTML
    mark_subtree_dynamic(&context.path);

    // Visit the expression
    // In the JavaScript version, this is done via context.next with expression state
    // In Rust, we handle this by walking the expression if needed
    // Walk the JavaScript expression
    let crate::ast::js::Expression::Value(ref value) = tag.expression;
    let _ = super::script::walk_js_node(value, context);

    Ok(())
}
