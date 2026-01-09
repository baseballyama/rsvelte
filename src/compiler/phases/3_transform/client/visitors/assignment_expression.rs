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
            // TODO: Visit the right side
            // let value = visit(build_assignment_value(operator, left, right));

            // Check if proxy is needed
            // let needs_proxy = field.field_type == "$state"
            //     && is_non_coercive_operator(operator)
            //     && should_proxy(right, context.state.scope);

            // return Some(b::call(
            //     b::id("$.set"),
            //     vec![left.clone(), value, b::bool_literal(needs_proxy)],
            // ));

            // Placeholder for now
            let _ = field; // Suppress unused warning
        }
    }

    // Case 3: Reassignment (object === left)
    // If the root identifier is the same as the left side
    if is_same_identifier(&object, left)
        && let Some(t) = transform
        && let Some(assign_fn) = t.assign
    {
        // TODO: Determine if this is a primitive assignment
        // let is_primitive = check_if_primitive_path(context);

        // TODO: Visit the right side
        // let value = visit(build_assignment_value(operator, left, right));

        // TODO: Determine if proxy is needed
        // let needs_proxy = !is_primitive
        //     && context.state.analysis.runes
        //     && should_proxy(right, context.state.scope)
        //     && is_non_coercive_operator(operator);

        // return Some(assign_fn(object.clone(), value, needs_proxy));

        // Placeholder for now
        let _ = assign_fn; // Suppress unused warning
    }

    // Case 4: Mutation (object !== left)
    // If the root identifier is different from the left side
    if let Some(t) = transform
        && let Some(mutate_fn) = t.mutate
    {
        // TODO: Visit left and right
        // let visited_left = visit(left);
        // let visited_right = visit(right);

        // return Some(mutate_fn(
        //     object.clone(),
        //     b::assign_op(operator, visited_left, visited_right),
        // ));

        // Placeholder for now
        let _ = mutate_fn; // Suppress unused warning
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
fn get_assignment_root<'a>(
    _expr: &JsExpr,
    _context: &'a ComponentContext,
) -> Option<(JsExpr, Option<&'a IdentifierTransform>)> {
    // TODO: Implement extraction of root identifier from:
    // - Identifier: x
    // - MemberExpression: x.y, x[y]
    // - ChainExpression: x?.y
    //
    // Should walk down the left side to find the root identifier,
    // then check context.state.transform for a transform rule.

    None
}

/// Check if two expressions refer to the same identifier.
fn is_same_identifier(a: &JsExpr, b: &JsExpr) -> bool {
    match (a, b) {
        (JsExpr::Identifier(name_a), JsExpr::Identifier(name_b)) => name_a == name_b,
        _ => false,
    }
}
