//! PropertyDefinition visitor.
//!
//! Analyzes class property definitions.
//!
//! Corresponds to Svelte's `2-analyze/visitors/PropertyDefinition.js`.

use super::VisitorContext;
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a property definition (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::PropertyDefinition {
        key,
        value,
        computed,
        ..
    } = node
    {
        let arena = context.parse_arena;

        // Visit the value expression if it exists
        if let Some(val_id) = value {
            let val_node = arena.get_js_node(*val_id);
            super::script::walk_js_node_typed(val_node, context)?;
        }

        // Visit computed key if present
        if *computed {
            let key_node = arena.get_js_node(*key);
            super::script::walk_js_node_typed(key_node, context)?;
        }
    }

    Ok(())
}
