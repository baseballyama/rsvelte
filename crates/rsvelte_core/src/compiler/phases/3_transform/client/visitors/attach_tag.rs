//! AttachTag visitor for client-side transformation.
//!
//! Corresponds to `AttachTag.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/AttachTag.js`.
//!
//! This visitor handles {@attach} tags which attach behaviors to elements.

use crate::ast::template::AttachTag;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_expression;
use crate::compiler::phases::phase3_transform::client::visitors::transition_directive::get_blockers_for_exprs;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;

/// Visit an AttachTag node and generate $.attach call.
///
/// Corresponds to `AttachTag()` function in AttachTag.js.
///
/// Generates code like:
/// ```javascript
/// $.attach(node, () => expression);
/// ```
///
/// If the expression references variables blocked by async promises,
/// wraps in `$.run_after_blockers`:
/// ```javascript
/// $.run_after_blockers([$$promises[N]], () => {
///     $.attach(node, () => expression);
/// });
/// ```
pub fn attach_tag(node: &AttachTag, context: &mut ComponentContext) -> TransformResult {
    // Convert the expression from AST to JS AST
    let js_expr = convert_expression(&node.expression, context);

    // Apply transforms using build_expression (mirrors official AttachTag.js)
    // This applies both transforms AND legacy $.untrack() wrapping
    let expr_metadata = ExpressionMetadata::from_template_metadata(&node.metadata.expression);
    let expression = build_expression(context, &js_expr, &expr_metadata);

    // Create the $.attach call: $.attach(node, () => expression)
    let mut statement = b::stmt(
        &context.arena,
        b::call(
            &context.arena,
            b::member_path(&context.arena, "$.attach"),
            vec![
                context.state.node.clone(),
                b::thunk(&context.arena, expression.clone()),
            ],
        ),
    );

    // Check if any referenced variables are blocked by async promises.
    let blocker_check_exprs: Vec<&JsExpr> = vec![&expression];
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

    context.state.init.push(statement);

    TransformResult::None
}
