//! AssignmentExpression visitor.
//!
//! Analyzes assignment expressions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/AssignmentExpression.js`.

use super::VisitorContext;
use super::shared::utils::{extract_identifiers, object, validate_assignment};
use crate::compiler::phases::phase2_analyze::AnalysisError;
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
        expression.has_assignment = true;
    }

    Ok(())
}
