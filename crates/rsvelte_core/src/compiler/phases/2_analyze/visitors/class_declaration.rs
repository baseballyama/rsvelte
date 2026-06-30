//! ClassDeclaration visitor.
//!
//! Analyzes class declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ClassDeclaration.js`.

use super::shared::utils::validate_identifier_name;
use super::{AstType, VisitorContext};
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::{AnalysisError, warnings};

/// Visit a class declaration (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::ClassDeclaration { id, body, .. } = node {
        let arena = context.parse_arena;

        // Validate identifier name if using runes and the class has an id
        if context.analysis.runes
            && let Some(id_ref) = id
            && let JsNode::Identifier { name, .. } = arena.get_js_node(*id_ref)
            && let Some(binding_idx) = context.analysis.root.scope.declarations.get(name.as_str())
        {
            let binding = &context.analysis.root.bindings[*binding_idx];
            validate_identifier_name(binding, Some(context.function_depth))?;
        }

        // Check function depth for performance warning
        let allowed_depth = if context.ast_type == AstType::Module {
            0
        } else {
            1
        };
        if context.function_depth > allowed_depth {
            context.emit_warning(warnings::perf_avoid_nested_class());
        }

        // Visit the class body - ClassBody visitor still uses Value,
        // so we walk it via walk_js_node_typed which will convert as needed
        let body_node = arena.get_js_node(*body);
        super::script::walk_js_node_typed(body_node, context)?;
    }

    Ok(())
}
