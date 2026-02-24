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
use crate::compiler::phases::phase3_transform::client::visitors::fragment::fragment;
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
    let expr_metadata = ExpressionMetadata::from_template_metadata(&node.metadata.expression);

    let built_expr = build_expression(context, &converted_expr, &expr_metadata);

    // If the expression has await, we need to apply $.save() transformation
    // to await expressions that are not at the last position.
    // For simplicity, we apply $.save() to all awaits that are nested inside other expressions.
    let built_expr = if node.metadata.expression.has_await() {
        apply_save_to_nested_awaits(&built_expr, true)
    } else {
        built_expr
    };

    // Wrap in thunk (async if has_await)
    let expression = if node.metadata.expression.has_await() {
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
    // Only include optional trailing args when they exist (avoid trailing nulls)
    let mut await_args = vec![context.state.node.clone(), expression, pending_block];
    // Add then block if it exists, or null if catch block follows
    if then_block.is_some() || catch_block.is_some() {
        // Use void 0 (undefined) for missing then block to match official compiler
        await_args.push(then_block.unwrap_or_else(b::undefined));
    }
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
                read_source: None,
                assign: None,
                mutate: None,
                update: None,
                skip_proxy: false,
                is_defined: false,
                // Await block resolved values need reactive tracking
                is_reactive: true,
                replacement_id: None,
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
                    method: false,
                    computed: false,
                })
            })
            .collect(),
    );

    let block_body = vec![
        b::var_decl_pattern(
            JsVariableKind::Var,
            pattern_js.clone(),
            Some(get_source_call),
        ),
        b::return_stmt(Some(return_object)),
    ];

    // Create the main derived value
    let derived_block = JsBlockStatement::with_body(block_body);
    let derived_call = create_derived_from_block(context, derived_block);

    let mut declarations = vec![b::var_decl("$$value", Some(derived_call))];

    // Create derived values for each identifier
    for id in &identifiers {
        // Set up transform for this identifier
        context.state.transform.insert(
            id.clone(),
            crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
                read: Some(get_value),
                read_source: None,
                assign: None,
                mutate: None,
                update: None,
                skip_proxy: false,
                is_defined: false,
                // Destructured await values need reactive tracking
                is_reactive: true,
                replacement_id: None,
            },
        );

        // Build: var id = $.derived(() => $.get($$value).id)
        let get_value_call = b::call(b::member_path("$.get"), vec![value_id.clone()]);
        let member_access = b::member(get_value_call, id);
        let id_derived = create_derived_from_expr(context, member_access);

        declarations.push(b::var_decl(id, Some(id_derived)));
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
        let name = obj.get("name").and_then(|v| v.as_str())?;
        // The parser may store destructuring patterns as Identifier nodes
        // with the full pattern text in the name field (e.g., "{ result, error }" or "[a, b]").
        // Detect these cases and return None so they go through the destructuring path.
        let trimmed = name.trim();
        if trimmed.starts_with('{') || trimmed.starts_with('[') {
            None
        } else {
            Some(name.to_string())
        }
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
                    let trimmed = name.trim();
                    // Check if this "identifier" is actually a destructuring pattern string
                    if trimmed.starts_with('{') || trimmed.starts_with('[') {
                        extract_identifiers_from_pattern_string(trimmed, identifiers);
                    } else {
                        identifiers.push(name.to_string());
                    }
                }
            }
            Some("ObjectPattern") => {
                if let Some(props) = obj.get("properties").and_then(|p| p.as_array()) {
                    for prop in props {
                        // Check if this is a RestElement inside the properties
                        if let Some(prop_type) = prop.get("type").and_then(|t| t.as_str())
                            && prop_type == "RestElement"
                        {
                            // Extract from the argument of RestElement
                            if let Some(arg) = prop.get("argument") {
                                extract_identifiers_recursive(
                                    &Expression::Value(arg.clone()),
                                    identifiers,
                                );
                            }
                            continue;
                        }

                        // Regular Property
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

/// Extract leaf identifier names from a destructuring pattern string like
/// `{ result, error }`, `[a, b]`, `{ error: { message, code } }`, etc.
fn extract_identifiers_from_pattern_string(pattern: &str, identifiers: &mut Vec<String>) {
    let trimmed = pattern.trim();

    if trimmed.starts_with('{') && trimmed.ends_with('}') {
        // Object pattern: { a, b } or { a: b } or { a: { b, c } } or { ...rest }
        let inner = &trimmed[1..trimmed.len() - 1];
        for part in split_top_level(inner, ',') {
            let part = part.trim();
            if part.is_empty() {
                continue;
            }
            if let Some(stripped) = part.strip_prefix("...") {
                // Rest element: ...rest or ...{ nested } or ...[nested]
                let rest_part = stripped.trim();
                if rest_part.starts_with('{') || rest_part.starts_with('[') {
                    extract_identifiers_from_pattern_string(rest_part, identifiers);
                } else if is_valid_identifier(rest_part) {
                    identifiers.push(rest_part.to_string());
                }
            } else if let Some(colon_pos) = find_top_level_colon(part) {
                // Property with value: key: value or key: { nested }
                let value_part = part[colon_pos + 1..].trim();
                if value_part.starts_with('{') || value_part.starts_with('[') {
                    // Nested destructuring
                    extract_identifiers_from_pattern_string(value_part, identifiers);
                } else {
                    // Check for default value: key: value = default
                    let value_name = value_part.split('=').next().unwrap_or("").trim();
                    if is_valid_identifier(value_name) {
                        identifiers.push(value_name.to_string());
                    }
                }
            } else {
                // Shorthand: just an identifier, possibly with default value
                let name = part.split('=').next().unwrap_or("").trim();
                if is_valid_identifier(name) {
                    identifiers.push(name.to_string());
                }
            }
        }
    } else if trimmed.starts_with('[') && trimmed.ends_with(']') {
        // Array pattern: [a, b] or [a, [b, c]] or [a, ...rest]
        let inner = &trimmed[1..trimmed.len() - 1];
        for part in split_top_level(inner, ',') {
            let part = part.trim();
            if part.is_empty() {
                continue;
            }
            if let Some(stripped) = part.strip_prefix("...") {
                // Rest element: ...rest or ...[nested] or ...{ nested }
                let rest_part = stripped.trim();
                if rest_part.starts_with('{') || rest_part.starts_with('[') {
                    extract_identifiers_from_pattern_string(rest_part, identifiers);
                } else if is_valid_identifier(rest_part) {
                    identifiers.push(rest_part.to_string());
                }
            } else if part.starts_with('{') || part.starts_with('[') {
                extract_identifiers_from_pattern_string(part, identifiers);
            } else {
                // Simple identifier, possibly with default value
                let name = part.split('=').next().unwrap_or("").trim();
                if is_valid_identifier(name) {
                    identifiers.push(name.to_string());
                }
            }
        }
    }
}

/// Split a string by a delimiter, but only at the top level
/// (not inside nested brackets/braces).
fn split_top_level(s: &str, delimiter: char) -> Vec<String> {
    let mut parts = Vec::new();
    let mut current = String::new();
    let mut depth = 0;

    for ch in s.chars() {
        match ch {
            '{' | '[' | '(' => {
                depth += 1;
                current.push(ch);
            }
            '}' | ']' | ')' => {
                depth -= 1;
                current.push(ch);
            }
            c if c == delimiter && depth == 0 => {
                parts.push(current.clone());
                current.clear();
            }
            _ => {
                current.push(ch);
            }
        }
    }
    if !current.is_empty() {
        parts.push(current);
    }
    parts
}

/// Find the position of the first top-level colon in a string.
/// This skips colons inside nested brackets/braces.
fn find_top_level_colon(s: &str) -> Option<usize> {
    let mut depth = 0;
    for (i, ch) in s.char_indices() {
        match ch {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            ':' if depth == 0 => return Some(i),
            _ => {}
        }
    }
    None
}

/// Check if a string is a valid JavaScript identifier.
fn is_valid_identifier(s: &str) -> bool {
    !s.is_empty()
        && s.chars()
            .next()
            .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
        && s.chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}

/// Convert an Expression to a JsPattern.
fn convert_expression_to_pattern(expr: &Expression) -> JsPattern {
    let Expression::Value(val) = expr;
    if let serde_json::Value::Object(obj) = val {
        match obj.get("type").and_then(|v| v.as_str()) {
            Some("Identifier") => {
                if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                    let trimmed = name.trim();
                    // Check if this "identifier" is actually a destructuring pattern string
                    if trimmed.starts_with('{') || trimmed.starts_with('[') {
                        return parse_pattern_string(trimmed);
                    }
                    return JsPattern::Identifier(name.to_string());
                }
            }
            Some("ObjectPattern") => {
                if let Some(props) = obj.get("properties").and_then(|p| p.as_array()) {
                    let properties = props
                        .iter()
                        .filter_map(|prop| {
                            let prop_obj = prop.as_object()?;
                            let prop_type = prop_obj.get("type").and_then(|t| t.as_str())?;

                            // Handle RestElement inside ObjectPattern
                            if prop_type == "RestElement" {
                                if let Some(arg) = prop_obj.get("argument") {
                                    let inner = convert_expression_to_pattern(&Expression::Value(
                                        arg.clone(),
                                    ));
                                    return Some(JsObjectPatternProperty::Rest(Box::new(inner)));
                                }
                                return None;
                            }

                            // Handle regular Property
                            let key = prop_obj.get("key")?.as_object()?;
                            let key_name = key.get("name").and_then(|v| v.as_str());
                            // For string literal keys like 'prop-1', get the value
                            let key_value = key.get("value").and_then(|v| v.as_str());
                            let actual_key = key_name.or(key_value)?;
                            let value = prop_obj.get("value")?;

                            let value_pattern = if value.is_object() {
                                convert_expression_to_pattern(&Expression::Value(value.clone()))
                            } else {
                                JsPattern::Identifier(actual_key.to_string())
                            };

                            let shorthand = prop_obj
                                .get("shorthand")
                                .and_then(|s| s.as_bool())
                                .unwrap_or(false);

                            // Handle computed/string keys
                            let computed = prop_obj
                                .get("computed")
                                .and_then(|c| c.as_bool())
                                .unwrap_or(false);

                            // For string keys, use Literal
                            let property_key = if key_name.is_some() {
                                JsPropertyKey::Identifier(actual_key.to_string())
                            } else {
                                JsPropertyKey::Literal(JsLiteral::String(actual_key.to_string()))
                            };

                            Some(JsObjectPatternProperty::Property {
                                key: property_key,
                                value: value_pattern,
                                computed,
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

/// Parse a destructuring pattern string into a JsPattern.
///
/// Handles patterns like:
/// - `{ a, b }` -> ObjectPattern with shorthand properties
/// - `{ a: b }` -> ObjectPattern with key-value properties
/// - `{ a: { b, c } }` -> Nested object pattern
/// - `[a, b]` -> ArrayPattern
/// - `[a, [b, c]]` -> Nested array pattern
/// - `{ ...rest }` -> ObjectPattern with rest element
/// - `[a, ...rest]` -> ArrayPattern with rest element
/// - `{ a = 5 }` -> ObjectPattern with default values
fn parse_pattern_string(pattern: &str) -> JsPattern {
    let trimmed = pattern.trim();

    if trimmed.starts_with('{') && trimmed.ends_with('}') {
        // Object pattern
        let inner = &trimmed[1..trimmed.len() - 1];
        let mut properties = Vec::new();

        for part in split_top_level(inner, ',') {
            let part = part.trim();
            if part.is_empty() {
                continue;
            }

            if let Some(stripped) = part.strip_prefix("...") {
                // Rest element: ...rest or ...{ nested } or ...[nested]
                let rest_part = stripped.trim();
                let inner_pattern = if rest_part.starts_with('{') || rest_part.starts_with('[') {
                    parse_pattern_string(rest_part)
                } else {
                    JsPattern::Identifier(rest_part.to_string())
                };
                properties.push(JsObjectPatternProperty::Rest(Box::new(inner_pattern)));
            } else if let Some(colon_pos) = find_top_level_colon(part) {
                // Property with key: value
                let key_str = part[..colon_pos].trim();
                let value_str = part[colon_pos + 1..].trim();

                let value_pattern = if value_str.starts_with('{') || value_str.starts_with('[') {
                    parse_pattern_string(value_str)
                } else {
                    // May have a default value: `key: value = default`
                    let value_name = value_str.split('=').next().unwrap_or("").trim();
                    if let Some((_, default_part)) = value_str.split_once('=') {
                        let default_str = default_part.trim();
                        JsPattern::Assignment(JsAssignmentPattern {
                            left: Box::new(JsPattern::Identifier(value_name.to_string())),
                            right: Box::new(parse_default_value_expr(default_str)),
                        })
                    } else {
                        JsPattern::Identifier(value_name.to_string())
                    }
                };

                // Determine if key is a number, string literal, or regular identifier
                let property_key = if key_str.starts_with('"') || key_str.starts_with('\'') {
                    // String literal key
                    let unquoted = &key_str[1..key_str.len() - 1];
                    JsPropertyKey::Literal(JsLiteral::String(unquoted.to_string()))
                } else if key_str.parse::<f64>().is_ok() {
                    // Numeric literal key
                    JsPropertyKey::Literal(JsLiteral::Number(key_str.parse().unwrap_or(0.0)))
                } else {
                    JsPropertyKey::Identifier(key_str.to_string())
                };

                let computed = key_str.starts_with('[') && key_str.ends_with(']');

                properties.push(JsObjectPatternProperty::Property {
                    key: property_key,
                    value: value_pattern,
                    computed,
                    shorthand: false,
                });
            } else {
                // Shorthand property (possibly with default value)
                if let Some((name_part, default_part)) = part.split_once('=') {
                    let name = name_part.trim();
                    let default_str = default_part.trim();
                    properties.push(JsObjectPatternProperty::Property {
                        key: JsPropertyKey::Identifier(name.to_string()),
                        value: JsPattern::Assignment(JsAssignmentPattern {
                            left: Box::new(JsPattern::Identifier(name.to_string())),
                            right: Box::new(parse_default_value_expr(default_str)),
                        }),
                        computed: false,
                        shorthand: false,
                    });
                } else {
                    properties.push(JsObjectPatternProperty::Property {
                        key: JsPropertyKey::Identifier(part.to_string()),
                        value: JsPattern::Identifier(part.to_string()),
                        computed: false,
                        shorthand: true,
                    });
                }
            }
        }

        JsPattern::Object(JsObjectPattern { properties })
    } else if trimmed.starts_with('[') && trimmed.ends_with(']') {
        // Array pattern
        let inner = &trimmed[1..trimmed.len() - 1];
        let mut elements = Vec::new();

        for part in split_top_level(inner, ',') {
            let part = part.trim();
            if part.is_empty() {
                elements.push(None); // Elision
                continue;
            }

            if let Some(stripped) = part.strip_prefix("...") {
                // Rest element: ...rest or ...[nested] or ...{ nested }
                let rest_part = stripped.trim();
                let inner_pattern = if rest_part.starts_with('{') || rest_part.starts_with('[') {
                    parse_pattern_string(rest_part)
                } else {
                    JsPattern::Identifier(rest_part.to_string())
                };
                elements.push(Some(JsPattern::Rest(Box::new(inner_pattern))));
            } else if part.starts_with('{') || part.starts_with('[') {
                elements.push(Some(parse_pattern_string(part)));
            } else if let Some((name_part, default_part)) = part.split_once('=') {
                let name = name_part.trim();
                let default_str = default_part.trim();
                elements.push(Some(JsPattern::Assignment(JsAssignmentPattern {
                    left: Box::new(JsPattern::Identifier(name.to_string())),
                    right: Box::new(parse_default_value_expr(default_str)),
                })));
            } else {
                elements.push(Some(JsPattern::Identifier(part.to_string())));
            }
        }

        JsPattern::Array(JsArrayPattern { elements })
    } else {
        JsPattern::Identifier(trimmed.to_string())
    }
}

/// Parse a simple default value expression string into a JsExpr.
fn parse_default_value_expr(s: &str) -> JsExpr {
    let trimmed = s.trim();
    if trimmed == "undefined" {
        JsExpr::Identifier("undefined".to_string())
    } else if trimmed == "null" {
        JsExpr::Literal(JsLiteral::Null)
    } else if trimmed == "true" {
        JsExpr::Literal(JsLiteral::Boolean(true))
    } else if trimmed == "false" {
        JsExpr::Literal(JsLiteral::Boolean(false))
    } else if let Ok(n) = trimmed.parse::<f64>() {
        JsExpr::Literal(JsLiteral::Number(n))
    } else if (trimmed.starts_with('"') && trimmed.ends_with('"'))
        || (trimmed.starts_with('\'') && trimmed.ends_with('\''))
    {
        JsExpr::Literal(JsLiteral::String(trimmed[1..trimmed.len() - 1].to_string()))
    } else {
        // Fallback: raw expression
        JsExpr::Raw(trimmed.to_string())
    }
}

/// Visit a fragment and return its statements.
///
/// This function uses the fragment visitor to properly process the fragment,
/// which handles template generation, render effects, and append statements.
fn visit_fragment(frag: &Fragment, context: &mut ComponentContext) -> Vec<JsStatement> {
    // Use the fragment visitor which returns a BlockStatement containing
    // all the generated code (init, template_effect, append, etc.)
    // Pass is_root_fragment=false because await block fragments are nested
    let block = fragment(frag, context, false);
    block.body
}

/// Extract a pattern from a JsExpr (for the node parameter).
fn extract_node_pattern(expr: &JsExpr) -> JsPattern {
    match expr {
        JsExpr::Identifier(name) => JsPattern::Identifier(name.clone()),
        _ => JsPattern::Identifier("$$anchor".to_string()),
    }
}

/// Apply $.save() transformation to await expressions that are not at the last position.
///
/// This transforms `await expr` to `(await $.save(expr))()` when the await is nested
/// inside another expression (i.e., not the entire expression itself).
///
/// The `is_last` parameter indicates whether this expression is at the "last" position
/// in its parent expression context. Await expressions that are not in last position
/// need the $.save() transformation to preserve reactivity.
///
/// Corresponds to the `save()` function in Svelte's utils/ast.js and the pickling
/// logic in 2-analyze/visitors/AwaitExpression.js.
fn apply_save_to_nested_awaits(expr: &JsExpr, is_last: bool) -> JsExpr {
    match expr {
        JsExpr::Await(inner) => {
            // Transform the inner expression first
            let transformed_inner = apply_save_to_nested_awaits(inner, true);

            if is_last {
                // If this await is in last position, no need for $.save()
                JsExpr::Await(Box::new(transformed_inner))
            } else {
                // Not in last position - wrap with $.save()
                // await expr -> (await $.save(expr))()
                let save_call = b::call(b::member_path("$.save"), vec![transformed_inner]);
                let await_save = JsExpr::Await(Box::new(save_call));
                // Call the result: (await $.save(expr))()
                b::call(await_save, vec![])
            }
        }
        JsExpr::Binary(binary) => {
            // Left side is NOT in last position (more expressions follow)
            let left = apply_save_to_nested_awaits(&binary.left, false);
            // Right side IS in last position
            let right = apply_save_to_nested_awaits(&binary.right, is_last);
            JsExpr::Binary(JsBinaryExpression {
                operator: binary.operator,
                left: Box::new(left),
                right: Box::new(right),
            })
        }
        JsExpr::Logical(logical) => {
            // Left side is NOT in last position
            let left = apply_save_to_nested_awaits(&logical.left, false);
            // Right side IS in last position
            let right = apply_save_to_nested_awaits(&logical.right, is_last);
            JsExpr::Logical(JsLogicalExpression {
                operator: logical.operator,
                left: Box::new(left),
                right: Box::new(right),
            })
        }
        JsExpr::Conditional(cond) => {
            // Test is NOT in last position
            let test = apply_save_to_nested_awaits(&cond.test, false);
            // Both branches are in last position
            let consequent = apply_save_to_nested_awaits(&cond.consequent, is_last);
            let alternate = apply_save_to_nested_awaits(&cond.alternate, is_last);
            JsExpr::Conditional(JsConditionalExpression {
                test: Box::new(test),
                consequent: Box::new(consequent),
                alternate: Box::new(alternate),
            })
        }
        JsExpr::Call(call) => {
            // Callee is NOT in last position
            let callee = apply_save_to_nested_awaits(&call.callee, false);
            // Arguments: all but last are NOT in last position
            let args: Vec<JsExpr> = call
                .arguments
                .iter()
                .enumerate()
                .map(|(i, arg)| {
                    let arg_is_last = is_last && i == call.arguments.len() - 1;
                    apply_save_to_nested_awaits(arg, arg_is_last)
                })
                .collect();
            JsExpr::Call(JsCallExpression {
                callee: Box::new(callee),
                arguments: args,
                optional: call.optional,
            })
        }
        JsExpr::Member(member) => {
            // Object is NOT in last position
            let object = apply_save_to_nested_awaits(&member.object, false);
            let property = match &member.property {
                JsMemberProperty::Expression(prop) if member.computed => {
                    JsMemberProperty::Expression(Box::new(apply_save_to_nested_awaits(
                        prop, is_last,
                    )))
                }
                other => other.clone(),
            };
            JsExpr::Member(JsMemberExpression {
                object: Box::new(object),
                property,
                computed: member.computed,
                optional: member.optional,
            })
        }
        JsExpr::Array(array) => {
            // All but last element are NOT in last position
            let elements: Vec<Option<JsExpr>> = array
                .elements
                .iter()
                .enumerate()
                .map(|(i, elem)| {
                    elem.as_ref().map(|e| {
                        let elem_is_last = is_last && i == array.elements.len() - 1;
                        apply_save_to_nested_awaits(e, elem_is_last)
                    })
                })
                .collect();
            JsExpr::Array(JsArrayExpression { elements })
        }
        JsExpr::Object(obj) => {
            // All but last property are NOT in last position
            let properties: Vec<JsObjectMember> = obj
                .properties
                .iter()
                .enumerate()
                .map(|(i, prop)| {
                    let prop_is_last = is_last && i == obj.properties.len() - 1;
                    match prop {
                        JsObjectMember::Property(p) => {
                            let value = apply_save_to_nested_awaits(&p.value, prop_is_last);
                            JsObjectMember::Property(JsProperty {
                                key: p.key.clone(),
                                value: Box::new(value),
                                kind: p.kind,
                                computed: p.computed,
                                shorthand: false,
                                method: false, // No longer shorthand after transformation
                            })
                        }
                        JsObjectMember::SpreadElement(spread) => JsObjectMember::SpreadElement(
                            Box::new(apply_save_to_nested_awaits(spread, prop_is_last)),
                        ),
                    }
                })
                .collect();
            JsExpr::Object(JsObjectExpression { properties })
        }
        JsExpr::Sequence(seq) => {
            // All but last expression are NOT in last position
            let expressions: Vec<JsExpr> = seq
                .expressions
                .iter()
                .enumerate()
                .map(|(i, e)| {
                    let expr_is_last = is_last && i == seq.expressions.len() - 1;
                    apply_save_to_nested_awaits(e, expr_is_last)
                })
                .collect();
            JsExpr::Sequence(JsSequenceExpression { expressions })
        }
        JsExpr::Unary(unary) => {
            let argument = apply_save_to_nested_awaits(&unary.argument, is_last);
            JsExpr::Unary(JsUnaryExpression {
                operator: unary.operator,
                argument: Box::new(argument),
                prefix: unary.prefix,
            })
        }
        JsExpr::TemplateLiteral(template) => {
            // All but last expression are NOT in last position
            let expressions: Vec<JsExpr> = template
                .expressions
                .iter()
                .enumerate()
                .map(|(i, e)| {
                    let expr_is_last = is_last && i == template.expressions.len() - 1;
                    apply_save_to_nested_awaits(e, expr_is_last)
                })
                .collect();
            JsExpr::TemplateLiteral(JsTemplateLiteral {
                quasis: template.quasis.clone(),
                expressions,
            })
        }
        // Leaf expressions and expressions that don't need traversal
        _ => expr.clone(),
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
