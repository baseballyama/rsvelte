//! NewExpression visitor.
//!
//! Analyzes new expressions and issues performance warnings for inline class instantiations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/NewExpression.js`.

use super::VisitorContext;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::{AnalysisError, warnings};

/// Visit a new expression (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::NewExpression {
        callee, arguments, ..
    } = node
    {
        let arena = context.parse_arena;
        let callee_node = arena.get_js_node(*callee);

        // Check for `new class { ... }` (inline class expression)
        if matches!(callee_node, JsNode::ClassExpression { .. }) && context.function_depth > 0 {
            context.emit_warning(warnings::perf_avoid_inline_class());
        }

        // Mark that we need context
        context.analysis.needs_context = true;

        // Visit callee
        super::script::walk_js_node_typed(callee_node, context)?;

        // Visit arguments
        for arg in arena.get_js_children(*arguments) {
            super::script::walk_js_node_typed(arg, context)?;
        }
    }

    Ok(())
}
