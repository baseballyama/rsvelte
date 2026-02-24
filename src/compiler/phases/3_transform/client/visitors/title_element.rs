//! TitleElement visitor for client-side transformation.
//!
//! Handles `<title>` elements within `<svelte:head>`.
//!
//! Corresponds to `TitleElement.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/TitleElement.js`.

use crate::ast::template::{TemplateNode, TitleElement};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::{
    apply_transforms_to_expression, expression_has_reactive_state,
};
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsBinaryOp;

/// Visit a TitleElement node and generate client-side code.
///
/// Generates code like:
/// ```js
/// $.deferred_template_effect(() => {
///     $.document.title = value ?? '';
/// });
/// ```
///
/// Or for static content:
/// ```js
/// $.effect(() => {
///     $.document.title = 'woo!!!';
/// });
/// ```
pub fn title_element(node: &TitleElement, context: &mut ComponentContext) {
    // Build the value expression from the fragment content, tracking has_state
    let (value, has_state) = build_title_content(&node.fragment.nodes, context);

    // Create the assignment: $.document.title = value
    let document_title = b::member(b::member_path("$.document"), "title");

    let assignment = b::stmt(b::assign(document_title, value));

    // When has_state is true, use $.deferred_template_effect to ensure title
    // only changes after async work is done. Otherwise use $.effect.
    if has_state {
        let effect_call = b::stmt(b::call(
            b::member_path("$.deferred_template_effect"),
            vec![b::thunk_block(vec![assignment])],
        ));
        context.state.after_update.push(effect_call);
    } else {
        let effect_call = b::stmt(b::call(
            b::member_path("$.effect"),
            vec![b::thunk_block(vec![assignment])],
        ));
        context.state.after_update.push(effect_call);
    }
}

/// Build the title content from fragment nodes.
///
/// Handles text nodes and expression tags to build a single value expression.
/// Returns (value_expression, has_state).
fn build_title_content(
    nodes: &[TemplateNode],
    context: &mut ComponentContext,
) -> (
    crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr,
    bool,
) {
    if nodes.is_empty() {
        return (b::string(""), false);
    }

    // If single text node, return literal string (no reactive state)
    if nodes.len() == 1
        && let TemplateNode::Text(text) = &nodes[0]
    {
        return (b::string(text.data.to_string()), false);
    }

    // Build concatenated expression for multiple nodes
    let mut parts: Vec<crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr> =
        Vec::new();
    let mut has_state = false;

    for node in nodes {
        match node {
            TemplateNode::Text(text) => {
                parts.push(b::string(text.data.to_string()));
            }
            TemplateNode::ExpressionTag(expr) => {
                // Check if this expression has reactive state
                if expression_has_reactive_state(&expr.expression, context) {
                    has_state = true;
                }

                let raw_value = convert_expression(&expr.expression, context);
                let value = apply_transforms_to_expression(&raw_value, context);

                // For single-expression titles, add ?? '' for potentially undefined values
                // (matching official compiler's is_defined check)
                if nodes.len() == 1 || is_single_expression_tag(nodes) {
                    // Single expression: pass directly, add ?? '' if not a literal
                    if !is_known_defined_expr(&expr.expression) {
                        parts.push(b::nullish(value, b::string("")));
                    } else {
                        parts.push(value);
                    }
                } else {
                    // Multiple nodes in template: add ?? '' for non-defined expressions
                    if !is_known_defined_expr(&expr.expression) {
                        parts.push(b::nullish(value, b::string("")));
                    } else {
                        parts.push(value);
                    }
                }
            }
            _ => {}
        }
    }

    // Concatenate with + operator or use template literal
    let value = if parts.len() == 1 {
        parts.into_iter().next().unwrap()
    } else {
        // Join with binary + operations
        parts
            .into_iter()
            .reduce(|acc, part| b::binary(JsBinaryOp::Add, acc, part))
            .unwrap_or_else(|| b::string(""))
    };

    (value, has_state)
}

/// Check if nodes contain a single expression tag (possibly with whitespace text nodes)
fn is_single_expression_tag(nodes: &[TemplateNode]) -> bool {
    let mut found_expr = false;
    for node in nodes {
        match node {
            TemplateNode::ExpressionTag(_) => {
                if found_expr {
                    return false;
                }
                found_expr = true;
            }
            TemplateNode::Text(_) => {}
            _ => return false,
        }
    }
    found_expr
}

/// Check if an expression is known to be defined (not null/undefined).
/// Literals and certain patterns are known to be defined.
fn is_known_defined_expr(expr: &crate::ast::js::Expression) -> bool {
    use crate::ast::js::Expression;
    match expr {
        Expression::Value(json_value) => {
            if let Some(obj) = json_value.as_object() {
                let expr_type = obj.get("type").and_then(|v| v.as_str()).unwrap_or("");
                match expr_type {
                    "Literal" => {
                        // Literals are defined (including strings, numbers, booleans)
                        // but null literal is not defined
                        let value = obj.get("value");
                        !matches!(value, Some(serde_json::Value::Null) | None)
                    }
                    "TemplateLiteral" => true, // Template literals always produce strings
                    _ => false,                // Everything else might be undefined
                }
            } else {
                false
            }
        }
    }
}
