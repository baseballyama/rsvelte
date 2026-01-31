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
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::shared::declarations::get_value;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_expression;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr;

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

    // Parse the declaration to get the id and init
    let (id_name, init_expr, is_identifier) = match parse_variable_declaration(declaration) {
        Some(result) => result,
        None => {
            // If we can't parse the declaration, skip it
            return;
        }
    };

    if is_identifier {
        // Simple identifier case: `{@const doubled = value * 2}`
        // Convert the init expression to JS AST
        let converted_init = convert_expression(&init_expr, context);

        // Build the expression with transforms applied
        let expr_metadata = ExpressionMetadata::from_template_metadata(&node.metadata.expression);
        let built_expr = build_expression(context, &converted_init, &expr_metadata);

        // Create derived expression
        // In legacy mode: $.derived_safe_equal(() => expr)
        // In runes mode: $.derived(() => expr)
        let derived_expr =
            create_derived(context, built_expr, node.metadata.expression.has_await());

        // Register a transform for this identifier so reads become $.get(id)
        context.state.transform.insert(
            id_name.clone(),
            IdentifierTransform {
                read: Some(get_value),
                assign: None,
                mutate: None,
                update: None,
                skip_proxy: false,
                is_defined: false,
                // @const creates a derived value that needs reactive tracking
                is_reactive: true,
            },
        );

        // Add the const declaration to state.consts
        // This will be output as: const doubled = $.derived_safe_equal(() => ...)
        add_const_declaration(context, &id_name, derived_expr, &node.metadata.expression);
    }
    // Destructuring pattern case: `{@const { x, y } = point}`
    //
    // NOTE: Destructuring in @const is more complex and requires a different approach
    // for the transform functions (they need to capture state, but Rust function pointers
    // cannot capture state). For now, we skip this case.
    //
    // TODO: Implement destructuring @const support. This would require either:
    // 1. Changing IdentifierTransform to use Box<dyn Fn> instead of fn pointers
    // 2. Or storing the temp variable name in a different way
}

/// Create a derived expression.
///
/// In legacy mode: `$.derived_safe_equal(() => expr)`
/// In runes mode: `$.derived(() => expr)`
fn create_derived(context: &ComponentContext, expression: JsExpr, is_async: bool) -> JsExpr {
    let thunk = if is_async {
        b::async_thunk(expression)
    } else {
        b::thunk(expression)
    };

    if is_async {
        b::svelte_call("async_derived", vec![thunk])
    } else if context.state.analysis.runes {
        b::svelte_call("derived", vec![thunk])
    } else {
        b::svelte_call("derived_safe_equal", vec![thunk])
    }
}

/// Add a const declaration to the state.
///
/// This adds the declaration to `context.state.consts` which will be
/// output at the beginning of the block.
fn add_const_declaration(
    context: &mut ComponentContext,
    id_name: &str,
    expression: JsExpr,
    metadata: &crate::ast::template::ExpressionMetadata,
) {
    let has_await = metadata.has_await();
    let has_blockers = metadata.has_blockers();

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
        context.state.consts.push(b::let_decl(id_name, None));

        // Create assignment expression
        let assignment = b::assign(b::id(id_name), expression);

        // Add thunk to async_consts
        if has_await {
            async_consts.thunks.push(b::async_thunk(assignment));
        } else {
            async_consts.thunks.push(b::thunk(assignment));
        }
    } else {
        // Simple case: just add const declaration
        context
            .state
            .consts
            .push(b::const_decl(id_name, expression));
    }
}

/// Parse a VariableDeclaration or AssignmentExpression from an Expression to extract the id and init.
///
/// Returns (id_name, init_expression, is_identifier) where is_identifier is true
/// if the id is a simple identifier (not destructuring).
///
/// This handles two formats:
/// 1. VariableDeclaration (official Svelte parser format):
///    `{ type: "VariableDeclaration", declarations: [{ id, init }] }`
/// 2. AssignmentExpression (our Rust parser format):
///    `{ type: "AssignmentExpression", left: id, right: init }`
fn parse_variable_declaration(expr: &Expression) -> Option<(String, Expression, bool)> {
    match expr {
        Expression::Value(json_value) => {
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
                        Some((name, init_expr, true))
                    } else {
                        // Destructuring pattern
                        let init_expr = Expression::Value(init.clone());
                        Some(("".to_string(), init_expr, false))
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
                        Some((name, init_expr, true))
                    } else {
                        // Destructuring pattern
                        let init_expr = Expression::Value(right.clone());
                        Some(("".to_string(), init_expr, false))
                    }
                }
                _ => None,
            }
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
        let (name, _init, is_identifier) = result.unwrap();
        assert_eq!(name, "doubled");
        assert!(is_identifier);
    }
}
