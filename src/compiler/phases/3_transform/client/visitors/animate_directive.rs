//! Animate directive visitor for client-side transformation.
//!
//! Corresponds to `AnimateDirective` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/AnimateDirective.js`.

use crate::ast::template::AnimateDirective;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::{
    apply_transforms_to_expression, parse_directive_name,
};
use crate::compiler::phases::phase3_transform::client::visitors::transition_directive::get_blockers_for_exprs;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;

/// Visit an animate directive.
///
/// Generates code to apply animations to elements using the `$.animation` runtime function.
/// The animation is registered in the `after_update` hook to ensure it runs after `bind:this`.
///
/// # Arguments
///
/// * `node` - The animate directive node
/// * `context` - The component transformation context
///
/// # Behavior
///
/// - If the directive has no expression, uses `null` as the animation parameter
/// - Otherwise, wraps the expression in a thunk
/// - Adds the animation call to the `after_update` array
/// - If the expression is async (has blockers), wrap in `$.run_after_blockers`
///
/// # Implementation
///
/// The JavaScript implementation:
/// ```javascript
/// export function AnimateDirective(node, context) {
///     const expression =
///         node.expression === null
///             ? b.null
///             : b.thunk(/** @type {Expression} */ (context.visit(node.expression)));
///
///     // in after_update to ensure it always happens after bind:this
///     let statement = b.stmt(
///         b.call(
///             '$.animation',
///             context.state.node,
///             b.thunk(/** @type {Expression} */ (context.visit(parse_directive_name(&context.arena, node.name)))),
///             expression
///         )
///     );
///
///     if (node.metadata.expression.is_async()) {
///         statement = b.stmt(
///             b.call(
///                 '$.run_after_blockers',
///                 node.metadata.expression.blockers(),
///                 b.thunk(b.block([statement]))
///             )
///         );
///     }
///
///     context.state.after_update.push(statement);
/// }
/// ```
pub fn animate_directive(node: &AnimateDirective, context: &mut ComponentContext) {
    // Build the expression: either null or a thunk containing the visited expression
    let expr_for_blockers;
    let expression = if let Some(ref expr) = node.expression {
        // Convert the expression using the expression converter, then apply transforms
        // so that reactive references like each-block index get $.get() wrapping
        let visited_expr = convert_expression(expr, context);
        let transformed_expr = apply_transforms_to_expression(&visited_expr, context);
        expr_for_blockers = Some(transformed_expr.clone());
        b::thunk(&context.arena, transformed_expr)
    } else {
        expr_for_blockers = None;
        b::null()
    };

    // Parse the directive name (e.g., "fade" or "custom.animation")
    // Apply transforms so that $state/$derived references get $.get() wrapping
    let name_expr =
        apply_transforms_to_expression(&parse_directive_name(&context.arena, &node.name), context);

    // Build the animation call: $.animation(node, () => name, expression)
    let mut statement = b::stmt(
        &context.arena,
        b::call(
            &context.arena,
            b::member_path(&context.arena, "$.animation"),
            vec![
                context.state.node.clone(),
                b::thunk(&context.arena, name_expr.clone()),
                expression,
            ],
        ),
    );

    // Check if any referenced variables are blocked by async promises.
    let mut blocker_check_exprs: Vec<&JsExpr> = vec![&name_expr];
    if let Some(ref expr) = expr_for_blockers {
        blocker_check_exprs.push(expr);
    }
    let blocker_exprs = get_blockers_for_exprs(&blocker_check_exprs, context);

    if !blocker_exprs.is_empty() {
        let blockers_array = b::array(blocker_exprs);
        statement = b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.run_after_blockers"),
                vec![blockers_array, b::arrow_block(vec![], vec![statement])],
            ),
        );
    }

    // Add to after_update to ensure it runs after bind:this
    context.state.after_update.push(statement);
}
