//! KeyBlock visitor for client-side transformation.
//!
//! Corresponds to `KeyBlock.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/KeyBlock.js`.

use crate::ast::template::KeyBlock;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::fragment::fragment;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_expression;
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
    // Add a comment marker to the template for hydration
    context.state.template.push_comment(None);

    let has_await = node.metadata.expression.has_await()
        || super::shared::utils::expression_has_await(&node.expression);
    // Build the key expression using build_expression (mirrors official KeyBlock.js)
    // This applies both transforms AND legacy $.untrack() wrapping
    let expression = convert_expression(&node.expression, context);
    let expr_metadata = ExpressionMetadata::from_template_metadata(&node.metadata.expression);
    let transformed_expression = build_expression(context, &expression, &expr_metadata);

    // Check blocker_map for blocked identifiers referenced in the expression
    let blocker_exprs_for_key = context
        .state
        .get_blockers_for_expr(&transformed_expression, &context.arena);
    let has_blockers = !blocker_exprs_for_key.is_empty();

    // When has_await, the key uses $.get($$key) instead of the original expression
    let key_expr = if has_await {
        b::thunk(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.get"),
                vec![b::id("$$key")],
            ),
        )
    } else {
        b::thunk(&context.arena, transformed_expression.clone())
    };

    // Visit the fragment - this returns a BlockStatement
    let prev_in_control_flow = context.state.in_control_flow_block;
    context.state.in_control_flow_block = true;
    let body_block = fragment(&node.fragment, context, false);
    context.state.in_control_flow_block = prev_in_control_flow;

    // Convert BlockStatement to arrow function body expression
    let anchor_param = b::id_pattern("$$anchor");
    let body = JsExpr::Arrow(
        crate::compiler::phases::phase3_transform::js_ast::nodes::JsArrowFunction {
            params: vec![anchor_param].into(),
            body: crate::compiler::phases::phase3_transform::js_ast::nodes::JsArrowBody::Block(
                body_block,
            ),
            is_async: false,
        },
    );

    // Create the $.key() call statement
    let key_call = b::call(
        &context.arena,
        b::member_path(&context.arena, "$.key"),
        vec![context.state.node.clone(), key_expr, body],
    );
    let key_call_stmt = if context.state.dev {
        use crate::compiler::phases::phase3_transform::client::visitors::attribute::locate_in_source;
        let (line, col) = locate_in_source(&context.state.analysis.source, node.start as usize);
        super::shared::utils::add_svelte_meta_dev(
            &context.arena,
            key_call,
            "key",
            &context.state.analysis.name,
            line,
            col,
            None,
            true,
        )
    } else {
        b::stmt(&context.arena, key_call)
    };

    // If the expression has await or blockers, wrap in $.async()
    if has_await || has_blockers {
        let blockers_expr = if has_blockers {
            b::array(blocker_exprs_for_key)
        } else {
            b::array(vec![])
        };

        let async_values = if has_await {
            // Strip the top-level await since $.async handles the awaiting
            b::array(vec![b::thunk(
                &context.arena,
                b::strip_await(&context.arena, transformed_expression),
            )])
        } else {
            b::undefined(&context.arena)
        };

        let node_name = match &context.state.node {
            JsExpr::Identifier(name) => name.clone(),
            _ => "node".into(),
        };
        let mut callback_params = vec![b::id_pattern(node_name.clone())];
        if has_await {
            callback_params.push(b::id_pattern("$$key"));
        }

        let callback = b::arrow_block(callback_params, vec![key_call_stmt]);

        context.state.init.push(b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.async"),
                vec![
                    context.state.node.clone(),
                    blockers_expr,
                    async_values,
                    callback,
                ],
            ),
        ));
    } else {
        context.state.init.push(key_call_stmt);
    }

    TransformResult::None
}
