//! PropertyDefinition visitor.
//!
//! Analyzes class property definitions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/PropertyDefinition.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit a property definition.
///
/// This visitor handles class property definitions and visits the value
/// expression to analyze any runes or expressions within.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Visit the value expression if it exists
    // This handles cases like `foo = $derived({ bar: this.a * 2 })`
    // where we need to analyze the expression inside the derived call
    if let Some(value) = node.get("value") {
        super::script::walk_js_node(value, context)?;
    }

    // Visit computed key if present
    let computed = node
        .get("computed")
        .and_then(|c| c.as_bool())
        .unwrap_or(false);
    if computed && let Some(key) = node.get("key") {
        super::script::walk_js_node(key, context)?;
    }

    Ok(())
}
