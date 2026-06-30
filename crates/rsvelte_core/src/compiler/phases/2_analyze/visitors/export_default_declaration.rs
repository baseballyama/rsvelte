//! ExportDefaultDeclaration visitor.
//!
//! Analyzes export default declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExportDefaultDeclaration.js`.

use super::VisitorContext;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::errors;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;

/// Visit an export default declaration (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::ExportDefaultDeclaration { declaration, .. } = node {
        let arena = context.parse_arena;
        let decl_node = arena.get_js_node(*declaration);

        if context.analysis.is_module_file {
            // In .svelte.js module files, check for invalid state/derived exports
            if let JsNode::Identifier { name, .. } = decl_node {
                validate_export(name.as_str(), context)?;
            }
            Ok(())
        } else {
            Err(errors::module_illegal_default_export())
        }
    } else {
        Ok(())
    }
}

/// Validate that an exported binding is not derived or reassigned state.
/// Corresponds to `validate_export()` in the official Svelte compiler.
fn validate_export(name: &str, context: &VisitorContext) -> Result<(), AnalysisError> {
    if let Some(binding_idx) = context.analysis.root.get_binding(name, context.scope) {
        let binding = &context.analysis.root.bindings[binding_idx];

        if binding.kind == BindingKind::Derived {
            return Err(errors::derived_invalid_export());
        }

        if matches!(binding.kind, BindingKind::State | BindingKind::RawState) && binding.reassigned
        {
            return Err(errors::state_invalid_export());
        }
    }
    Ok(())
}
