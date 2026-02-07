//! RenderTag visitor for client-side transformation.
//!
//! Corresponds to `RenderTag.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/RenderTag.js`.
//!
//! This visitor handles the transformation of `{@render snippet(...)}` tags
//! into client-side JavaScript code.

use crate::ast::js::Expression;
use crate::ast::template::RenderTag;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_expression;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Visit a RenderTag node and generate client-side code.
///
/// This function corresponds to the `RenderTag` visitor in the JavaScript compiler.
/// It generates the necessary JavaScript to render a snippet.
///
/// # Arguments
///
/// * `node` - The RenderTag AST node
/// * `context` - The component transformation context
///
/// # Returns
///
/// Returns a statement that renders the snippet.
///
/// # Example
///
/// Given this Svelte code:
/// ```svelte
/// {@render snip()}
/// ```
///
/// This visitor generates code like:
/// ```javascript
/// snip(node);
/// ```
///
/// For dynamic snippets, it generates:
/// ```javascript
/// $.snippet(node, () => snippet_function, ...args);
/// ```
pub fn render_tag(node: &RenderTag, context: &mut ComponentContext) -> JsStatement {
    // Push a comment placeholder for the render tag
    context.state.template.push_comment(None);

    // Get the call expression from the render tag
    // The expression should be a CallExpression like `snip()` or `snip(arg1, arg2)`
    let call_expr = unwrap_optional(&node.expression);

    // Extract arguments and wrap them in thunks
    // Reference: RenderTag.js lines 22-33
    let raw_args = extract_call_arguments(&call_expr);
    let args: Vec<JsExpr> = raw_args
        .iter()
        .enumerate()
        .map(|(i, arg)| {
            let converted = convert_expression(arg, context);
            // Get metadata from analysis for this argument, or compute from expression
            let template_metadata = node.metadata.arguments.get(i).cloned().unwrap_or_default();
            let metadata = ExpressionMetadata::from_template_metadata(&template_metadata);
            // Apply transforms ($.get() wrapping for reactive state variables)
            let built = build_expression(context, &converted, &metadata);
            b::thunk(built)
        })
        .collect();

    // Get the snippet function (callee)
    // Reference: RenderTag.js lines 40-44
    let snippet_function = if let Some(callee) = extract_call_callee(&call_expr) {
        let converted = convert_expression(&callee, context);
        // Apply transforms to the callee too (e.g., for derived snippet variables)
        let metadata = ExpressionMetadata::from_template_metadata(&node.metadata.expression);
        build_expression(context, &converted, &metadata)
    } else {
        // Fallback - shouldn't normally happen
        b::id("$$snippet")
    };

    // Build the call based on whether the snippet is dynamic
    let call = if node.metadata.dynamic {
        // Dynamic snippet: use $.snippet() helper
        let mut call_args = vec![context.state.node.clone(), b::thunk(snippet_function)];
        call_args.extend(args);
        b::call(b::member_path("$.snippet"), call_args)
    } else {
        // Static snippet: direct call
        let mut call_args = vec![context.state.node.clone()];
        call_args.extend(args);
        b::call(snippet_function, call_args)
    };

    b::stmt(call)
}

/// Unwrap optional chain expression if present.
///
/// Corresponds to `unwrap_optional` in Svelte's utils.
fn unwrap_optional(expr: &Expression) -> Expression {
    let Expression::Value(val) = expr;
    // Check for ChainExpression (optional chaining)
    if let Some(obj) = val.as_object()
        && let Some("ChainExpression") = obj.get("type").and_then(|t| t.as_str())
        && let Some(inner) = obj.get("expression")
        && let Some(inner_obj) = inner.as_object()
    {
        return Expression::Value(serde_json::Value::Object(inner_obj.clone()));
    }
    expr.clone()
}

/// Extract arguments from a call expression.
fn extract_call_arguments(expr: &Expression) -> Vec<Expression> {
    let Expression::Value(val) = expr;
    if let Some(obj) = val.as_object()
        && let Some("CallExpression") = obj.get("type").and_then(|t| t.as_str())
        && let Some(args) = obj.get("arguments").and_then(|a| a.as_array())
    {
        return args
            .iter()
            .map(|arg| Expression::Value(arg.clone()))
            .collect();
    }
    Vec::new()
}

/// Extract callee from a call expression.
fn extract_call_callee(expr: &Expression) -> Option<Expression> {
    let Expression::Value(val) = expr;
    if let Some(obj) = val.as_object()
        && let Some("CallExpression") = obj.get("type").and_then(|t| t.as_str())
        && let Some(callee) = obj.get("callee")
    {
        return Some(Expression::Value(callee.clone()));
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_call_callee() {
        let call_expr = Expression::Value(serde_json::json!({
            "type": "CallExpression",
            "callee": {
                "type": "Identifier",
                "name": "snip"
            },
            "arguments": []
        }));

        let callee = extract_call_callee(&call_expr);
        assert!(callee.is_some());

        if let Some(Expression::Value(val)) = callee {
            let obj = val.as_object().unwrap();
            assert_eq!(obj.get("type").and_then(|t| t.as_str()), Some("Identifier"));
            assert_eq!(obj.get("name").and_then(|n| n.as_str()), Some("snip"));
        }
    }

    #[test]
    fn test_extract_call_arguments() {
        let call_expr = Expression::Value(serde_json::json!({
            "type": "CallExpression",
            "callee": {
                "type": "Identifier",
                "name": "snip"
            },
            "arguments": [
                { "type": "Literal", "value": 42 }
            ]
        }));

        let args = extract_call_arguments(&call_expr);
        assert_eq!(args.len(), 1);
    }
}
