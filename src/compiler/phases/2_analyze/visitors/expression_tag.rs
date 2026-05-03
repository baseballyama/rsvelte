//! ExpressionTag visitor.
//!
//! Analyzes {expression} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExpressionTag.js`.

use super::VisitorContext;
use super::shared::utils::walk_js_expression_node;
use crate::ast::template::ExpressionTag;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an expression tag.
///
/// Analyzes the JavaScript expression within the tag to:
/// - Track variable references
/// - Mark bindings as used
/// - Detect reactive dependencies
/// - Set needs_context when non-safe identifiers are accessed
/// - Populate `tag.metadata.expression` so Phase 3 transforms can read
///   `has_call`, `has_state`, etc. without re-walking the expression
pub fn visit(tag: &mut ExpressionTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark that we're inside a template expression tag so that nested
    // `AwaitExpression` visitors can detect that the await is in a reactive
    // template position. Mirrors `state.expression = node.metadata.expression`
    // in the official `ExpressionTag.js`.
    let saved_in_expression_tag = context.in_expression_tag;
    context.in_expression_tag = true;

    // Walk the JS AST and populate `tag.metadata.expression` (has_call,
    // has_state, dependencies, …). The walker dispatches to the typed
    // visitors so identifier / call / member analysis still runs.
    let node = tag.expression.as_node();
    let result = walk_js_expression_node(&node, context, &mut tag.metadata.expression);

    context.in_expression_tag = saved_in_expression_tag;
    result?;

    // Detect pickled awaits in template expression tags.
    // Template expression tags are reactive contexts, so await expressions
    // that aren't the last evaluated expression need $.save() wrapping.
    super::await_block::collect_pickled_awaits_node(
        &node,
        &mut context.analysis.pickled_awaits,
        context.parse_arena,
    );

    Ok(())
}

/// Alias for visit function.
pub fn visit_expression_tag(
    tag: &mut ExpressionTag,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(tag, context)
}
