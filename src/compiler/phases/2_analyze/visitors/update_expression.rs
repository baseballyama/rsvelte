//! UpdateExpression visitor.
//!
//! Analyzes update expressions (++, --).
//!
//! Corresponds to Svelte's `2-analyze/visitors/UpdateExpression.js`.

use super::VisitorContext;
use super::shared::utils::validate_assignment;
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
    }

    // Track assignments in reactive statements (legacy mode)
    // In the JavaScript implementation:
    // if (context.state.reactive_statement) {
    //   const id = node.argument.type === 'MemberExpression' ? object(node.argument) : node.argument;
    //   if (id?.type === 'Identifier') {
    //     const binding = context.state.scope.get(id.name);
    //     if (binding) {
    //       context.state.reactive_statement.assignments.add(binding);
    //     }
    //   }
    // }
    //
    // To implement this, we need to:
    // 1. Check if we're inside a reactive statement (tracked via a state flag)
    // 2. Get the base identifier (using object() for MemberExpression)
    // 3. Look up the binding and add it to assignments
    //
    // However, the current VisitorContext doesn't track reactive_statement state.
    // This is tracked in ComponentAnalysis.reactive_statements which is populated
    // during LabeledStatement visitor traversal.
    //
    // The reactive statement tracking happens in two phases:
    // 1. LabeledStatement visitor creates ReactiveStatement and stores in analysis
    // 2. Child visitors (like this one) would update the current reactive statement
    //
    // Since we don't have a current_reactive_statement field in VisitorContext yet,
    // we'll leave this as a TODO for now. The reactive statement dependencies are
    // already computed in labeled_statement.rs using collect_references().
    //
    // TODO: Add current_reactive_statement to VisitorContext if needed for
    // incremental reactive statement analysis during traversal.

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
#[allow(dead_code)]
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
