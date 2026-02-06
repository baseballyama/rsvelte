//! KeyBlock visitor for client-side transformation.
//!
//! Corresponds to `KeyBlock.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/KeyBlock.js`.

use crate::ast::template::KeyBlock;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::fragment::fragment;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;

/// Visit a KeyBlock node.
///
/// Corresponds to `KeyBlock()` function in KeyBlock.js.
///
/// Generates code like:
/// ```js
/// $.key(node, () => expression, ($$anchor) => {
///     // fragment body
/// });
/// ```
pub fn key_block(node: &KeyBlock, context: &mut ComponentContext) -> TransformResult {
    use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression;

    // Add a comment marker to the template for hydration
    context.state.template.push_comment(None);

    // Build the key expression
    // TODO: Handle async expressions with blockers
    // We need to apply transforms (e.g., $.get() for reactive variables)
    let expression = convert_expression(&node.expression, context);
    let transformed_expression = apply_transforms_to_expression(&expression, context);
    let key = b::thunk(transformed_expression);

    // Visit the fragment - this returns a BlockStatement
    // The fragment function handles template hoisting internally
    let body_block = fragment(&node.fragment, context, false);

    // Convert BlockStatement to arrow function body expression
    let anchor_param = b::id_pattern("$$anchor");
    let body = JsExpr::Arrow(
        crate::compiler::phases::phase3_transform::js_ast::nodes::JsArrowFunction {
            params: vec![anchor_param],
            body: crate::compiler::phases::phase3_transform::js_ast::nodes::JsArrowBody::Block(
                body_block,
            ),
            is_async: false,
        },
    );

    // Create the $.key() call
    let key_call = b::call(
        b::member_path("$.key"),
        vec![context.state.node.clone(), key, body],
    );

    context.state.init.push(b::stmt(key_call));

    TransformResult::None
}
