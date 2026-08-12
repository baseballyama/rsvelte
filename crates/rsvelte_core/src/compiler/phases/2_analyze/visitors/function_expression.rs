//! FunctionExpression visitor.
//!
//! Analyzes function expressions and arrow function expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/FunctionExpression.js`.

use super::VisitorContext;
use super::shared::function::{visit_function, visit_parameter_defaults};
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a function expression or arrow function expression (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let arena = context.parse_arena;

    // Get body start for scope lookup
    let (params, body_id) = match node {
        JsNode::FunctionExpression { params, body, .. } => (*params, *body),
        JsNode::ArrowFunctionExpression { params, body, .. } => (*params, Some(*body)),
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
        if let Err(error) = visit_parameter_defaults(params, ctx) {
            result = Err(error);
            return;
        }
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
