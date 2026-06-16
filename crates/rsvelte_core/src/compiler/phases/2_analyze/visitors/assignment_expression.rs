//! AssignmentExpression visitor.
//!
//! Analyzes assignment expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/AssignmentExpression.js`.

use super::VisitorContext;
use super::shared::utils::{extract_identifiers, object, validate_assignment};
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::scope::MutationKind;
use serde_json::Value;

/// Visit an assignment expression.
///
/// Corresponds to `AssignmentExpression` in AssignmentExpression.js.
///
/// This function validates that the assignment target is mutable and tracks
/// which bindings are being assigned to in reactive statements.
pub fn visit(
    node: &Value, // The AssignmentExpression node from JavaScript AST
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Validate that we can assign to the left-hand side
    if let Some(left) = node.get("left") {
        validate_assignment(left, context, false)?;
    }

    // Track mutations/reassignments for all bindings being assigned to.
    // This is important for prop flags (PROPS_IS_UPDATED) and state tracking.
    if let Some(left) = node.get("left") {
        mark_binding_mutation(left, context);
    }

    // Track assignments in reactive statements (legacy mode)
    if let Some(reactive_stmt_ptr) = context.reactive_statement
        && let Some(left) = node.get("left")
    {
        // Get the identifier: if left is a MemberExpression, get the object, otherwise use left itself
        let id = if left.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
            object(left)
        } else {
            Some(left.clone())
        };

        if id.is_some() {
            // Extract all identifier names from the left-hand side
            let identifier_names = extract_identifiers(left);

            // SAFETY: `reactive_stmt_ptr` is the `*mut ReactiveStatement` set on
            // the visit context by the enclosing reactive-statement scope; its
            // referent is owned by the analysis and outlives this traversal,
            // which is single-threaded, so there is no live aliasing reference.
            let reactive_stmt = unsafe { &mut *reactive_stmt_ptr };

            for name in identifier_names {
                // Look up the binding in the current scope
                if let Some(&binding_idx) = context.analysis.root.scope.declarations.get(&name) {
                    reactive_stmt.assignments.insert(binding_idx);
                }
            }
        }
    }

    // Mark expression as having assignment
    if let Some(expression) = context.current_expression() {
        expression.set_has_assignment(true);
    }

    // Visit children (left and right)
    // This is equivalent to context.next() in the JavaScript implementation
    if let Some(left) = node.get("left") {
        super::script::walk_js_node(left, context)?;
    }

    if let Some(right) = node.get("right") {
        super::script::walk_js_node(right, context)?;
    }

    Ok(())
}

/// Mark a binding as mutated or reassigned based on the assignment target.
///
/// If the target is a simple Identifier, it's a direct reassignment.
/// If the target is a MemberExpression, it's a property mutation.
///
/// This is public so it can be called from walk_js_expression for assignment
/// expressions inside templates (e.g., on:click handlers).
pub fn mark_binding_mutation(target: &Value, context: &mut VisitorContext) {
    let target_type = target.get("type").and_then(|t| t.as_str());

    match target_type {
        Some("Identifier") => {
            // Direct assignment: x = value
            if let Some(name) = target.get("name").and_then(|n| n.as_str()) {
                // Look up the binding and mark it as reassigned
                if let Some(binding_idx) = context
                    .analysis
                    .root
                    .get_binding(name, context.scope)
                    .or_else(|| context.analysis.root.find_binding_any_scope(name))
                {
                    let binding = &mut context.analysis.root.bindings[binding_idx];
                    binding.add_mutation(0, 0, MutationKind::Assignment);
                }
            }
        }
        Some("MemberExpression") => {
            // Property mutation: obj.prop = value or obj[key] = value
            // Find the root identifier of the member expression
            if let Some(root_name) = get_member_expression_root_name(target)
                && let Some(binding_idx) = context
                    .analysis
                    .root
                    .get_binding(&root_name, context.scope)
                    .or_else(|| context.analysis.root.find_binding_any_scope(&root_name))
            {
                let binding = &mut context.analysis.root.bindings[binding_idx];
                binding.add_mutation(0, 0, MutationKind::PropertyMutation);
            }
        }
        Some("ArrayPattern") | Some("ObjectPattern") => {
            // Destructuring assignment: [a, b] = value or {a, b} = value
            let identifiers = extract_identifiers(target);
            for name in identifiers {
                if let Some(binding_idx) = context
                    .analysis
                    .root
                    .get_binding(&name, context.scope)
                    .or_else(|| context.analysis.root.find_binding_any_scope(&name))
                {
                    let binding = &mut context.analysis.root.bindings[binding_idx];
                    binding.add_mutation(0, 0, MutationKind::Assignment);
                }
            }
        }
        _ => {}
    }
}

/// Get the root identifier name from a MemberExpression chain.
///
/// For example:
/// - `obj.prop` => "obj"
/// - `obj.prop.nested` => "obj"
/// - `arr[0].prop` => "arr"
fn get_member_expression_root_name(expr: &Value) -> Option<String> {
    let expr_type = expr.get("type").and_then(|t| t.as_str())?;

    match expr_type {
        "Identifier" => expr.get("name").and_then(|n| n.as_str()).map(String::from),
        "MemberExpression" => {
            let object = expr.get("object")?;
            get_member_expression_root_name(object)
        }
        _ => None,
    }
}

/// Visit an assignment expression (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::AssignmentExpression { left, right, .. } = node {
        let arena = context.parse_arena;
        let left_node = arena.get_js_node(*left);
        let right_node = arena.get_js_node(*right);

        // Validate assignment using typed node
        super::shared::utils::validate_assignment_node(left_node, context, false)?;

        // Track mutations
        mark_binding_mutation_node(left_node, context);

        // Track assignments in reactive statements (legacy mode)
        if let Some(reactive_stmt_ptr) = context.reactive_statement {
            let id = if matches!(left_node, JsNode::MemberExpression { .. }) {
                super::shared::utils::object_node(left_node, arena)
            } else {
                None
            };

            let identifier_names = super::shared::utils::extract_identifiers_node(left_node, arena);
            // SAFETY: `reactive_stmt_ptr` is the `*mut ReactiveStatement` set on
            // the visit context by the enclosing reactive-statement scope; its
            // referent is owned by the analysis and outlives this traversal,
            // which is single-threaded, so there is no live aliasing reference.
            let reactive_stmt = unsafe { &mut *reactive_stmt_ptr };

            for name in identifier_names {
                if let Some(&binding_idx) = context.analysis.root.scope.declarations.get(&name) {
                    reactive_stmt.assignments.insert(binding_idx);
                }
            }

            // If left is not MemberExpression, also check the left node directly
            if id.is_none()
                && let JsNode::Identifier { name, .. } = left_node
                && let Some(&binding_idx) =
                    context.analysis.root.scope.declarations.get(name.as_str())
            {
                reactive_stmt.assignments.insert(binding_idx);
            }
        }

        // Mark expression as having assignment
        if let Some(expression) = context.current_expression() {
            expression.set_has_assignment(true);
        }

        // Visit children
        super::script::walk_js_node_typed(left_node, context)?;
        super::script::walk_js_node_typed(right_node, context)?;
    }

    Ok(())
}

/// JsNode-based version of mark_binding_mutation.
pub fn mark_binding_mutation_node(target: &JsNode, context: &mut VisitorContext) {
    match target {
        JsNode::Identifier { name, .. } => {
            if let Some(binding_idx) = context
                .analysis
                .root
                .get_binding(name.as_str(), context.scope)
                .or_else(|| context.analysis.root.find_binding_any_scope(name.as_str()))
            {
                let binding = &mut context.analysis.root.bindings[binding_idx];
                binding.add_mutation(0, 0, MutationKind::Assignment);
            }
        }
        JsNode::MemberExpression { .. } => {
            if let Some(root_name) =
                get_member_expression_root_name_node(target, context.parse_arena)
                && let Some(binding_idx) = context
                    .analysis
                    .root
                    .get_binding(&root_name, context.scope)
                    .or_else(|| context.analysis.root.find_binding_any_scope(&root_name))
            {
                let binding = &mut context.analysis.root.bindings[binding_idx];
                binding.add_mutation(0, 0, MutationKind::PropertyMutation);
            }
        }
        JsNode::ArrayPattern { .. } | JsNode::ObjectPattern { .. } => {
            let identifiers =
                super::shared::utils::extract_identifiers_node(target, context.parse_arena);
            for name in identifiers {
                if let Some(binding_idx) = context
                    .analysis
                    .root
                    .get_binding(&name, context.scope)
                    .or_else(|| context.analysis.root.find_binding_any_scope(&name))
                {
                    let binding = &mut context.analysis.root.bindings[binding_idx];
                    binding.add_mutation(0, 0, MutationKind::Assignment);
                }
            }
        }
        _ => {}
    }
}

/// Get the root identifier name from a JsNode MemberExpression chain.
fn get_member_expression_root_name_node(
    expr: &JsNode,
    arena: &crate::ast::arena::ParseArena,
) -> Option<String> {
    match expr {
        JsNode::Identifier { name, .. } => Some(name.to_string()),
        JsNode::MemberExpression { object, .. } => {
            get_member_expression_root_name_node(arena.get_js_node(*object), arena)
        }
        _ => None,
    }
}
