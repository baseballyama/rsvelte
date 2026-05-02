//! AwaitExpression visitor.
//!
//! Analyzes await expressions in JavaScript code.
//!
//! Corresponds to Svelte's `2-analyze/visitors/AwaitExpression.js`.

use super::{JsPathEntry, VisitorContext};
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit an await expression.
///
/// Corresponds to the `AwaitExpression` function in AwaitExpression.js.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let tla = context.ast_type == super::AstType::Instance && context.function_depth == 1;

    // Check if this await is in a reactive expression context.
    // Reference: AwaitExpression.js line 14-22
    // An await is in a reactive context when:
    // 1. It's inside a $derived function (derived_function_depth == function_depth), OR
    // 2. It's inside a template expression (context.expression is Some)
    let in_derived = context.derived_function_depth == context.function_depth
        && context.derived_function_depth > 0;
    let in_reactive = in_derived || context.expression.is_some();

    // Preserve context for awaits that precede other expressions in template or $derived(...)
    if in_reactive && !is_last_evaluated_expression_js(&context.js_path, node) {
        let start = node.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as u32;
        context.analysis.pickled_awaits.insert(start);
    }

    // Determine if this await requires suspension.
    // Reference: AwaitExpression.js lines 24-30
    let mut suspend = tla;

    if let Some(metadata) = context.current_expression() {
        metadata.set_has_await(true);
        suspend = true;
    } else if context.in_expression_tag && !crosses_function_boundary(&context.js_path) {
        // The rsvelte `ExpressionTag` AST node currently has no metadata
        // pointer to attach `expression` to, but the await is still in a
        // reactive template position and must trigger the same checks
        // (unless an inner function declaration breaks the reactive context).
        suspend = true;
    }

    // Disallow top-level `await` or `await` in template expressions
    // unless a) in runes mode and b) opted into `experimental.async`
    // Reference: AwaitExpression.js lines 32-42
    if suspend {
        if !context.analysis.experimental_async {
            return Err(AnalysisError::ValidationWithCode {
                code: "experimental_async".to_string(),
                message: "Cannot use `await` in deriveds and template expressions, or at the top level of a component, unless the `experimental.async` compiler option is `true`".to_string(),
            });
        }

        if !context.analysis.runes {
            return Err(AnalysisError::ValidationWithCode {
                code: "legacy_await_invalid".to_string(),
                message: "Cannot use `await` in deriveds and template expressions, or at the top level of a component, unless in runes mode".to_string(),
            });
        }
    }

    // Visit the argument expression
    if let Some(argument) = node.get("argument") {
        super::script::walk_js_node(argument, context)?;
    }

    Ok(())
}

/// Returns true when the JS path between the current node and the enclosing
/// template expression contains a function boundary (Arrow/FunctionExpression/
/// FunctionDeclaration). Mirrors `is_reactive_expression`'s function-boundary
/// short-circuit in the official `AwaitExpression.js`.
fn crosses_function_boundary(js_path: &[JsPathEntry]) -> bool {
    for entry in js_path.iter().rev() {
        let parent_type = entry.as_value().get("type").and_then(|t| t.as_str());
        match parent_type {
            Some("ArrowFunctionExpression")
            | Some("FunctionExpression")
            | Some("FunctionDeclaration") => return true,
            _ => {}
        }
    }
    false
}

/// Visit an await expression (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let tla = context.ast_type == super::AstType::Instance && context.function_depth == 1;

    let in_derived = context.derived_function_depth == context.function_depth
        && context.derived_function_depth > 0;
    let in_reactive = in_derived || context.expression.is_some();

    if in_reactive {
        // Need Value for is_last_evaluated_expression_js comparison
        let value = node.to_value();
        if !is_last_evaluated_expression_js(&context.js_path, &value) {
            let start = node.start().unwrap_or(0);
            context.analysis.pickled_awaits.insert(start);
        }
    }

    let mut suspend = tla;

    if let Some(metadata) = context.current_expression() {
        metadata.set_has_await(true);
        suspend = true;
    } else if context.in_expression_tag && !crosses_function_boundary(&context.js_path) {
        suspend = true;
    }

    if suspend {
        if !context.analysis.experimental_async {
            return Err(AnalysisError::ValidationWithCode {
                code: "experimental_async".to_string(),
                message: "Cannot use `await` in deriveds and template expressions, or at the top level of a component, unless the `experimental.async` compiler option is `true`".to_string(),
            });
        }

        if !context.analysis.runes {
            return Err(AnalysisError::ValidationWithCode {
                code: "legacy_await_invalid".to_string(),
                message: "Cannot use `await` in deriveds and template expressions, or at the top level of a component, unless in runes mode".to_string(),
            });
        }
    }

    // Visit the argument expression using typed traversal
    if let JsNode::AwaitExpression { argument, .. } = node {
        let arena = context.parse_arena;
        let arg_node = arena.get_js_node(*argument);
        super::script::walk_js_node_typed(arg_node, context)?;
    }

    Ok(())
}

/// Check if an expression is in a reactive context by walking up the JS AST path.
fn is_reactive_expression_js(js_path: &[JsPathEntry], in_derived: bool) -> bool {
    if in_derived {
        return true;
    }

    for entry in js_path.iter().rev() {
        let parent = entry.as_value();
        let parent_type = parent.get("type").and_then(|t| t.as_str());

        // Function boundaries stop the search
        match parent_type {
            Some("ArrowFunctionExpression")
            | Some("FunctionExpression")
            | Some("FunctionDeclaration") => {
                return false;
            }
            _ => {}
        }

        // Check if parent has metadata (indicating reactive template context)
        if parent.get("metadata").is_some() {
            return true;
        }
    }

    false
}

/// Check if an expression is the last evaluated expression in its reactive context.
///
/// Corresponds to `is_last_evaluated_expression` in AwaitExpression.js.
fn is_last_evaluated_expression_js(js_path: &[JsPathEntry], node: &Value) -> bool {
    let mut current = node;

    for entry in js_path.iter().rev() {
        let parent = entry.as_value();
        let parent_type = parent.get("type").and_then(|t| t.as_str());

        if parent_type == Some("ConstTag") {
            return false;
        }

        if parent.get("metadata").is_some() {
            return true;
        }

        match parent_type {
            Some("ArrayExpression") => {
                if let Some(Value::Array(elements)) = parent.get("elements")
                    && !is_same_node(elements.last(), current)
                {
                    return false;
                }
            }

            Some("AssignmentExpression") | Some("BinaryExpression") | Some("LogicalExpression") => {
                if is_same_node(parent.get("left"), current) {
                    return false;
                }
            }

            Some("CallExpression") | Some("NewExpression") => {
                if let Some(Value::Array(args)) = parent.get("arguments")
                    && !is_same_node(args.last(), current)
                {
                    return false;
                }
            }

            Some("ConditionalExpression") => {
                if is_same_node(parent.get("test"), current) {
                    return false;
                }
            }

            Some("MemberExpression") => {
                if parent
                    .get("computed")
                    .and_then(|c| c.as_bool())
                    .unwrap_or(false)
                    && is_same_node(parent.get("object"), current)
                {
                    return false;
                }
            }

            Some("ObjectExpression") => {
                if let Some(Value::Array(props)) = parent.get("properties")
                    && !is_same_node(props.last(), current)
                {
                    return false;
                }
            }

            Some("Property") => {
                if is_same_node(parent.get("key"), current) {
                    return false;
                }
            }

            Some("SequenceExpression") => {
                if let Some(Value::Array(exprs)) = parent.get("expressions")
                    && !is_same_node(exprs.last(), current)
                {
                    return false;
                }
            }

            Some("TaggedTemplateExpression") => {
                if let Some(quasi) = parent.get("quasi")
                    && let Some(Value::Array(exprs)) = quasi.get("expressions")
                    && !is_same_node(exprs.last(), current)
                {
                    return false;
                }
            }

            Some("TemplateLiteral") => {
                if let Some(Value::Array(exprs)) = parent.get("expressions")
                    && !is_same_node(exprs.last(), current)
                {
                    return false;
                }
            }

            Some("VariableDeclarator") => {
                return true;
            }

            _ => {
                return false;
            }
        }

        current = parent;
    }

    false
}

/// Check if two JSON nodes are the same by comparing start/end positions.
fn is_same_node(a: Option<&Value>, b: &Value) -> bool {
    match a {
        Some(a_val) => {
            let a_start = a_val.get("start").and_then(|s| s.as_u64());
            let b_start = b.get("start").and_then(|s| s.as_u64());
            let a_end = a_val.get("end").and_then(|s| s.as_u64());
            let b_end = b.get("end").and_then(|s| s.as_u64());
            a_start.is_some() && a_start == b_start && a_end == b_end
        }
        None => false,
    }
}
