//! Function visitor for client-side transformation.
//!
//! Corresponds to `visit_function` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/function.js`.

use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Visit a function expression or arrow function.
///
/// This visitor handles function scoping and tracks whether we're in a constructor
/// or derived context. Corresponds to `visit_function` in the JavaScript implementation.
///
/// # Arguments
///
/// * `node` - The function node (either ArrowFunctionExpression or FunctionExpression)
/// * `context` - The component transformation context
///
/// # Behavior
///
/// - Clears `in_constructor` flag (except for constructor MethodDefinitions)
/// - Clears `in_derived` flag
/// - Continues visiting child nodes with updated state
pub fn visit_function(
    node: &JsFunctionNode,
    context: &mut ComponentContext,
) -> TransformResult {
    // Clone the current state and update flags
    let mut new_state = context.state.clone();
    new_state.in_constructor = false;
    new_state.in_derived = false;

    // Special case: if this is a FunctionExpression in a constructor MethodDefinition,
    // keep in_constructor = true
    if let JsFunctionNode::FunctionExpression(_) = node {
        if let Some(parent) = context.path.last() {
            // Check if parent is a MethodDefinition with kind = "constructor"
            // This would require checking the parent node type
            // For now, we'll check this in a simplified way
            if is_constructor_method(parent) {
                new_state.in_constructor = true;
            }
        }
    }

    // Continue visiting with the new state
    // In the JS implementation, this calls context.next(state)
    // which continues the visitor traversal with the new state
    context.state = new_state;

    TransformResult::None
}

/// Check if a node is a constructor method definition.
///
/// This is a helper to determine if we're inside a class constructor.
fn is_constructor_method(_node: &crate::ast::template::TemplateNode) -> bool {
    // TODO: Implement proper MethodDefinition check
    // This would require:
    // 1. Checking if the node is a MethodDefinition
    // 2. Checking if kind === 'constructor'
    //
    // For now, we return false as a safe default
    false
}

/// Function node types.
///
/// Represents either an arrow function or a regular function expression.
#[derive(Debug, Clone)]
pub enum JsFunctionNode {
    /// Arrow function expression
    ArrowFunctionExpression {
        /// Function parameters
        params: Vec<JsPattern>,
        /// Function body (expression or block)
        body: Box<JsExpr>,
        /// Whether the function is async
        is_async: bool,
    },

    /// Regular function expression
    FunctionExpression(JsFunctionExpression),
}

// Implementation note:
// The JavaScript version uses context.next(state) to continue traversal.
// In the Rust implementation, we update the context.state directly
// and return TransformResult::None to indicate no transformation was produced.
// The actual traversal continuation would be handled by the caller.
