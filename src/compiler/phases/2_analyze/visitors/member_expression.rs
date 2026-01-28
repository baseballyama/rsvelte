//! MemberExpression visitor.
//!
//! Analyzes member expressions (obj.prop, obj[prop]).
//!
//! Corresponds to Svelte's `2-analyze/visitors/MemberExpression.js`.

use super::VisitorContext;
use super::shared::utils::{is_pure, is_safe_identifier};
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

    // Track expression metadata in the current expression context
    // Check purity first to avoid borrowing issues
    let is_not_pure = !is_pure(node, context);

    if let Some(expression) = context.current_expression() {
        expression.set_has_member_expression(true);

        // If the member expression is not pure, mark the expression as having state
        if is_not_pure {
            expression.set_has_state(true);
        }
    }

    // Check if this identifier is "safe" (doesn't require component context)
    // If it's not safe, we need to track that this component needs context
    if !is_safe_identifier(node, context) {
        context.analysis.needs_context = true;
    }

    // Visit children (object and property)
    // This is equivalent to context.next() in the JavaScript implementation
    if let Some(object) = node.get("object") {
        super::script::walk_js_node(object, context)?;
    }

    // Only visit property if computed (dynamic property access)
    let computed = node
        .get("computed")
        .and_then(|c| c.as_bool())
        .unwrap_or(false);
    if computed && let Some(property) = node.get("property") {
        super::script::walk_js_node(property, context)?;
    }

    Ok(())
}
