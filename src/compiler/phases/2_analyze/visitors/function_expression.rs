//! FunctionExpression visitor.
//!
//! Analyzes function expressions and arrow function expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/FunctionExpression.js`.

use super::VisitorContext;
use super::shared::function::visit_function;
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
    // Look up the scope for this function body from the function_scope_map
    // This enables is_safe_identifier to correctly resolve lexical scoping
    let body_start: Option<u32> = node
        .get("body")
        .and_then(|b| b.get("start"))
        .and_then(|s| s.as_u64())
        .map(|s| s as u32);
    let saved_scope = context.scope;
    if let Some(start) = body_start
        && let Some(&scope_idx) = context.analysis.root.function_scope_map.get(&start)
    {
        context.scope = scope_idx;
    }

    let mut result = Ok(());
    visit_function(context, |ctx| {
        // Visit function body
        if let Some(body) = node.get("body")
            && let Err(e) = super::script::walk_js_node(body, ctx)
        {
            result = Err(e);
        }
    });

    context.scope = saved_scope;
    result
}
