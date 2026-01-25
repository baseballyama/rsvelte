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
    // Build function arguments - $$anchor is always the first argument
    let mut args: Vec<JsPattern> = vec![b::id_pattern("$$anchor")];

    // Track declarations that need to be added at the start of the body
    let mut declarations: Vec<JsStatement> = Vec::new();

    // Process each parameter
    for (i, param) in node.parameters.iter().enumerate() {
        if let Some(arg_info) = process_parameter(param, i, context) {
            args.push(arg_info.pattern);
            declarations.extend(arg_info.declarations);
        }
    }

    // Visit the snippet body
    let body_statements = visit_fragment(&node.body, context);

    // Build the full body with declarations and visited body
    let mut full_body = Vec::new();

    // In dev mode, add validation at the start
    if context.state.dev {
        full_body.push(b::stmt(b::call(
            b::member_path("$.validate_snippet_args"),
            vec![b::spread_expr(b::id("arguments"))],
        )));
    }

    // Add parameter declarations
    full_body.extend(declarations);

    // Add the body statements
    full_body.extend(body_statements);

    // Get the snippet name from the expression
    let snippet_name = get_snippet_name(&node.expression);

    // Create the snippet function
    let snippet = if context.state.dev {
        // In dev mode, use $.wrap_snippet with a named function expression
        let func = b::function_expr(Some(snippet_name.clone()), args, full_body);

        b::call(
            b::member_path("$.wrap_snippet"),
            vec![b::id(&context.state.analysis.name), func],
        )
    } else {
        // In production mode, use an arrow function
        b::arrow_block(args, full_body)
    };

    // Create the const declaration: const snippet_name = ...;
    let declaration = b::const_decl(&snippet_name, snippet);

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

/// Process a snippet parameter.
///
/// For simple identifiers, creates an assignment pattern with $.noop as default.
/// For destructured patterns, creates intermediate variables with derived values.
fn process_parameter(
    param: &Expression,
    index: usize,
    context: &mut ComponentContext,
) -> Option<ParameterInfo> {
    let Expression::Value(val) = param;

    if let serde_json::Value::Object(obj) = val {
        let param_type = obj.get("type").and_then(|v| v.as_str())?;

        if param_type == "Identifier" {
            // Simple identifier parameter: param = $.noop
            let name = obj.get("name").and_then(|v| v.as_str())?;

            // Create assignment pattern: param = $.noop
            let pattern = JsPattern::Assignment(JsAssignmentPattern {
                left: Box::new(b::id_pattern(name)),
                right: Box::new(b::member_path("$.noop")),
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

        // For destructured patterns (ObjectPattern, ArrayPattern), we need to:
        // 1. Create an intermediate argument name ($$argN)
        // 2. Extract paths from the pattern
        // 3. Create derived values for each extracted path

        let arg_alias = format!("$$arg{}", index);
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

                                // Create: let key = needs_derived ? $.derived_safe_equal(...) : () => $$arg?.key
                                let access_expr =
                                    b::member_path(&format!("{}?.{}", arg_alias, key_name));
                                let fn_expr = b::thunk(access_expr);

                                let decl = if needs_derived {
                                    // For default values, use $.derived_safe_equal
                                    b::let_decl(
                                        key_name,
                                        Some(b::call(
                                            b::member_path("$.derived_safe_equal"),
                                            vec![fn_expr],
                                        )),
                                    )
                                } else {
                                    b::let_decl(key_name, Some(fn_expr))
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
                                        b::call(b::member_path("$.get"), vec![b::id(key_name)])
                                    } else {
                                        b::call(b::id(key_name), vec![])
                                    };
                                    declarations.push(b::stmt(read_call));
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
                                declarations.push(b::let_decl(name, Some(b::thunk(access_expr))));
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

                // Create: const $$array = $.derived(() => $.to_array($$arg?.()))
                let to_array_call = b::call(
                    b::member_path("$.to_array"),
                    vec![b::call(b::member_path(&format!("{}?.", arg_alias)), vec![])],
                );

                declarations.push(b::const_decl(
                    &array_name,
                    b::call(b::member_path("$.derived"), vec![b::thunk(to_array_call)]),
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
                                b::call(b::member_path("$.get"), vec![b::id(&array_name)]),
                                b::number(i as f64),
                            );

                            declarations.push(b::let_decl(name, Some(b::thunk(access))));
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

/// Create a transform that calls the identifier as a function.
fn create_call_transform()
-> crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
    crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
        read: Some(|expr| b::call(expr, vec![])),
        assign: None,
        mutate: None,
        update: None,
    }
}

/// Create a transform that calls $.get(identifier).
fn create_get_value_transform()
-> crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
    crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
        read: Some(|expr| b::call(b::member_path("$.get"), vec![expr])),
        assign: None,
        mutate: None,
        update: None,
    }
}

/// Get the snippet name from the expression.
fn get_snippet_name(expr: &Expression) -> String {
    let Expression::Value(val) = expr;
    if let serde_json::Value::Object(obj) = val
        && obj.get("type").and_then(|v| v.as_str()) == Some("Identifier")
        && let Some(name) = obj.get("name").and_then(|v| v.as_str())
    {
        return name.to_string();
    }
    "snippet".to_string()
}

/// Place the snippet declaration in the appropriate collection.
///
/// Snippets are placed based on:
/// - Top-level snippets that can be hoisted -> module_level_snippets
/// - Top-level snippets that can't be hoisted -> instance_level_snippets
/// - Non-top-level snippets -> init (within the current block)
fn place_snippet_declaration(
    node: &SnippetBlock,
    context: &mut ComponentContext,
    declaration: JsStatement,
) {
    // Check if this is a top-level snippet
    // In the JS version, this is: context.path.length === 1 && context.path[0].type === 'Fragment'
    // Since we don't have a Fragment variant in TemplateNode, we check if the path is empty or has only one element
    // (meaning we're at the root level of the component)
    let is_at_root = context.path.is_empty() || context.path.len() == 1;

    if is_at_root {
        if node.metadata.can_hoist {
            context.state.module_level_snippets.push(declaration);
        } else {
            context.state.instance_level_snippets.push(declaration);
        }
    } else {
        context.state.init.push(declaration);
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

    let block = fragment_visitor(frag, context);
    block.body
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
}
