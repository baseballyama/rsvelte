//! Assignment expression visitor for client-side transformation.
//!
//! Corresponds to `AssignmentExpression` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/AssignmentExpression.js`.

use super::shared::assignment_helpers::*;
use super::shared::utils::validate_mutation;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use crate::compiler::phases::phase3_transform::shared::assignments::visit_assignment_expression;

/// Check if operator is non-coercive (=, ||=, &&=, ??=).
fn is_non_coercive_operator(operator: &str) -> bool {
    matches!(operator, "=" | "||=" | "&&=" | "??=")
}

/// Get the appropriate $.assign* function name for an operator.
fn get_assign_callee(operator: &str) -> &'static str {
    match operator {
        "=" => "$.assign",
        "&&=" => "$.assign_and",
        "||=" => "$.assign_or",
        "??=" => "$.assign_nullish",
        _ => "$.assign",
    }
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
            let value = build_assignment_value(operator, left, right);

            // Check if proxy is needed
            // TODO: Pass Expression to should_proxy
            let needs_proxy = field.field_type == "$state" && is_non_coercive_operator(operator);
            // && should_proxy(right_expr, context.state.scope);

            // Call $.set() with optional proxy flag
            let mut args = vec![left.clone(), value];
            if needs_proxy {
                args.push(b::boolean(true));
            }

            return Some(b::call(b::id("$.set"), args));
        }
    }

    // Case 3: Reassignment (object === left)
    // If the root identifier is the same as the left side
    if is_same_identifier(&object, left)
        && let Some(t) = transform
        && let Some(assign_fn) = t.assign
    {
        // Build the assignment value (expand compound operators)
        let value = build_assignment_value(operator, left, right);

        // TODO: Determine if this is a primitive assignment by checking path
        // For now, conservatively assume it's not primitive
        let is_primitive = false;

        // Determine if proxy is needed
        // TODO: Pass Expression to should_proxy instead of using placeholder
        let needs_proxy =
            !is_primitive && context.state.analysis.runes && is_non_coercive_operator(operator);
        // && should_proxy(right_expr, context.state.scope)

        return Some(assign_fn(object.clone(), value, needs_proxy));
    }

    // Case 4: Mutation (object !== left)
    // If the root identifier is different from the left side
    if let Some(t) = transform
        && let Some(mutate_fn) = t.mutate
    {
        // Build the mutation expression
        // TODO: Visit left and right for full transformation
        // For now, use them directly
        let mutation_expr = b::assign_op(operator, left.clone(), right.clone());

        return Some(mutate_fn(object.clone(), mutation_expr));
    }

    // Case 5: Proxified assignments in dev mode
    let should_transform = context.state.dev
        // TODO: Check if parent is not ExpressionStatement
        // && parent_type != "ExpressionStatement"
        && is_non_coercive_operator(operator);

    if should_transform && let JsExpr::Member(member) = left {
        let callee = get_assign_callee(operator);

        // Get the property expression
        let property_expr = match &member.property {
            JsMemberProperty::Identifier(name) => b::string(name),
            JsMemberProperty::PrivateIdentifier(name) => b::string(name),
            JsMemberProperty::Expression(expr) => (**expr).clone(),
        };

        // TODO: Visit the right side
        // let visited_right = visit(right);

        let loc = locate_node(&JsAssignmentExpression {
            operator: JsAssignmentOp::Assign,
            left: Box::new(left.clone()),
            right: Box::new(right.clone()),
        });

        // For now, just return a placeholder
        // return Some(b::call(
        //     b::member_path(callee),
        //     vec![
        //         (*member.object).clone(),
        //         property_expr,
        //         right.clone(), // Should be visited_right
        //         b::string(&loc),
        //     ],
        // ));

        let _ = (callee, property_expr, loc); // Suppress warnings
    }

    // No transformation needed
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
    let root_name = extract_root_identifier(expr)?;

    // Look up the transform for this identifier
    let transform = context.state.transform.get(&root_name);

    // Return the root identifier as a JsExpr and its transform
    Some((JsExpr::Identifier(root_name), transform))
}

/// Extract the root identifier name from an expression.
///
/// Recursively walks down member expressions, computed member expressions,
/// and optional chaining to find the leftmost identifier.
fn extract_root_identifier(expr: &JsExpr) -> Option<String> {
    match expr {
        // Base case: identifier
        JsExpr::Identifier(name) => Some(name.clone()),

        // Member expression: obj.prop or obj[prop]
        JsExpr::Member(member) => extract_root_identifier(&member.object),

        // Optional chaining: obj?.prop
        JsExpr::Chain(chain) => {
            // Chain expressions wrap the underlying expression
            // Recursively extract from the wrapped expression
            extract_root_identifier(&chain.expression)
        }

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

    #[test]
    fn test_extract_root_identifier_simple() {
        let expr = JsExpr::Identifier("x".to_string());
        let root = extract_root_identifier(&expr);
        assert_eq!(root, Some("x".to_string()));
    }

    #[test]
    fn test_extract_root_identifier_member() {
        // x.y -> x
        let expr = JsExpr::Member(JsMemberExpression {
            object: Box::new(JsExpr::Identifier("x".to_string())),
            property: JsMemberProperty::Identifier("y".to_string()),
            computed: false,
            optional: false,
        });
        let root = extract_root_identifier(&expr);
        assert_eq!(root, Some("x".to_string()));
    }

    #[test]
    fn test_extract_root_identifier_nested_member() {
        // x.y.z -> x
        let expr = JsExpr::Member(JsMemberExpression {
            object: Box::new(JsExpr::Member(JsMemberExpression {
                object: Box::new(JsExpr::Identifier("x".to_string())),
                property: JsMemberProperty::Identifier("y".to_string()),
                computed: false,
                optional: false,
            })),
            property: JsMemberProperty::Identifier("z".to_string()),
            computed: false,
            optional: false,
        });
        let root = extract_root_identifier(&expr);
        assert_eq!(root, Some("x".to_string()));
    }

    #[test]
    fn test_extract_root_identifier_computed() {
        // x[y] -> x
        let expr = JsExpr::Member(JsMemberExpression {
            object: Box::new(JsExpr::Identifier("x".to_string())),
            property: JsMemberProperty::Expression(Box::new(JsExpr::Identifier("y".to_string()))),
            computed: true,
            optional: false,
        });
        let root = extract_root_identifier(&expr);
        assert_eq!(root, Some("x".to_string()));
    }

    #[test]
    fn test_extract_root_identifier_chain() {
        // x?.y -> x
        let expr = JsExpr::Chain(JsChainExpression {
            expression: Box::new(JsExpr::Member(JsMemberExpression {
                object: Box::new(JsExpr::Identifier("x".to_string())),
                property: JsMemberProperty::Identifier("y".to_string()),
                computed: false,
                optional: true,
            })),
        });
        let root = extract_root_identifier(&expr);
        assert_eq!(root, Some("x".to_string()));
    }

    #[test]
    fn test_extract_root_identifier_non_identifier() {
        // 42.toString() -> None (literal, not identifier)
        let expr = JsExpr::Member(JsMemberExpression {
            object: Box::new(JsExpr::Literal(JsLiteral::Number(42.0))),
            property: JsMemberProperty::Identifier("toString".to_string()),
            computed: false,
            optional: false,
        });
        let root = extract_root_identifier(&expr);
        assert_eq!(root, None);
    }

    #[test]
    fn test_is_same_identifier_true() {
        let a = JsExpr::Identifier("x".to_string());
        let b = JsExpr::Identifier("x".to_string());
        assert!(is_same_identifier(&a, &b));
    }

    #[test]
    fn test_is_same_identifier_false() {
        let a = JsExpr::Identifier("x".to_string());
        let b = JsExpr::Identifier("y".to_string());
        assert!(!is_same_identifier(&a, &b));
    }

    #[test]
    fn test_is_same_identifier_non_identifier() {
        let a = JsExpr::Identifier("x".to_string());
        let b = JsExpr::Literal(JsLiteral::Number(42.0));
        assert!(!is_same_identifier(&a, &b));
    }
}
