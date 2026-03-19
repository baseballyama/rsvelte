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

    // Track async values for $.async() wrapping
    let mut async_values: Vec<JsExpr> = Vec::new();
    let mut async_ids: Vec<compact_str::CompactString> = Vec::new();
    let mut any_has_await = false;

    let mut derived_decls: Vec<JsStatement> = Vec::new();
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

            // Check if this argument has await
            let arg_has_await =
                template_metadata.has_await() || super::shared::utils::expression_has_await(arg);

            if arg_has_await {
                any_has_await = true;
                // Generate async value id like $0, $1, etc.
                let id_name = format!("${}", async_values.len());
                // Strip the top-level await since $.async handles the awaiting
                let stripped = b::strip_await(built);
                // If the stripped expression still contains awaits, use async thunk
                let thunked = if b::js_expr_has_await(&stripped) {
                    b::async_thunk(stripped)
                } else {
                    b::thunk(stripped)
                };
                async_values.push(thunked);
                async_ids.push(id_name.clone().into());
                // Return: () => $.get($N)
                b::thunk(b::call(b::member_path("$.get"), vec![b::id(&id_name)]))
            } else {
                // If the argument expression has a call, we need to memoize it with $.derived()
                let has_call_from_expr = json_value_has_call(arg.as_json());
                if template_metadata.has_call() || has_call_from_expr {
                    let id_name = context.state.memoizer.generate_id("$0");
                    derived_decls.push(b::let_decl(
                        &id_name,
                        Some(b::call(b::member_path("$.derived"), vec![b::thunk(built)])),
                    ));
                    b::thunk(b::call(b::member_path("$.get"), vec![b::id(&id_name)]))
                } else {
                    b::thunk(built)
                }
            }
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

    // If we have a chain expression then ensure a nullish snippet function gets turned into an empty one
    let is_chain_expression = node
        .expression
        .as_json()
        .as_object()
        .and_then(|obj| obj.get("type"))
        .and_then(|t| t.as_str())
        == Some("ChainExpression");

    // Build the call based on whether the snippet is dynamic
    let call = if node.metadata.dynamic {
        // Dynamic snippet: use $.snippet() helper
        let snippet_fn = if is_chain_expression {
            b::logical_str("??", snippet_function, b::member_path("$.noop"))
        } else {
            snippet_function
        };
        let mut call_args = vec![context.state.node.clone(), b::thunk(snippet_fn)];
        call_args.extend(args);
        b::call(b::member_path("$.snippet"), call_args)
    } else {
        // Static snippet: direct call
        let mut call_args = vec![context.state.node.clone()];
        call_args.extend(args);
        b::call(snippet_function, call_args)
    };

    // Build the statements list (derived decls + call)
    let mut statements: Vec<JsStatement> = derived_decls;
    // In dev mode, wrap with $.add_svelte_meta() for render tags
    if context.state.dev {
        use crate::compiler::phases::phase3_transform::client::visitors::attribute::locate_in_source;
        let (line, col) = locate_in_source(&context.state.analysis.source, node.start as usize);
        statements.push(super::shared::utils::add_svelte_meta_dev(
            call,
            "render",
            &context.state.analysis.name,
            line,
            col,
            None,
            true,
        ));
    } else {
        statements.push(b::stmt(call));
    }

    // Check for blockers from the blocker_map by scanning the call for identifiers.
    // We use collect_identifiers_from_statement (which recurses into arrow functions)
    // rather than collect_get_arg_identifiers_from_statement (which doesn't),
    // because render tag arguments are often thunked: `child($$anchor, () => $.get(n))`.
    // The $.get(n) inside the arrow contains the blocker reference.
    let mut all_blocker_exprs: Vec<JsExpr> = Vec::new();
    for stmt in &statements {
        let mut names = Vec::new();
        super::fragment::collect_identifiers_from_statement_deep(stmt, &mut names);
        let map = context.state.blocker_map.borrow();
        for name in &names {
            if let Some(&idx) = map.get(name.as_str()) {
                let blocker = b::member_computed(b::id("$$promises"), b::number(idx as f64));
                let blocker_str = format!("{:?}", blocker);
                if !all_blocker_exprs
                    .iter()
                    .any(|b| format!("{:?}", b) == blocker_str)
                {
                    all_blocker_exprs.push(blocker);
                }
            }
        }
    }
    let has_blockers = !all_blocker_exprs.is_empty();

    // If any arguments have await or blockers, wrap in $.async()
    if any_has_await || has_blockers {
        let node_name = match &context.state.node {
            JsExpr::Identifier(name) => name.clone(),
            _ => "$$anchor".into(),
        };

        let mut callback_params: Vec<
            crate::compiler::phases::phase3_transform::js_ast::nodes::JsPattern,
        > = vec![b::id_pattern(node_name.clone())];
        for id in &async_ids {
            callback_params.push(b::id_pattern(id.clone()));
        }

        let callback = b::arrow_block(callback_params, statements);

        // Build blockers argument
        let blockers_arg = if has_blockers {
            b::array(all_blocker_exprs)
        } else {
            b::undefined()
        };

        // Build async_values argument
        let async_values_arg = if any_has_await {
            b::array(async_values)
        } else {
            b::undefined()
        };

        let result = b::stmt(b::call(
            b::member_path("$.async"),
            vec![
                context.state.node.clone(),
                blockers_arg,
                async_values_arg,
                callback,
            ],
        ));

        // If standalone, push $.async() to init and add $.next() after
        if context.state.is_standalone {
            context.state.init.push(result);
            return b::stmt(b::call(b::member_path("$.next"), vec![]));
        }

        result
    } else if statements.len() == 1 {
        statements.pop().unwrap()
    } else {
        b::block(statements)
    }
}

/// Unwrap optional chain expression if present.
///
/// Corresponds to `unwrap_optional` in Svelte's utils.
fn unwrap_optional(expr: &Expression) -> Expression {
    let val = expr.as_json();
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
    let val = expr.as_json();
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
    let val = expr.as_json();
    if let Some(obj) = val.as_object()
        && let Some("CallExpression") = obj.get("type").and_then(|t| t.as_str())
        && let Some(callee) = obj.get("callee")
    {
        return Some(Expression::Value(callee.clone()));
    }
    None
}

/// Recursively check if a JSON value (ESTree node) contains a CallExpression.
/// Stops recursion at function boundaries (ArrowFunctionExpression, FunctionExpression)
/// since calls inside those don't affect the outer expression's reactivity.
fn json_value_has_call(val: &serde_json::Value) -> bool {
    match val {
        serde_json::Value::Object(obj) => {
            if let Some(expr_type) = obj.get("type").and_then(|v| v.as_str()) {
                if expr_type == "CallExpression" {
                    return true;
                }
                if expr_type == "ArrowFunctionExpression"
                    || expr_type == "FunctionExpression"
                    || expr_type == "FunctionDeclaration"
                {
                    return false;
                }
            }
            obj.values().any(json_value_has_call)
        }
        serde_json::Value::Array(arr) => arr.iter().any(json_value_has_call),
        _ => false,
    }
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

        if let Some(callee_expr) = callee {
            let val = callee_expr.as_json();
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
