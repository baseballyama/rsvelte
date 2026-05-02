//! Assignment expression visitor for client-side transformation.
//!
//! Corresponds to `AssignmentExpression` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/AssignmentExpression.js`.

use super::shared::assignment_helpers::*;
use super::shared::utils::{apply_transforms_to_expression, validate_mutation};
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use crate::compiler::phases::phase3_transform::shared::assignments::visit_assignment_expression;

/// Check if operator is non-coercive (=, ||=, &&=, ??=).
fn is_non_coercive_operator(operator: &str) -> bool {
    matches!(operator, "=" | "||=" | "&&=" | "??=")
}

/// Visit an assignment expression.
///
/// This visitor handles assignment expressions with special transformations for:
/// - State field assignments in class constructors
/// - Private state field assignments
/// - Store subscriptions
/// - Proxified state assignments
///
/// # Arguments
///
/// * `node` - The assignment expression node
/// * `context` - The component transformation context
///
/// # Returns
///
/// Returns the transformed expression with mutation validation applied.
pub fn assignment_expression(
    node: &JsAssignmentExpression,
    context: &mut ComponentContext,
) -> TransformResult {
    // Visit the assignment expression using the shared visitor
    let expression = visit_assignment_expression(node, context, build_assignment);

    // Apply mutation validation in dev mode
    let validated = validate_mutation(node, context, expression);

    TransformResult::Expression(validated)
}

/// Build an assignment with special handling for state and proxies.
///
/// This function handles various assignment scenarios:
/// 1. State field assignments in class constructors (with runes)
/// 2. Private state field assignments with `$.set()`
/// 3. Transformed assignments (store subscriptions, etc.)
/// 4. Proxified assignments in dev mode
///
/// # Arguments
///
/// * `operator` - The assignment operator (=, +=, ||=, etc.)
/// * `left` - The left-hand side pattern
/// * `right` - The right-hand side expression
/// * `context` - The component transformation context
///
/// # Returns
///
/// Returns the transformed expression, or None if no transformation is needed.
fn build_assignment(
    operator: &str,
    left: &JsExpr,
    right: &JsExpr,
    context: &mut ComponentContext,
) -> Option<JsExpr> {
    // Get the root identifier and transform if available
    let (object, transform) = get_assignment_root(left, context)?;

    // Case 1: Rune mode state field declaration
    // If in runes mode and left is a member expression with a state field declaration
    if context.state.analysis.runes
        && let JsExpr::Member(member) = left
    {
        let name = get_property_name(&member.property);
        if let Some(field_name) = &name
            && let Some(field) = context.state.state_fields.get(field_name)
        {
            // TODO: Check if this is the declaration site
            // TODO: Check if right side is a rune call
            // For now, skip this case
            let _ = field; // Suppress unused warning
        }

        // Case 2: Private field assignment
        if let JsMemberProperty::PrivateIdentifier(_) = member.property
            && let Some(field_name) = name
            && let Some(field) = context.state.state_fields.get(&field_name)
        {
            // Build the assignment value (expand compound operators)
            let value = build_assignment_value(&context.arena, operator, left, right);

            // Check if proxy is needed
            let needs_proxy = field.field_type == "$state"
                && is_non_coercive_operator(operator)
                && should_proxy_js_expr(right);

            // Call $.set() with optional proxy flag
            let mut args = vec![left.clone(), value];
            if needs_proxy {
                args.push(b::boolean(true));
            }

            return Some(b::call(&context.arena, b::id("$.set"), args));
        }
    }

    // Case 3: Reassignment (object === left)
    // If the root identifier is the same as the left side
    if is_same_identifier(&object, left)
        && let Some(t) = transform
        && let Some(assign_fn) = t.assign
    {
        // Build the assignment value (expand compound operators)
        let value = build_assignment_value(&context.arena, operator, left, right);

        // Determine if proxy is needed based on:
        // 1. Not skipped (not $state.raw)
        // 2. Binding kind doesn't exclude proxy (not Derived, Prop, etc.)
        // 3. In runes mode
        // 4. Non-coercive operator (=, ||=, &&=, ??=)
        // 5. Right side should be proxied (not a primitive)
        let skip_proxy = t.skip_proxy;

        // Check if the binding kind excludes proxy
        let binding_kind_excludes_proxy = if let JsExpr::Identifier(name) = &object {
            context
                .state
                .get_binding(name)
                .map(|b| {
                    matches!(
                        b.kind,
                        BindingKind::Prop
                            | BindingKind::BindableProp
                            | BindingKind::Derived
                            | BindingKind::StoreSub
                            | BindingKind::RawState
                    )
                })
                .unwrap_or(false)
        } else {
            false
        };

        let needs_proxy = !skip_proxy
            && !binding_kind_excludes_proxy
            && context.state.analysis.runes
            && is_non_coercive_operator(operator)
            && should_proxy_js_expr_with_context(right, context);

        return Some(assign_fn(
            &context.arena,
            object.clone(),
            value,
            needs_proxy,
        ));
    }

    // Case 4: Mutation (object !== left)
    // If the root identifier is different from the left side
    if let Some(t) = transform
        && let Some(mutate_fn) = t.mutate
    {
        // Build the mutation expression.
        // We must visit (transform) left and right so that reactive reads inside the
        // assignment get wrapped properly, e.g. `object[key] = []` becomes
        // `$.mutate(object, $.get(object)[key] = [])`.
        let visited_left = apply_transforms_to_expression(left, context);
        let visited_right = apply_transforms_to_expression(right, context);
        let mutation_expr = b::assign_op(&context.arena, operator, visited_left, visited_right);

        // Use replacement_id if set (e.g., reactive imports: global -> $$_import_global)
        let mutate_target = if let Some(ref replacement) = t.replacement_id {
            JsExpr::Identifier(replacement.clone().into())
        } else {
            object.clone()
        };

        return Some(mutate_fn(&context.arena, mutate_target, mutation_expr));
    }

    // Case 5: Proxified assignments in dev mode.
    //
    // The official compiler emits `$.assign(object, prop, value, loc)` for
    // member assignments in dev mode (so the runtime can attach the offending
    // source location to a TypeError when assigning to a frozen proxy). The
    // emit path here is intentionally not implemented yet — it requires
    // visiting the RHS first, and the parent-statement check that the
    // official compiler relies on is not yet wired through. Keeping a stub
    // that constructs values and discards them only added churn without
    // emitting code, so this case is now an explicit no-op until the
    // surrounding infrastructure lands.
    None
}

/// Get the root identifier and its transform from an assignment target.
///
/// Returns (root_identifier, transform) if the target contains a transformable identifier.
///
/// # Examples
///
/// ```ignore
/// // x = 1 -> (x, transform_for_x)
/// // x.y = 1 -> (x, transform_for_x)
/// // x[y] = 1 -> (x, transform_for_x)
/// // x?.y = 1 -> (x, transform_for_x)
/// ```
fn get_assignment_root<'a>(
    expr: &JsExpr,
    context: &'a ComponentContext,
) -> Option<(JsExpr, Option<&'a IdentifierTransform>)> {
    // Extract the root identifier by recursively walking the expression
    let root_name = extract_root_identifier(expr, &context.arena)?;

    // Look up the transform for this identifier
    let transform = context.state.transform.get(&root_name);

    // Return the root identifier as a JsExpr and its transform
    Some((JsExpr::Identifier(root_name.into()), transform))
}

/// Extract the root identifier name from an expression.
///
/// Recursively walks down member expressions, computed member expressions,
/// and optional chaining to find the leftmost identifier.
fn extract_root_identifier(
    expr: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> Option<String> {
    match expr {
        // Base case: identifier
        JsExpr::Identifier(name) => Some(name.to_string()),

        // Member expression: obj.prop or obj[prop]
        JsExpr::Member(member) => extract_root_identifier(arena.get_expr(member.object), arena),

        // Optional chaining: obj?.prop
        JsExpr::Chain(chain) => extract_root_identifier(arena.get_expr(chain.expression), arena),

        // Assignment to other expressions (literals, calls, etc.) doesn't have a root identifier
        _ => None,
    }
}

/// Check if two expressions refer to the same identifier.
fn is_same_identifier(a: &JsExpr, b: &JsExpr) -> bool {
    match (a, b) {
        (JsExpr::Identifier(name_a), JsExpr::Identifier(name_b)) => name_a == name_b,
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::phases::phase3_transform::js_ast::arena::JsArena;

    #[test]
    fn test_extract_root_identifier_simple() {
        let arena = JsArena::new();
        let expr = JsExpr::Identifier("x".into());
        let root = extract_root_identifier(&expr, &arena);
        assert_eq!(root, Some("x".to_string()));
    }

    #[test]
    fn test_extract_root_identifier_member() {
        let arena = JsArena::new();
        // x.y -> x
        let expr = JsExpr::Member(JsMemberExpression {
            object: arena.alloc_expr(JsExpr::Identifier("x".into())),
            property: JsMemberProperty::Identifier("y".into()),
            computed: false,
            optional: false,
        });
        let root = extract_root_identifier(&expr, &arena);
        assert_eq!(root, Some("x".to_string()));
    }

    #[test]
    fn test_extract_root_identifier_nested_member() {
        let arena = JsArena::new();
        // x.y.z -> x
        let inner = JsExpr::Member(JsMemberExpression {
            object: arena.alloc_expr(JsExpr::Identifier("x".into())),
            property: JsMemberProperty::Identifier("y".into()),
            computed: false,
            optional: false,
        });
        let expr = JsExpr::Member(JsMemberExpression {
            object: arena.alloc_expr(inner),
            property: JsMemberProperty::Identifier("z".into()),
            computed: false,
            optional: false,
        });
        let root = extract_root_identifier(&expr, &arena);
        assert_eq!(root, Some("x".to_string()));
    }

    #[test]
    fn test_extract_root_identifier_computed() {
        let arena = JsArena::new();
        // x[y] -> x
        let expr = JsExpr::Member(JsMemberExpression {
            object: arena.alloc_expr(JsExpr::Identifier("x".into())),
            property: JsMemberProperty::Expression(
                arena.alloc_expr(JsExpr::Identifier("y".into())),
            ),
            computed: true,
            optional: false,
        });
        let root = extract_root_identifier(&expr, &arena);
        assert_eq!(root, Some("x".to_string()));
    }

    #[test]
    fn test_extract_root_identifier_chain() {
        let arena = JsArena::new();
        // x?.y -> x
        let member = JsExpr::Member(JsMemberExpression {
            object: arena.alloc_expr(JsExpr::Identifier("x".into())),
            property: JsMemberProperty::Identifier("y".into()),
            computed: false,
            optional: true,
        });
        let expr = JsExpr::Chain(JsChainExpression {
            expression: arena.alloc_expr(member),
        });
        let root = extract_root_identifier(&expr, &arena);
        assert_eq!(root, Some("x".to_string()));
    }

    #[test]
    fn test_extract_root_identifier_non_identifier() {
        let arena = JsArena::new();
        // 42.toString() -> None (literal, not identifier)
        let expr = JsExpr::Member(JsMemberExpression {
            object: arena.alloc_expr(JsExpr::Literal(JsLiteral::Number(42.0))),
            property: JsMemberProperty::Identifier("toString".into()),
            computed: false,
            optional: false,
        });
        let root = extract_root_identifier(&expr, &arena);
        assert_eq!(root, None);
    }

    #[test]
    fn test_is_same_identifier_true() {
        let a = JsExpr::Identifier("x".into());
        let b = JsExpr::Identifier("x".into());
        assert!(is_same_identifier(&a, &b));
    }

    #[test]
    fn test_is_same_identifier_false() {
        let a = JsExpr::Identifier("x".into());
        let b = JsExpr::Identifier("y".into());
        assert!(!is_same_identifier(&a, &b));
    }

    #[test]
    fn test_is_same_identifier_non_identifier() {
        let a = JsExpr::Identifier("x".into());
        let b = JsExpr::Literal(JsLiteral::Number(42.0));
        assert!(!is_same_identifier(&a, &b));
    }
}
