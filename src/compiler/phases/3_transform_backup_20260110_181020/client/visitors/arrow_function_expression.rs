//! Arrow function expression visitor for client-side transformation.
//!
//! Corresponds to `ArrowFunctionExpression` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/ArrowFunctionExpression.js`.

use super::shared::function::*;
use crate::compiler::phases::phase3_transform::client::types::*;

/// Visit an arrow function expression.
///
/// This visitor delegates to the shared `visit_function` utility.
///
/// # Arguments
///
/// * `node` - The arrow function expression node
/// * `context` - The component transformation context
///
/// # Returns
///
/// Returns the transformation result from visiting the function.
pub fn arrow_function_expression(
    node: &JsFunctionNode,
    context: &mut ComponentContext,
) -> TransformResult {
    visit_function(node, context)
}
