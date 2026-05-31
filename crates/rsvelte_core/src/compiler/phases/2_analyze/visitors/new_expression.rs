//! NewExpression visitor.
//!
//! Analyzes new expressions and issues performance warnings for inline class instantiations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/NewExpression.js`.

use super::VisitorContext;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::{AnalysisError, warnings};
use serde_json::Value;

/// Visit a new expression.
///
/// Analyzes `new` expressions to detect inline class instantiations (`new class { ... }`)
/// and sets the `needs_context` flag.
///
/// # Arguments
///
/// * `node` - The NewExpression AST node
/// * `context` - The visitor context
///
/// # Warnings
///
/// - `perf_avoid_inline_class`: Warns when `new class` is used inside a function (function_depth > 0)
///
/// # Example
///
/// ```javascript
/// // ❌ Warns: inline class in function
/// function foo() {
///   const instance = new class {
///     method() { }
///   };
/// }
///
/// // ✅ OK: class declared at top level
/// class MyClass {
///   method() { }
/// }
/// const instance = new MyClass();
/// ```
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check if this is `new class { ... }` (inline class expression)
    // and if we're inside a function (function_depth > 0)
    if let Some(callee) = node.get("callee")
        && callee.get("type").and_then(|t| t.as_str()) == Some("ClassExpression")
        && context.function_depth > 0
    {
        context.emit_warning(warnings::perf_avoid_inline_class());
    }

    // Mark that we need context for new expressions
    // This is required for proper runtime behavior
    context.analysis.needs_context = true;

    // Visit children (callee and arguments)
    // In JavaScript this is done with context.next()

    // Visit the callee (class expression or identifier)
    if let Some(callee) = node.get("callee") {
        super::script::walk_js_node(callee, context)?;
    }

    // Visit the arguments
    if let Some(arguments) = node.get("arguments").and_then(|a| a.as_array()) {
        for arg in arguments {
            super::script::walk_js_node(arg, context)?;
        }
    }

    Ok(())
}

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
