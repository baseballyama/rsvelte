//! FunctionExpression visitor.
//!
//! Analyzes function expressions and arrow function expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/FunctionExpression.js`.

use super::shared::function::visit_function;
use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit a function expression (FunctionExpression or ArrowFunctionExpression).
///
/// Processes the function body with incremented function depth.
///
/// # Arguments
///
/// * `node` - The FunctionExpression or ArrowFunctionExpression AST node
/// * `context` - The visitor context
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Visit the function with incremented function depth
    visit_function(context, |ctx| {
        // Visit function body
        if let Some(body) = node.get("body") {
            let _ = super::script::walk_js_node(body, ctx);
        }
    });

    Ok(())
}
