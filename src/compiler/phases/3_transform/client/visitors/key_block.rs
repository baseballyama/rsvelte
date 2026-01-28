//! KeyBlock visitor for client-side transformation.
//!
//! Corresponds to `KeyBlock.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/KeyBlock.js`.

use crate::ast::template::KeyBlock;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::shared::fragment::process_children;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;

/// Visit a KeyBlock node.
///
/// Corresponds to `KeyBlock()` function in KeyBlock.js.
pub fn key_block(node: &KeyBlock, context: &mut ComponentContext) -> TransformResult {
    // Add a comment marker to the template for hydration
    context.state.template.push_comment(None);

    // Build the key expression
    // TODO: Handle async expressions with blockers
    let expression = convert_expression(&node.expression, context);
    let key = b::arrow(vec![], expression);

    // Process the fragment content into a separate template
    // Save current template and create a new one for the KeyBlock body
    let saved_template = std::mem::take(&mut context.state.template);
    let saved_init = std::mem::take(&mut context.state.init);
    let saved_update = std::mem::take(&mut context.state.update);
    let saved_after_update = std::mem::take(&mut context.state.after_update);

    // Create fragment variable for the body
    let fragment_id = context.state.memoizer.generate_id("fragment");
    let saved_node = std::mem::replace(&mut context.state.node, b::id(&fragment_id));

    // Visit fragment children with new template
    process_children(
        &node.fragment.nodes,
        |_is_text| b::call(b::member_path("$.first_child"), vec![b::id(&fragment_id)]),
        false,
        context,
    );

    let child_init = std::mem::take(&mut context.state.init);
    let child_update = std::mem::take(&mut context.state.update);
    let child_after_update = std::mem::take(&mut context.state.after_update);

    // Get the child template and generate hoisted template variable
    let child_template = std::mem::replace(&mut context.state.template, saved_template);
    let template_name = context.state.memoizer.generate_id("key_content");
    let template_html = child_template.as_html();
    let template_call = b::call(
        b::member_path("$.from_html"),
        vec![template_html, b::number(1.0)],
    );

    // Add the hoisted template declaration
    context
        .state
        .hoisted
        .push(b::var_decl(&template_name, Some(template_call)));

    // Restore state
    context.state.init = saved_init;
    context.state.update = saved_update;
    context.state.after_update = saved_after_update;
    context.state.node = saved_node;

    // Build the body of the key callback
    let mut body_stmts = vec![];

    // Create fragment from template
    body_stmts.push(b::var_decl(
        &fragment_id,
        Some(b::call(b::id(&template_name), vec![])),
    ));

    body_stmts.extend(child_init);

    // Add template effect if there are updates
    if !child_update.is_empty() {
        body_stmts.push(b::stmt(b::call(
            b::member_path("$.template_effect"),
            vec![b::arrow_block(vec![], child_update)],
        )));
    }

    body_stmts.extend(child_after_update);

    // Add $.append call at the end
    body_stmts.push(b::stmt(b::call(
        b::member_path("$.append"),
        vec![b::id("$$anchor"), b::id(&fragment_id)],
    )));

    let anchor_param = b::id_pattern("$$anchor");
    let body = JsExpr::Arrow(crate::compiler::phases::phase3_transform::js_ast::nodes::JsArrowFunction {
        params: vec![anchor_param],
        body: crate::compiler::phases::phase3_transform::js_ast::nodes::JsArrowBody::Block(
            crate::compiler::phases::phase3_transform::js_ast::nodes::JsBlockStatement::with_body(body_stmts),
        ),
        is_async: false,
    });

    // Create the $.key() call
    let key_call = b::call(
        b::member_path("$.key"),
        vec![context.state.node.clone(), key, body],
    );

    context.state.init.push(b::stmt(key_call));

    TransformResult::None
}
