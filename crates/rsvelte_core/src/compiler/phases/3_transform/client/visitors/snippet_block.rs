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
    // Statements to duplicate at the very top of this snippet's body
    // (set by `<svelte:boundary>` for boundary-level `{@const}` declarations
    // — upstream SvelteBoundary.js unshifts them into each hoisted snippet).
    // Taken eagerly so nested snippet bodies don't also receive them.
    let body_prepend = std::mem::take(&mut context.state.snippet_body_prepend);

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
    let saved_transform_deep_read = context.state.transform_deep_read.clone();

    // Switch `state.scope` to the snippet body's Phase-2 scope (keyed by the
    // snippet block's start in `template_scope_map`) for the duration of body
    // processing. Mirrors upstream's visitor, which carries the snippet's own
    // scope: identifier resolution (and `scope.evaluate`-style constant
    // folding in `get_literal_value`) then resolves template declarations
    // lexically — a `{@const}` declared in a SIBLING snippet is not reachable
    // from here, so it is referenced as a (possibly global) identifier rather
    // than substituted.
    let saved_scope = context.state.scope;
    if let Some(snippet_scope) = context
        .state
        .scope_root
        .template_scope_map
        .get(&node.start)
        .and_then(|idx| context.state.scope_root.all_scopes.get(*idx))
    {
        context.state.scope = snippet_scope;
    }

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

    // Save and adjust shadowed_prop_names for snippet body. Snippet parameters
    // can shadow outer props (e.g., `{#snippet foo(options)}` where `options`
    // is also a prop). References to `options` inside the snippet body should
    // refer to the parameter, not the prop.
    let saved_shadowed = context.state.shadowed_prop_names.clone();
    for param in &node.parameters {
        for name in extract_param_names(param) {
            context.state.shadowed_prop_names.insert(name);
        }
    }

    // Visit the snippet body
    let body_statements = visit_fragment(&node.body, context);

    // Restore the transform map and blocker_map to the outer scope
    context.state.scope = saved_scope;
    context.state.transform = saved_transform;
    context.state.transform_deep_read = saved_transform_deep_read;
    *context.state.blocker_map.borrow_mut() = saved_blocker_map;
    context.state.shadowed_prop_names = saved_shadowed;

    // Build the full body with declarations and visited body
    let mut full_body = Vec::new();

    // Boundary-level `{@const}` duplicates go before everything else
    // (upstream unshifts them ahead of the dev validation statement).
    full_body.extend(body_prepend);

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
    extract_param_names_from_json(val, &mut names);
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

    if let serde_json::Value::Object(obj) = val {
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
            context.state.transform_deep_read.remove(name);

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

/// Process a destructured pattern (ObjectPattern / ArrayPattern / AssignmentPattern)
/// by walking it with `extract_snippet_paths` from the base `$$argN?.()`.
fn process_destructured_pattern(
    obj: &serde_json::Map<String, serde_json::Value>,
    arg_alias: &str,
    context: &mut ComponentContext,
) -> Vec<JsStatement> {
    let mut declarations = Vec::new();
    let base = b::optional_call(&context.arena, b::id(arg_alias), vec![]);
    extract_snippet_paths(
        &serde_json::Value::Object(obj.clone()),
        base,
        false,
        &mut declarations,
        context,
    );
    declarations
}

/// Emit a leaf binding `let name = needs_derived ? $.derived_safe_equal(() => access)
/// : () => access`, wire up the read transform, and (in dev) eagerly read it.
/// Mirrors the per-path emission in upstream `SnippetBlock.js`.
fn emit_snippet_path(
    name: &str,
    access: JsExpr,
    needs_derived: bool,
    declarations: &mut Vec<JsStatement>,
    context: &mut ComponentContext,
) {
    let fn_expr = b::thunk(&context.arena, access);
    let decl = if needs_derived {
        b::let_decl(
            &context.arena,
            name,
            Some(b::call(
                &context.arena,
                b::member_path(&context.arena, "$.derived_safe_equal"),
                vec![fn_expr],
            )),
        )
    } else {
        b::let_decl(&context.arena, name, Some(fn_expr))
    };
    declarations.push(decl);

    let transform = if needs_derived {
        create_get_value_transform()
    } else {
        create_call_transform()
    };
    context.state.transform.insert(name.to_string(), transform);
    context.state.transform_deep_read.remove(name);

    if context.state.dev {
        let read_call = if needs_derived {
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.get"),
                vec![b::id(name)],
            )
        } else {
            b::call(&context.arena, b::id(name), vec![])
        };
        declarations.push(b::stmt(&context.arena, read_call));
    }
}

/// Recursive port of upstream `extract_paths` for snippet parameters.
///
/// Walks a destructuring `pattern` (JSON), threading the access expression
/// `base` (the AST that reads the current sub-value). Array patterns push an
/// intermediate `var $$array = $.derived(() => $.to_array(base, len?))` and read
/// elements as `$.get($$array)[i]`; object rest emits
/// `$.exclude_from_object(base, [keys])`; defaults wrap the access in
/// `$.fallback(...)`; the whole path collapses to `$.derived_safe_equal(...)`
/// when any default is involved. (issue #446, H-100..H-103)
fn extract_snippet_paths(
    pattern: &serde_json::Value,
    base: JsExpr,
    has_default: bool,
    declarations: &mut Vec<JsStatement>,
    context: &mut ComponentContext,
) {
    let obj = match pattern.as_object() {
        Some(o) => o,
        None => return,
    };
    match obj.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => {
            if let Some(name) = obj.get("name").and_then(|n| n.as_str()) {
                emit_snippet_path(name, base, has_default, declarations, context);
            }
        }
        Some("ObjectPattern") => {
            let props = match obj.get("properties").and_then(|p| p.as_array()) {
                Some(p) => p,
                None => return,
            };
            for prop in props {
                let prop_obj = match prop.as_object() {
                    Some(o) => o,
                    None => continue,
                };
                match prop_obj.get("type").and_then(|t| t.as_str()) {
                    Some("RestElement") => {
                        // `$.exclude_from_object(base, ['k1', 'k2', ...])`
                        let keys: Vec<JsExpr> = props
                            .iter()
                            .filter_map(|p| p.as_object())
                            .filter(|p| p.get("type").and_then(|t| t.as_str()) == Some("Property"))
                            .filter_map(|p| object_pattern_key_literal(p, context))
                            .collect();
                        let rest_expr = b::call(
                            &context.arena,
                            b::member_path(&context.arena, "$.exclude_from_object"),
                            vec![base.clone(), b::array(keys)],
                        );
                        if let Some(arg) = prop_obj.get("argument") {
                            extract_snippet_paths(
                                arg,
                                rest_expr,
                                has_default,
                                declarations,
                                context,
                            );
                        }
                    }
                    Some("Property") => {
                        let access =
                            object_pattern_property_access(prop_obj, base.clone(), context);
                        if let Some(value) = prop_obj.get("value") {
                            extract_snippet_paths(
                                value,
                                access,
                                has_default,
                                declarations,
                                context,
                            );
                        }
                    }
                    _ => {}
                }
            }
        }
        Some("ArrayPattern") => {
            let elements = match obj.get("elements").and_then(|e| e.as_array()) {
                Some(e) => e,
                None => return,
            };
            let array_name = context.state.memoizer.generate_id("$$array");
            let has_rest = elements
                .last()
                .and_then(|e| e.as_object())
                .and_then(|o| o.get("type"))
                .and_then(|t| t.as_str())
                == Some("RestElement");

            // var $$array = $.derived(() => $.to_array(base, len?))
            let mut to_array_args = vec![base];
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

            for (i, elem) in elements.iter().enumerate() {
                if elem.is_null() {
                    continue;
                }
                let elem_obj = match elem.as_object() {
                    Some(o) => o,
                    None => continue,
                };
                // `$.get($$array)`
                let array_get = || {
                    b::call(
                        &context.arena,
                        b::member_path(&context.arena, "$.get"),
                        vec![b::id(&array_name)],
                    )
                };
                if elem_obj.get("type").and_then(|t| t.as_str()) == Some("RestElement") {
                    // `$.get($$array).slice(i)`
                    let slice_expr = b::call(
                        &context.arena,
                        b::member(&context.arena, array_get(), "slice"),
                        vec![b::number(i as f64)],
                    );
                    if let Some(arg) = elem_obj.get("argument") {
                        extract_snippet_paths(arg, slice_expr, has_default, declarations, context);
                    }
                } else {
                    // `$.get($$array)[i]`
                    let access =
                        b::member_computed(&context.arena, array_get(), b::number(i as f64));
                    extract_snippet_paths(elem, access, has_default, declarations, context);
                }
            }
        }
        Some("AssignmentPattern") => {
            // `$.fallback(base, default[, true])`, then recurse the left with has_default.
            if let (Some(left), Some(right)) = (obj.get("left"), obj.get("right")) {
                let mut fallback_args = vec![base];
                fallback_args.extend(build_fallback_args(right, context));
                let fallback_call = b::call(
                    &context.arena,
                    b::member_path(&context.arena, "$.fallback"),
                    fallback_args,
                );
                extract_snippet_paths(left, fallback_call, true, declarations, context);
            }
        }
        _ => {}
    }
}

/// Build the access expression for an object-pattern `Property`: `base.key` for a
/// plain identifier key, `base[key]` when computed or a non-identifier key.
fn object_pattern_property_access(
    prop: &serde_json::Map<String, serde_json::Value>,
    base: JsExpr,
    context: &mut ComponentContext,
) -> JsExpr {
    let computed = prop
        .get("computed")
        .and_then(|c| c.as_bool())
        .unwrap_or(false);
    let key = prop.get("key").and_then(|k| k.as_object());
    let key_type = key
        .and_then(|k| k.get("type"))
        .and_then(|t| t.as_str())
        .unwrap_or("");
    if !computed
        && key_type == "Identifier"
        && let Some(name) = key.and_then(|k| k.get("name")).and_then(|n| n.as_str())
    {
        return b::member(&context.arena, base, name);
    }
    // Computed or literal/expression key: `base[<key>]`.
    if let Some(key_obj) = key {
        let key_expr = convert_snippet_expr(&serde_json::Value::Object(key_obj.clone()), context);
        return b::member_computed(&context.arena, base, key_expr);
    }
    base
}

/// Produce the string literal used in `$.exclude_from_object(base, [...])` for a
/// non-rest object-pattern property key (mirrors upstream's key collection).
fn object_pattern_key_literal(
    prop: &serde_json::Map<String, serde_json::Value>,
    context: &mut ComponentContext,
) -> Option<JsExpr> {
    let computed = prop
        .get("computed")
        .and_then(|c| c.as_bool())
        .unwrap_or(false);
    let key = prop.get("key").and_then(|k| k.as_object())?;
    let key_type = key.get("type").and_then(|t| t.as_str()).unwrap_or("");
    if key_type == "Identifier" && !computed {
        let name = key.get("name").and_then(|n| n.as_str())?;
        Some(b::string(name))
    } else if key_type == "Literal" {
        let val = key.get("value")?;
        let s = match val {
            serde_json::Value::String(s) => s.clone(),
            other => other.to_string(),
        };
        Some(b::string(s))
    } else {
        // `String(<key>)`
        let key_expr = convert_snippet_expr(&serde_json::Value::Object(key.clone()), context);
        Some(b::call(&context.arena, b::id("String"), vec![key_expr]))
    }
}

/// Convert a JSON expression to a transformed `JsExpr` for use inside snippet
/// parameter access expressions.
fn convert_snippet_expr(value: &serde_json::Value, context: &mut ComponentContext) -> JsExpr {
    use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
    convert_expression(&Expression::Value(value.clone()), context)
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
        context.state.transform_deep_read.remove(name);

        let pattern = b::id_pattern(&arg_alias);

        return Some(ParameterInfo {
            pattern,
            declarations: vec![decl],
        });
    }

    // Destructured pattern with a whole-parameter default (e.g.
    // `{#snippet foo({ a } = defaultObj)}`): build the fallback over `$$argN?.()`
    // and walk the destructured left with `has_default = true` so each leaf
    // collapses to `$.derived_safe_equal(...)`. (H-103)
    let arg_alias = format!("$$arg{}", index);
    let pattern = b::id_pattern(&arg_alias);

    let arg_call = b::optional_call(&context.arena, b::id(&arg_alias), vec![]);
    let mut fallback_args = vec![arg_call];
    fallback_args.extend(build_fallback_args(right, context));
    let fallback_call = b::call(
        &context.arena,
        b::member_path(&context.arena, "$.fallback"),
        fallback_args,
    );

    let mut declarations = Vec::new();
    extract_snippet_paths(
        &serde_json::Value::Object(left.clone()),
        fallback_call,
        true,
        &mut declarations,
        context,
    );

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
    use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression;

    if is_simple_expression_json(default_value) {
        // Simple default: $.fallback(arg?.(), default). Apply reactive-read
        // transforms so a default like `x = count` becomes `$.get(count)`
        // (the default expression was previously emitted untransformed). M-068.
        let default_expr = convert_expression(&Expression::Value(default_value.clone()), context);
        let default_expr = apply_transforms_to_expression(&default_expr, context);
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
            // General case: thunk the (transformed) expression so reactive reads
            // inside a complex default (`x = a + b`) are wrapped. M-068.
            let default_expr =
                convert_expression(&Expression::Value(default_value.clone()), context);
            let default_expr = apply_transforms_to_expression(&default_expr, context);
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
    let snippet_namespace =
        infer_namespace_from_children(&frag.nodes, &context.state.metadata.namespace);
    let saved_namespace =
        std::mem::replace(&mut context.state.metadata.namespace, snippet_namespace);

    // Also temporarily clear the path so that the fragment visitor's infer_namespace()
    // doesn't see the parent element (e.g., <svg>) and skip child-based inference.
    // The snippet body is its own template scope.
    let saved_path = std::mem::take(&mut context.path);

    // Bump template_nesting_level so that snippets nested INSIDE this snippet body
    // are not treated as component-root snippets. The fragment visitor uses
    // `context.state.template_nesting_level` (not a hardcoded 0) when is_root_fragment=true,
    // so bumping here before the call ensures the inner fragment state inherits level >= 1.
    // Mirrors upstream's `context.path.length === 1` check: a snippet body's direct
    // children live at path-length 2+, so nested snippets must NOT land at level 0.
    let saved_nesting = context.state.template_nesting_level;
    context.state.template_nesting_level += 1;

    // Snippet body needs is_root_fragment=true to get $.next() when text-first
    let block = fragment_visitor(frag, context, true);

    // Restore the parent path, namespace, and nesting level
    context.path = saved_path;
    context.state.metadata.namespace = saved_namespace;
    context.state.template_nesting_level = saved_nesting;

    block.body
}

/// Result of scanning a snippet body for its namespace.
///
/// Mirrors the `Namespace | 'keep' | 'maybe_html'` accumulator in upstream's
/// `check_nodes_for_namespace()`.
#[derive(Clone, Copy, PartialEq, Eq)]
enum NsScan {
    Keep,
    MaybeHtml,
    Html,
    Svg,
    Mathml,
}

/// Infer namespace for a snippet body, mirroring upstream's
/// `infer_namespace()` for a `SnippetBlock` parent.
///
/// Faithful port of `check_nodes_for_namespace()` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js`. The walk
/// descends through block containers (`{#if}` / `{#each}` / `{#await}` /
/// `{#key}` / fragments) and stops at the first element it reaches; components,
/// render tags, and nested snippets are *not* descended (they reset the
/// namespace themselves). When the scan finds no element — only whitespace,
/// text, or dynamic anchors — the result is `keep`/`maybe_html`, and upstream
/// falls back to the *inherited* namespace rather than defaulting to `html`.
/// Previously this defaulted to `"html"`, which wrongly emitted `$.from_html`
/// (and a spurious whitespace text anchor) for a `{#snippet}` of adjacent
/// component/render anchors inside `<svg>` (issue #1227).
fn infer_namespace_from_children(
    nodes: &[crate::ast::template::TemplateNode],
    inherited: &str,
) -> String {
    let mut ns = NsScan::Keep;
    for node in nodes {
        // The per-node "stop" (return value) only halts the walk *within* one
        // top-level node — upstream's outer loop keeps scanning siblings and
        // only bails once the namespace resolves to `html`.
        scan_node_for_namespace(node, &mut ns);
        if ns == NsScan::Html {
            break;
        }
    }

    match ns {
        NsScan::Html => "html".to_string(),
        NsScan::Svg => "svg".to_string(),
        NsScan::Mathml => "mathml".to_string(),
        // `keep` / `maybe_html` → inherit the surrounding namespace.
        NsScan::Keep | NsScan::MaybeHtml => inherited.to_string(),
    }
}

/// Apply the element-namespace rule from upstream's `RegularElement` /
/// `SvelteElement` walk visitors. Returns `true` to stop the walk (upstream's
/// `stop()`): the first element reached determines the namespace.
fn apply_element_namespace(svg: bool, mathml: bool, ns: &mut NsScan) -> bool {
    if !svg && !mathml {
        *ns = NsScan::Html;
    } else if *ns == NsScan::Keep {
        *ns = if svg { NsScan::Svg } else { NsScan::Mathml };
    }
    true
}

/// Recursive walk mirroring upstream `check_nodes_for_namespace()`'s zimmerframe
/// traversal. Returns `true` when the walk should stop (an element was found).
fn scan_node_for_namespace(node: &crate::ast::template::TemplateNode, ns: &mut NsScan) -> bool {
    use crate::ast::template::TemplateNode;

    match node {
        TemplateNode::RegularElement(e) => {
            apply_element_namespace(e.metadata.svg, e.metadata.mathml, ns)
        }
        TemplateNode::SvelteElement(e) => {
            apply_element_namespace(e.metadata.svg, e.metadata.mathml, ns)
        }
        TemplateNode::Text(t) => {
            if !t.data.trim().is_empty() {
                *ns = NsScan::MaybeHtml;
            }
            false
        }
        TemplateNode::IfBlock(b) => {
            scan_nodes_for_namespace(&b.consequent.nodes, ns)
                || b.alternate
                    .as_ref()
                    .is_some_and(|f| scan_nodes_for_namespace(&f.nodes, ns))
        }
        TemplateNode::EachBlock(b) => {
            scan_nodes_for_namespace(&b.body.nodes, ns)
                || b.fallback
                    .as_ref()
                    .is_some_and(|f| scan_nodes_for_namespace(&f.nodes, ns))
        }
        TemplateNode::AwaitBlock(b) => {
            b.pending
                .as_ref()
                .is_some_and(|f| scan_nodes_for_namespace(&f.nodes, ns))
                || b.then
                    .as_ref()
                    .is_some_and(|f| scan_nodes_for_namespace(&f.nodes, ns))
                || b.catch
                    .as_ref()
                    .is_some_and(|f| scan_nodes_for_namespace(&f.nodes, ns))
        }
        TemplateNode::KeyBlock(b) => scan_nodes_for_namespace(&b.fragment.nodes, ns),
        // Components, render tags, nested snippets, expression tags, etc. are
        // not descended — they reset the namespace on their own.
        _ => false,
    }
}

/// Walk a node list, stopping early when a child requests a stop.
fn scan_nodes_for_namespace(nodes: &[crate::ast::template::TemplateNode], ns: &mut NsScan) -> bool {
    for node in nodes {
        if scan_node_for_namespace(node, ns) {
            return true;
        }
    }
    false
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
        use crate::ast::arena::with_serialize_arena;
        use crate::{ParseOptions, parse};
        let input = r#"{#snippet one(a, b = 1, c = (2, 3))}
  {a}{b}{c}
{/snippet}
{@render one(0)}"#;
        let result = parse(input, ParseOptions::default()).unwrap();
        let json = with_serialize_arena(&result.arena, || {
            serde_json::to_string_pretty(&result).unwrap()
        });
        assert!(
            json.contains("AssignmentPattern"),
            "Parser should produce AssignmentPattern for default params"
        );
    }
}
