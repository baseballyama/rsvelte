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
///
/// When the expression contains `await`, wraps in `$.async()`:
/// ```js
/// $.async(node, blockers, [() => expression], (node, $$key) => {
///     $.key(node, () => $.get($$key), ($$anchor) => { ... });
/// });
/// ```
pub fn key_block(node: &KeyBlock, context: &mut ComponentContext) -> TransformResult {
    use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression;

    // Add a comment marker to the template for hydration
    context.state.template.push_comment(None);

    let has_await = node.metadata.expression.has_await()
        || super::shared::utils::expression_has_await(&node.expression);
    let has_blockers = node.metadata.expression.has_blockers();

    // Build the key expression
    let expression = convert_expression(&node.expression, context);
    let transformed_expression = apply_transforms_to_expression(&expression, context);

    // When has_await, the key uses $.get($$key) instead of the original expression
    let key_expr = if has_await {
        b::thunk(b::call(b::member_path("$.get"), vec![b::id("$$key")]))
    } else {
        b::thunk(transformed_expression.clone())
    };

    // Visit the fragment - this returns a BlockStatement
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

    // Create the $.key() call statement
    let key_call_stmt = b::stmt(b::call(
        b::member_path("$.key"),
        vec![context.state.node.clone(), key_expr, body],
    ));

    // If the expression has await or blockers, wrap in $.async()
    if has_await || has_blockers {
        let metadata = ExpressionMetadata::from_template_metadata(&node.metadata.expression);
        let blockers_expr = if has_blockers {
            metadata.blockers()
        } else {
            b::array(vec![])
        };

        let async_values = if has_await {
            // Strip the top-level await since $.async handles the awaiting
            b::array(vec![b::thunk(b::strip_await(transformed_expression))])
        } else {
            b::undefined()
        };

        let node_name = match &context.state.node {
            JsExpr::Identifier(name) => name.clone(),
            _ => "node".to_string(),
        };
        let mut callback_params = vec![b::id_pattern(&node_name)];
        if has_await {
            callback_params.push(b::id_pattern("$$key"));
        }

        let callback = b::arrow_block(callback_params, vec![key_call_stmt]);

        context.state.init.push(b::stmt(b::call(
            b::member_path("$.async"),
            vec![
                context.state.node.clone(),
                blockers_expr,
                async_values,
                callback,
            ],
        )));
    } else {
        context.state.init.push(key_call_stmt);
    }

    TransformResult::None
}
