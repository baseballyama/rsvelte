//! TitleElement visitor for client-side transformation.
//!
//! Handles `<title>` elements within `<svelte:head>`.
//!
//! Corresponds to `TitleElement.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/TitleElement.js`.

use crate::ast::template::{TemplateNode, TitleElement};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsBinaryOp;

/// Visit a TitleElement node and generate client-side code.
///
/// Generates code like:
/// ```js
/// $.effect(() => {
///     $.document.title = 'woo!!!';
/// });
/// ```
///
/// Or for dynamic content:
/// ```js
/// $.effect(() => {
///     $.document.title = value ?? '';
/// });
/// ```
pub fn title_element(node: &TitleElement, context: &mut ComponentContext) {
    // Build the value expression from the fragment content
    let value = build_title_content(&node.fragment.nodes, context);

    // Create the assignment: $.document.title = value
    let document_title = b::member(b::member_path("$.document"), "title");

    let assignment = b::stmt(b::assign(document_title, value));

    // Wrap in an effect for reactivity
    let effect_call = b::stmt(b::call(
        b::member_path("$.effect"),
        vec![b::thunk_block(vec![assignment])],
    ));

    // Add to after_update (title changes should happen after the initial render)
    context.state.after_update.push(effect_call);
}

/// Build the title content from fragment nodes.
///
/// Handles text nodes and expression tags to build a single value expression.
fn build_title_content(
    nodes: &[TemplateNode],
    context: &mut ComponentContext,
) -> crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr {
    if nodes.is_empty() {
        return b::string("");
    }

    // If single text node, return literal string
    if nodes.len() == 1
        && let TemplateNode::Text(text) = &nodes[0]
    {
        return b::string(text.data.to_string());
    }

    // Build concatenated expression for multiple nodes
    let mut parts: Vec<crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr> =
        Vec::new();

    for node in nodes {
        match node {
            TemplateNode::Text(text) => {
                parts.push(b::string(text.data.to_string()));
            }
            TemplateNode::ExpressionTag(expr) => {
                let value = convert_expression(&expr.expression, context);
                parts.push(value);
            }
            _ => {}
        }
    }

    // Concatenate with + operator or use template literal
    if parts.len() == 1 {
        parts.into_iter().next().unwrap()
    } else {
        // Join with binary + operations
        parts
            .into_iter()
            .reduce(|acc, part| b::binary(JsBinaryOp::Add, acc, part))
            .unwrap_or_else(|| b::string(""))
    }
}
