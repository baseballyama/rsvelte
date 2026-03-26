//! SnippetBlock visitor for client-side transformation.
//!
//! Corresponds to `SnippetBlock` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/SnippetBlock.js`.
//!
//! # Overview
//!
//! Snippets are reusable template fragments that can be rendered via `{@render}` tags.
//! This visitor transforms snippet blocks into const declarations containing either:
//! - An arrow function (production mode)
//! - A wrapped function expression (development mode) for better debugging
//!
//! # Generated Code
//!
//! For a simple snippet like:
//!
//! ```svelte
//! {#snippet greeting(name)}
//!   <p>Hello {name}</p>
//! {/snippet}
//! ```
//!
//! In production mode, this generates:
//!
//! ```javascript
//! const greeting = ($$anchor, name = $.noop) => {
//!   // snippet body
//! };
//! ```
//!
//! In development mode:
//!
//! ```javascript
//! const greeting = $.wrap_snippet(Component, function greeting($$anchor, name = $.noop) {
//!   $.validate_snippet_args(...arguments);
//!   // snippet body
//! });
//! ```
//!
//! # Hoisting
//!
//! Snippets can be hoisted to different levels:
//! - Module level: Snippets that don't reference instance-level state (can_hoist = true)
//! - Instance level: Snippets that reference instance-level state
//! - Init level: Snippets defined inside blocks (not at top level)

use crate::ast::js::Expression;
use crate::ast::template::{Fragment, SnippetBlock};
use crate::compiler::phases::phase3_transform::client::types::ComponentContext;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Visit a snippet block and generate the corresponding JavaScript code.
///
/// # Arguments
///
/// * `node` - The SnippetBlock AST node
/// * `context` - The component transformation context
///
/// # Implementation Notes
///
/// This function mirrors the JavaScript implementation in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/SnippetBlock.js`.
///
/// The implementation:
/// 1. Builds function arguments with $$anchor as the first parameter
/// 2. Handles parameters (simple identifiers and destructured patterns)
/// 3. Sets up transforms for reactive parameter access
/// 4. Visits the snippet body
/// 5. Creates either an arrow function or wrapped function (dev mode)
/// 6. Places the declaration in the appropriate snippet collection
pub fn snippet_block(node: &SnippetBlock, context: &mut ComponentContext) {
    // Get the snippet name and register it
    let snippet_name = get_snippet_name(&node.expression);
    context.state.snippet_names.insert(snippet_name.clone());

    // Build function arguments - $$anchor is always the first argument
    let mut args: Vec<JsPattern> = vec![b::id_pattern("$$anchor")];

    // Track declarations that need to be added at the start of the body
    let mut declarations: Vec<JsStatement> = Vec::new();

    // Save the current transform map before processing snippet parameters.
    // Snippet parameters (like {count} in `{#snippet foo({count})}`) create
    // local transforms that should only apply within the snippet body.
    // Without saving/restoring, these transforms would overwrite outer scope
    // transforms (e.g., a $state variable with the same name).
    let saved_transform = context.state.transform.clone();

    // Process each parameter
    for (i, param) in node.parameters.iter().enumerate() {
        if let Some(arg_info) = process_parameter(param, i, context) {
            args.push(arg_info.pattern);
            declarations.extend(arg_info.declarations);
        }
    }

    // Save and adjust blocker_map for snippet body. Snippets can reference
    // instance-level blocked variables, so we preserve the blocker_map.
    // However, snippet parameters that shadow blocked instance variables
    // should NOT be treated as blocked.
    let saved_blocker_map = {
        let mut map = context.state.blocker_map.borrow_mut();
        let saved = map.clone();
        // Remove entries for snippet parameter names since they shadow instance vars
        for param in &node.parameters {
            // Extract all identifier names from the parameter pattern
            let param_names = extract_param_names(param);
            for name in &param_names {
                map.remove(name);
            }
        }
        saved
    };

    // Visit the snippet body
    let body_statements = visit_fragment(&node.body, context);

    // Restore the transform map and blocker_map to the outer scope
    context.state.transform = saved_transform;
    *context.state.blocker_map.borrow_mut() = saved_blocker_map;

    // Build the full body with declarations and visited body
    let mut full_body = Vec::new();

    // In dev mode, add validation at the start
    if context.state.dev {
        full_body.push(b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.validate_snippet_args"),
                vec![b::spread_expr(&context.arena, b::id("arguments"))],
            ),
        ));
    }

    // Add parameter declarations
    full_body.extend(declarations);

    // Add the body statements
    full_body.extend(body_statements);

    // Get the snippet name from the expression
    let snippet_name = get_snippet_name(&node.expression);

    // Create the snippet function
    let snippet = if context.state.dev {
        // In dev mode, use $.wrap_snippet with an anonymous function expression
        let func = b::function_expr(None, args, full_body);

        b::call(
            &context.arena,
            b::member_path(&context.arena, "$.wrap_snippet"),
            vec![b::id(&context.state.analysis.name), func],
        )
    } else {
        // In production mode, use an arrow function
        b::arrow_block(args, full_body)
    };

    // Create the const declaration: const snippet_name = ...;
    let declaration = b::const_decl(&context.arena, &snippet_name, snippet);

    // Determine where to place the declaration
    place_snippet_declaration(node, context, declaration);
}

/// Information about a processed parameter.
struct ParameterInfo {
    /// The pattern for the function parameter
    pattern: JsPattern,
    /// Any declarations needed at the start of the body
    declarations: Vec<JsStatement>,
}

/// Extract all parameter names from a snippet parameter expression.
/// Used to remove snippet parameter names from the blocker_map so that
/// parameters that shadow blocked instance variables don't cause false blockers.
fn extract_param_names(param: &Expression) -> Vec<String> {
    let val = param.as_json();
    let mut names = Vec::new();
    extract_param_names_from_json(&val, &mut names);
    names
}

fn extract_param_names_from_json(val: &serde_json::Value, names: &mut Vec<String>) {
    if let serde_json::Value::Object(obj) = val {
        let param_type = obj.get("type").and_then(|v| v.as_str());
        match param_type {
            Some("Identifier") => {
                if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                    names.push(name.to_string());
                }
            }
            Some("AssignmentPattern") => {
                if let Some(left) = obj.get("left") {
                    extract_param_names_from_json(left, names);
                }
            }
            Some("ObjectPattern") => {
                if let Some(properties) = obj.get("properties").and_then(|v| v.as_array()) {
                    for prop in properties {
                        if let Some(value) = prop.get("value") {
                            extract_param_names_from_json(value, names);
                        } else if prop.get("type").and_then(|v| v.as_str()) == Some("RestElement")
                            && let Some(arg) = prop.get("argument")
                        {
                            extract_param_names_from_json(arg, names);
                        }
                    }
                }
            }
            Some("ArrayPattern") => {
                if let Some(elements) = obj.get("elements").and_then(|v| v.as_array()) {
                    for elem in elements {
                        if !elem.is_null() {
                            extract_param_names_from_json(elem, names);
                        }
                    }
                }
            }
            Some("RestElement") => {
                if let Some(arg) = obj.get("argument") {
                    extract_param_names_from_json(arg, names);
                }
            }
            _ => {}
        }
    }
}

/// Process a snippet parameter.
///
/// For simple identifiers, creates an assignment pattern with $.noop as default.
/// For destructured patterns, creates intermediate variables with derived values.
fn process_parameter(
    param: &Expression,
    index: usize,
    context: &mut ComponentContext,
) -> Option<ParameterInfo> {
    let val = param.as_json();

    if let serde_json::Value::Object(ref obj) = val {
        let param_type = obj.get("type").and_then(|v| v.as_str())?;

        if param_type == "Identifier" {
            // Simple identifier parameter: param = $.noop
            let name = obj.get("name").and_then(|v| v.as_str())?;

            // Create assignment pattern: param = $.noop
            let pattern = JsPattern::Assignment(JsAssignmentPattern {
                left: Box::new(b::id_pattern(name)),
                right: context
                    .arena
                    .alloc_expr(b::member_path(&context.arena, "$.noop")),
            });

            // Set up transform for reading this parameter
            // In JS: transform[argument.name] = { read: b.call };
            // This means the parameter should be called like a function: param()
            context
                .state
                .transform
                .insert(name.to_string(), create_call_transform());

            return Some(ParameterInfo {
                pattern,
                declarations: vec![],
            });
        }

        if param_type == "AssignmentPattern" {
            // Parameter with default value: param = defaultValue
            // Generates: ($$anchor, $$argN) => {
            //   let param = $.derived_safe_equal(() => $.fallback($$argN?.(), default));
            // }
            return process_assignment_pattern(obj, index, context);
        }

        // For destructured patterns (ObjectPattern, ArrayPattern), we need to:
        // 1. Create an intermediate argument name ($$argN)
        // 2. Extract paths from the pattern
        // 3. Create derived values for each extracted path

        let arg_alias = format!("$$arg{}", index);

        // IMPORTANT: Use simple identifier pattern for the function parameter
        // The destructuring is handled internally via declarations
        let pattern = b::id_pattern(&arg_alias);

        // For now, we'll create a simplified handling of destructured patterns
        // A full implementation would use extract_paths like the JS version
        let declarations = process_destructured_pattern(obj, &arg_alias, context);

        Some(ParameterInfo {
            pattern,
            declarations,
        })
    } else {
        None
    }
}

/// Process a destructured pattern (ObjectPattern or ArrayPattern).
///
/// This is a simplified version. The full implementation would use
/// extract_paths to handle all cases including rest elements and default values.
fn process_destructured_pattern(
    obj: &serde_json::Map<String, serde_json::Value>,
    arg_alias: &str,
    context: &mut ComponentContext,
) -> Vec<JsStatement> {
    let mut declarations = Vec::new();

    let param_type = obj.get("type").and_then(|v| v.as_str()).unwrap_or("");

    match param_type {
        "ObjectPattern" => {
            if let Some(props) = obj.get("properties").and_then(|p| p.as_array()) {
                for prop in props {
                    if let Some(prop_obj) = prop.as_object() {
                        let prop_type = prop_obj.get("type").and_then(|v| v.as_str());

                        if prop_type == Some("Property") {
                            if let Some(key) = prop_obj.get("key").and_then(|k| k.as_object())
                                && let Some(key_name) = key.get("name").and_then(|n| n.as_str())
                            {
                                let has_default = prop_obj.get("value").and_then(|v| {
                                    v.as_object()
                                        .and_then(|o| o.get("type"))
                                        .and_then(|t| t.as_str())
                                        .map(|t| t == "AssignmentPattern")
                                });

                                let needs_derived = has_default.unwrap_or(false);

                                // Create: let key = needs_derived ? $.derived_safe_equal(...) : () => $$arg?.().key
                                // The snippet parameter is passed as a thunk, so we need to call it first
                                let call_expr =
                                    b::optional_call(&context.arena, b::id(arg_alias), vec![]);
                                let access_expr = b::member(&context.arena, call_expr, key_name);
                                let fn_expr = b::thunk(&context.arena, access_expr);

                                let decl = if needs_derived {
                                    // For default values, use $.derived_safe_equal
                                    b::let_decl(
                                        &context.arena,
                                        key_name,
                                        Some(b::call(
                                            &context.arena,
                                            b::member_path(&context.arena, "$.derived_safe_equal"),
                                            vec![fn_expr],
                                        )),
                                    )
                                } else {
                                    b::let_decl(&context.arena, key_name, Some(fn_expr))
                                };

                                declarations.push(decl);

                                // Set up transform
                                let transform = if needs_derived {
                                    create_get_value_transform()
                                } else {
                                    create_call_transform()
                                };
                                context
                                    .state
                                    .transform
                                    .insert(key_name.to_string(), transform);

                                // In dev mode, eagerly evaluate to catch initialization errors
                                if context.state.dev {
                                    let read_call = if needs_derived {
                                        b::call(
                                            &context.arena,
                                            b::member_path(&context.arena, "$.get"),
                                            vec![b::id(key_name)],
                                        )
                                    } else {
                                        b::call(&context.arena, b::id(key_name), vec![])
                                    };
                                    declarations.push(b::stmt(&context.arena, read_call));
                                }
                            }
                        } else if prop_type == Some("RestElement") {
                            // Handle rest element: { ...rest }
                            if let Some(arg) = prop_obj.get("argument").and_then(|a| a.as_object())
                                && let Some(name) = arg.get("name").and_then(|n| n.as_str())
                            {
                                // For rest elements, we'd need to use $.exclude_from_object
                                // Simplified version: just pass through
                                let access_expr = b::id(arg_alias);
                                declarations.push(b::let_decl(
                                    &context.arena,
                                    name,
                                    Some(b::thunk(&context.arena, access_expr)),
                                ));
                                context
                                    .state
                                    .transform
                                    .insert(name.to_string(), create_call_transform());
                            }
                        }
                    }
                }
            }
        }
        "ArrayPattern" => {
            // For array patterns, we need to use $.to_array first
            if let Some(elements) = obj.get("elements").and_then(|e| e.as_array()) {
                // Generate array variable
                let array_name = context.state.memoizer.generate_id("$$array");

                // Check if last element is a RestElement
                let has_rest = elements
                    .last()
                    .and_then(|e| e.as_object())
                    .and_then(|o| o.get("type"))
                    .and_then(|t| t.as_str())
                    == Some("RestElement");

                // Create: var $$array = $.derived(() => $.to_array($$arg?.(), length))
                // The length argument is only added when there's no rest element
                let arg_call = b::call(
                    &context.arena,
                    b::member_path(&context.arena, &format!("{}?.", arg_alias)),
                    vec![],
                );
                let mut to_array_args = vec![arg_call];
                if !has_rest {
                    to_array_args.push(b::number(elements.len() as f64));
                }
                let to_array_call = b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.to_array"),
                    to_array_args,
                );

                declarations.push(b::var_decl(
                    &context.arena,
                    &array_name,
                    Some(b::call(
                        &context.arena,
                        b::member_path(&context.arena, "$.derived"),
                        vec![b::thunk(&context.arena, to_array_call)],
                    )),
                ));

                context
                    .state
                    .transform
                    .insert(array_name.clone(), create_get_value_transform());

                // Process each element
                for (i, elem) in elements.iter().enumerate() {
                    if elem.is_null() {
                        continue;
                    }

                    if let Some(elem_obj) = elem.as_object() {
                        let elem_type = elem_obj.get("type").and_then(|t| t.as_str());

                        if elem_type == Some("Identifier")
                            && let Some(name) = elem_obj.get("name").and_then(|n| n.as_str())
                        {
                            // Create: let name = () => $.get($$array)[i]
                            let access = b::member_computed(
                                &context.arena,
                                b::call(
                                    &context.arena,
                                    b::member_path(&context.arena, "$.get"),
                                    vec![b::id(&array_name)],
                                ),
                                b::number(i as f64),
                            );

                            declarations.push(b::let_decl(
                                &context.arena,
                                name,
                                Some(b::thunk(&context.arena, access)),
                            ));
                            context
                                .state
                                .transform
                                .insert(name.to_string(), create_call_transform());
                        }
                        // RestElement handling would go here
                    }
                }
            }
        }
        _ => {}
    }

    declarations
}

/// Process an AssignmentPattern parameter (parameter with default value).
///
/// For `{#snippet item(c = count)}`, generates:
///   - Parameter: `$$arg0`
///   - Declaration: `let c = $.derived_safe_equal(() => $.fallback($$arg0?.(), count))`
///   - Transform: `c` reads as `$.get(c)`
///
/// For complex defaults (non-simple expressions), the default is thunked:
///   `$.fallback($$arg?.(), () => complexExpr, true)`
fn process_assignment_pattern(
    obj: &serde_json::Map<String, serde_json::Value>,
    index: usize,
    context: &mut ComponentContext,
) -> Option<ParameterInfo> {
    let left = obj.get("left").and_then(|l| l.as_object())?;
    let right = obj.get("right")?;

    // Get the parameter name from the left side
    let left_type = left.get("type").and_then(|t| t.as_str())?;

    if left_type == "Identifier" {
        let name = left.get("name").and_then(|n| n.as_str())?;
        let arg_alias = format!("$$arg{}", index);

        // Build the fallback expression
        // $.fallback($$argN?.(), defaultValue) or $.fallback($$argN?.(), () => defaultValue, true)
        let arg_call = b::optional_call(&context.arena, b::id(&arg_alias), vec![]);

        let fallback_args = build_fallback_args(right, context);
        let mut all_args = vec![arg_call];
        all_args.extend(fallback_args);

        let fallback_call = b::call(
            &context.arena,
            b::member_path(&context.arena, "$.fallback"),
            all_args,
        );

        // Wrap in $.derived_safe_equal(() => $.fallback(...))
        let derived_call = b::call(
            &context.arena,
            b::member_path(&context.arena, "$.derived_safe_equal"),
            vec![b::thunk(&context.arena, fallback_call)],
        );

        let decl = b::let_decl(&context.arena, name, Some(derived_call));

        // Set up transform: reads as $.get(name)
        context
            .state
            .transform
            .insert(name.to_string(), create_get_value_transform());

        let pattern = b::id_pattern(&arg_alias);

        return Some(ParameterInfo {
            pattern,
            declarations: vec![decl],
        });
    }

    // For destructured patterns with defaults (e.g., {a, b} = defaultObj),
    // fall back to the destructured pattern handler with an arg alias
    let arg_alias = format!("$$arg{}", index);
    let pattern = b::id_pattern(&arg_alias);
    let declarations = process_destructured_pattern(left, &arg_alias, context);

    Some(ParameterInfo {
        pattern,
        declarations,
    })
}

/// Build the arguments for $.fallback() call.
/// Returns [defaultValue] for simple defaults or [callee/thunk, true] for complex ones.
///
/// This implements the same logic as the official `build_fallback` in
/// `svelte/packages/svelte/src/compiler/utils/ast.js`, including the `unthunk`
/// optimization from `builders.js` that simplifies `() => func()` to just `func`.
fn build_fallback_args(
    default_value: &serde_json::Value,
    context: &mut ComponentContext,
) -> Vec<JsExpr> {
    use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;

    if is_simple_expression_json(default_value) {
        // Simple default: $.fallback(arg?.(), default)
        let default_expr = convert_expression(&Expression::Value(default_value.clone()), context);
        vec![default_expr]
    } else {
        // Complex default - check for the unthunk optimization:
        // When the default is `func()` (CallExpression with 0 args and Identifier callee),
        // just pass `func` instead of `() => func()`. This matches Svelte's `unthunk` in builders.js.
        if let Some(obj) = default_value.as_object()
            && obj.get("type").and_then(|t| t.as_str()) == Some("CallExpression")
            && obj
                .get("arguments")
                .and_then(|a| a.as_array())
                .is_some_and(|a| a.is_empty())
            && let Some(callee) = obj.get("callee").and_then(|c| c.as_object())
            && callee.get("type").and_then(|t| t.as_str()) == Some("Identifier")
        {
            // Optimization: pass just the callee identifier instead of thunking
            let callee_expr = convert_expression(
                &Expression::Value(serde_json::Value::Object(callee.clone())),
                context,
            );
            vec![callee_expr, JsExpr::Literal(JsLiteral::Boolean(true))]
        } else {
            // General case: thunk the expression
            let default_expr =
                convert_expression(&Expression::Value(default_value.clone()), context);
            vec![
                b::thunk(&context.arena, default_expr),
                JsExpr::Literal(JsLiteral::Boolean(true)),
            ]
        }
    }
}

/// Check if a JSON AST expression is "simple" (doesn't need thunking).
/// Matches the official Svelte compiler's `is_simple_expression` logic.
fn is_simple_expression_json(value: &serde_json::Value) -> bool {
    let obj = match value.as_object() {
        Some(o) => o,
        None => return true, // Literals are simple
    };

    let expr_type = match obj.get("type").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => return true,
    };

    match expr_type {
        "Literal" | "Identifier" | "ArrowFunctionExpression" | "FunctionExpression" => true,
        "ConditionalExpression" => {
            let test_simple = obj
                .get("test")
                .map(is_simple_expression_json)
                .unwrap_or(true);
            let consequent_simple = obj
                .get("consequent")
                .map(is_simple_expression_json)
                .unwrap_or(true);
            let alternate_simple = obj
                .get("alternate")
                .map(is_simple_expression_json)
                .unwrap_or(true);
            test_simple && consequent_simple && alternate_simple
        }
        "BinaryExpression" | "LogicalExpression" => {
            let left_simple = obj
                .get("left")
                .map(is_simple_expression_json)
                .unwrap_or(true);
            let right_simple = obj
                .get("right")
                .map(is_simple_expression_json)
                .unwrap_or(true);
            left_simple && right_simple
        }
        "UnaryExpression" => obj
            .get("argument")
            .map(is_simple_expression_json)
            .unwrap_or(true),
        // Generic "Expression" fallback from parser (position-only placeholder)
        "Expression" => true,
        _ => false,
    }
}

/// Create a transform that calls the identifier as a function.
fn create_call_transform()
-> crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
    crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
        read: Some(|arena, expr| b::call(arena, expr, vec![])),
        read_source: None,
        assign: None,
        mutate: None,
        update: None,
        skip_proxy: false,
        is_defined: false,
        // Snippet parameters need reactive tracking when used in templates
        is_reactive: true,
        replacement_id: None,
    }
}

/// Create a transform that calls $.get(identifier).
fn create_get_value_transform()
-> crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
    crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
        read: Some(|arena, expr| b::call(arena, b::member_path(arena, "$.get"), vec![expr])),
        read_source: None,
        assign: None,
        mutate: None,
        update: None,
        skip_proxy: false,
        is_defined: false,
        // Derived values need reactive tracking
        is_reactive: true,
        replacement_id: None,
    }
}

/// Get the snippet name from the expression.
fn get_snippet_name(expr: &Expression) -> String {
    if let Some(name) = expr.identifier_name() {
        return name.to_string();
    }
    "snippet".to_string()
}

/// Place the snippet declaration in the appropriate collection.
///
/// Snippets are placed based on:
/// - Top-level snippets that can be hoisted -> module_level_snippets
/// - Top-level snippets that can't be hoisted -> instance_level_snippets
/// - Non-top-level snippets -> snippets (within the child_state, to be wrapped in a block)
fn place_snippet_declaration(
    node: &SnippetBlock,
    context: &mut ComponentContext,
    declaration: JsStatement,
) {
    // Check if this is a top-level snippet
    // In the JS version, this is: context.path.length === 1 && context.path[0].type === 'Fragment'
    // We use template_nesting_level to track this: 0 means we're at component root
    let is_at_root = context.state.template_nesting_level == 0;

    if is_at_root {
        // Use metadata.can_hoist from the analyze phase - this is authoritative
        // The analyze phase checks if the snippet references any instance-level state
        let can_hoist = node.metadata.can_hoist;

        if can_hoist {
            context.state.module_level_snippets.push(declaration);
        } else {
            context.state.instance_level_snippets.push(declaration);
        }
    } else {
        // Non-top-level snippets go to the `snippets` array
        // This matches the JS: context.state.snippets.push(declaration)
        // The parent (e.g., RegularElement) will wrap these in a block
        context.state.snippets.push(declaration);
    }
}

/// Check if a snippet can be hoisted based on its body content.
///
/// A snippet can be hoisted if it only references its own parameters and
/// no instance-level state. Since we don't have full scope information
/// in Phase 3, we use a simplified heuristic:
///
/// - Snippets that only contain static content can always be hoisted
/// - Snippets that reference variables ONLY through expression tags referencing
///   their own parameters can be hoisted
/// - Snippets that reference instance state cannot be hoisted
///
/// This is a simplified heuristic. The proper implementation should check
/// scope references during Phase 2 analysis.
///
/// NOTE: This function is currently unused because we determine can_hoist
/// in Phase 2 analysis. Keeping it for potential future use.
#[allow(dead_code)]
fn can_hoist_snippet(node: &SnippetBlock) -> bool {
    use crate::ast::template::TemplateNode;

    // Collect parameter names
    let param_names: std::collections::HashSet<String> = node
        .parameters
        .iter()
        .filter_map(extract_param_name)
        .collect();

    // Check if the body only references parameters (not instance state)
    fn check_hoistable(
        nodes: &[TemplateNode],
        param_names: &std::collections::HashSet<String>,
    ) -> bool {
        for node in nodes {
            match node {
                // Expression tags are OK if they only reference parameters
                TemplateNode::ExpressionTag(tag) => {
                    if !expression_only_uses_params(&tag.expression, param_names) {
                        return false;
                    }
                }

                // These prevent hoisting regardless
                TemplateNode::HtmlTag(_)
                | TemplateNode::IfBlock(_)
                | TemplateNode::EachBlock(_)
                | TemplateNode::AwaitBlock(_)
                | TemplateNode::KeyBlock(_)
                | TemplateNode::Component(_)
                | TemplateNode::SvelteComponent(_)
                | TemplateNode::SvelteElement(_)
                | TemplateNode::SvelteSelf(_) => return false,

                // RenderTag - check the expression
                TemplateNode::RenderTag(tag) => {
                    if !expression_only_uses_params(&tag.expression, param_names) {
                        return false;
                    }
                }

                // Nested snippet - recursively check
                TemplateNode::SnippetBlock(_snippet) => {
                    // Nested snippets have their own scope; don't check their internals
                    // but do ensure the nested snippet itself doesn't reference parent state
                }

                // Regular elements - check attributes and children
                TemplateNode::RegularElement(elem) => {
                    // Check for dynamic attributes
                    for attr in &elem.attributes {
                        match attr {
                            crate::ast::template::Attribute::Attribute(a) => match &a.value {
                                crate::ast::template::AttributeValue::Sequence(parts) => {
                                    for p in parts {
                                        if let crate::ast::template::AttributeValuePart::ExpressionTag(tag) = p
                                                && !expression_only_uses_params(&tag.expression, param_names) {
                                                    return false;
                                                }
                                    }
                                }
                                crate::ast::template::AttributeValue::Expression(tag) => {
                                    if !expression_only_uses_params(&tag.expression, param_names) {
                                        return false;
                                    }
                                }
                                _ => {}
                            },
                            // Directives might reference state
                            crate::ast::template::Attribute::BindDirective(bind) => {
                                if !expression_only_uses_params(&bind.expression, param_names) {
                                    return false;
                                }
                            }
                            crate::ast::template::Attribute::OnDirective(on) => {
                                if let Some(ref expr) = on.expression
                                    && !expression_only_uses_params(expr, param_names)
                                {
                                    return false;
                                }
                            }
                            // Other directives - assume they might reference state
                            _ => {}
                        }
                    }
                    // Check children
                    if !check_hoistable(&elem.fragment.nodes, param_names) {
                        return false;
                    }
                }

                // Static content - always OK
                TemplateNode::Text(_) | TemplateNode::Comment(_) => {}

                // Other nodes - assume safe to hoist
                _ => {}
            }
        }
        true
    }

    check_hoistable(&node.body.nodes, &param_names)
}

/// Extract parameter name from a parameter expression.
///
/// NOTE: This function is currently unused because we determine can_hoist
/// in Phase 2 analysis. Keeping it for potential future use.
#[allow(dead_code)]
fn extract_param_name(param: &crate::ast::js::Expression) -> Option<String> {
    param.identifier_name().map(|s| s.to_string())
}

/// Check if an expression only uses the given parameter names.
/// Returns true if the expression only references parameters (can be hoisted).
///
/// NOTE: This function is currently unused because we determine can_hoist
/// in Phase 2 analysis. Keeping it for potential future use.
#[allow(dead_code)]
fn expression_only_uses_params(
    expr: &crate::ast::js::Expression,
    param_names: &std::collections::HashSet<String>,
) -> bool {
    use crate::ast::js::Expression;

    let val = expr.as_json();

    if let serde_json::Value::Object(obj) = val {
        let expr_type = obj.get("type").and_then(|v| v.as_str());

        match expr_type {
            // Identifier - must be a parameter or a known safe global
            Some("Identifier") => {
                if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                    // Parameters are safe
                    if param_names.contains(name) {
                        return true;
                    }
                    // Some globals are safe (undefined, null, etc.)
                    if matches!(
                        name,
                        "undefined"
                            | "null"
                            | "NaN"
                            | "Infinity"
                            | "console"
                            | "Math"
                            | "JSON"
                            | "Object"
                            | "Array"
                            | "String"
                            | "Number"
                            | "Boolean"
                    ) {
                        return true;
                    }
                    // Unknown identifiers might be instance state - but for simplicity,
                    // assume that identifiers not in params are instance state
                    return false;
                }
                true
            }

            // Literals are always safe
            Some("Literal")
            | Some("NumericLiteral")
            | Some("StringLiteral")
            | Some("BooleanLiteral")
            | Some("NullLiteral") => true,

            // Call expressions - check callee and arguments
            Some("CallExpression") => {
                // Check callee
                if let Some(callee) = obj.get("callee") {
                    let callee_expr = Expression::Value(callee.clone());
                    if !expression_only_uses_params(&callee_expr, param_names) {
                        return false;
                    }
                }
                // Check arguments
                if let Some(args) = obj.get("arguments").and_then(|a| a.as_array()) {
                    for arg in args {
                        if !expression_only_uses_params(
                            &Expression::Value(arg.clone()),
                            param_names,
                        ) {
                            return false;
                        }
                    }
                }
                true
            }

            // Member expressions - check object and property
            Some("MemberExpression") => {
                if let Some(object) = obj.get("object")
                    && !expression_only_uses_params(&Expression::Value(object.clone()), param_names)
                {
                    return false;
                }
                // Computed properties need checking too
                if obj
                    .get("computed")
                    .and_then(|c| c.as_bool())
                    .unwrap_or(false)
                    && let Some(prop) = obj.get("property")
                    && !expression_only_uses_params(&Expression::Value(prop.clone()), param_names)
                {
                    return false;
                }
                true
            }

            // Binary/Logical expressions - check both sides
            Some("BinaryExpression") | Some("LogicalExpression") => {
                if let Some(left) = obj.get("left")
                    && !expression_only_uses_params(&Expression::Value(left.clone()), param_names)
                {
                    return false;
                }
                if let Some(right) = obj.get("right")
                    && !expression_only_uses_params(&Expression::Value(right.clone()), param_names)
                {
                    return false;
                }
                true
            }

            // Conditional expressions
            Some("ConditionalExpression") => {
                for key in &["test", "consequent", "alternate"] {
                    if let Some(e) = obj.get(*key)
                        && !expression_only_uses_params(&Expression::Value(e.clone()), param_names)
                    {
                        return false;
                    }
                }
                true
            }

            // Template literal - check expressions
            Some("TemplateLiteral") => {
                if let Some(exprs) = obj.get("expressions").and_then(|e| e.as_array()) {
                    for e in exprs {
                        if !expression_only_uses_params(&Expression::Value(e.clone()), param_names)
                        {
                            return false;
                        }
                    }
                }
                true
            }

            // Array/Object expressions - check elements/properties
            Some("ArrayExpression") => {
                if let Some(elements) = obj.get("elements").and_then(|e| e.as_array()) {
                    for elem in elements {
                        if !elem.is_null()
                            && !expression_only_uses_params(
                                &Expression::Value(elem.clone()),
                                param_names,
                            )
                        {
                            return false;
                        }
                    }
                }
                true
            }

            // Arrow/function expressions are self-contained - always safe
            Some("ArrowFunctionExpression") | Some("FunctionExpression") => true,

            // Unknown expression type - be conservative
            _ => false,
        }
    } else {
        // Not an object - probably a primitive
        true
    }
}

/// Visit a fragment and return its statements.
///
/// This function properly processes the fragment using the Fragment visitor
/// which handles whitespace trimming, $.next() for text_first, and proper
/// $.text() / $.append() for single text nodes.
fn visit_fragment(frag: &Fragment, context: &mut ComponentContext) -> Vec<JsStatement> {
    // Use the proper fragment visitor to handle all cases correctly
    use crate::compiler::phases::phase3_transform::client::visitors::fragment::fragment as fragment_visitor;

    // Determine the namespace for the snippet body from its content.
    // This matches the official Svelte compiler's check_nodes_for_namespace() logic
    // which is called when the parent is a SnippetBlock. The snippet's template
    // namespace is determined by its children, NOT inherited from the parent element.
    // For example:
    //   - {#snippet} inside <svg> with <p> children -> "html"
    //   - {#snippet} inside <svg> with <a><text>...</text></a> children -> "svg"
    let snippet_namespace = infer_namespace_from_children(&frag.nodes);
    let saved_namespace =
        std::mem::replace(&mut context.state.metadata.namespace, snippet_namespace);

    // Also temporarily clear the path so that the fragment visitor's infer_namespace()
    // doesn't see the parent element (e.g., <svg>) and skip child-based inference.
    // The snippet body is its own template scope.
    let saved_path = std::mem::take(&mut context.path);

    // Snippet body needs is_root_fragment=true to get $.next() when text-first
    let block = fragment_visitor(frag, context, true);

    // Restore the parent path and namespace
    context.path = saved_path;
    context.state.metadata.namespace = saved_namespace;

    block.body
}

/// Infer namespace from snippet body children.
///
/// Matches the official Svelte compiler's `check_nodes_for_namespace()` logic:
/// - If all elements are SVG -> "svg"
/// - If all elements are MathML -> "mathml"
/// - If any element is regular HTML -> "html"
/// - If no elements found -> "html" (default)
fn infer_namespace_from_children(nodes: &[crate::ast::template::TemplateNode]) -> String {
    use crate::ast::template::TemplateNode;

    let mut found_namespace: Option<&str> = None;

    for node in nodes {
        match node {
            TemplateNode::RegularElement(elem) => {
                if !elem.metadata.svg && !elem.metadata.mathml {
                    return "html".to_string();
                }
                if elem.metadata.svg {
                    found_namespace = Some(match found_namespace {
                        None | Some("svg") => "svg",
                        _ => return "html".to_string(),
                    });
                } else if elem.metadata.mathml {
                    found_namespace = Some(match found_namespace {
                        None | Some("mathml") => "mathml",
                        _ => return "html".to_string(),
                    });
                }
            }
            TemplateNode::SvelteElement(elem) => {
                if !elem.metadata.svg && !elem.metadata.mathml {
                    return "html".to_string();
                }
                if elem.metadata.svg {
                    found_namespace = Some(match found_namespace {
                        None | Some("svg") => "svg",
                        _ => return "html".to_string(),
                    });
                } else if elem.metadata.mathml {
                    found_namespace = Some(match found_namespace {
                        None | Some("mathml") => "mathml",
                        _ => return "html".to_string(),
                    });
                }
            }
            // For non-element nodes (text, expressions, blocks), continue checking
            _ => {}
        }
    }

    found_namespace.unwrap_or("html").to_string()
}

/// Helper to convert an AST expression to a JS expression.
#[allow(dead_code)]
fn convert_expr(expr: &Expression, context: &mut ComponentContext) -> JsExpr {
    convert_expression(expr, context)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_snippet_name() {
        let expr = Expression::Value(serde_json::json!({
            "type": "Identifier",
            "name": "greeting"
        }));

        assert_eq!(get_snippet_name(&expr), "greeting");
    }

    #[test]
    fn test_get_snippet_name_fallback() {
        let expr = Expression::Value(serde_json::json!({
            "type": "CallExpression"
        }));

        assert_eq!(get_snippet_name(&expr), "snippet");
    }

    #[test]
    fn test_create_call_transform() {
        let transform = create_call_transform();
        assert!(transform.read.is_some());
        assert!(transform.assign.is_none());
        assert!(transform.mutate.is_none());
    }

    #[test]
    fn test_create_get_value_transform() {
        let transform = create_get_value_transform();
        assert!(transform.read.is_some());
        assert!(transform.assign.is_none());
        assert!(transform.mutate.is_none());
    }

    #[test]
    fn test_snippet_params_with_defaults() {
        use crate::{ParseOptions, parse};
        let input = r#"{#snippet one(a, b = 1, c = (2, 3))}
  {a}{b}{c}
{/snippet}
{@render one(0)}"#;
        let result = parse(input, ParseOptions::default()).unwrap();
        let json = serde_json::to_string_pretty(&result).unwrap();
        assert!(
            json.contains("AssignmentPattern"),
            "Parser should produce AssignmentPattern for default params"
        );
    }
}
