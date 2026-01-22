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

/// Opens an if/each block for hydration boundaries.
///
/// This marker allows us to remove nodes in case of a mismatch during hydration.
///
/// Corresponds to `block_open` in `utils.js`.
pub fn block_open() -> JsExpr {
    JsExpr::Literal(JsLiteral::String(BLOCK_OPEN.to_string()))
}

/// Opens an if/each block with an else marker.
///
/// Used to indicate that an `{:else}...` block was rendered.
///
/// Corresponds to `block_open_else` in `utils.js`.
pub fn block_open_else() -> JsExpr {
    JsExpr::Literal(JsLiteral::String(BLOCK_OPEN_ELSE.to_string()))
}

/// Closes an if/each block.
///
/// This marker serves both as a closing boundary and an anchor for these blocks.
///
/// Corresponds to `block_close` in `utils.js`.
pub fn block_close() -> JsExpr {
    JsExpr::Literal(JsLiteral::String(BLOCK_CLOSE.to_string()))
}

/// Empty comment to keep text nodes separate or provide an anchor node for blocks.
///
/// Corresponds to `empty_comment` in `utils.js`.
pub fn empty_comment() -> JsExpr {
    JsExpr::Literal(JsLiteral::String(EMPTY_COMMENT.to_string()))
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
            raw: String::new(),
            cooked: String::new(),
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
                    // For now, we don't have scope evaluation, so we treat all expressions as dynamic
                    // TODO: Implement scope.evaluate() for constant folding

                    // Add the expression with $.escape() call
                    // TODO: Visit the expression once we have a visitor
                    let expr_str = extract_expression_string(&expr_tag.expression);
                    expressions.push(JsExpr::Call(JsCallExpression {
                        callee: Box::new(JsExpr::Member(JsMemberExpression {
                            object: Box::new(JsExpr::Identifier("$".to_string())),
                            property: JsMemberProperty::Identifier("escape".to_string()),
                            computed: false,
                            optional: false,
                        })),
                        arguments: vec![JsExpr::Identifier(expr_str)],
                        optional: false,
                    }));

                    // Start a new quasi
                    quasi = JsTemplateElement {
                        raw: String::new(),
                        cooked: String::new(),
                        tail: i + 1 == seq.len(),
                    };
                    quasis.push(quasi.clone());
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
            quasi.raw = sanitize_template_string(&quasi.cooked);
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
                        .push(TemplateItem::Expression(JsExpr::Identifier(expr_str)));
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
pub fn build_template(template: &[TemplateItem]) -> Vec<JsStatement> {
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
                raw: sanitize_template_string(cooked),
                cooked: cooked.clone(),
                tail: i == strings.len() - 1,
            })
            .collect();

        let template_literal = JsExpr::TemplateLiteral(JsTemplateLiteral {
            quasis,
            expressions: expressions.clone(),
        });

        statements.push(JsStatement::Expression(JsExpressionStatement {
            expression: Box::new(JsExpr::Call(JsCallExpression {
                callee: Box::new(JsExpr::Member(JsMemberExpression {
                    object: Box::new(JsExpr::Identifier("$$renderer".to_string())),
                    property: JsMemberProperty::Identifier("push".to_string()),
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
                            strings.push(quasi.cooked.clone());
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
) -> JsExpr
where
    F: Fn(JsExpr) -> JsExpr,
{
    use crate::ast::template::AttributeValue;

    match value {
        AttributeValue::True(_) => JsExpr::Literal(JsLiteral::Boolean(true)),
        AttributeValue::Expression(expr_tag) => {
            let expr_str = extract_expression_string(&expr_tag.expression);
            transform(JsExpr::Identifier(expr_str))
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

                        return JsExpr::Literal(JsLiteral::String(value));
                    }
                    AttributeValuePart::ExpressionTag(expr_tag) => {
                        let expr_str = extract_expression_string(&expr_tag.expression);
                        return transform(JsExpr::Identifier(expr_str));
                    }
                }
            }

            // Multiple parts - build template literal
            let mut quasi = JsTemplateElement {
                raw: String::new(),
                cooked: String::new(),
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
                        let expr_str = extract_expression_string(&expr_tag.expression);
                        let expr = JsExpr::Identifier(expr_str);

                        // Wrap in $.stringify
                        expressions.push(JsExpr::Call(JsCallExpression {
                            callee: Box::new(JsExpr::Member(JsMemberExpression {
                                object: Box::new(JsExpr::Identifier("$".to_string())),
                                property: JsMemberProperty::Identifier("stringify".to_string()),
                                computed: false,
                                optional: false,
                            })),
                            arguments: vec![transform(expr)],
                            optional: false,
                        }));

                        quasi = JsTemplateElement {
                            raw: String::new(),
                            cooked: String::new(),
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
pub fn create_child_block(body: JsBlockStatement, is_async: bool) -> JsStatement {
    JsStatement::Expression(JsExpressionStatement {
        expression: Box::new(JsExpr::Call(JsCallExpression {
            callee: Box::new(JsExpr::Member(JsMemberExpression {
                object: Box::new(JsExpr::Identifier("$$renderer".to_string())),
                property: JsMemberProperty::Identifier("child".to_string()),
                computed: false,
                optional: false,
            })),
            arguments: vec![JsExpr::Arrow(JsArrowFunction {
                params: vec![JsPattern::Identifier("$$renderer".to_string())],
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
        expression: Box::new(JsExpr::Call(JsCallExpression {
            callee: Box::new(JsExpr::Member(JsMemberExpression {
                object: Box::new(JsExpr::Identifier("$$renderer".to_string())),
                property: JsMemberProperty::Identifier(method_name.to_string()),
                computed: false,
                optional: false,
            })),
            arguments: vec![
                JsExpr::Array(JsArrayExpression {
                    elements: blockers.into_iter().map(Some).collect(),
                }),
                JsExpr::Arrow(JsArrowFunction {
                    params: vec![JsPattern::Identifier("$$renderer".to_string())],
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
