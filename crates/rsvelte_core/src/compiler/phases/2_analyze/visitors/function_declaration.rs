//! FunctionDeclaration visitor.
//!
//! Analyzes function declarations.
//!
//! Corresponds to Svelte's `2-analyze/visitors/FunctionDeclaration.js`.

use super::VisitorContext;
use super::shared::function::visit_parameter_defaults;
use super::shared::utils::validate_identifier_name;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a function declaration (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::FunctionDeclaration {
        id, params, body, ..
    } = node
    {
        let arena = context.parse_arena;

        // In runes mode, validate the function name
        if context.analysis.runes
            && let Some(id_ref) = id
            && let JsNode::Identifier { name, .. } = arena.get_js_node(*id_ref)
            && let Some(binding_idx) = context.analysis.root.scope.declarations.get(name.as_str())
        {
            let binding = &context.analysis.root.bindings[*binding_idx];
            validate_identifier_name(binding, Some(context.function_depth))?;
        }

        // Increment function depth
        context.function_depth += 1;

        // Look up the scope for this function body from the function_scope_map
        let body_start: Option<u32> = body.and_then(|b| arena.get_js_node(b).start());
        let saved_scope = context.scope;
        if let Some(start) = body_start
            && let Some(&scope_idx) = context.analysis.root.function_scope_map.get(&start)
        {
            context.scope = scope_idx;
        }

        // Parameter defaults execute in the function scope before the body.
        let mut result = visit_parameter_defaults(*params, context);
        if result.is_ok()
            && let Some(body_id) = body
        {
            let body_node = arena.get_js_node(*body_id);
            result = super::script::walk_js_node_typed(body_node, context);
        }

        // Decrement function depth and restore scope
        context.function_depth -= 1;
        context.scope = saved_scope;

        result
    } else {
        Ok(())
    }
}
