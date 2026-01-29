//! AttachTag visitor for client-side transformation.
//!
//! Corresponds to `AttachTag.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/AttachTag.js`.
//!
//! This visitor handles {@attach} tags which attach behaviors to elements.

use crate::ast::template::AttachTag;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;

/// Visit an AttachTag node and generate $.attach call.
///
/// Corresponds to `AttachTag()` function in AttachTag.js.
///
/// Generates code like:
/// ```javascript
/// $.attach(node, () => expression);
/// ```
pub fn attach_tag(node: &AttachTag, context: &mut ComponentContext) -> TransformResult {
    // Convert the expression from AST to JS AST
    let js_expr = convert_expression(&node.expression, context);

    // Apply transforms (e.g., $.get() wrapping for reactive values)
    let expression = apply_transforms_to_expression(&js_expr, context);

    // Create the $.attach call: $.attach(node, () => expression)
    let statement = b::stmt(b::call(
        b::member_path("$.attach"),
        vec![context.state.node.clone(), b::thunk(expression)],
    ));

    // TODO: Handle async case
    // if node.metadata.expression.has_await() {
    //     statement = b::stmt(b::call(
    //         b::member_path("$.run_after_blockers"),
    //         vec![
    //             node.metadata.expression.blockers(),
    //             b::thunk(b::block(vec![statement])),
    //         ],
    //     ));
    // }

    context.state.init.push(statement);

    TransformResult::None
}
