//! MemberExpression visitor.
//!
//! Analyzes member expressions (obj.prop, obj[prop]).
//!
//! Corresponds to Svelte's `2-analyze/visitors/MemberExpression.js`.

use super::VisitorContext;
use super::shared::utils::is_safe_identifier;
use crate::compiler::phases::phase2_analyze::{AnalysisError, BindingKind, errors};
use serde_json::Value;

/// Visit a member expression.
///
/// This visitor handles:
/// - Validation of rest prop access ($$-prefixed properties are illegal)
/// - Expression metadata tracking (has_member_expression, has_state)
/// - Component context detection (needs_context)
///
/// # Arguments
///
/// * `node` - The MemberExpression AST node
/// * `context` - The visitor context
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for illegal $$-prefixed property access on rest_prop bindings
    // e.g., `restProps.$$slots` where restProps is from `const { ...restProps } = $props()`
    if node
        .get("object")
        .and_then(|o| o.get("type"))
        .and_then(|t| t.as_str())
        == Some("Identifier")
        && node
            .get("property")
            .and_then(|p| p.get("type"))
            .and_then(|t| t.as_str())
            == Some("Identifier")
    {
        // Get the object name
        if let Some(object_name) = node
            .get("object")
            .and_then(|o| o.get("name"))
            .and_then(|n| n.as_str())
            && let Some(&binding_idx) = context.analysis.root.scope.declarations.get(object_name)
        {
            let binding = &context.analysis.root.bindings[binding_idx];

            // Check if it's a rest_prop binding and property name starts with '$$'
            if binding.kind == BindingKind::RestProp
                && let Some(property_name) = node
                    .get("property")
                    .and_then(|p| p.get("name"))
                    .and_then(|n| n.as_str())
                && property_name.starts_with("$$")
            {
                return Err(errors::props_illegal_name());
            }
        }
    }

    // TODO: Track expression metadata when expression context is implemented
    // In the JavaScript version, this updates context.state.expression:
    // - has_member_expression = true
    // - has_state ||= !is_pure(node, context)
    //
    // This requires implementing an expression context stack in VisitorContext
    // For now, we skip this tracking as the infrastructure is not yet in place

    // Check if this identifier is "safe" (doesn't require component context)
    // If it's not safe, we need to track that this component needs context
    if !is_safe_identifier(node, context) {
        context.analysis.needs_context = true;
    }

    // Continue walking the tree (the visitor will handle child nodes)
    Ok(())
}
