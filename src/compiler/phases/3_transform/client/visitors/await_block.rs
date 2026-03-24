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
    add_svelte_meta, apply_transforms_to_expression, build_expression,
};
use crate::compiler::phases::phase3_transform::js_ast::arena::JsArena;
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

    // Check for blockers before moving built_expr into thunk
    let blocker_exprs = context
        .state
        .get_blockers_for_expr(&built_expr, &context.arena);
    let has_blockers = !blocker_exprs.is_empty();

    // Wrap in thunk (async if has_await)
    // Note: b::async_thunk(&context.arena) already applies $.save() wrapping internally,
    // so we must NOT apply it separately to avoid double $.save() wrapping.
    let expression = if node.metadata.expression.has_await() {
        b::async_thunk(&context.arena, built_expr)
    } else {
        b::thunk(&context.arena, built_expr)
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
        let prev_in_control_flow = context.state.in_control_flow_block;
        context.state.in_control_flow_block = true;
        let body_statements = visit_fragment(pending_fragment, context);
        context.state.in_control_flow_block = prev_in_control_flow;
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
        await_args.push(then_block.unwrap_or_else(|| b::undefined(&context.arena)));
    }
    if let Some(catch_fn) = catch_block {
        await_args.push(catch_fn);
    }
    let await_call = b::call(
        &context.arena,
        b::member_path(&context.arena, "$.await"),
        await_args,
    );

    // Add svelte metadata
    let stmt = if context.state.dev {
        use crate::compiler::phases::phase3_transform::client::visitors::attribute::locate_in_source;
        let (line, col) = locate_in_source(&context.state.analysis.source, node.start as usize);
        super::shared::utils::add_svelte_meta_dev(
            &context.arena,
            await_call,
            "await",
            &context.state.analysis.name,
            line,
            col,
            None,
            true,
        )
    } else {
        add_svelte_meta(&context.arena, await_call)
    };

    if has_blockers {
        // Wrap in $.async()
        let blockers = b::array(blocker_exprs);

        let async_call = b::call(
            &context.arena,
            b::member_path(&context.arena, "$.async"),
            vec![
                context.state.node.clone(),
                blockers,
                b::array(vec![]),
                b::arrow_block(vec![extract_node_pattern(&context.state.node)], vec![stmt]),
            ],
        );

        context.state.init.push(b::stmt(&context.arena, async_call));
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
    let prev_in_control_flow = context.state.in_control_flow_block;
    context.state.in_control_flow_block = true;
    let fragment_statements = visit_fragment(fragment, context);
    context.state.in_control_flow_block = prev_in_control_flow;
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
        return (Some(JsPattern::Identifier(name.into())), vec![]);
    }

    // Destructuring pattern - extract identifiers and create derived values
    let identifiers = extract_identifiers(pattern);

    if identifiers.is_empty() {
        return (None, vec![]);
    }

    let _pattern_expr = convert_expression(pattern, context);
    let pattern_js = convert_expression_to_pattern_with_context(pattern, context);

    let source_id = b::id("$$source");
    let value_id = b::id("$$value");

    // Build: let { a, b } = $.get($$source); return { a, b };
    let get_source_call = b::call(
        &context.arena,
        b::member_path(&context.arena, "$.get"),
        vec![source_id.clone()],
    );

    // Build object with shorthand properties for return statement
    let return_object = b::object(
        identifiers
            .iter()
            .map(|id| {
                JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Identifier(id.clone().into()),
                    value: context.arena.alloc_expr(b::id(id)),
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
            &context.arena,
            JsVariableKind::Var,
            pattern_js.clone(),
            Some(get_source_call),
        ),
        b::return_stmt(&context.arena, Some(return_object)),
    ];

    // Create the main derived value
    let derived_block = JsBlockStatement::with_body(block_body);
    let derived_call = create_derived_from_block(context, derived_block);

    let mut declarations = vec![b::var_decl(&context.arena, "$$value", Some(derived_call))];

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
        let get_value_call = b::call(
            &context.arena,
            b::member_path(&context.arena, "$.get"),
            vec![value_id.clone()],
        );
        let member_access = b::member(&context.arena, get_value_call, id);
        let id_derived = create_derived_from_expr(context, member_access);

        declarations.push(b::var_decl(&context.arena, id, Some(id_derived)));
    }

    // The argument pattern is $$source
    (Some(JsPattern::Identifier("$$source".into())), declarations)
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

    b::call(
        &context.arena,
        b::member_path(&context.arena, method),
        vec![thunk],
    )
}

/// Create a $.derived() or $.derived_safe_equal() call from an expression.
///
/// Uses $.derived in runes mode, $.derived_safe_equal in legacy mode.
fn create_derived_from_expr(context: &ComponentContext, expr: JsExpr) -> JsExpr {
    let thunk = b::thunk(&context.arena, expr);

    let method = if context.state.analysis.runes {
        "$.derived"
    } else {
        "$.derived_safe_equal"
    };

    b::call(
        &context.arena,
        b::member_path(&context.arena, method),
        vec![thunk],
    )
}

/// Get the name if the expression is a simple identifier.
fn get_identifier_name(expr: &Expression) -> Option<String> {
    let name = expr.identifier_name()?;
    // The parser may store destructuring patterns as Identifier nodes
    // with the full pattern text in the name field (e.g., "{ result, error }" or "[a, b]").
    // Detect these cases and return None so they go through the destructuring path.
    let trimmed = name.trim();
    if trimmed.starts_with('{') || trimmed.starts_with('[') {
        None
    } else {
        Some(name.to_string())
    }
}

/// Extract all identifier names from a pattern expression.
fn extract_identifiers(expr: &Expression) -> Vec<String> {
    let mut identifiers = Vec::new();
    extract_identifiers_recursive(expr, &mut identifiers);
    identifiers
}

fn extract_identifiers_recursive(expr: &Expression, identifiers: &mut Vec<String>) {
    let val = expr.as_json();
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

/// Convert an Expression to a JsPattern, applying reactive transforms for computed keys.
fn convert_expression_to_pattern_with_context(
    expr: &Expression,
    context: &mut ComponentContext,
) -> JsPattern {
    let val = expr.as_json();
    convert_value_to_pattern_with_context(val, context)
}

/// Convert a JSON AST Value to a JsPattern, using reactive transforms for computed keys.
/// This ensures that expressions like `num++` in computed property keys are converted
/// to `$.update(num)` when `num` is a mutable_source.
fn convert_value_to_pattern_with_context(
    val: &serde_json::Value,
    context: &mut ComponentContext,
) -> JsPattern {
    if let serde_json::Value::Object(obj) = val {
        match obj.get("type").and_then(|v| v.as_str()) {
            Some("Identifier") => {
                if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                    let trimmed = name.trim();
                    if trimmed.starts_with('{') || trimmed.starts_with('[') {
                        return parse_pattern_string(trimmed, &context.arena);
                    }
                    return JsPattern::Identifier(name.into());
                }
            }
            Some("AssignmentPattern") => {
                if let (Some(left), Some(right)) = (obj.get("left"), obj.get("right")) {
                    let left_pattern = convert_value_to_pattern_with_context(left, context);
                    let right_expr = convert_value_to_js_expr_simple(right, &context.arena);
                    return JsPattern::Assignment(JsAssignmentPattern {
                        left: Box::new(left_pattern),
                        right: context.arena.alloc_expr(right_expr),
                    });
                }
            }
            Some("ObjectPattern") => {
                if let Some(props) = obj.get("properties").and_then(|p| p.as_array()) {
                    let properties = props
                        .iter()
                        .filter_map(|prop| {
                            let prop_obj = prop.as_object()?;
                            let prop_type = prop_obj.get("type").and_then(|t| t.as_str())?;

                            if prop_type == "RestElement" {
                                if let Some(arg) = prop_obj.get("argument") {
                                    let inner = convert_value_to_pattern_with_context(arg, context);
                                    return Some(JsObjectPatternProperty::Rest(Box::new(inner)));
                                }
                                return None;
                            }

                            let key_val = prop_obj.get("key")?;
                            let key = key_val.as_object()?;
                            let value = prop_obj.get("value")?;

                            let shorthand = prop_obj
                                .get("shorthand")
                                .and_then(|s| s.as_bool())
                                .unwrap_or(false);

                            let computed = prop_obj
                                .get("computed")
                                .and_then(|c| c.as_bool())
                                .unwrap_or(false);

                            let value_pattern =
                                convert_value_to_pattern_with_context(value, context);

                            let key_type = key.get("type").and_then(|t| t.as_str()).unwrap_or("");
                            let property_key = if computed {
                                // Computed key: use convert_expression to apply reactive transforms
                                // This converts num++ to $.update(num) and num to $.get(num) etc.
                                let key_expr = Expression::Value(key_val.clone());
                                let converted = convert_expression(&key_expr, context);
                                let converted = apply_transforms_to_expression(&converted, context);
                                JsPropertyKey::Computed(context.arena.alloc_expr(converted))
                            } else if key_type == "Literal" {
                                if let Some(n) = key.get("value").and_then(|v| v.as_f64()) {
                                    JsPropertyKey::Literal(JsLiteral::Number(n))
                                } else if let Some(s) = key.get("value").and_then(|v| v.as_str()) {
                                    JsPropertyKey::Literal(JsLiteral::String(s.into()))
                                } else {
                                    let raw =
                                        key.get("raw").and_then(|r| r.as_str()).unwrap_or("0");
                                    JsPropertyKey::Literal(JsLiteral::String(raw.into()))
                                }
                            } else if let Some(name) = key.get("name").and_then(|v| v.as_str()) {
                                JsPropertyKey::Identifier(name.into())
                            } else if let Some(s) = key.get("value").and_then(|v| v.as_str()) {
                                JsPropertyKey::Literal(JsLiteral::String(s.into()))
                            } else if let Some(n) = key.get("value").and_then(|v| v.as_f64()) {
                                JsPropertyKey::Literal(JsLiteral::Number(n))
                            } else {
                                JsPropertyKey::Identifier("unknown".into())
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
                                Some(convert_value_to_pattern_with_context(elem, context))
                            }
                        })
                        .collect();

                    return JsPattern::Array(JsArrayPattern { elements });
                }
            }
            Some("RestElement") => {
                if let Some(arg) = obj.get("argument") {
                    let inner = convert_value_to_pattern_with_context(arg, context);
                    return JsPattern::Rest(Box::new(inner));
                }
            }
            _ => {}
        }
    }

    // Fallback to simple conversion
    convert_value_to_pattern(val, &context.arena)
}

/// Convert a JSON AST Value node to a JsPattern.
/// This handles all pattern node types: Identifier, ObjectPattern, ArrayPattern,
/// AssignmentPattern, and RestElement.
fn convert_value_to_pattern(val: &serde_json::Value, arena: &JsArena) -> JsPattern {
    if let serde_json::Value::Object(obj) = val {
        match obj.get("type").and_then(|v| v.as_str()) {
            Some("Identifier") => {
                if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                    let trimmed = name.trim();
                    // Check if this "identifier" is actually a destructuring pattern string
                    if trimmed.starts_with('{') || trimmed.starts_with('[') {
                        return parse_pattern_string(trimmed, arena);
                    }
                    return JsPattern::Identifier(name.into());
                }
            }
            Some("AssignmentPattern") => {
                // Default value pattern: `a = 3` or `{ x } = {}`
                if let (Some(left), Some(right)) = (obj.get("left"), obj.get("right")) {
                    let left_pattern = convert_value_to_pattern(left, arena);
                    let right_expr = convert_value_to_js_expr_simple(right, arena);
                    return JsPattern::Assignment(JsAssignmentPattern {
                        left: Box::new(left_pattern),
                        right: arena.alloc_expr(right_expr),
                    });
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
                                    let inner = convert_value_to_pattern(arg, arena);
                                    return Some(JsObjectPatternProperty::Rest(Box::new(inner)));
                                }
                                return None;
                            }

                            // Handle regular Property
                            let key_val = prop_obj.get("key")?;
                            let key = key_val.as_object()?;
                            let value = prop_obj.get("value")?;

                            let shorthand = prop_obj
                                .get("shorthand")
                                .and_then(|s| s.as_bool())
                                .unwrap_or(false);

                            let computed = prop_obj
                                .get("computed")
                                .and_then(|c| c.as_bool())
                                .unwrap_or(false);

                            let value_pattern = convert_value_to_pattern(value, arena);

                            // Determine property key
                            let key_type = key.get("type").and_then(|t| t.as_str()).unwrap_or("");
                            let property_key = if computed {
                                // Computed key: [expr]
                                JsPropertyKey::Computed(
                                    arena.alloc_expr(convert_value_to_js_expr_simple(
                                        key_val, arena,
                                    )),
                                )
                            } else if key_type == "Literal" {
                                // Literal key (number or string)
                                if let Some(n) = key.get("value").and_then(|v| v.as_f64()) {
                                    JsPropertyKey::Literal(JsLiteral::Number(n))
                                } else if let Some(s) = key.get("value").and_then(|v| v.as_str()) {
                                    JsPropertyKey::Literal(JsLiteral::String(s.into()))
                                } else {
                                    let raw =
                                        key.get("raw").and_then(|r| r.as_str()).unwrap_or("0");
                                    JsPropertyKey::Literal(JsLiteral::String(raw.into()))
                                }
                            } else if let Some(name) = key.get("name").and_then(|v| v.as_str()) {
                                JsPropertyKey::Identifier(name.into())
                            } else if let Some(s) = key.get("value").and_then(|v| v.as_str()) {
                                // String literal key
                                JsPropertyKey::Literal(JsLiteral::String(s.into()))
                            } else if let Some(n) = key.get("value").and_then(|v| v.as_f64()) {
                                // Numeric literal key
                                JsPropertyKey::Literal(JsLiteral::Number(n))
                            } else {
                                JsPropertyKey::Identifier("unknown".into())
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
                                Some(convert_value_to_pattern(elem, arena))
                            }
                        })
                        .collect();

                    return JsPattern::Array(JsArrayPattern { elements });
                }
            }
            Some("RestElement") => {
                if let Some(arg) = obj.get("argument") {
                    let inner = convert_value_to_pattern(arg, arena);
                    return JsPattern::Rest(Box::new(inner));
                }
            }
            _ => {}
        }
    }
    JsPattern::Identifier("$$unknown".into())
}

/// Convert a JSON AST Value expression to a JsExpr without needing ComponentContext.
/// This handles common expression types used in destructure patterns (default values, computed keys).
fn convert_value_to_js_expr_simple(val: &serde_json::Value, arena: &JsArena) -> JsExpr {
    match val {
        serde_json::Value::Object(obj) => {
            let node_type = obj.get("type").and_then(|t| t.as_str()).unwrap_or("");
            match node_type {
                "Identifier" => {
                    let name = obj
                        .get("name")
                        .and_then(|v| v.as_str())
                        .unwrap_or("undefined");
                    JsExpr::Identifier(name.into())
                }
                "Literal" => {
                    if let Some(raw) = obj.get("raw").and_then(|r| r.as_str()) {
                        let value = obj.get("value");
                        if let Some(n) = value.and_then(|v| v.as_f64()) {
                            JsExpr::Literal(JsLiteral::Number(n))
                        } else if let Some(s) = value.and_then(|v| v.as_str()) {
                            JsExpr::Literal(JsLiteral::String(s.into()))
                        } else if let Some(b) = value.and_then(|v| v.as_bool()) {
                            JsExpr::Literal(JsLiteral::Boolean(b))
                        } else if value.is_some_and(|v| v.is_null()) {
                            JsExpr::Literal(JsLiteral::Null)
                        } else {
                            JsExpr::Raw(raw.into())
                        }
                    } else if let Some(n) = obj.get("value").and_then(|v| v.as_f64()) {
                        JsExpr::Literal(JsLiteral::Number(n))
                    } else if let Some(s) = obj.get("value").and_then(|v| v.as_str()) {
                        JsExpr::Literal(JsLiteral::String(s.into()))
                    } else if let Some(b) = obj.get("value").and_then(|v| v.as_bool()) {
                        JsExpr::Literal(JsLiteral::Boolean(b))
                    } else {
                        JsExpr::Literal(JsLiteral::Null)
                    }
                }
                "TemplateLiteral" => {
                    // Convert template literal
                    let quasis_arr = obj
                        .get("quasis")
                        .and_then(|q| q.as_array())
                        .cloned()
                        .unwrap_or_default();
                    let expressions_arr = obj
                        .get("expressions")
                        .and_then(|e| e.as_array())
                        .cloned()
                        .unwrap_or_default();

                    let quasis: Vec<JsTemplateElement> = quasis_arr
                        .iter()
                        .enumerate()
                        .map(|(i, quasi)| {
                            let raw = quasi
                                .get("value")
                                .and_then(|v| v.get("raw"))
                                .and_then(|r| r.as_str())
                                .unwrap_or("");
                            let cooked = quasi
                                .get("value")
                                .and_then(|v| v.get("cooked"))
                                .and_then(|c| c.as_str())
                                .unwrap_or(raw);
                            JsTemplateElement {
                                raw: raw.into(),
                                cooked: cooked.into(),
                                tail: i == quasis_arr.len() - 1,
                            }
                        })
                        .collect();

                    let expressions: Vec<JsExpr> = expressions_arr
                        .iter()
                        .map(|v| convert_value_to_js_expr_simple(v, arena))
                        .collect();

                    JsExpr::TemplateLiteral(JsTemplateLiteral {
                        quasis,
                        expressions,
                    })
                }
                "BinaryExpression" => {
                    let left = obj
                        .get("left")
                        .map(|v| convert_value_to_js_expr_simple(v, arena))
                        .unwrap_or(JsExpr::Literal(JsLiteral::Number(0.0)));
                    let right = obj
                        .get("right")
                        .map(|v| convert_value_to_js_expr_simple(v, arena))
                        .unwrap_or(JsExpr::Literal(JsLiteral::Number(0.0)));
                    let op_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("+");
                    let operator = str_to_binary_op(op_str);
                    JsExpr::Binary(JsBinaryExpression {
                        operator,
                        left: arena.alloc_expr(left),
                        right: arena.alloc_expr(right),
                    })
                }
                "MemberExpression" => {
                    let object = obj
                        .get("object")
                        .map(|v| convert_value_to_js_expr_simple(v, arena))
                        .unwrap_or(JsExpr::Identifier("undefined".into()));
                    let prop_val = obj.get("property");
                    let computed = obj
                        .get("computed")
                        .and_then(|c| c.as_bool())
                        .unwrap_or(false);
                    let optional = obj
                        .get("optional")
                        .and_then(|o| o.as_bool())
                        .unwrap_or(false);
                    let property = if computed {
                        JsMemberProperty::Expression(
                            arena.alloc_expr(
                                prop_val
                                    .map(|v| convert_value_to_js_expr_simple(v, arena))
                                    .unwrap_or(JsExpr::Identifier("undefined".into())),
                            ),
                        )
                    } else {
                        let prop_name = prop_val
                            .and_then(|v| v.as_object())
                            .and_then(|o| o.get("name"))
                            .and_then(|n| n.as_str())
                            .unwrap_or("undefined");
                        JsMemberProperty::Identifier(prop_name.into())
                    };
                    JsExpr::Member(JsMemberExpression {
                        object: arena.alloc_expr(object),
                        property,
                        computed,
                        optional,
                    })
                }
                "CallExpression" => {
                    let callee = obj
                        .get("callee")
                        .map(|v| convert_value_to_js_expr_simple(v, arena))
                        .unwrap_or(JsExpr::Identifier("undefined".into()));
                    let args = obj
                        .get("arguments")
                        .and_then(|a| a.as_array())
                        .map(|arr| {
                            arr.iter()
                                .map(|v| convert_value_to_js_expr_simple(v, arena))
                                .collect()
                        })
                        .unwrap_or_default();
                    let optional = obj
                        .get("optional")
                        .and_then(|o| o.as_bool())
                        .unwrap_or(false);
                    JsExpr::Call(JsCallExpression {
                        callee: arena.alloc_expr(callee),
                        arguments: args,
                        optional,
                    })
                }
                "UpdateExpression" => {
                    let argument = obj
                        .get("argument")
                        .map(|v| convert_value_to_js_expr_simple(v, arena))
                        .unwrap_or(JsExpr::Identifier("undefined".into()));
                    let op_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("++");
                    let operator = if op_str == "--" {
                        JsUpdateOp::Decrement
                    } else {
                        JsUpdateOp::Increment
                    };
                    let prefix = obj.get("prefix").and_then(|p| p.as_bool()).unwrap_or(false);
                    JsExpr::Update(JsUpdateExpression {
                        operator,
                        argument: arena.alloc_expr(argument),
                        prefix,
                    })
                }
                "ObjectExpression" => {
                    let props = obj
                        .get("properties")
                        .and_then(|p| p.as_array())
                        .cloned()
                        .unwrap_or_default();
                    let members: Vec<JsObjectMember> = props
                        .iter()
                        .filter_map(|p| {
                            let p_obj = p.as_object()?;
                            let key_val = p_obj.get("key")?;
                            let key_obj = key_val.as_object()?;
                            let val = p_obj.get("value")?;
                            let computed = p_obj
                                .get("computed")
                                .and_then(|c| c.as_bool())
                                .unwrap_or(false);
                            let shorthand = p_obj
                                .get("shorthand")
                                .and_then(|s| s.as_bool())
                                .unwrap_or(false);

                            let key = if computed {
                                JsPropertyKey::Computed(
                                    arena.alloc_expr(convert_value_to_js_expr_simple(
                                        key_val, arena,
                                    )),
                                )
                            } else if let Some(name) = key_obj.get("name").and_then(|n| n.as_str())
                            {
                                JsPropertyKey::Identifier(name.into())
                            } else {
                                JsPropertyKey::Identifier("unknown".into())
                            };

                            Some(JsObjectMember::Property(JsProperty {
                                key,
                                value: arena
                                    .alloc_expr(convert_value_to_js_expr_simple(val, arena)),
                                kind: JsPropertyKind::Init,
                                shorthand,
                                method: false,
                                computed,
                            }))
                        })
                        .collect();
                    JsExpr::Object(JsObjectExpression {
                        properties: members,
                    })
                }
                "ArrayExpression" => {
                    let elems = obj
                        .get("elements")
                        .and_then(|e| e.as_array())
                        .cloned()
                        .unwrap_or_default();
                    let items: Vec<Option<JsExpr>> = elems
                        .iter()
                        .map(|e| {
                            if e.is_null() {
                                None
                            } else {
                                Some(convert_value_to_js_expr_simple(e, arena))
                            }
                        })
                        .collect();
                    JsExpr::Array(JsArrayExpression { elements: items })
                }
                "UnaryExpression" => {
                    let argument = obj
                        .get("argument")
                        .map(|v| convert_value_to_js_expr_simple(v, arena))
                        .unwrap_or(JsExpr::Literal(JsLiteral::Number(0.0)));
                    let op_str = obj.get("operator").and_then(|o| o.as_str()).unwrap_or("-");
                    let operator = str_to_unary_op(op_str);
                    let prefix = obj.get("prefix").and_then(|p| p.as_bool()).unwrap_or(true);
                    JsExpr::Unary(JsUnaryExpression {
                        operator,
                        argument: arena.alloc_expr(argument),
                        prefix,
                    })
                }
                "ConditionalExpression" => {
                    let test = obj
                        .get("test")
                        .map(|v| convert_value_to_js_expr_simple(v, arena))
                        .unwrap_or(JsExpr::Literal(JsLiteral::Boolean(false)));
                    let consequent = obj
                        .get("consequent")
                        .map(|v| convert_value_to_js_expr_simple(v, arena))
                        .unwrap_or(JsExpr::Identifier("undefined".into()));
                    let alternate = obj
                        .get("alternate")
                        .map(|v| convert_value_to_js_expr_simple(v, arena))
                        .unwrap_or(JsExpr::Identifier("undefined".into()));
                    JsExpr::Conditional(JsConditionalExpression {
                        test: arena.alloc_expr(test),
                        consequent: arena.alloc_expr(consequent),
                        alternate: arena.alloc_expr(alternate),
                    })
                }
                _ => {
                    // Fallback: try to use raw representation based on start/end from source
                    JsExpr::Raw(format!("/* TODO: {} */", node_type).into())
                }
            }
        }
        serde_json::Value::String(s) => JsExpr::Literal(JsLiteral::String(s.clone().into())),
        serde_json::Value::Number(n) => {
            JsExpr::Literal(JsLiteral::Number(n.as_f64().unwrap_or(0.0)))
        }
        serde_json::Value::Bool(b) => JsExpr::Literal(JsLiteral::Boolean(*b)),
        serde_json::Value::Null => JsExpr::Literal(JsLiteral::Null),
        _ => JsExpr::Raw("undefined".into()),
    }
}

/// Convert a string operator to JsBinaryOp.
fn str_to_binary_op(op: &str) -> JsBinaryOp {
    match op {
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
    }
}

/// Convert a string operator to JsUnaryOp.
fn str_to_unary_op(op: &str) -> JsUnaryOp {
    match op {
        "-" => JsUnaryOp::Minus,
        "+" => JsUnaryOp::Plus,
        "!" => JsUnaryOp::Not,
        "~" => JsUnaryOp::BitNot,
        "typeof" => JsUnaryOp::TypeOf,
        "void" => JsUnaryOp::Void,
        "delete" => JsUnaryOp::Delete,
        _ => JsUnaryOp::Minus,
    }
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
fn parse_pattern_string(pattern: &str, arena: &JsArena) -> JsPattern {
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
                    parse_pattern_string(rest_part, arena)
                } else {
                    JsPattern::Identifier(rest_part.into())
                };
                properties.push(JsObjectPatternProperty::Rest(Box::new(inner_pattern)));
            } else if let Some(colon_pos) = find_top_level_colon(part) {
                // Property with key: value
                let key_str = part[..colon_pos].trim();
                let value_str = part[colon_pos + 1..].trim();

                let value_pattern = if value_str.starts_with('{') || value_str.starts_with('[') {
                    parse_pattern_string(value_str, arena)
                } else {
                    // May have a default value: `key: value = default`
                    let value_name = value_str.split('=').next().unwrap_or("").trim();
                    if let Some((_, default_part)) = value_str.split_once('=') {
                        let default_str = default_part.trim();
                        JsPattern::Assignment(JsAssignmentPattern {
                            left: Box::new(JsPattern::Identifier(value_name.into())),
                            right: arena.alloc_expr(parse_default_value_expr(default_str)),
                        })
                    } else {
                        JsPattern::Identifier(value_name.into())
                    }
                };

                // Determine if key is a number, string literal, or regular identifier
                let property_key = if key_str.starts_with('"') || key_str.starts_with('\'') {
                    // String literal key
                    let unquoted = &key_str[1..key_str.len() - 1];
                    JsPropertyKey::Literal(JsLiteral::String(unquoted.into()))
                } else if key_str.parse::<f64>().is_ok() {
                    // Numeric literal key
                    JsPropertyKey::Literal(JsLiteral::Number(key_str.parse().unwrap_or(0.0)))
                } else {
                    JsPropertyKey::Identifier(key_str.into())
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
                        key: JsPropertyKey::Identifier(name.into()),
                        value: JsPattern::Assignment(JsAssignmentPattern {
                            left: Box::new(JsPattern::Identifier(name.into())),
                            right: arena.alloc_expr(parse_default_value_expr(default_str)),
                        }),
                        computed: false,
                        shorthand: false,
                    });
                } else {
                    properties.push(JsObjectPatternProperty::Property {
                        key: JsPropertyKey::Identifier(part.into()),
                        value: JsPattern::Identifier(part.into()),
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
                    parse_pattern_string(rest_part, arena)
                } else {
                    JsPattern::Identifier(rest_part.into())
                };
                elements.push(Some(JsPattern::Rest(Box::new(inner_pattern))));
            } else if part.starts_with('{') || part.starts_with('[') {
                elements.push(Some(parse_pattern_string(part, arena)));
            } else if let Some((name_part, default_part)) = part.split_once('=') {
                let name = name_part.trim();
                let default_str = default_part.trim();
                elements.push(Some(JsPattern::Assignment(JsAssignmentPattern {
                    left: Box::new(JsPattern::Identifier(name.into())),
                    right: arena.alloc_expr(parse_default_value_expr(default_str)),
                })));
            } else {
                elements.push(Some(JsPattern::Identifier(part.into())));
            }
        }

        JsPattern::Array(JsArrayPattern { elements })
    } else {
        JsPattern::Identifier(trimmed.into())
    }
}

/// Parse a simple default value expression string into a JsExpr.
fn parse_default_value_expr(s: &str) -> JsExpr {
    let trimmed = s.trim();
    if trimmed == "undefined" {
        JsExpr::Identifier("undefined".into())
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
        JsExpr::Literal(JsLiteral::String(trimmed[1..trimmed.len() - 1].into()))
    } else {
        // Fallback: raw expression
        JsExpr::Raw(trimmed.into())
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
        _ => JsPattern::Identifier("$$anchor".into()),
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

        let val = expr.as_json();
        let arena = JsArena::new();
        let pattern = convert_value_to_pattern(val, &arena);
        match pattern {
            JsPattern::Identifier(name) => assert_eq!(name, "value"),
            _ => panic!("Expected identifier pattern"),
        }
    }
}
