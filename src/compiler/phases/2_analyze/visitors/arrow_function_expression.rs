//! ArrowFunctionExpression visitor.
//!
//! Analyzes arrow function expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ArrowFunctionExpression.js`.

use super::VisitorContext;
use super::shared::function::visit_function;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an arrow function expression.
///
/// Corresponds to `ArrowFunctionExpression` in ArrowFunctionExpression.js.
///
/// Arrow functions create a new function scope and increment the function depth.
/// This is important for tracking which variables are accessible and for $effect analysis.
pub fn visit(context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // In JS: visit_function(node, context)
    // This increments function_depth and handles expression tracking
    visit_function(context, |_ctx| {
        // TODO: Visit function body when JavaScript AST traversal is implemented
        // For now, the function_depth is already incremented by visit_function
    });

    Ok(())
}
