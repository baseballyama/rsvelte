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
    // Extract the JSON value from the expression
    let expr_value = tag.expression.as_json();

    // Walk the JavaScript AST to analyze it
    // This will trigger CallExpression, MemberExpression, etc. visitors
    // which set needs_context when appropriate
    super::script::walk_js_node(expr_value, context)?;

    Ok(())
}

/// Alias for visit function.
pub fn visit_expression_tag(
    tag: &ExpressionTag,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    visit(tag, context)
}
