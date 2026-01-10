//! FunctionDeclaration visitor.
//!
//! Analyzes function declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/FunctionDeclaration.js`.

use super::VisitorContext;
use super::shared::function::visit_function;
use super::shared::utils::validate_identifier_name;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit a function declaration.
///
/// Validates the function identifier name in runes mode and processes the function body.
///
/// # Arguments
///
/// * `node` - The FunctionDeclaration AST node
/// * `context` - The visitor context
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // In runes mode, validate the function name
    if context.analysis.runes
        && let Some(id) = node.get("id")
        && !id.is_null()
        && let Some(name) = id.get("name").and_then(|n| n.as_str())
    {
        // Look up the binding for this function name
        if let Some(binding_idx) = context.analysis.root.scope.declarations.get(name) {
            let binding = &context.analysis.root.bindings[*binding_idx];
            validate_identifier_name(binding, Some(context.function_depth))?;
        }
    }

    // Increment function depth
    context.function_depth += 1;

    // Visit function body
    let result = if let Some(body) = node.get("body") {
        super::script::walk_js_node(body, context)
    } else {
        Ok(())
    };

    // Decrement function depth
    context.function_depth -= 1;

    result
}
