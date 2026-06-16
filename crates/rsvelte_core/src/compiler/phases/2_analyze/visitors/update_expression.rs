//! UpdateExpression visitor.
//!
//! Analyzes update expressions (++, --).
//!
//! Corresponds to Svelte's `2-analyze/visitors/UpdateExpression.js`.

use super::VisitorContext;
use super::assignment_expression::{mark_binding_mutation, mark_binding_mutation_node};
use super::shared::utils::{validate_assignment, validate_assignment_node};
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit an update expression.
///
/// Corresponds to `UpdateExpression` in UpdateExpression.js.
///
/// This function validates that the update target is mutable and tracks
/// which bindings are being assigned to in reactive statements.
///
/// # Arguments
///
/// * `node` - The UpdateExpression node from JavaScript AST
/// * `context` - The visitor context
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate that we can assign to the argument
    if let Some(argument) = node.get("argument") {
        validate_assignment(argument, context, false)?;

        // Mark the binding as reassigned (++/-- is a form of assignment)
        mark_binding_mutation(argument, context);
    }

    // Track assignments in reactive statements (legacy mode)
    if let Some(reactive_stmt_ptr) = context.reactive_statement
        && let Some(argument) = node.get("argument")
    {
        // SAFETY: `reactive_stmt_ptr` is the `*mut ReactiveStatement` set on the
        // visit context by the enclosing reactive-statement scope; its referent
        // is owned by the analysis and outlives this single-threaded traversal,
        // so there is no live aliasing reference.
        let reactive_stmt = unsafe { &mut *reactive_stmt_ptr };

        let id = if argument.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
            get_object_identifier(argument)
        } else {
            Some(argument.clone())
        };

        if let Some(identifier) = id
            && let Some(name) = identifier.get("name").and_then(|n| n.as_str())
            && let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name)
        {
            reactive_stmt.assignments.insert(binding_idx);
        }
    }

    // Track expression assignments (for expression metadata)
    // In the JavaScript implementation:
    // if (context.state.expression) {
    //   context.state.expression.has_assignment = true;
    // }
    //
    // This would require:
    // 1. VisitorContext to track current expression metadata
    // 2. ExpressionMetadata to have a has_assignment field
    //
    // Currently, ExpressionMetadata doesn't have has_assignment field, and
    // VisitorContext doesn't track current expression.
    //
    // This metadata is primarily used for optimizing expressions in bindings
    // and event handlers. Since it's not yet implemented, we'll leave as TODO.
    //
    // TODO: Add expression state tracking to VisitorContext and has_assignment
    // to ExpressionMetadata if needed for expression optimization.

    Ok(())
}

/// Visit an update expression (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::UpdateExpression { argument, .. } = node {
        let arena = context.parse_arena;
        let arg_node = arena.get_js_node(*argument);

        // Validate assignment
        validate_assignment_node(arg_node, context, false)?;

        // Mark the binding as reassigned
        mark_binding_mutation_node(arg_node, context);

        // Track assignments in reactive statements (legacy mode)
        if let Some(reactive_stmt_ptr) = context.reactive_statement {
            // SAFETY: `reactive_stmt_ptr` is the `*mut ReactiveStatement` set on
            // the visit context by the enclosing reactive-statement scope; its
            // referent is owned by the analysis and outlives this single-threaded
            // traversal, so there is no live aliasing reference.
            let reactive_stmt = unsafe { &mut *reactive_stmt_ptr };

            let id_name = match arg_node {
                JsNode::MemberExpression { .. } => {
                    super::shared::utils::object_node(arg_node, arena)
                }
                JsNode::Identifier { name, .. } => Some(name.to_string()),
                _ => None,
            };

            if let Some(name) = id_name
                && let Some(&binding_idx) = context.analysis.root.scope.declarations.get(&name)
            {
                reactive_stmt.assignments.insert(binding_idx);
            }
        }
    }

    Ok(())
}

/// Get the leftmost identifier in a MemberExpression chain.
///
/// For example:
/// - `foo.bar.baz` returns `foo`
/// - `foo` returns `foo`
/// - `this.foo` returns `None` (not an Identifier)
///
/// Corresponds to the `object()` function in Svelte's utils/ast.js.
///
/// # Arguments
///
/// * `expression` - The expression to analyze
///
/// # Returns
///
/// The leftmost identifier, or None if not found or not an Identifier
fn get_object_identifier(expression: &Value) -> Option<Value> {
    let mut current = expression;

    // Walk through MemberExpression chain to find the base object
    while current.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        if let Some(object) = current.get("object") {
            current = object;
        } else {
            break;
        }
    }

    // Return the identifier if we found one
    if current.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
        Some(current.clone())
    } else {
        None
    }
}
