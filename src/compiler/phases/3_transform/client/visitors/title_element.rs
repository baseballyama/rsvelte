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
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;

/// Visit a TitleElement node and generate client-side code.
///
/// Generates code like:
/// ```js
/// $.deferred_template_effect(() => {
///     $.document.title = `a ${adjective() ?? ''} title`;
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
/// Uses template literals for mixed text+expression content (matching the
/// official compiler's build_template_chunk behavior).
/// Returns (value_expression, has_state).
fn build_title_content(nodes: &[TemplateNode], context: &mut ComponentContext) -> (JsExpr, bool) {
    if nodes.is_empty() {
        return (b::string(""), false);
    }

    // If single text node, return literal string (no reactive state)
    if nodes.len() == 1
        && let TemplateNode::Text(text) = &nodes[0]
    {
        return (b::string(text.data.to_string()), false);
    }

    // If single expression tag, return the expression with optional ?? ''
    if is_single_expression_tag(nodes) {
        let mut has_state = false;
        for node in nodes {
            if let TemplateNode::ExpressionTag(expr) = node {
                if expression_has_reactive_state(&expr.expression, context) {
                    has_state = true;
                }
                let raw_value = convert_expression(&expr.expression, context);
                let value = apply_transforms_to_expression(&raw_value, context);
                if !is_known_defined_expr(&expr.expression) {
                    return (b::nullish(value, b::string("")), has_state);
                } else {
                    return (value, has_state);
                }
            }
        }
    }

    // Multiple nodes: build a template literal
    // E.g., `a ${adjective() ?? ''} title`
    let mut quasis: Vec<String> = Vec::new();
    let mut expressions: Vec<JsExpr> = Vec::new();
    let mut has_state = false;
    let mut current_text = String::new();

    for node in nodes {
        match node {
            TemplateNode::Text(text) => {
                current_text.push_str(&text.data);
            }
            TemplateNode::ExpressionTag(expr) => {
                if expression_has_reactive_state(&expr.expression, context) {
                    has_state = true;
                }

                // Flush accumulated text as a quasi
                quasis.push(std::mem::take(&mut current_text));

                let raw_value = convert_expression(&expr.expression, context);
                let value = apply_transforms_to_expression(&raw_value, context);

                // Add ?? '' for potentially undefined expressions
                if !is_known_defined_expr(&expr.expression) {
                    expressions.push(b::nullish(value, b::string("")));
                } else {
                    expressions.push(value);
                }
            }
            _ => {}
        }
    }

    // Add trailing text
    quasis.push(current_text);

    // Build the template literal quasis as JsTemplateElement
    let template_quasis: Vec<_> = quasis
        .iter()
        .enumerate()
        .map(|(i, text)| b::quasi(text.as_str(), i == quasis.len() - 1))
        .collect();
    let value = b::template(template_quasis, expressions);
    (value, has_state)
}

/// Check if nodes contain a single expression tag (possibly with whitespace text nodes)
fn is_single_expression_tag(nodes: &[TemplateNode]) -> bool {
    let expr_count = nodes
        .iter()
        .filter(|n| matches!(n, TemplateNode::ExpressionTag(_)))
        .count();
    let non_text_non_expr = nodes
        .iter()
        .any(|n| !matches!(n, TemplateNode::Text(_) | TemplateNode::ExpressionTag(_)));

    expr_count == 1 && !non_text_non_expr && nodes.len() == 1
}

/// Check if an expression is known to be defined (not null/undefined).
/// Literals and certain patterns are known to be defined.
fn is_known_defined_expr(expr: &crate::ast::js::Expression) -> bool {
    let json_value = expr.as_json();
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
