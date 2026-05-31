//! Shared assignment expression handling.
//!
//! Corresponds to `visit_assignment_expression` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/shared/assignments.js`.

use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Visit an assignment expression with custom build function.
///
/// This function handles assignment expressions, including destructuring patterns.
/// It delegates to the provided `build_assignment` function to generate the
/// transformed assignment expression.
///
/// # Arguments
///
/// * `node` - The assignment expression node
/// * `context` - The component transformation context
/// * `build_assignment` - A function to build the transformed assignment
///
/// # Returns
///
/// Returns the transformed expression, or the original if no transformation is needed.
pub fn visit_assignment_expression<F>(
    node: &JsAssignmentExpression,
    context: &mut ComponentContext,
    build_assignment: F,
) -> JsExpr
where
    F: Fn(&str, &JsExpr, &JsExpr, &mut ComponentContext) -> Option<JsExpr>,
{
    // Call the build_assignment function
    // node.left and node.right are ExprIds - resolve through arena
    let left = context.arena.get_expr(node.left).clone();
    let right = context.arena.get_expr(node.right).clone();
    if let Some(transformed) = build_assignment(&node.operator.to_string(), &left, &right, context)
    {
        return transformed;
    }

    // No transformation needed, return the original assignment
    // (This would typically be handled by visiting the node normally)
    JsExpr::Assignment(node.clone())
}

// ============================================================================
// Type Extensions
// ============================================================================

// Note: JsAssignmentOp already implements Display trait in js_ast/nodes.rs
// Use .to_string() directly instead of implementing a custom method
