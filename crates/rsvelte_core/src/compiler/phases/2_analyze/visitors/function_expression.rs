//! FunctionExpression visitor.
//!
//! Analyzes function expressions and arrow function expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/FunctionExpression.js`.

use super::VisitorContext;
use super::shared::function::visit_function;
use crate::ast::typed_expr::JsNode;
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

/// Visit a function expression or arrow function expression (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;

    // Get body start for scope lookup
    let body_id = match node {
        JsNode::FunctionExpression { body, .. } => *body,
        JsNode::ArrowFunctionExpression { body, .. } => Some(*body),
        _ => return Ok(()),
    };

    let body_start: Option<u32> = body_id.and_then(|b| arena.get_js_node(b).start());
    let saved_scope = context.scope;
    if let Some(start) = body_start
        && let Some(&scope_idx) = context.analysis.root.function_scope_map.get(&start)
    {
        context.scope = scope_idx;
    }

    let mut result = Ok(());
    visit_function(context, |ctx| {
        // Visit function body
        if let Some(body_id) = body_id
            && let Err(e) = super::script::walk_js_node_typed(arena.get_js_node(body_id), ctx)
        {
            result = Err(e);
        }
    });

    context.scope = saved_scope;
    result
}
