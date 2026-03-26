//! Shared utility functions for server-side visitors.
//!
//! This module contains helper functions used by multiple server-side visitors.
//! It corresponds to `svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/shared/utils.js`.

use crate::ast::template::{AttributeValuePart, TemplateNode};
use crate::compiler::constants::{BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE, EMPTY_COMMENT};
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use crate::compiler::phases::phase3_transform::server::types::{
    ComponentServerTransformState, TemplateItem,
};
use crate::compiler::phases::phase3_transform::shared::{escape_html, sanitize_template_string};
use compact_str::CompactString;

/// Strip TypeScript annotations from an expression string.
fn strip_ts_from_expr_simple(expr: &str) -> String {
    use crate::compiler::phases::phase2_analyze::types::strip_typescript;
    let wrapper = format!("var _ = {};", expr);
    let stripped = strip_typescript(&wrapper);
    if let Some(rest) = stripped.strip_prefix("var _ = ") {
        rest.trim_end_matches(';').trim().to_string()
    } else {
        expr.to_string()
    }
}

/// Opens an if/each block for hydration boundaries.
///
/// This marker allows us to remove nodes in case of a mismatch during hydration.
///
/// Corresponds to `block_open` in `utils.js`.
pub fn block_open() -> JsExpr {
    JsExpr::Literal(JsLiteral::String(BLOCK_OPEN.into()))
}

/// Opens an if/each block with an else marker.
///
/// Used to indicate that an `{:else}...` block was rendered.
///
/// Corresponds to `block_open_else` in `utils.js`.
pub fn block_open_else() -> JsExpr {
    JsExpr::Literal(JsLiteral::String(BLOCK_OPEN_ELSE.into()))
}

/// Closes an if/each block.
///
/// This marker serves both as a closing boundary and an anchor for these blocks.
///
/// Corresponds to `block_close` in `utils.js`.
pub fn block_close() -> JsExpr {
    JsExpr::Literal(JsLiteral::String(BLOCK_CLOSE.into()))
}

/// Empty comment to keep text nodes separate or provide an anchor node for blocks.
///
/// Corresponds to `empty_comment` in `utils.js`.
pub fn empty_comment() -> JsExpr {
    JsExpr::Literal(JsLiteral::String(EMPTY_COMMENT.into()))
}

/// Processes an array of template nodes, joining sibling text/expression nodes
/// and recursing into child nodes.
///
/// This function groups consecutive text, comment, and expression nodes into
/// template literals for efficient output, and calls visit() for other node types.
///
/// Corresponds to `process_children()` in `utils.js`.
///
/// # Arguments
///
/// * `nodes` - The child nodes to process
/// * `state` - The component server transform state
/// * `visit` - The visitor function to call for non-text nodes
pub fn process_children<F>(
    nodes: &[TemplateNode],
    state: &mut ComponentServerTransformState,
    mut visit: F,
) where
    F: FnMut(&TemplateNode, &mut ComponentServerTransformState),
{
    let mut sequence: Vec<&TemplateNode> = Vec::new();

    // Helper to flush accumulated text/expression sequence
    let flush = |seq: &mut Vec<&TemplateNode>, state: &mut ComponentServerTransformState| {
        if seq.is_empty() {
            return;
        }

        let mut quasi = JsTemplateElement {
            raw: CompactString::default(),
            cooked: CompactString::default(),
            tail: false,
        };
        let mut quasis = vec![quasi.clone()];
        let mut expressions: Vec<JsExpr> = Vec::new();

        for (i, node) in seq.iter().enumerate() {
            match node {
                TemplateNode::Text(text) => {
                    quasi.cooked.push_str(&escape_html(&text.data));
                }
                TemplateNode::Comment(comment) => {
                    quasi.cooked.push_str(&format!("<!--{}-->", comment.data));
                }
                TemplateNode::ExpressionTag(expr_tag) => {
                    // Try to evaluate the expression at compile time (constant folding)
                    // This corresponds to state.scope.evaluate(node.expression) in the official compiler
                    let eval_result = try_evaluate_expression(&expr_tag.expression.as_json());

                    match eval_result {
                        EvalResult::Known(value) => {
                            // Expression evaluates to a known value - fold into template string
                            // This is equivalent to: quasi.value.cooked += escape_html((evaluated.value ?? '') + '');
                            quasi.cooked.push_str(&value);
                        }
                        EvalResult::Unknown => {
                            // Expression needs runtime evaluation - emit $.escape() call
                            let expr_str = extract_expression_string(&expr_tag.expression);
                            expressions.push(JsExpr::Call(JsCallExpression {
                                callee: state.arena.alloc_expr(JsExpr::Member(
                                    JsMemberExpression {
                                        object: state
                                            .arena
                                            .alloc_expr(JsExpr::Identifier("$".into())),
                                        property: JsMemberProperty::Identifier("escape".into()),
                                        computed: false,
                                        optional: false,
                                    },
                                )),
                                arguments: vec![JsExpr::Identifier(expr_str.into())],
                                optional: false,
                            }));

                            // Start a new quasi
                            quasi = JsTemplateElement {
                                raw: CompactString::default(),
                                cooked: CompactString::default(),
                                tail: i + 1 == seq.len(),
                            };
                            quasis.push(quasi.clone());
                        }
                    }
                }
                _ => {}
            }
        }

        // Mark the last quasi as tail
        if let Some(last_quasi) = quasis.last_mut() {
            last_quasi.tail = true;
        }

        // Sanitize template strings
        for quasi in &mut quasis {
            quasi.raw = sanitize_template_string(&quasi.cooked).into();
        }

        // Add to template
        state
            .template
            .push(TemplateItem::Expression(JsExpr::TemplateLiteral(
                JsTemplateLiteral {
                    quasis,
                    expressions,
                },
            )));

        seq.clear();
    };

    for node in nodes {
        match node {
            TemplateNode::Text(_) | TemplateNode::Comment(_) => {
                sequence.push(node);
            }
            TemplateNode::ExpressionTag(expr_tag) => {
                // Check if the expression is async
                // TODO: Implement metadata.expression.is_async() check
                let is_async = false; // Placeholder

                if is_async {
                    // Flush current sequence
                    flush(&mut sequence, state);

                    // Handle async expression separately
                    // TODO: Create push with async handling
                    let expr_str = extract_expression_string(&expr_tag.expression);
                    state
                        .template
                        .push(TemplateItem::Expression(JsExpr::Identifier(
                            expr_str.into(),
                        )));
                } else {
                    sequence.push(node);
                }
            }
            _ => {
                // Flush sequence before visiting other node types
                flush(&mut sequence, state);
                visit(node, state);
            }
        }
    }

    // Flush any remaining sequence
    flush(&mut sequence, state);
}

/// Builds the final template statements from the accumulated template items.
///
/// This function combines template literals and statements into the final
/// array of statements that make up the SSR function body.
///
/// Corresponds to `build_template()` in `utils.js`.
///
/// # Arguments
///
/// * `template` - The template items (expressions and statements)
///
/// # Returns
///
/// An array of statements for the SSR function
pub fn build_template(
    template: &[TemplateItem],
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> Vec<JsStatement> {
    let mut strings: Vec<String> = Vec::new();
    let mut expressions: Vec<JsExpr> = Vec::new();
    let mut statements: Vec<JsStatement> = Vec::new();

    let flush = |strings: &mut Vec<String>,
                 expressions: &mut Vec<JsExpr>,
                 statements: &mut Vec<JsStatement>| {
        if strings.is_empty() {
            return;
        }

        let quasis = strings
            .iter()
            .enumerate()
            .map(|(i, cooked)| JsTemplateElement {
                raw: sanitize_template_string(cooked).into(),
                cooked: cooked.clone().into(),
                tail: i == strings.len() - 1,
            })
            .collect();

        let template_literal = JsExpr::TemplateLiteral(JsTemplateLiteral {
            quasis,
            expressions: expressions.clone(),
        });

        statements.push(JsStatement::Expression(JsExpressionStatement {
            expression: arena.alloc_expr(JsExpr::Call(JsCallExpression {
                callee: arena.alloc_expr(JsExpr::Member(JsMemberExpression {
                    object: arena.alloc_expr(JsExpr::Identifier("$$renderer".into())),
                    property: JsMemberProperty::Identifier("push".into()),
                    computed: false,
                    optional: false,
                })),
                arguments: vec![template_literal],
                optional: false,
            })),
        }));

        strings.clear();
        expressions.clear();
    };

    for item in template {
        match item {
            TemplateItem::Statement(stmt) => {
                if !strings.is_empty() {
                    flush(&mut strings, &mut expressions, &mut statements);
                }
                statements.push(stmt.clone());
            }
            TemplateItem::Expression(expr) => {
                if strings.is_empty() {
                    strings.push(String::new());
                }

                match expr {
                    JsExpr::Literal(lit) => {
                        // Append literal value to the last string
                        if let Some(last) = strings.last_mut() {
                            match lit {
                                JsLiteral::String(s) => last.push_str(s),
                                JsLiteral::Number(n) => last.push_str(&n.to_string()),
                                JsLiteral::Boolean(b) => last.push_str(&b.to_string()),
                                JsLiteral::Null => last.push_str("null"),
                                JsLiteral::Undefined => last.push_str("undefined"),
                                JsLiteral::Regex { pattern, flags } => {
                                    last.push_str(&format!("/{}/{}", pattern, flags))
                                }
                            }
                        }
                    }
                    JsExpr::TemplateLiteral(tpl) => {
                        // Merge template literal into current strings/expressions
                        if let Some(last) = strings.last_mut()
                            && let Some(first_quasi) = tpl.quasis.first()
                        {
                            last.push_str(&first_quasi.cooked);
                        }
                        for quasi in tpl.quasis.iter().skip(1) {
                            strings.push(quasi.cooked.to_string());
                        }
                        expressions.extend(tpl.expressions.iter().cloned());
                    }
                    _ => {
                        // Other expressions are added to the expression list
                        expressions.push(expr.clone());
                        strings.push(String::new());
                    }
                }
            }
        }
    }

    if !strings.is_empty() {
        flush(&mut strings, &mut expressions, &mut statements);
    }

    statements
}

/// Builds an attribute value expression from an attribute value.
///
/// This handles different attribute value types (true, text, expression, mixed).
///
/// Corresponds to `build_attribute_value()` in `utils.js`.
///
/// # Arguments
///
/// * `value` - The attribute value
/// * `transform` - A function to transform expressions (e.g., for async optimization)
/// * `trim_whitespace` - Whether to trim/normalize whitespace
/// * `is_component` - Whether this is for a component prop (no HTML escaping)
///
/// # Returns
///
/// An expression representing the attribute value
pub fn build_attribute_value<F>(
    value: &crate::ast::template::AttributeValue,
    transform: F,
    trim_whitespace: bool,
    is_component: bool,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr
where
    F: Fn(JsExpr) -> JsExpr,
{
    build_attribute_value_ts(
        value,
        transform,
        trim_whitespace,
        is_component,
        false,
        arena,
    )
}

pub fn build_attribute_value_ts<F>(
    value: &crate::ast::template::AttributeValue,
    transform: F,
    trim_whitespace: bool,
    is_component: bool,
    is_typescript: bool,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr
where
    F: Fn(JsExpr) -> JsExpr,
{
    use crate::ast::template::AttributeValue;

    match value {
        AttributeValue::True(_) => JsExpr::Literal(JsLiteral::Boolean(true)),
        AttributeValue::Expression(expr_tag) => {
            let mut expr_str = extract_expression_string(&expr_tag.expression.clone());
            if is_typescript {
                expr_str = strip_ts_from_expr_simple(&expr_str);
            }
            transform(JsExpr::Identifier(expr_str.into()))
        }
        AttributeValue::Sequence(parts) => {
            if parts.len() == 1 {
                // Single part - handle directly
                match &parts[0] {
                    AttributeValuePart::Text(text) => {
                        let data = if trim_whitespace {
                            text.data
                                .split_whitespace()
                                .collect::<Vec<_>>()
                                .join(" ")
                                .trim()
                                .to_string()
                        } else {
                            text.data.to_string()
                        };

                        let value = if is_component {
                            data
                        } else {
                            escape_html(&data)
                        };

                        return JsExpr::Literal(JsLiteral::String(value.into()));
                    }
                    AttributeValuePart::ExpressionTag(expr_tag) => {
                        let expr_str = extract_expression_string(&expr_tag.expression.clone());
                        return transform(JsExpr::Identifier(expr_str.into()));
                    }
                }
            }

            // Multiple parts - build template literal
            let mut quasi = JsTemplateElement {
                raw: CompactString::default(),
                cooked: CompactString::default(),
                tail: false,
            };
            let mut quasis = vec![quasi.clone()];
            let mut expressions: Vec<JsExpr> = Vec::new();

            for (i, part) in parts.iter().enumerate() {
                match part {
                    AttributeValuePart::Text(text) => {
                        let data = if trim_whitespace {
                            text.data
                                .split_whitespace()
                                .collect::<Vec<_>>()
                                .join(" ")
                                .trim()
                                .to_string()
                        } else {
                            text.data.to_string()
                        };

                        quasi.cooked.push_str(&data);
                    }
                    AttributeValuePart::ExpressionTag(expr_tag) => {
                        let expr_str = extract_expression_string(&expr_tag.expression.clone());
                        let expr = JsExpr::Identifier(expr_str.into());

                        // Wrap in $.stringify
                        expressions.push(JsExpr::Call(JsCallExpression {
                            callee: arena.alloc_expr(JsExpr::Member(JsMemberExpression {
                                object: arena.alloc_expr(JsExpr::Identifier("$".into())),
                                property: JsMemberProperty::Identifier("stringify".into()),
                                computed: false,
                                optional: false,
                            })),
                            arguments: vec![transform(expr)],
                            optional: false,
                        }));

                        quasi = JsTemplateElement {
                            raw: CompactString::default(),
                            cooked: CompactString::default(),
                            tail: i + 1 == parts.len(),
                        };
                        quasis.push(quasi.clone());
                    }
                }
            }

            // Mark last quasi as tail
            if let Some(last) = quasis.last_mut() {
                last.tail = true;
            }

            JsExpr::TemplateLiteral(JsTemplateLiteral {
                quasis,
                expressions,
            })
        }
    }
}

/// Creates a `$$renderer.child(...)` statement.
///
/// Corresponds to `create_child_block()` in `utils.js`.
pub fn create_child_block(
    body: JsBlockStatement,
    is_async: bool,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsStatement {
    JsStatement::Expression(JsExpressionStatement {
        expression: arena.alloc_expr(JsExpr::Call(JsCallExpression {
            callee: arena.alloc_expr(JsExpr::Member(JsMemberExpression {
                object: arena.alloc_expr(JsExpr::Identifier("$$renderer".into())),
                property: JsMemberProperty::Identifier("child".into()),
                computed: false,
                optional: false,
            })),
            arguments: vec![JsExpr::Arrow(JsArrowFunction {
                params: smallvec::smallvec![JsPattern::Identifier("$$renderer".into())],
                body: JsArrowBody::Block(body),
                is_async,
            })],
            optional: false,
        })),
    })
}

/// Creates a `$$renderer.async_block(...)` or `$$renderer.async(...)` statement.
///
/// Corresponds to `create_async_block()` in `utils.js`.
pub fn create_async_block(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    body: JsBlockStatement,
    blockers: Vec<JsExpr>,
    has_await: bool,
    needs_hydration_markers: bool,
) -> JsStatement {
    let method_name = if needs_hydration_markers {
        "async_block"
    } else {
        "async"
    };

    JsStatement::Expression(JsExpressionStatement {
        expression: arena.alloc_expr(JsExpr::Call(JsCallExpression {
            callee: arena.alloc_expr(JsExpr::Member(JsMemberExpression {
                object: arena.alloc_expr(JsExpr::Identifier("$$renderer".into())),
                property: JsMemberProperty::Identifier(method_name.into()),
                computed: false,
                optional: false,
            })),
            arguments: vec![
                JsExpr::Array(JsArrayExpression {
                    elements: blockers.into_iter().map(Some).collect(),
                }),
                JsExpr::Arrow(JsArrowFunction {
                    params: smallvec::smallvec![JsPattern::Identifier("$$renderer".into())],
                    body: JsArrowBody::Block(body),
                    is_async: has_await,
                }),
            ],
            optional: false,
        })),
    })
}

// =============================================================================
// Helper functions
// =============================================================================

/// Evaluate result for compile-time constant expressions.
///
/// Corresponds to the `scope.evaluate()` check in the official compiler's
/// `process_children()` → `flush()` function.
enum EvalResult {
    /// Expression evaluates to a known value at compile time.
    /// The string is the escape_html'd representation.
    Known(String),
    /// Expression cannot be evaluated at compile time.
    Unknown,
}

/// Try to evaluate an expression at compile time.
///
/// Returns `EvalResult::Known(html_escaped_value)` for expressions that can be
/// statically evaluated (e.g., `null`, `undefined`, `null && fn()`, `false && x`).
/// Returns `EvalResult::Unknown` for expressions that need runtime evaluation.
///
/// This corresponds to `state.scope.evaluate(node.expression)` in the official compiler.
fn try_evaluate_expression(json: &serde_json::Value) -> EvalResult {
    let expr_type = json.get("type").and_then(|t| t.as_str()).unwrap_or("");

    match expr_type {
        "Literal" => {
            let value = json.get("value");
            match value {
                Some(serde_json::Value::Null) => {
                    // null → escape_html((null ?? '') + '') → ''
                    EvalResult::Known(String::new())
                }
                Some(serde_json::Value::Bool(b)) => {
                    // true → 'true', false → 'false'
                    EvalResult::Known(escape_html(&b.to_string()))
                }
                Some(serde_json::Value::Number(n)) => {
                    EvalResult::Known(escape_html(&n.to_string()))
                }
                Some(serde_json::Value::String(s)) => EvalResult::Known(escape_html(s)),
                _ => EvalResult::Unknown,
            }
        }
        "Identifier" => {
            let name = json.get("name").and_then(|n| n.as_str()).unwrap_or("");
            if name == "undefined" {
                // undefined → escape_html((undefined ?? '') + '') → ''
                EvalResult::Known(String::new())
            } else {
                EvalResult::Unknown
            }
        }
        "LogicalExpression" => {
            let operator = json.get("operator").and_then(|o| o.as_str()).unwrap_or("");
            let left = json.get("left");
            let right = json.get("right");

            match operator {
                "&&" => {
                    // If left is known and falsy, result is left's value
                    if let Some(left_json) = left
                        && let EvalResult::Known(left_val) = try_evaluate_expression(left_json)
                    {
                        // Check if the evaluated left value is falsy
                        // In JS: null, undefined, false, 0, '', NaN are falsy
                        // After escape_html + (x ?? '') + '' conversion:
                        // null/undefined → '', false → 'false', 0 → '0', '' → ''
                        if is_literal_falsy(left_json) {
                            // null && anything → null → ''
                            // false && anything → false → 'false'
                            // 0 && anything → 0 → '0'
                            return EvalResult::Known(left_val);
                        }
                        // If left is known and truthy, result is right's value
                        if let Some(right_json) = right {
                            return try_evaluate_expression(right_json);
                        }
                    }
                    EvalResult::Unknown
                }
                "||" => {
                    // If left is known and truthy, result is left's value
                    if let Some(left_json) = left
                        && let EvalResult::Known(left_val) = try_evaluate_expression(left_json)
                    {
                        if !is_literal_falsy(left_json) {
                            return EvalResult::Known(left_val);
                        }
                        // If left is known and falsy, result is right's value
                        if let Some(right_json) = right {
                            return try_evaluate_expression(right_json);
                        }
                    }
                    EvalResult::Unknown
                }
                "??" => {
                    // If left is known and not null/undefined, result is left's value
                    if let Some(left_json) = left
                        && let EvalResult::Known(left_val) = try_evaluate_expression(left_json)
                    {
                        if !is_literal_nullish(left_json) {
                            return EvalResult::Known(left_val);
                        }
                        // If left is known and nullish, result is right's value
                        if let Some(right_json) = right {
                            return try_evaluate_expression(right_json);
                        }
                    }
                    EvalResult::Unknown
                }
                _ => EvalResult::Unknown,
            }
        }
        _ => EvalResult::Unknown,
    }
}

/// Check if a literal JSON expression AST node is falsy in JavaScript.
fn is_literal_falsy(json: &serde_json::Value) -> bool {
    let expr_type = json.get("type").and_then(|t| t.as_str()).unwrap_or("");
    match expr_type {
        "Literal" => {
            let value = json.get("value");
            match value {
                Some(serde_json::Value::Null) => true,
                Some(serde_json::Value::Bool(false)) => true,
                Some(serde_json::Value::Number(n)) => n.as_f64() == Some(0.0),
                Some(serde_json::Value::String(s)) => s.is_empty(),
                _ => false,
            }
        }
        "Identifier" => {
            let name = json.get("name").and_then(|n| n.as_str()).unwrap_or("");
            name == "undefined" || name == "NaN"
        }
        _ => false,
    }
}

/// Check if a literal JSON expression AST node is null or undefined.
fn is_literal_nullish(json: &serde_json::Value) -> bool {
    let expr_type = json.get("type").and_then(|t| t.as_str()).unwrap_or("");
    match expr_type {
        "Literal" => {
            let value = json.get("value");
            matches!(value, Some(serde_json::Value::Null))
        }
        "Identifier" => {
            let name = json.get("name").and_then(|n| n.as_str()).unwrap_or("");
            name == "undefined"
        }
        _ => false,
    }
}

/// Extract a string representation of an expression for code generation.
///
/// This is a temporary helper until we have full expression visiting.
fn extract_expression_string(expr: &crate::ast::js::Expression) -> String {
    let json = expr.as_json();

    // Get the expression type
    let expr_type = json.get("type").and_then(|t| t.as_str()).unwrap_or("");

    match expr_type {
        "Identifier" => json
            .get("name")
            .and_then(|n| n.as_str())
            .unwrap_or("identifier")
            .to_string(),
        "MemberExpression" => {
            if let (Some(object), Some(property)) = (json.get("object"), json.get("property")) {
                let object_str = extract_expression_string(&crate::ast::js::Expression::from_json(
                    object.clone(),
                ));
                let property_str = extract_expression_string(
                    &crate::ast::js::Expression::from_json(property.clone()),
                );
                let computed = json
                    .get("computed")
                    .and_then(|c| c.as_bool())
                    .unwrap_or(false);

                if computed {
                    format!("{}[{}]", object_str, property_str)
                } else {
                    format!("{}.{}", object_str, property_str)
                }
            } else {
                "member".to_string()
            }
        }
        "CallExpression" => {
            if let (Some(callee), Some(arguments)) = (json.get("callee"), json.get("arguments")) {
                let callee_str = extract_expression_string(&crate::ast::js::Expression::from_json(
                    callee.clone(),
                ));
                let args = if let Some(args_array) = arguments.as_array() {
                    args_array
                        .iter()
                        .map(|arg| {
                            extract_expression_string(&crate::ast::js::Expression::from_json(
                                arg.clone(),
                            ))
                        })
                        .collect::<Vec<_>>()
                        .join(", ")
                } else {
                    String::new()
                };
                format!("{}({})", callee_str, args)
            } else {
                "call".to_string()
            }
        }
        "Literal" => {
            if let Some(raw) = json.get("raw").and_then(|r| r.as_str()) {
                raw.to_string()
            } else if let Some(value) = json.get("value") {
                if value.is_null() {
                    "null".to_string()
                } else if let Some(s) = value.as_str() {
                    format!("\"{}\"", s)
                } else if let Some(n) = value.as_f64() {
                    n.to_string()
                } else if let Some(b) = value.as_bool() {
                    b.to_string()
                } else {
                    "literal".to_string()
                }
            } else {
                "literal".to_string()
            }
        }
        _ => {
            // For other expression types, use a placeholder
            "expr".to_string()
        }
    }
}

/// Converts an AST Expression to a JsExpr for server-side rendering.
///
/// This is a simplified version of the client-side expression converter
/// that doesn't need context for basic expression types.
pub fn convert_expression_simple(
    expr: &crate::ast::js::Expression,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    let json = expr.as_json();
    convert_json_value_simple(&json, arena)
}

/// Convert a JSON value to JsExpr without context.
fn convert_json_value_simple(
    value: &serde_json::Value,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    match value {
        serde_json::Value::Object(obj) => {
            let node_type = obj
                .get("type")
                .and_then(|t| t.as_str())
                .unwrap_or("Unknown");

            match node_type {
                "Identifier" => {
                    let name = obj
                        .get("name")
                        .and_then(|n| n.as_str())
                        .unwrap_or("unknown")
                        .to_string();
                    JsExpr::Identifier(name.into())
                }
                "Literal" => convert_literal_simple(obj, arena),
                "MemberExpression" => convert_member_expression_simple(obj, arena),
                "CallExpression" => convert_call_expression_simple(obj, arena),
                "ObjectExpression" => convert_object_expression_simple(obj, arena),
                "ArrayExpression" => convert_array_expression_simple(obj, arena),
                "BinaryExpression" => convert_binary_expression_simple(obj, arena),
                "UnaryExpression" => convert_unary_expression_simple(obj, arena),
                "LogicalExpression" => convert_logical_expression_simple(obj, arena),
                "ConditionalExpression" => convert_conditional_expression_simple(obj, arena),
                "ArrowFunctionExpression" => convert_arrow_function_simple(obj, arena),
                "ThisExpression" => JsExpr::This,
                "SpreadElement" => {
                    let argument = obj
                        .get("argument")
                        .map(|v| convert_json_value_simple(v, arena))
                        .unwrap_or(JsExpr::Literal(JsLiteral::Null));
                    JsExpr::Spread(arena.alloc_expr(argument))
                }
                "TemplateLiteral" => convert_template_literal_simple(obj, arena),
                _ => {
                    // For unknown types.into(), try to extract the raw source or use placeholder
                    JsExpr::Raw(format!("/* Unknown: {} */", node_type).into())
                }
            }
        }
        serde_json::Value::String(s) => JsExpr::Literal(JsLiteral::String(s.clone().into())),
        serde_json::Value::Number(n) => {
            JsExpr::Literal(JsLiteral::Number(n.as_f64().unwrap_or(0.0)))
        }
        serde_json::Value::Bool(b) => JsExpr::Literal(JsLiteral::Boolean(*b)),
        serde_json::Value::Null => JsExpr::Literal(JsLiteral::Null),
        serde_json::Value::Array(_) => JsExpr::Raw("/* Array */".into()),
    }
}

fn convert_literal_simple(
    obj: &serde_json::Map<String, serde_json::Value>,
    _arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    let value = obj.get("value");

    match value {
        Some(serde_json::Value::String(s)) => JsExpr::Literal(JsLiteral::String(s.clone().into())),
        Some(serde_json::Value::Number(n)) => {
            JsExpr::Literal(JsLiteral::Number(n.as_f64().unwrap_or(0.0)))
        }
        Some(serde_json::Value::Bool(b)) => JsExpr::Literal(JsLiteral::Boolean(*b)),
        Some(serde_json::Value::Null) | None => {
            // Check for regex
            if let Some(regex_obj) = obj.get("regex").and_then(|r| r.as_object()) {
                let pattern = regex_obj
                    .get("pattern")
                    .and_then(|p| p.as_str())
                    .unwrap_or("")
                    .to_string();
                let flags = regex_obj
                    .get("flags")
                    .and_then(|f| f.as_str())
                    .unwrap_or("")
                    .to_string();
                return JsExpr::Literal(JsLiteral::Regex {
                    pattern: pattern.into(),
                    flags: flags.into(),
                });
            }
            JsExpr::Literal(JsLiteral::Null)
        }
        _ => JsExpr::Literal(JsLiteral::Null),
    }
}

fn convert_member_expression_simple(
    obj: &serde_json::Map<String, serde_json::Value>,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    let object = obj
        .get("object")
        .map(|v| convert_json_value_simple(v, arena))
        .unwrap_or(JsExpr::Identifier("unknown".into()));

    let computed = obj
        .get("computed")
        .and_then(|c| c.as_bool())
        .unwrap_or(false);

    let optional = obj
        .get("optional")
        .and_then(|o| o.as_bool())
        .unwrap_or(false);

    let property = if let Some(prop) = obj.get("property") {
        if computed {
            JsMemberProperty::Expression(arena.alloc_expr(convert_json_value_simple(prop, arena)))
        } else if let Some(prop_obj) = prop.as_object()
            && let Some(name) = prop_obj.get("name").and_then(|n| n.as_str())
        {
            JsMemberProperty::Identifier(name.into())
        } else {
            JsMemberProperty::Identifier("unknown".into())
        }
    } else {
        JsMemberProperty::Identifier("unknown".into())
    };

    JsExpr::Member(JsMemberExpression {
        object: arena.alloc_expr(object),
        property,
        computed,
        optional,
    })
}

fn convert_call_expression_simple(
    obj: &serde_json::Map<String, serde_json::Value>,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    let callee = obj
        .get("callee")
        .map(|v| convert_json_value_simple(v, arena))
        .unwrap_or(JsExpr::Identifier("unknown".into()));

    let arguments = obj
        .get("arguments")
        .and_then(|a| a.as_array())
        .map(|args| {
            args.iter()
                .map(|v| convert_json_value_simple(v, arena))
                .collect()
        })
        .unwrap_or_default();

    let optional = obj
        .get("optional")
        .and_then(|o| o.as_bool())
        .unwrap_or(false);

    JsExpr::Call(JsCallExpression {
        callee: arena.alloc_expr(callee),
        arguments,
        optional,
    })
}

fn convert_object_expression_simple(
    obj: &serde_json::Map<String, serde_json::Value>,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    let properties = obj
        .get("properties")
        .and_then(|p| p.as_array())
        .map(|props| {
            props
                .iter()
                .filter_map(|prop| {
                    let prop_obj = prop.as_object()?;
                    let prop_type = prop_obj.get("type")?.as_str()?;

                    match prop_type {
                        "Property" => {
                            let key = convert_property_key_simple(prop_obj, arena);
                            let value = prop_obj
                                .get("value")
                                .map(|v| arena.alloc_expr(convert_json_value_simple(v, arena)))
                                .unwrap_or_else(|| {
                                    arena.alloc_expr(JsExpr::Literal(JsLiteral::Null))
                                });

                            let computed = prop_obj
                                .get("computed")
                                .and_then(|c| c.as_bool())
                                .unwrap_or(false);

                            let shorthand = prop_obj
                                .get("shorthand")
                                .and_then(|s| s.as_bool())
                                .unwrap_or(false);

                            let kind = match prop_obj.get("kind").and_then(|k| k.as_str()) {
                                Some("init") | None => JsPropertyKind::Init,
                                Some("get") => JsPropertyKind::Get,
                                Some("set") => JsPropertyKind::Set,
                                _ => JsPropertyKind::Init,
                            };

                            let method = prop_obj
                                .get("method")
                                .and_then(|v| v.as_bool())
                                .unwrap_or(false);

                            Some(JsObjectMember::Property(JsProperty {
                                key,
                                value,
                                kind,
                                computed,
                                shorthand,
                                method,
                            }))
                        }
                        "SpreadElement" => {
                            let argument = prop_obj
                                .get("argument")
                                .map(|a| arena.alloc_expr(convert_json_value_simple(a, arena)))
                                .unwrap_or_else(|| {
                                    arena.alloc_expr(JsExpr::Literal(JsLiteral::Null))
                                });

                            Some(JsObjectMember::SpreadElement(argument))
                        }
                        _ => None,
                    }
                })
                .collect()
        })
        .unwrap_or_default();

    JsExpr::Object(JsObjectExpression { properties })
}

fn convert_property_key_simple(
    obj: &serde_json::Map<String, serde_json::Value>,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsPropertyKey {
    let key = obj.get("key");
    let computed = obj
        .get("computed")
        .and_then(|c| c.as_bool())
        .unwrap_or(false);

    if computed && let Some(k) = key {
        return JsPropertyKey::Computed(arena.alloc_expr(convert_json_value_simple(k, arena)));
    }

    if let Some(key_obj) = key.and_then(|k| k.as_object()) {
        if let Some("Identifier") = key_obj.get("type").and_then(|t| t.as_str())
            && let Some(name) = key_obj.get("name").and_then(|n| n.as_str())
        {
            return JsPropertyKey::Identifier(name.into());
        }
        if let Some("Literal") = key_obj.get("type").and_then(|t| t.as_str()) {
            let literal = convert_literal_simple(key_obj, arena);
            if let JsExpr::Literal(lit) = literal {
                return JsPropertyKey::Literal(lit);
            }
        }
    }

    JsPropertyKey::Identifier("unknown".into())
}

fn convert_array_expression_simple(
    obj: &serde_json::Map<String, serde_json::Value>,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    let elements = obj
        .get("elements")
        .and_then(|e| e.as_array())
        .map(|elems| {
            elems
                .iter()
                .map(|elem| {
                    if elem.is_null() {
                        None
                    } else {
                        Some(convert_json_value_simple(elem, arena))
                    }
                })
                .collect()
        })
        .unwrap_or_default();

    JsExpr::Array(JsArrayExpression { elements })
}

fn convert_binary_expression_simple(
    obj: &serde_json::Map<String, serde_json::Value>,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    let operator_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("+");

    let operator = match operator_str {
        "+" => JsBinaryOp::Add,
        "-" => JsBinaryOp::Sub,
        "*" => JsBinaryOp::Mul,
        "/" => JsBinaryOp::Div,
        "%" => JsBinaryOp::Mod,
        "**" => JsBinaryOp::Pow,
        "==" => JsBinaryOp::Eq,
        "!=" => JsBinaryOp::Ne,
        "===" => JsBinaryOp::StrictEq,
        "!==" => JsBinaryOp::StrictNe,
        "<" => JsBinaryOp::Lt,
        "<=" => JsBinaryOp::Le,
        ">" => JsBinaryOp::Gt,
        ">=" => JsBinaryOp::Ge,
        "&" => JsBinaryOp::BitAnd,
        "|" => JsBinaryOp::BitOr,
        "^" => JsBinaryOp::BitXor,
        "<<" => JsBinaryOp::Shl,
        ">>" => JsBinaryOp::Shr,
        ">>>" => JsBinaryOp::UShr,
        "in" => JsBinaryOp::In,
        "instanceof" => JsBinaryOp::InstanceOf,
        _ => JsBinaryOp::Add,
    };

    let left = obj
        .get("left")
        .map(|v| convert_json_value_simple(v, arena))
        .unwrap_or(JsExpr::Literal(JsLiteral::Null));

    let right = obj
        .get("right")
        .map(|v| convert_json_value_simple(v, arena))
        .unwrap_or(JsExpr::Literal(JsLiteral::Null));

    JsExpr::Binary(JsBinaryExpression {
        operator,
        left: arena.alloc_expr(left),
        right: arena.alloc_expr(right),
    })
}

fn convert_unary_expression_simple(
    obj: &serde_json::Map<String, serde_json::Value>,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    let operator_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("!");

    let operator = match operator_str {
        "-" => JsUnaryOp::Minus,
        "+" => JsUnaryOp::Plus,
        "!" => JsUnaryOp::Not,
        "~" => JsUnaryOp::BitNot,
        "typeof" => JsUnaryOp::TypeOf,
        "void" => JsUnaryOp::Void,
        "delete" => JsUnaryOp::Delete,
        _ => JsUnaryOp::Not,
    };

    let prefix = obj.get("prefix").and_then(|p| p.as_bool()).unwrap_or(true);

    let argument = obj
        .get("argument")
        .map(|v| convert_json_value_simple(v, arena))
        .unwrap_or(JsExpr::Literal(JsLiteral::Null));

    JsExpr::Unary(JsUnaryExpression {
        operator,
        argument: arena.alloc_expr(argument),
        prefix,
    })
}

fn convert_logical_expression_simple(
    obj: &serde_json::Map<String, serde_json::Value>,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    let operator_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("&&");

    let operator = match operator_str {
        "&&" => JsLogicalOp::And,
        "||" => JsLogicalOp::Or,
        "??" => JsLogicalOp::NullishCoalescing,
        _ => JsLogicalOp::And,
    };

    let left = obj
        .get("left")
        .map(|v| convert_json_value_simple(v, arena))
        .unwrap_or(JsExpr::Literal(JsLiteral::Null));

    let right = obj
        .get("right")
        .map(|v| convert_json_value_simple(v, arena))
        .unwrap_or(JsExpr::Literal(JsLiteral::Null));

    JsExpr::Logical(JsLogicalExpression {
        operator,
        left: arena.alloc_expr(left),
        right: arena.alloc_expr(right),
    })
}

fn convert_conditional_expression_simple(
    obj: &serde_json::Map<String, serde_json::Value>,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    let test = obj
        .get("test")
        .map(|v| convert_json_value_simple(v, arena))
        .unwrap_or(JsExpr::Literal(JsLiteral::Null));

    let consequent = obj
        .get("consequent")
        .map(|v| convert_json_value_simple(v, arena))
        .unwrap_or(JsExpr::Literal(JsLiteral::Null));

    let alternate = obj
        .get("alternate")
        .map(|v| convert_json_value_simple(v, arena))
        .unwrap_or(JsExpr::Literal(JsLiteral::Null));

    JsExpr::Conditional(JsConditionalExpression {
        test: arena.alloc_expr(test),
        consequent: arena.alloc_expr(consequent),
        alternate: arena.alloc_expr(alternate),
    })
}

fn convert_arrow_function_simple(
    obj: &serde_json::Map<String, serde_json::Value>,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    let is_async = obj.get("async").and_then(|a| a.as_bool()).unwrap_or(false);

    let params = obj
        .get("params")
        .and_then(|p| p.as_array())
        .map(|params| {
            params
                .iter()
                .filter_map(|param| {
                    let param_obj = param.as_object()?;
                    let param_type = param_obj.get("type")?.as_str()?;
                    match param_type {
                        "Identifier" => {
                            let name = param_obj
                                .get("name")
                                .and_then(|n| n.as_str())
                                .unwrap_or("_")
                                .to_string();
                            Some(JsPattern::Identifier(name.into()))
                        }
                        _ => None,
                    }
                })
                .collect()
        })
        .unwrap_or_default();

    let body = if let Some(body_val) = obj.get("body") {
        if let Some(body_obj) = body_val.as_object()
            && body_obj.get("type").and_then(|t| t.as_str()) == Some("BlockStatement")
        {
            // Block body - for now, just return an empty block
            JsArrowBody::Block(JsBlockStatement { body: vec![] })
        } else {
            JsArrowBody::Expression(arena.alloc_expr(convert_json_value_simple(body_val, arena)))
        }
    } else {
        JsArrowBody::Expression(arena.alloc_expr(JsExpr::Literal(JsLiteral::Null)))
    };

    JsExpr::Arrow(JsArrowFunction {
        params,
        body,
        is_async,
    })
}

fn convert_template_literal_simple(
    obj: &serde_json::Map<String, serde_json::Value>,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    let quasis = obj
        .get("quasis")
        .and_then(|q| q.as_array())
        .map(|quasis| {
            quasis
                .iter()
                .filter_map(|quasi| {
                    let quasi_obj = quasi.as_object()?;
                    let value_obj = quasi_obj.get("value")?.as_object()?;
                    let raw = value_obj
                        .get("raw")
                        .and_then(|r| r.as_str())
                        .unwrap_or("")
                        .to_string();
                    let cooked = value_obj
                        .get("cooked")
                        .and_then(|c| c.as_str())
                        .unwrap_or("")
                        .to_string();
                    let tail = quasi_obj
                        .get("tail")
                        .and_then(|t| t.as_bool())
                        .unwrap_or(false);

                    Some(JsTemplateElement {
                        raw: raw.into(),
                        cooked: cooked.into(),
                        tail,
                    })
                })
                .collect()
        })
        .unwrap_or_default();

    let expressions = obj
        .get("expressions")
        .and_then(|e| e.as_array())
        .map(|exprs| {
            exprs
                .iter()
                .map(|v| convert_json_value_simple(v, arena))
                .collect()
        })
        .unwrap_or_default();

    JsExpr::TemplateLiteral(JsTemplateLiteral {
        quasis,
        expressions,
    })
}

/// Check if an expression has a comma at the top level (i.e., it's a sequence/comma expression).
/// Returns false if all commas are inside parentheses, brackets, braces, or strings.
///
/// This is used to determine if an expression needs to be wrapped in parentheses
/// before being passed as a single argument to a function like `$.escape()` or `$.html()`.
pub fn has_top_level_comma(expr: &str) -> bool {
    let chars: Vec<char> = expr.chars().collect();
    let mut i = 0;
    let mut paren_depth: i32 = 0;
    let mut bracket_depth: i32 = 0;
    let mut brace_depth: i32 = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        let c = chars[i];
        if in_string {
            if c == '\\' {
                i += 2;
                continue;
            } else if c == string_char {
                in_string = false;
            }
        } else if c == '"' || c == '\'' || c == '`' {
            in_string = true;
            string_char = c;
        } else {
            match c {
                '(' => paren_depth += 1,
                ')' => paren_depth -= 1,
                '[' => bracket_depth += 1,
                ']' => bracket_depth -= 1,
                '{' => brace_depth += 1,
                '}' => brace_depth -= 1,
                ',' if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 => {
                    return true;
                }
                _ => {}
            }
        }
        i += 1;
    }
    false
}
