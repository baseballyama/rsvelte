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
    apply_transforms_to_expression, expression_has_await, expression_has_reactive_state,
};
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// An entry in the memoizer - represents either a sync or async memoized value.
struct MemoEntry {
    /// The converted expression (with transforms applied)
    expression: JsExpr,
    /// Whether this is an async expression (contains await)
    is_async: bool,
}

/// Visit a TitleElement node and generate client-side code.
///
/// When the content contains reactive expressions, generates:
/// ```js
/// $.deferred_template_effect(
///     ($0) => { $.document.title = $0 ?? '' },
///     sync_values,    // [() => expr1, () => expr2] or void 0
///     async_values,   // [async_thunk1, async_thunk2] or undefined
///     blockers        // blocker array or undefined
/// );
/// ```
///
/// For static content:
/// ```js
/// $.effect(() => { $.document.title = 'woo!!!' });
/// ```
pub fn title_element(node: &TitleElement, context: &mut ComponentContext) {
    // Build the value expression from the fragment content, using the memoizer pattern
    let (value, has_state, memo_entries) = build_title_content(&node.fragment.nodes, context);

    // Create the assignment: $.document.title = value
    let document_title = b::member(b::member_path("$.document"), "title");
    let assignment = b::stmt(b::assign(document_title, value));

    if has_state {
        // Separate memo entries into sync and async
        let sync_entries: Vec<&MemoEntry> = memo_entries.iter().filter(|e| !e.is_async).collect();
        let async_entries: Vec<&MemoEntry> = memo_entries.iter().filter(|e| e.is_async).collect();

        // Build parameter list: $0, $1, $2, ...
        let params: Vec<JsPattern> = (0..memo_entries.len())
            .map(|i| JsPattern::Identifier(format!("${i}").into()))
            .collect();

        // Build callback with parameters
        let callback = if params.is_empty() {
            b::thunk_block(vec![assignment])
        } else {
            b::arrow_block(params, vec![assignment])
        };

        // Build sync_values: [() => expr1, () => expr2] or void 0
        let sync_values = if sync_entries.is_empty() {
            b::undefined()
        } else {
            b::array(
                sync_entries
                    .iter()
                    .map(|e| b::thunk(e.expression.clone()))
                    .collect(),
            )
        };

        // Build async_values: [thunk1, thunk2] or undefined
        let async_values_opt = if async_entries.is_empty() {
            None
        } else {
            Some(b::array(
                async_entries
                    .iter()
                    .map(|e| build_async_thunk(&e.expression))
                    .collect(),
            ))
        };

        // Build the deferred_template_effect call
        let mut args = vec![callback];
        if async_values_opt.is_some() || !sync_entries.is_empty() {
            args.push(sync_values);
        }
        if let Some(async_values) = async_values_opt {
            args.push(async_values);
        }

        let effect_call = b::stmt(b::call(b::member_path("$.deferred_template_effect"), args));
        context.state.after_update.push(effect_call);
    } else {
        let effect_call = b::stmt(b::call(
            b::member_path("$.effect"),
            vec![b::thunk_block(vec![assignment])],
        ));
        context.state.after_update.push(effect_call);
    }
}

/// Build an async thunk for a memoized expression.
///
/// For an await expression like `await push()`, this creates the optimized form:
/// - `async () => await push()` → optimized to `push` (if push is a simple call)
/// - `async () => await complex_expr` → stays as `async () => complex_expr`
fn build_async_thunk(expression: &JsExpr) -> JsExpr {
    // If the expression is `await X`, we want to create `async () => await X`
    // then optimize: `async () => await call()` → `call` (if call has no nested awaits)
    match expression {
        JsExpr::Await(inner) => {
            // Check if the argument is a simple expression (no nested awaits)
            if !js_expr_has_await(inner) {
                // Optimize: just use the argument directly
                // `async () => await push()` → `push`
                // But we need to check if it's a call or identifier
                match &**inner {
                    JsExpr::Call(call) => {
                        if call.arguments.is_empty()
                            && let JsExpr::Identifier(_) = &*call.callee
                        {
                            // `async () => await func()` → `func`
                            return (*call.callee).clone();
                        }
                        // Default: wrap in arrow
                        (**inner).clone()
                    }
                    JsExpr::Identifier(_) => (**inner).clone(),
                    _ => {
                        // Wrap: `() => expr`
                        b::thunk((**inner).clone())
                    }
                }
            } else {
                // Has nested awaits, must keep as async arrow
                b::async_thunk(expression.clone())
            }
        }
        _ => {
            // Not an await expression, wrap as async thunk
            b::async_thunk(expression.clone())
        }
    }
}

/// Check if a JsExpr contains await expressions.
fn js_expr_has_await(expr: &JsExpr) -> bool {
    match expr {
        JsExpr::Await(_) => true,
        JsExpr::Call(call) => {
            js_expr_has_await(&call.callee) || call.arguments.iter().any(js_expr_has_await)
        }
        JsExpr::Member(m) => {
            js_expr_has_await(&m.object)
                || matches!(&m.property, JsMemberProperty::Expression(e) if js_expr_has_await(e))
        }
        JsExpr::Binary(bin) => js_expr_has_await(&bin.left) || js_expr_has_await(&bin.right),
        JsExpr::Logical(l) => js_expr_has_await(&l.left) || js_expr_has_await(&l.right),
        JsExpr::Conditional(c) => {
            js_expr_has_await(&c.test)
                || js_expr_has_await(&c.consequent)
                || js_expr_has_await(&c.alternate)
        }
        JsExpr::Unary(u) => js_expr_has_await(&u.argument),
        JsExpr::Array(arr) => arr
            .elements
            .iter()
            .any(|e| e.as_ref().is_some_and(js_expr_has_await)),
        JsExpr::Sequence(seq) => seq.expressions.iter().any(js_expr_has_await),
        JsExpr::Assignment(a) => js_expr_has_await(&a.left) || js_expr_has_await(&a.right),
        JsExpr::TemplateLiteral(t) => t.expressions.iter().any(js_expr_has_await),
        _ => false,
    }
}

/// Build the title content from fragment nodes using memoizer pattern.
///
/// Handles text nodes and expression tags to build a single value expression.
/// For expressions with `await`, extracts them into the memo_entries for
/// separate handling as async values in deferred_template_effect.
///
/// Returns (value_expression, has_state, memo_entries).
fn build_title_content(
    nodes: &[TemplateNode],
    context: &mut ComponentContext,
) -> (JsExpr, bool, Vec<MemoEntry>) {
    let mut memo_entries: Vec<MemoEntry> = Vec::new();

    if nodes.is_empty() {
        return (b::string(""), false, memo_entries);
    }

    // If single text node, return literal string (no reactive state)
    if nodes.len() == 1
        && let TemplateNode::Text(text) = &nodes[0]
    {
        return (b::string(text.data.to_string()), false, memo_entries);
    }

    // If single expression tag, return the expression with optional ?? ''
    if is_single_expression_tag(nodes) {
        let mut has_state = false;
        for node in nodes {
            if let TemplateNode::ExpressionTag(expr) = node {
                if expression_has_reactive_state(&expr.expression, context) {
                    has_state = true;
                }
                let has_await = expression_has_await(&expr.expression);
                let raw_value = convert_expression(&expr.expression, context);
                let value = apply_transforms_to_expression(&raw_value, context);

                // If expression has call or await, memoize it
                let has_call = expression_has_call(&expr.expression);
                if has_call || has_await {
                    let param_name = format!("${}", memo_entries.len());
                    memo_entries.push(MemoEntry {
                        expression: value,
                        is_async: has_await,
                    });
                    let param_ref = b::id(&param_name);
                    if !is_known_defined_expr(&expr.expression) {
                        return (
                            b::nullish(param_ref, b::string("")),
                            has_state,
                            memo_entries,
                        );
                    } else {
                        return (param_ref, has_state, memo_entries);
                    }
                }

                if !is_known_defined_expr(&expr.expression) {
                    return (b::nullish(value, b::string("")), has_state, memo_entries);
                } else {
                    return (value, has_state, memo_entries);
                }
            }
        }
    }

    // Multiple nodes: build a template literal
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

                let has_await = expression_has_await(&expr.expression);
                let has_call = expression_has_call(&expr.expression);
                let raw_value = convert_expression(&expr.expression, context);
                let value = apply_transforms_to_expression(&raw_value, context);

                // If expression has call or await, memoize it
                if has_call || has_await {
                    let param_name = format!("${}", memo_entries.len());
                    memo_entries.push(MemoEntry {
                        expression: value,
                        is_async: has_await,
                    });
                    let param_ref = b::id(&param_name);
                    if !is_known_defined_expr(&expr.expression) {
                        expressions.push(b::nullish(param_ref, b::string("")));
                    } else {
                        expressions.push(param_ref);
                    }
                } else if !is_known_defined_expr(&expr.expression) {
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

    // Build the template literal
    let template_quasis: Vec<_> = quasis
        .iter()
        .enumerate()
        .map(|(i, text)| b::quasi(text.as_str(), i == quasis.len() - 1))
        .collect();
    let value = b::template(template_quasis, expressions);
    (value, has_state, memo_entries)
}

/// Check if an expression has a function call (has_call metadata).
fn expression_has_call(expr: &crate::ast::js::Expression) -> bool {
    has_call_json(expr.as_json())
}

fn has_call_json(json_value: &serde_json::Value) -> bool {
    let Some(obj) = json_value.as_object() else {
        return false;
    };
    let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) else {
        return false;
    };

    match expr_type {
        "CallExpression" => true,
        "AwaitExpression" => {
            if let Some(arg) = obj.get("argument") {
                has_call_json(arg)
            } else {
                false
            }
        }
        _ => {
            // Check children
            for (key, val) in obj {
                if key == "type" {
                    continue;
                }
                match val {
                    serde_json::Value::Object(_) => {
                        if has_call_json(val) {
                            return true;
                        }
                    }
                    serde_json::Value::Array(arr) => {
                        for item in arr {
                            if has_call_json(item) {
                                return true;
                            }
                        }
                    }
                    _ => {}
                }
            }
            false
        }
    }
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
fn is_known_defined_expr(expr: &crate::ast::js::Expression) -> bool {
    let json_value = expr.as_json();
    if let Some(obj) = json_value.as_object() {
        let expr_type = obj.get("type").and_then(|v| v.as_str()).unwrap_or("");
        match expr_type {
            "Literal" => {
                let value = obj.get("value");
                !matches!(value, Some(serde_json::Value::Null) | None)
            }
            "TemplateLiteral" => true,
            _ => false,
        }
    } else {
        false
    }
}
