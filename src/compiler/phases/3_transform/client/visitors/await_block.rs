//! AwaitBlock visitor for client-side transformation.
//!
//! This module handles the transformation of `{#await}` blocks into client-side
//! JavaScript code. It corresponds to
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/AwaitBlock.js`.
//!
//! # Overview
//!
//! The AwaitBlock visitor generates code for handling promises in templates. It handles:
//!
//! - Pending state (while the promise is in progress)
//! - Then state (when the promise resolves)
//! - Catch state (when the promise rejects)
//! - Variable scoping for resolved values and errors
//! - Async expressions with blockers
//!
//! # Generated Code
//!
//! For a simple await block like:
//!
//! ```svelte
//! {#await promise}
//!   <p>Loading...</p>
//! {:then value}
//!   <p>{value}</p>
//! {:catch error}
//!   <p>{error.message}</p>
//! {/await}
//! ```
//!
//! This generates:
//!
//! ```js
//! $.await(anchor, () => promise, ($$anchor) => {
//!   // pending content
//! }, ($$anchor, value) => {
//!   // then content
//! }, ($$anchor, error) => {
//!   // catch content
//! });
//! ```

use crate::ast::js::Expression;
use crate::ast::template::{AwaitBlock, Fragment};
use crate::compiler::phases::phase3_transform::client::types::{
    ComponentContext, ExpressionMetadata,
};
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::shared::declarations::get_value;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::{
    add_svelte_meta, build_expression,
};
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Transform an AwaitBlock node into client-side JavaScript.
///
/// # Arguments
///
/// * `node` - The AwaitBlock AST node
/// * `context` - The component transformation context
///
/// # Implementation Notes
///
/// This function mirrors the JavaScript implementation in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/AwaitBlock.js`.
///
/// The implementation:
/// 1. Adds a comment placeholder in the template
/// 2. Builds the promise expression (wrapped in a thunk)
/// 3. Creates arrow functions for pending, then, and catch blocks
/// 4. For then/catch blocks with values, sets up transforms and derived declarations
/// 5. Wraps in $.async() if the expression has blockers
pub fn await_block(node: &AwaitBlock, context: &mut ComponentContext) {
    // Add comment placeholder for the await block
    context.state.template.push_comment(None);

    // Visit {#await <expression>} first to ensure that scopes are in the correct order
    // Build the promise expression
    let converted_expr = convert_expression(&node.expression, context);

    // Build expression with metadata
    let expr_metadata = ExpressionMetadata {
        has_call: node.metadata.expression.has_call,
        has_await: node.metadata.expression.has_await,
        has_state: node.metadata.expression.has_state,
        has_member_expression: node.metadata.expression.has_member_expression,
        has_assignment: node.metadata.expression.has_assignment,
        ..Default::default()
    };

    let built_expr = build_expression(context, &converted_expr, &expr_metadata);

    // Wrap in thunk (async if has_await)
    let expression = if node.metadata.expression.has_await {
        b::async_thunk(built_expr)
    } else {
        b::thunk(built_expr)
    };

    // Build then block
    let then_block = node.then.as_ref().map(|then_fragment| {
        build_block_with_argument(then_fragment, &node.value, context, "then")
    });

    // Build catch block
    let catch_block = node.catch.as_ref().map(|catch_fragment| {
        build_block_with_argument(catch_fragment, &node.error, context, "catch")
    });

    // Build pending block
    let pending_block = if let Some(ref pending_fragment) = node.pending {
        let body_statements = visit_fragment(pending_fragment, context);
        b::arrow_block(vec![b::id_pattern("$$anchor")], body_statements)
    } else {
        b::null()
    };

    // Build $.await() call arguments
    // Only include catch_block if it exists (avoid trailing null)
    let mut await_args = vec![
        context.state.node.clone(),
        expression,
        pending_block,
        then_block.unwrap_or_else(b::null),
    ];
    if let Some(catch_fn) = catch_block {
        await_args.push(catch_fn);
    }
    let await_call = b::call(b::member_path("$.await"), await_args);

    // Add svelte metadata
    let stmt = add_svelte_meta(await_call);

    // Check if expression has blockers (async dependencies)
    // Note: has_blockers() currently returns false as blocker tracking is not yet implemented
    if node.metadata.expression.has_blockers() {
        // Wrap in $.async()
        // Since blockers field doesn't exist in ExpressionMetadata yet, use empty array
        let blockers = b::array(vec![]);

        let async_call = b::call(
            b::member_path("$.async"),
            vec![
                context.state.node.clone(),
                blockers,
                b::array(vec![]),
                b::arrow_block(vec![extract_node_pattern(&context.state.node)], vec![stmt]),
            ],
        );

        context.state.init.push(b::stmt(async_call));
    } else {
        context.state.init.push(stmt);
    }
}

/// Build a block (then/catch) with an optional argument pattern.
///
/// For then blocks: `($$anchor, value) => { ... }`
/// For catch blocks: `($$anchor, error) => { ... }`
///
/// If the argument is a destructuring pattern, creates derived values for
/// each extracted identifier.
fn build_block_with_argument(
    fragment: &Fragment,
    argument_pattern: &Option<Expression>,
    context: &mut ComponentContext,
    block_type: &str,
) -> JsExpr {
    // Create a new state context with copied transform
    // In the JS implementation, this is done with:
    // const then_context = { ...context, state: { ...context.state, transform: { ...context.state.transform } } };
    let saved_transform = context.state.transform.clone();

    // Build the argument and declarations
    let (arg_pattern, declarations) = if let Some(pattern) = argument_pattern {
        create_derived_block_argument(pattern, context)
    } else {
        (None, vec![])
    };

    // Build parameters
    let mut params = vec![b::id_pattern("$$anchor")];
    if let Some(arg) = arg_pattern {
        params.push(arg);
    }

    // Visit the fragment to get body statements
    let mut body_statements = declarations;
    let fragment_statements = visit_fragment(fragment, context);
    body_statements.extend(fragment_statements);

    // Restore the transform state
    context.state.transform = saved_transform;

    // Log for debugging if needed
    let _ = block_type;

    b::arrow_block(params, body_statements)
}

/// Create a derived block argument from a pattern.
///
/// For simple identifiers like `value`, sets up a transform with `get_value`.
///
/// For destructuring patterns like `{ a, b }`, creates derived values:
/// ```js
/// let $$value = $.derived(() => {
///   let { a, b } = $.get($$source);
///   return { a, b };
/// });
/// let a = $.derived(() => $.get($$value).a);
/// let b = $.derived(() => $.get($$value).b);
/// ```
///
/// Returns the argument pattern and any declarations needed.
fn create_derived_block_argument(
    pattern: &Expression,
    context: &mut ComponentContext,
) -> (Option<JsPattern>, Vec<JsStatement>) {
    // Check if it's a simple identifier
    if let Some(name) = get_identifier_name(pattern) {
        // Simple identifier - set up transform with get_value
        context.state.transform.insert(
            name.clone(),
            crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
                read: Some(get_value),
                assign: None,
                mutate: None,
                update: None,
            },
        );
        return (Some(JsPattern::Identifier(name)), vec![]);
    }

    // Destructuring pattern - extract identifiers and create derived values
    let identifiers = extract_identifiers(pattern);

    if identifiers.is_empty() {
        return (None, vec![]);
    }

    let _pattern_expr = convert_expression(pattern, context);
    let pattern_js = convert_expression_to_pattern(pattern);

    let source_id = b::id("$$source");
    let value_id = b::id("$$value");

    // Build: let { a, b } = $.get($$source); return { a, b };
    let get_source_call = b::call(b::member_path("$.get"), vec![source_id.clone()]);

    // Build object with shorthand properties for return statement
    let return_object = b::object(
        identifiers
            .iter()
            .map(|id| {
                JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Identifier(id.clone()),
                    value: Box::new(b::id(id)),
                    kind: JsPropertyKind::Init,
                    shorthand: true,
                    computed: false,
                })
            })
            .collect(),
    );

    let block_body = vec![
        b::var_decl_pattern(
            JsVariableKind::Let,
            pattern_js.clone(),
            Some(get_source_call),
        ),
        b::return_stmt(Some(return_object)),
    ];

    // Create the main derived value
    let derived_block = JsBlockStatement::with_body(block_body);
    let derived_call = create_derived_from_block(context, derived_block);

    let mut declarations = vec![b::let_decl("$$value", Some(derived_call))];

    // Create derived values for each identifier
    for id in &identifiers {
        // Set up transform for this identifier
        context.state.transform.insert(
            id.clone(),
            crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
                read: Some(get_value),
                assign: None,
                mutate: None,
                update: None,
            },
        );

        // Build: let id = $.derived(() => $.get($$value).id)
        let get_value_call = b::call(b::member_path("$.get"), vec![value_id.clone()]);
        let member_access = b::member(get_value_call, id);
        let id_derived = create_derived_from_expr(context, member_access);

        declarations.push(b::let_decl(id, Some(id_derived)));
    }

    // The argument pattern is $$source
    (
        Some(JsPattern::Identifier("$$source".to_string())),
        declarations,
    )
}

/// Create a $.derived() or $.derived_safe_equal() call from a block statement.
///
/// Uses $.derived in runes mode, $.derived_safe_equal in legacy mode.
fn create_derived_from_block(context: &ComponentContext, block: JsBlockStatement) -> JsExpr {
    let thunk = b::arrow_block(vec![], block.body);

    let method = if context.state.analysis.runes {
        "$.derived"
    } else {
        "$.derived_safe_equal"
    };

    b::call(b::member_path(method), vec![thunk])
}

/// Create a $.derived() or $.derived_safe_equal() call from an expression.
///
/// Uses $.derived in runes mode, $.derived_safe_equal in legacy mode.
fn create_derived_from_expr(context: &ComponentContext, expr: JsExpr) -> JsExpr {
    let thunk = b::thunk(expr);

    let method = if context.state.analysis.runes {
        "$.derived"
    } else {
        "$.derived_safe_equal"
    };

    b::call(b::member_path(method), vec![thunk])
}

/// Get the name if the expression is a simple identifier.
fn get_identifier_name(expr: &Expression) -> Option<String> {
    let Expression::Value(val) = expr;
    if let serde_json::Value::Object(obj) = val
        && obj.get("type").and_then(|v| v.as_str()) == Some("Identifier")
    {
        obj.get("name").and_then(|v| v.as_str()).map(String::from)
    } else {
        None
    }
}

/// Extract all identifier names from a pattern expression.
fn extract_identifiers(expr: &Expression) -> Vec<String> {
    let mut identifiers = Vec::new();
    extract_identifiers_recursive(expr, &mut identifiers);
    identifiers
}

fn extract_identifiers_recursive(expr: &Expression, identifiers: &mut Vec<String>) {
    let Expression::Value(val) = expr;
    if let serde_json::Value::Object(obj) = val {
        match obj.get("type").and_then(|v| v.as_str()) {
            Some("Identifier") => {
                if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                    identifiers.push(name.to_string());
                }
            }
            Some("ObjectPattern") => {
                if let Some(props) = obj.get("properties").and_then(|p| p.as_array()) {
                    for prop in props {
                        if let Some(value) = prop.get("value") {
                            extract_identifiers_recursive(
                                &Expression::Value(value.clone()),
                                identifiers,
                            );
                        } else if let Some(key) = prop.get("key") {
                            // Shorthand property
                            extract_identifiers_recursive(
                                &Expression::Value(key.clone()),
                                identifiers,
                            );
                        }
                    }
                }
            }
            Some("ArrayPattern") => {
                if let Some(elems) = obj.get("elements").and_then(|e| e.as_array()) {
                    for elem in elems {
                        if !elem.is_null() {
                            extract_identifiers_recursive(
                                &Expression::Value(elem.clone()),
                                identifiers,
                            );
                        }
                    }
                }
            }
            Some("RestElement") => {
                if let Some(arg) = obj.get("argument") {
                    extract_identifiers_recursive(&Expression::Value(arg.clone()), identifiers);
                }
            }
            Some("AssignmentPattern") => {
                if let Some(left) = obj.get("left") {
                    extract_identifiers_recursive(&Expression::Value(left.clone()), identifiers);
                }
            }
            _ => {}
        }
    }
}

/// Convert an Expression to a JsPattern.
fn convert_expression_to_pattern(expr: &Expression) -> JsPattern {
    let Expression::Value(val) = expr;
    if let serde_json::Value::Object(obj) = val {
        match obj.get("type").and_then(|v| v.as_str()) {
            Some("Identifier") => {
                if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                    return JsPattern::Identifier(name.to_string());
                }
            }
            Some("ObjectPattern") => {
                if let Some(props) = obj.get("properties").and_then(|p| p.as_array()) {
                    let properties = props
                        .iter()
                        .filter_map(|prop| {
                            let prop_obj = prop.as_object()?;
                            let key = prop_obj.get("key")?.as_object()?;
                            let key_name = key.get("name")?.as_str()?;
                            let value = prop_obj.get("value")?;

                            let value_pattern = if value.is_object() {
                                convert_expression_to_pattern(&Expression::Value(value.clone()))
                            } else {
                                JsPattern::Identifier(key_name.to_string())
                            };

                            let shorthand = prop_obj
                                .get("shorthand")
                                .and_then(|s| s.as_bool())
                                .unwrap_or(false);

                            Some(JsObjectPatternProperty::Property {
                                key: JsPropertyKey::Identifier(key_name.to_string()),
                                value: value_pattern,
                                computed: false,
                                shorthand,
                            })
                        })
                        .collect();

                    return JsPattern::Object(JsObjectPattern { properties });
                }
            }
            Some("ArrayPattern") => {
                if let Some(elems) = obj.get("elements").and_then(|e| e.as_array()) {
                    let elements = elems
                        .iter()
                        .map(|elem| {
                            if elem.is_null() {
                                None
                            } else {
                                Some(convert_expression_to_pattern(&Expression::Value(
                                    elem.clone(),
                                )))
                            }
                        })
                        .collect();

                    return JsPattern::Array(JsArrayPattern { elements });
                }
            }
            Some("RestElement") => {
                if let Some(arg) = obj.get("argument") {
                    let inner = convert_expression_to_pattern(&Expression::Value(arg.clone()));
                    return JsPattern::Rest(Box::new(inner));
                }
            }
            _ => {}
        }
    }
    JsPattern::Identifier("$$unknown".to_string())
}

/// Visit a fragment and return its statements.
fn visit_fragment(fragment: &Fragment, context: &mut ComponentContext) -> Vec<JsStatement> {
    // Save the current state
    let saved_init = std::mem::take(&mut context.state.init);
    let saved_update = std::mem::take(&mut context.state.update);

    // Visit each node in the fragment
    for node in &fragment.nodes {
        let _ = context.visit_node(node, None);
    }

    // Collect the generated init statements
    let result = std::mem::replace(&mut context.state.init, saved_init);

    // Restore the update statements
    context.state.update = saved_update;

    result
}

/// Extract a pattern from a JsExpr (for the node parameter).
fn extract_node_pattern(expr: &JsExpr) -> JsPattern {
    match expr {
        JsExpr::Identifier(name) => JsPattern::Identifier(name.clone()),
        _ => JsPattern::Identifier("$$anchor".to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_identifier_name_simple() {
        let expr = Expression::Value(serde_json::json!({
            "type": "Identifier",
            "name": "value"
        }));

        assert_eq!(get_identifier_name(&expr), Some("value".to_string()));
    }

    #[test]
    fn test_get_identifier_name_not_identifier() {
        let expr = Expression::Value(serde_json::json!({
            "type": "ObjectPattern",
            "properties": []
        }));

        assert_eq!(get_identifier_name(&expr), None);
    }

    #[test]
    fn test_extract_identifiers_simple() {
        let expr = Expression::Value(serde_json::json!({
            "type": "Identifier",
            "name": "value"
        }));

        let ids = extract_identifiers(&expr);
        assert_eq!(ids, vec!["value".to_string()]);
    }

    #[test]
    fn test_extract_identifiers_object_pattern() {
        let expr = Expression::Value(serde_json::json!({
            "type": "ObjectPattern",
            "properties": [
                {
                    "type": "Property",
                    "key": { "type": "Identifier", "name": "a" },
                    "value": { "type": "Identifier", "name": "a" },
                    "shorthand": true
                },
                {
                    "type": "Property",
                    "key": { "type": "Identifier", "name": "b" },
                    "value": { "type": "Identifier", "name": "b" },
                    "shorthand": true
                }
            ]
        }));

        let ids = extract_identifiers(&expr);
        assert_eq!(ids, vec!["a".to_string(), "b".to_string()]);
    }

    #[test]
    fn test_convert_simple_pattern() {
        let expr = Expression::Value(serde_json::json!({
            "type": "Identifier",
            "name": "value"
        }));

        let pattern = convert_expression_to_pattern(&expr);
        match pattern {
            JsPattern::Identifier(name) => assert_eq!(name, "value"),
            _ => panic!("Expected identifier pattern"),
        }
    }
}
