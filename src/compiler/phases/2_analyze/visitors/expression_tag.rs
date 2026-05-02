//! ExpressionTag visitor.
//!
//! Analyzes {expression} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExpressionTag.js`.

use super::VisitorContext;
use crate::ast::template::ExpressionTag;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an expression tag.
///
/// Analyzes the JavaScript expression within the tag to:
/// - Track variable references
/// - Mark bindings as used
/// - Detect reactive dependencies
/// - Set needs_context when non-safe identifiers are accessed
pub fn visit(tag: &ExpressionTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark that we're inside a template expression tag so that nested
    // `AwaitExpression` visitors can detect that the await is in a reactive
    // template position. Mirrors `state.expression = node.metadata.expression`
    // in the official `ExpressionTag.js`.
    let saved_in_expression_tag = context.in_expression_tag;
    context.in_expression_tag = true;

    // Walk the JavaScript AST to analyze it
    // This will trigger CallExpression, MemberExpression, etc. visitors
    // which set needs_context when appropriate
    let result = super::script::walk_expression(&tag.expression, context);

    context.in_expression_tag = saved_in_expression_tag;
    result?;

    // Detect pickled awaits in template expression tags.
    // Template expression tags are reactive contexts, so await expressions
    // that aren't the last evaluated expression need $.save() wrapping.
    let node = tag.expression.as_node();
    super::await_block::collect_pickled_awaits_node(
        &node,
        &mut context.analysis.pickled_awaits,
        context.parse_arena,
    );

    Ok(())
}

/// Alias for visit function.
pub fn visit_expression_tag(
    tag: &ExpressionTag,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(tag, context)
}
