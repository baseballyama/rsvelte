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
    if context.analysis.runes {
        if let Some(id) = node.get("id") {
            if !id.is_null() {
                if let Some(name) = id.get("name").and_then(|n| n.as_str()) {
                    // Look up the binding for this function name
                    if let Some(binding_idx) = context.analysis.root.scope.declarations.get(name) {
                        let binding = &context.analysis.root.bindings[*binding_idx];
                        validate_identifier_name(binding, Some(context.function_depth))?;
                    }
                }
            }
        }
    }

    // Visit the function with incremented function depth
    visit_function(context, |ctx| {
        // Visit function body
        if let Some(body) = node.get("body") {
            let _ = super::script::walk_js_node(body, ctx);
        }
    });

    Ok(())
}
