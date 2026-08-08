//! AssignmentExpression visitor.
//!
//! Analyzes assignment expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/AssignmentExpression.js`.

use super::VisitorContext;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::scope::MutationKind;

/// Visit an assignment expression (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::AssignmentExpression {
        left,
        right,
        start,
        end,
        ..
    } = node
    {
        let arena = context.parse_arena;
        let left_node = arena.get_js_node(*left);
        let right_node = arena.get_js_node(*right);

        // Validate assignment using typed node
        super::shared::utils::validate_assignment_node((*start, *end), left_node, context, false)?;

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
