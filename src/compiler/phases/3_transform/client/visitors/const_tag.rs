//! ConstTag visitor for client-side transformation.
//!
//! Corresponds to `ConstTag` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/ConstTag.js`.
//!
//! The ConstTag visitor handles `{@const}` declarations inside blocks like
//! `{#if}`, `{#each}`, `{#await}`, etc. It creates derived values that track
//! their dependencies and update reactively.

use crate::ast::js::Expression;
use crate::ast::template::ConstTag;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::{
    convert_expression, convert_param_pattern,
};
use crate::compiler::phases::phase3_transform::client::visitors::shared::declarations::get_value;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_expression;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Visit a const tag.
///
/// Generates code for `{@const}` declarations. These are transformed into
/// derived values that track their dependencies.
///
/// # Arguments
///
/// * `node` - The const tag node
/// * `context` - The component transformation context
///
/// # Generated Code
///
/// For a simple identifier declaration like `{@const doubled = value * 2}`:
///
/// ```javascript
/// const doubled = $.derived_safe_equal(() => value * 2);
/// ```
///
/// For destructuring patterns like `{@const { x, y } = point}`:
///
/// ```javascript
/// const computed_const = $.derived_safe_equal(() => {
///     const { x, y } = point;
///     return { x, y };
/// });
/// ```
///
/// And identifiers are transformed to read from the computed value:
/// - `x` -> `$.get(computed_const).x`
pub fn const_tag(node: &ConstTag, context: &mut ComponentContext) {
    // The declaration is stored as an Expression containing a VariableDeclaration
    // We need to extract the declarators from it
    let declaration = &node.declaration;

    // Parse the declaration to get the id pattern, init, and whether it's a simple identifier
    let parsed = match parse_variable_declaration(declaration) {
        Some(result) => result,
        None => {
            // If we can't parse the declaration, skip it
            return;
        }
    };

    if parsed.is_identifier {
        // Simple identifier case: `{@const doubled = value * 2}`
        let id_name = parsed.id_name;

        // Guard against empty name (parser failed to parse complex pattern)
        if id_name.is_empty() {
            return;
        }

        // Convert the init expression to JS AST
        let converted_init = convert_expression(&parsed.init_expr, context);

        // Build the expression with transforms applied
        let expr_metadata = ExpressionMetadata::from_template_metadata(&node.metadata.expression);
        let built_expr = build_expression(context, &converted_init, &expr_metadata);

        // Create derived expression
        // In legacy mode: $.derived_safe_equal(() => expr)
        // In runes mode: $.derived(() => expr)
        let mut derived_expr =
            create_derived(context, built_expr, node.metadata.expression.has_await());

        // In dev mode, wrap with $.tag(expression, name)
        // Reference: ConstTag.js lines 24-26
        if context.state.options.dev {
            derived_expr = b::call(
                &context.arena,
                b::member(&context.arena, b::id("$"), "tag"),
                vec![derived_expr, b::string(&id_name)],
            );
        }

        // Register a transform for this identifier so reads become $.get(id)
        context.state.transform.insert(
            id_name.clone(),
            IdentifierTransform {
                read: Some(get_value),
                read_source: None,
                assign: None,
                mutate: None,
                update: None,
                skip_proxy: false,
                is_defined: false,
                is_reactive: true,
                replacement_id: None,
            },
        );

        // Extract referenced variable names from init expression for blocker detection
        let init_refs = extract_refs_from_json_expr(&parsed.init_expr);

        // Add the const declaration to state.consts
        // This will be output as: const doubled = $.derived_safe_equal(() => ...)
        add_const_declaration(
            context,
            &id_name,
            derived_expr,
            &node.metadata.expression,
            &init_refs,
        );
    } else {
        // Destructuring pattern case: `{@const { x, y } = point}`
        //
        // Following the official Svelte compiler (ConstTag.js lines 38-86):
        // 1. Extract identifiers from the destructuring pattern
        // 2. Generate a unique temp variable (computed_const)
        // 3. Create a child state where destructured identifiers have no transform
        //    (they are not signals inside the derived computation)
        // 4. Build: computed_const = $.derived_safe_equal(() => {
        //        const { x, y } = init;
        //        return { x, y };
        //    })
        // 5. Register read transforms: x -> $.get(computed_const).x

        let pattern_json = match &parsed.pattern_json {
            Some(json) => json.clone(),
            None => return,
        };

        // Extract all identifiers from the destructuring pattern
        let identifiers = extract_identifiers_from_pattern(&pattern_json);
        if identifiers.is_empty() {
            return;
        }

        // Generate a unique temp variable name
        let tmp_name = context.state.memoizer.generate_id("computed_const");

        // Create a child transform map where all destructured identifiers have
        // no transform (they are regular variables inside the derived computation,
        // not signals yet)
        let mut child_transform = context.state.transform.clone();
        for id_name in &identifiers {
            child_transform.remove(id_name);
        }

        // Save the original transform and temporarily swap in the child transform
        let original_transform = std::mem::replace(&mut context.state.transform, child_transform);

        // Convert and build the init expression with the child state
        let converted_init = convert_expression(&parsed.init_expr, context);
        let expr_metadata = ExpressionMetadata::from_template_metadata(&node.metadata.expression);

        let built_init = build_expression(context, &converted_init, &expr_metadata);

        // Restore the original transform
        context.state.transform = original_transform;

        // Convert the destructuring pattern to JsPattern
        let pattern = convert_param_pattern(&pattern_json, context);

        // Build the block body:
        // const { x, y } = init;
        // return { x, y };
        //
        // When async, apply save wrapping to the init expression so that
        // `await X` becomes `(await $.save(X))()` within the async arrow body.
        // We use non-tail position because the expression is in a const declaration,
        // not in the return expression, so await expressions need $.save() wrapping.
        let is_async = node.metadata.expression.has_await();
        let init_for_const = if is_async {
            b::apply_save_wrapping_non_tail(&context.arena, built_init)
        } else {
            built_init
        };
        let const_stmt = if let Some(pat) = pattern {
            b::var_decl_pattern(
                &context.arena,
                JsVariableKind::Const,
                pat,
                Some(init_for_const.clone()),
            )
        } else {
            // Fallback: generate raw destructuring statement
            let pattern_str = render_pattern_as_string(&pattern_json);
            let init_str =
                crate::compiler::phases::phase3_transform::js_ast::codegen::generate_expr(
                    &init_for_const,
                    &context.arena,
                );
            JsStatement::Raw(format!("const {} = {};", pattern_str, init_str).into())
        };

        // Create the return object: { x, y }
        // Using shorthand properties: prop("x", id("x")) which auto-detects shorthand
        let return_props: Vec<JsObjectMember> = identifiers
            .iter()
            .map(|name| b::prop(&context.arena, name.clone(), b::id(name)))
            .collect();
        let return_obj = b::object(return_props);
        let return_stmt = b::return_stmt(&context.arena, Some(return_obj));

        // Create the block expression as a thunk with block body: () => { const {...} = init; return {...}; }
        // We use thunk_block directly instead of create_derived + arrow_block to avoid
        // double wrapping (create_derived already wraps in thunk)
        let block_thunk = if is_async {
            // When the body contains await expressions, the thunk must be async:
            // async () => { const { x, y } = (await $.save(...))(); return { x, y }; }
            b::async_arrow_block(vec![], vec![const_stmt, return_stmt])
        } else {
            b::thunk_block(vec![const_stmt, return_stmt])
        };

        // Create derived expression wrapping the block thunk
        let mut derived_expr = if is_async {
            // Wrap with save(): (await $.save($.async_derived(thunk)))()
            b::save(
                &context.arena,
                b::svelte_call(&context.arena, "async_derived", vec![block_thunk]),
            )
        } else if context.state.analysis.runes {
            b::svelte_call(&context.arena, "derived", vec![block_thunk])
        } else {
            b::svelte_call(&context.arena, "derived_safe_equal", vec![block_thunk])
        };

        // In dev mode, wrap with $.tag(expression, '[@const]')
        // Reference: ConstTag.js lines 69-71
        if context.state.options.dev {
            derived_expr = b::call(
                &context.arena,
                b::member(&context.arena, b::id("$"), "tag"),
                vec![derived_expr, b::string("[@const]")],
            );
        }

        // Extract referenced variable names from init expression for blocker detection
        let init_refs = extract_refs_from_json_expr(&parsed.init_expr);

        // Add the const declaration for the temp variable
        add_const_declaration(
            context,
            &tmp_name,
            derived_expr,
            &node.metadata.expression,
            &init_refs,
        );

        // Register read transforms for each destructured identifier:
        // x -> $.get(computed_const).x
        for id_name in &identifiers {
            context.state.transform.insert(
                id_name.clone(),
                IdentifierTransform {
                    read: None,
                    read_source: Some(tmp_name.clone()),
                    assign: None,
                    mutate: None,
                    update: None,
                    skip_proxy: false,
                    is_defined: false,
                    is_reactive: true,
                    replacement_id: None,
                },
            );
        }
    }
}

/// Extract all identifier names from a destructuring pattern JSON.
///
/// Handles ObjectPattern, ArrayPattern, RestElement, and AssignmentPattern.
fn extract_identifiers_from_pattern(pattern: &serde_json::Value) -> Vec<String> {
    let mut identifiers = Vec::new();
    collect_identifiers(pattern, &mut identifiers);
    identifiers
}

fn collect_identifiers(pattern: &serde_json::Value, out: &mut Vec<String>) {
    let pat_type = pattern.get("type").and_then(|v| v.as_str());
    match pat_type {
        Some("Identifier") => {
            if let Some(name) = pattern.get("name").and_then(|v| v.as_str()) {
                out.push(name.to_string());
            }
        }
        // Handle both ObjectPattern (official AST) and ObjectExpression (our parser's AST)
        Some("ObjectPattern") | Some("ObjectExpression") => {
            if let Some(properties) = pattern.get("properties").and_then(|v| v.as_array()) {
                for prop in properties {
                    let prop_type = prop.get("type").and_then(|v| v.as_str());
                    if prop_type == Some("RestElement") || prop_type == Some("SpreadElement") {
                        if let Some(arg) = prop.get("argument") {
                            collect_identifiers(arg, out);
                        }
                    } else if let Some(value) = prop.get("value") {
                        collect_identifiers(value, out);
                    }
                }
            }
        }
        // Handle both ArrayPattern (official AST) and ArrayExpression (our parser's AST)
        Some("ArrayPattern") | Some("ArrayExpression") => {
            if let Some(elements) = pattern.get("elements").and_then(|v| v.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        collect_identifiers(elem, out);
                    }
                }
            }
        }
        Some("RestElement") | Some("SpreadElement") => {
            if let Some(arg) = pattern.get("argument") {
                collect_identifiers(arg, out);
            }
        }
        Some("AssignmentPattern") | Some("AssignmentExpression") => {
            if let Some(left) = pattern.get("left") {
                collect_identifiers(left, out);
            }
        }
        _ => {}
    }
}

/// Render a pattern JSON as a string for raw output fallback.
fn render_pattern_as_string(pattern: &serde_json::Value) -> String {
    let pat_type = pattern.get("type").and_then(|v| v.as_str());
    match pat_type {
        Some("Identifier") => pattern
            .get("name")
            .and_then(|v| v.as_str())
            .unwrap_or("_")
            .to_string(),
        Some("ObjectPattern") | Some("ObjectExpression") => {
            let props: Vec<String> = pattern
                .get("properties")
                .and_then(|v| v.as_array())
                .map(|props| {
                    props
                        .iter()
                        .map(|prop| {
                            let prop_type = prop.get("type").and_then(|v| v.as_str());
                            if prop_type == Some("RestElement") {
                                let arg = prop
                                    .get("argument")
                                    .map(render_pattern_as_string)
                                    .unwrap_or_default();
                                format!("...{}", arg)
                            } else {
                                let key = prop
                                    .get("key")
                                    .and_then(|k| k.get("name"))
                                    .and_then(|n| n.as_str())
                                    .unwrap_or("_");
                                let value = prop.get("value").map(render_pattern_as_string);
                                let shorthand = prop
                                    .get("shorthand")
                                    .and_then(|s| s.as_bool())
                                    .unwrap_or(false);
                                if shorthand || value.as_deref() == Some(key) {
                                    key.to_string()
                                } else if let Some(val) = value {
                                    format!("{}: {}", key, val)
                                } else {
                                    key.to_string()
                                }
                            }
                        })
                        .collect()
                })
                .unwrap_or_default();
            format!("{{ {} }}", props.join(", "))
        }
        Some("ArrayPattern") | Some("ArrayExpression") => {
            let elems: Vec<String> = pattern
                .get("elements")
                .and_then(|v| v.as_array())
                .map(|elems| {
                    elems
                        .iter()
                        .map(|elem| {
                            if elem.is_null() {
                                String::new()
                            } else {
                                render_pattern_as_string(elem)
                            }
                        })
                        .collect()
                })
                .unwrap_or_default();
            format!("[{}]", elems.join(", "))
        }
        Some("RestElement") => {
            let arg = pattern
                .get("argument")
                .map(render_pattern_as_string)
                .unwrap_or_default();
            format!("...{}", arg)
        }
        Some("AssignmentPattern") => {
            // We don't render defaults in the const destructuring pattern
            pattern
                .get("left")
                .map(render_pattern_as_string)
                .unwrap_or_default()
        }
        _ => "_".to_string(),
    }
}

/// Extract all identifier references from a JSON expression.
///
/// This walks the JSON AST of the init expression to find all Identifier nodes.
/// Used to determine which variables are referenced by a `{@const}` init expression,
/// which is needed for blocker detection (checking const_blocker_map).
fn extract_refs_from_json_expr(expr: &crate::ast::js::Expression) -> Vec<String> {
    let value = expr.as_json();
    let mut refs = Vec::new();
    collect_json_identifiers(&value, &mut refs);
    refs
}

fn collect_json_identifiers(value: &serde_json::Value, out: &mut Vec<String>) {
    match value {
        serde_json::Value::Object(obj) => {
            if let Some(typ) = obj.get("type").and_then(|t| t.as_str()) {
                if typ == "Identifier" {
                    if let Some(name) = obj.get("name").and_then(|n| n.as_str())
                        && !out.contains(&name.to_string())
                    {
                        out.push(name.to_string());
                    }
                    return;
                }
                // Don't recurse into function/arrow bodies
                if typ == "ArrowFunctionExpression" || typ == "FunctionExpression" {
                    return;
                }
            }
            for (key, val) in obj {
                // Skip position/metadata fields
                if key == "start" || key == "end" || key == "loc" || key == "type" {
                    continue;
                }
                collect_json_identifiers(val, out);
            }
        }
        serde_json::Value::Array(arr) => {
            for val in arr {
                collect_json_identifiers(val, out);
            }
        }
        _ => {}
    }
}

/// Create a derived expression.
///
/// In legacy mode: `$.derived_safe_equal(() => expr)`
/// In runes mode: `$.derived(() => expr)`
fn create_derived(context: &ComponentContext, expression: JsExpr, is_async: bool) -> JsExpr {
    let thunk = if is_async {
        // For ConstTag, ALL awaits must be save-wrapped (non-tail position)
        // because is_last_evaluated_expression returns false for ConstTag parent.
        // Use apply_save_wrapping_non_tail instead of async_thunk's apply_save_wrapping.
        let saved_expr = b::apply_save_wrapping_non_tail(&context.arena, expression);
        b::unthunk(
            &context.arena,
            b::async_arrow(&context.arena, vec![], saved_expr),
        )
    } else {
        b::thunk(&context.arena, expression)
    };

    if is_async {
        // Wrap with save(): (await $.save($.async_derived(thunk)))()
        // Matches official: save(b.call('$.async_derived', thunk))
        b::save(
            &context.arena,
            b::svelte_call(&context.arena, "async_derived", vec![thunk]),
        )
    } else if context.state.analysis.runes {
        b::svelte_call(&context.arena, "derived", vec![thunk])
    } else {
        b::svelte_call(&context.arena, "derived_safe_equal", vec![thunk])
    }
}

/// Add a const declaration to the state.
///
/// This adds the declaration to `context.state.consts` which will be
/// output at the beginning of the block.
///
/// Mirrors the official Svelte compiler's `add_const_declaration` in ConstTag.js.
/// When the expression has async dependencies (awaits or blockers from other async
/// const declarations), this creates an async run group with wait thunks and registers
/// the resulting binding's blocker for future const tags.
fn add_const_declaration(
    context: &mut ComponentContext,
    id_name: &str,
    expression: JsExpr,
    metadata: &crate::ast::template::ExpressionMetadata,
    init_refs: &[String],
) {
    let has_await = metadata.has_await();

    // Collect blockers from const_blocker_map for identifiers referenced in the init expression.
    // This mirrors the official compiler's:
    //   const blockers = [...metadata.dependencies].map(dep => dep.blocker)
    //       .filter(b => b !== null && b.object !== state.async_consts?.id);
    //
    // We use init_refs (identifiers extracted from the raw init expression JSON) to look up
    // in const_blocker_map, since the generated JS expression wraps identifiers in arrow functions
    // that collect_identifiers_from_expr won't cross.
    let blockers = {
        let const_blocker_map = context.state.const_blocker_map.borrow();
        let current_async_consts_id =
            context
                .state
                .async_consts
                .as_ref()
                .and_then(|ac| match &ac.id {
                    JsExpr::Identifier(name) => Some(name.clone()),
                    _ => None,
                });

        let mut blocker_list: Vec<JsExpr> = Vec::new();
        // Deduplicate by pointer identity from the map (same map entry = same expression).
        let mut seen_ptrs: Vec<*const JsExpr> = Vec::new();

        for name in init_refs {
            if let Some(blocker_expr) = const_blocker_map.get(name) {
                let ptr = blocker_expr as *const JsExpr;
                if seen_ptrs.contains(&ptr) {
                    continue;
                }
                // Filter out blockers that point to the current async_consts group
                // (matching official: b.object !== state.async_consts?.id)
                let should_include = match blocker_expr {
                    JsExpr::Member(member_expr) => match context.arena.get_expr(member_expr.object)
                    {
                        JsExpr::Identifier(obj_name) => {
                            current_async_consts_id.as_deref() != Some(obj_name.as_str())
                        }
                        _ => true,
                    },
                    _ => true,
                };
                if should_include {
                    seen_ptrs.push(ptr);
                    blocker_list.push(blocker_expr.clone());
                }
            }
        }
        blocker_list
    };

    let has_blockers = !blockers.is_empty();

    if has_await || context.state.async_consts.is_some() || has_blockers {
        // Async case: need to handle async consts
        let async_consts = context.state.async_consts.get_or_insert_with(|| {
            let id_name = context.state.memoizer.generate_id("promises");
            AsyncConsts {
                id: b::id(&id_name),
                thunks: Vec::new(),
            }
        });

        // Add let declaration
        context
            .state
            .consts
            .push(b::let_decl(&context.arena, id_name, None));

        // Add blocker wait thunks before the assignment thunk.
        // Official: if (blockers.length === 1) run.thunks.push(b.thunk(b.member(blockers[0], 'promise')))
        //           else if (blockers.length > 0) run.thunks.push(b.thunk(b.call('$.wait', b.array(blockers))))
        if blockers.len() == 1 {
            // Single blocker: () => blocker.promise
            let blocker_promise = b::member(
                &context.arena,
                blockers.into_iter().next().unwrap(),
                "promise",
            );
            async_consts
                .thunks
                .push(b::thunk(&context.arena, blocker_promise));
        } else if blockers.len() > 1 {
            // Multiple blockers: () => $.wait([blocker1, blocker2])
            async_consts.thunks.push(b::thunk(
                &context.arena,
                b::svelte_call(&context.arena, "wait", vec![b::array(blockers)]),
            ));
        }

        // Create assignment expression
        let assignment = b::assign(&context.arena, b::id(id_name), expression);

        // Add thunk to async_consts
        // Note: We use a plain async arrow (not async_thunk) because the expression
        // from create_derived already has $.save() wrapping applied internally.
        // Using async_thunk would apply save wrapping again, causing double-save.
        if has_await {
            async_consts
                .thunks
                .push(b::async_arrow(&context.arena, vec![], assignment));
        } else {
            async_consts
                .thunks
                .push(b::thunk(&context.arena, assignment));
        }

        // Register the blocker for this binding in const_blocker_map.
        // Official: const blocker = b.member(run.id, b.literal(run.thunks.length - 1), true);
        //           for (const binding of bindings) { binding.blocker = blocker; }
        let thunk_index = async_consts.thunks.len() - 1;
        let async_consts_id = async_consts.id.clone();
        let blocker_expr = b::member_computed(
            &context.arena,
            async_consts_id,
            b::number(thunk_index as f64),
        );
        context
            .state
            .const_blocker_map
            .borrow_mut()
            .insert(id_name.to_string(), blocker_expr);
    } else {
        // Simple case: just add const declaration
        context
            .state
            .consts
            .push(b::const_decl(&context.arena, id_name, expression));

        // In dev mode, add an eager $.get(id) call after the const declaration.
        // This ensures "Cannot access x before initialization" errors are hit immediately.
        // Reference: ConstTag.js line 99
        if context.state.options.dev {
            context.state.consts.push(b::stmt(
                &context.arena,
                b::svelte_call(&context.arena, "get", vec![b::id(id_name)]),
            ));
        }
    }
}

/// Parsed variable declaration result.
struct ParsedDeclaration {
    /// The identifier name (empty for destructuring patterns)
    id_name: String,
    /// The initializer expression
    init_expr: Expression,
    /// Whether the id is a simple identifier (true) or destructuring pattern (false)
    is_identifier: bool,
    /// The raw JSON pattern for destructuring (None for simple identifiers)
    pattern_json: Option<serde_json::Value>,
}

/// Parse a VariableDeclaration or AssignmentExpression from an Expression to extract the id and init.
///
/// This handles two formats:
/// 1. VariableDeclaration (official Svelte parser format):
///    `{ type: "VariableDeclaration", declarations: [{ id, init }] }`
/// 2. AssignmentExpression (our Rust parser format):
///    `{ type: "AssignmentExpression", left: id, right: init }`
fn parse_variable_declaration(expr: &Expression) -> Option<ParsedDeclaration> {
    {
        let json_value = expr.as_json();
        let obj = json_value.as_object()?;
        let expr_type = obj.get("type")?.as_str()?;

        match expr_type {
            "VariableDeclaration" => {
                let declarations = obj.get("declarations")?.as_array()?;
                if declarations.is_empty() {
                    return None;
                }

                let first_decl = declarations[0].as_object()?;
                let id = first_decl.get("id")?;
                let init = first_decl.get("init")?;

                let id_obj = id.as_object()?;
                let id_type = id_obj.get("type")?.as_str()?;

                if id_type == "Identifier" {
                    let name = id_obj.get("name")?.as_str()?.to_string();
                    let init_expr = Expression::Value(init.clone());
                    Some(ParsedDeclaration {
                        id_name: name,
                        init_expr,
                        is_identifier: true,
                        pattern_json: None,
                    })
                } else {
                    // Destructuring pattern
                    let init_expr = Expression::Value(init.clone());
                    Some(ParsedDeclaration {
                        id_name: String::new(),
                        init_expr,
                        is_identifier: false,
                        pattern_json: Some(id.clone()),
                    })
                }
            }
            "AssignmentExpression" => {
                // Our Rust parser format: { type: "AssignmentExpression", left: id, right: init }
                let left = obj.get("left")?;
                let right = obj.get("right")?;

                let left_obj = left.as_object()?;
                let left_type = left_obj.get("type")?.as_str()?;

                if left_type == "Identifier" {
                    let name = left_obj.get("name")?.as_str()?.to_string();
                    let init_expr = Expression::Value(right.clone());
                    Some(ParsedDeclaration {
                        id_name: name,
                        init_expr,
                        is_identifier: true,
                        pattern_json: None,
                    })
                } else {
                    // Destructuring pattern
                    let init_expr = Expression::Value(right.clone());
                    Some(ParsedDeclaration {
                        id_name: String::new(),
                        init_expr,
                        is_identifier: false,
                        pattern_json: Some(left.clone()),
                    })
                }
            }
            _ => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_variable_declaration_identifier() {
        let json = serde_json::json!({
            "type": "VariableDeclaration",
            "declarations": [{
                "type": "VariableDeclarator",
                "id": { "type": "Identifier", "name": "doubled" },
                "init": {
                    "type": "BinaryExpression",
                    "operator": "*",
                    "left": { "type": "Identifier", "name": "value" },
                    "right": { "type": "Literal", "value": 2 }
                }
            }]
        });

        let expr = Expression::Value(json);
        let result = parse_variable_declaration(&expr);

        assert!(result.is_some());
        let parsed = result.unwrap();
        assert_eq!(parsed.id_name, "doubled");
        assert!(parsed.is_identifier);
        assert!(parsed.pattern_json.is_none());
    }

    #[test]
    fn test_parse_variable_declaration_destructuring() {
        let json = serde_json::json!({
            "type": "VariableDeclaration",
            "declarations": [{
                "type": "VariableDeclarator",
                "id": {
                    "type": "ObjectPattern",
                    "properties": [{
                        "type": "Property",
                        "key": { "type": "Identifier", "name": "x" },
                        "value": { "type": "Identifier", "name": "x" },
                        "shorthand": true
                    }, {
                        "type": "Property",
                        "key": { "type": "Identifier", "name": "y" },
                        "value": { "type": "Identifier", "name": "y" },
                        "shorthand": true
                    }]
                },
                "init": { "type": "Identifier", "name": "point" }
            }]
        });

        let expr = Expression::Value(json);
        let result = parse_variable_declaration(&expr);

        assert!(result.is_some());
        let parsed = result.unwrap();
        assert!(!parsed.is_identifier);
        assert!(parsed.pattern_json.is_some());
    }

    #[test]
    fn test_extract_identifiers_object_pattern() {
        let pattern = serde_json::json!({
            "type": "ObjectPattern",
            "properties": [{
                "type": "Property",
                "key": { "type": "Identifier", "name": "x" },
                "value": { "type": "Identifier", "name": "x" },
                "shorthand": true
            }, {
                "type": "Property",
                "key": { "type": "Identifier", "name": "y" },
                "value": { "type": "Identifier", "name": "y" },
                "shorthand": true
            }]
        });

        let identifiers = extract_identifiers_from_pattern(&pattern);
        assert_eq!(identifiers, vec!["x", "y"]);
    }

    #[test]
    fn test_extract_identifiers_array_pattern() {
        let pattern = serde_json::json!({
            "type": "ArrayPattern",
            "elements": [
                { "type": "Identifier", "name": "a" },
                { "type": "Identifier", "name": "b" }
            ]
        });

        let identifiers = extract_identifiers_from_pattern(&pattern);
        assert_eq!(identifiers, vec!["a", "b"]);
    }

    #[test]
    fn test_extract_identifiers_nested() {
        let pattern = serde_json::json!({
            "type": "ObjectPattern",
            "properties": [{
                "type": "Property",
                "key": { "type": "Identifier", "name": "a" },
                "value": {
                    "type": "ObjectPattern",
                    "properties": [{
                        "type": "Property",
                        "key": { "type": "Identifier", "name": "b" },
                        "value": { "type": "Identifier", "name": "b" },
                        "shorthand": true
                    }]
                }
            }]
        });

        let identifiers = extract_identifiers_from_pattern(&pattern);
        assert_eq!(identifiers, vec!["b"]);
    }
}
