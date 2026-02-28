//! ClassDeclaration visitor.
//!
//! Analyzes class declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ClassDeclaration.js`.

use super::shared::utils::validate_identifier_name;
use super::{AstType, VisitorContext};
use crate::compiler::phases::phase2_analyze::{AnalysisError, warnings};
use serde_json::Value;

/// Visit a class declaration.
///
/// Corresponds to ClassDeclaration() in Svelte's `2-analyze/visitors/ClassDeclaration.js`.
///
/// This function validates the class name and issues a performance warning
/// if the class is nested beyond the allowed depth.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate identifier name if using runes and the class has an id
    if context.analysis.runes
        && let Some(id) = node.get("id")
        && let Some(name) = id.get("name").and_then(|n| n.as_str())
    {
        // Look up the binding for this class name
        if let Some(binding_idx) = context.analysis.root.scope.declarations.get(name) {
            let binding = &context.analysis.root.bindings[*binding_idx];
            validate_identifier_name(binding, Some(context.function_depth))?;
        }
    }

    // Check function depth for performance warning.
    // In modules, we allow top-level module scope only (depth 0).
    // In components, we allow the component scope (depth 1).
    // Corresponds to ClassDeclaration.js L18-22.
    let allowed_depth = if context.ast_type == AstType::Module {
        0
    } else {
        1
    };
    if context.function_depth > allowed_depth {
        context.emit_warning(warnings::perf_avoid_nested_class());
    }

    // Visit the class body to analyze state fields and detect needs_context
    if let Some(body) = node.get("body") {
        super::script::walk_js_node(body, context)?;
    }

    Ok(())
}
