//! VariableDeclarator visitor.
//!
//! Analyzes variable declarators.
//!
//! Corresponds to Svelte's `2-analyze/visitors/VariableDeclarator.js`.

use super::super::errors;
use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit a variable declarator.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Create bindings for declared variables
    // Detect rune initializers ($state, $derived, etc.)

    // Check if init is $props() rune
    if let Some(init) = node.get("init") {
        let rune = get_rune(init, context);

        // Validate $props() pattern
        if rune.as_deref() == Some("$props") {
            // Check that the pattern is either ObjectPattern or Identifier
            if let Some(id) = node.get("id") {
                let id_type = id.get("type").and_then(|t| t.as_str());
                if !matches!(id_type, Some("ObjectPattern") | Some("Identifier")) {
                    return Err(errors::props_invalid_identifier());
                }
            }
        }

        // Visit the initializer expression
        super::script::walk_js_node(init, context)?;
    }

    Ok(())
}

/// Get the rune name from a CallExpression node, if it is a rune call.
///
/// Returns Some(rune_name) if the call is a rune, None otherwise.
fn get_rune(node: &Value, context: &VisitorContext) -> Option<String> {
    if node.get("type").and_then(|t| t.as_str()) != Some("CallExpression") {
        return None;
    }

    let callee = node.get("callee")?;
    let keypath = get_global_keypath(callee, context)?;

    if super::shared::function::is_rune(&keypath) {
        Some(keypath)
    } else {
        None
    }
}

/// Get the global keypath of an expression.
fn get_global_keypath(node: &Value, context: &VisitorContext) -> Option<String> {
    let mut n = node;
    let mut joined = String::new();

    // Handle MemberExpression chain
    while n.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        if n.get("computed").and_then(|c| c.as_bool()).unwrap_or(false) {
            return None;
        }

        let property = n.get("property")?;
        if property.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
            return None;
        }

        let prop_name = property.get("name").and_then(|n| n.as_str())?;
        joined = format!(".{}{}", prop_name, joined);

        n = n.get("object")?;
    }

    // Handle CallExpression (for patterns like `$inspect().with`)
    if n.get("type").and_then(|t| t.as_str()) == Some("CallExpression") {
        let callee = n.get("callee")?;
        if callee.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
            return None;
        }
        joined = format!("(){}", joined);
        n = callee;
    }

    // Must be an Identifier at the base
    if n.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
        return None;
    }

    let name = n.get("name").and_then(|n| n.as_str())?;

    // Check if it's a binding (if so, it's not a rune)
    if context.analysis.root.scope.declarations.contains_key(name) {
        return None;
    }

    Some(format!("{}{}", name, joined))
}
