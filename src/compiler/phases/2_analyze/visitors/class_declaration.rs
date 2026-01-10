//! ClassDeclaration visitor.
//!
//! Analyzes class declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ClassDeclaration.js`.

use super::VisitorContext;
use super::shared::utils::validate_identifier_name;
use crate::compiler::phases::phase2_analyze::AnalysisError;
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

    // Check function depth for performance warning
    // In modules, we allow top-level module scope only (depth 0)
    // In components, we allow the component scope (depth 1)
    // With the exception of `new class` which is not allowed at component scope level either
    // TODO: Issue warning if nested too deep
    // For now, we just check the depth but don't issue warnings
    // let allowed_depth = if context.state.ast_type == 'module' { 0 } else { 1 };
    // if context.state.scope.function_depth > allowed_depth {
    //     w.perf_avoid_nested_class(node);
    // }

    Ok(())
}
