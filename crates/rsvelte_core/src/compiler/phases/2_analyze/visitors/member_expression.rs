//! MemberExpression visitor.
//!
//! Analyzes member expressions (obj.prop, obj[prop]).
//!
//! Corresponds to Svelte's `2-analyze/visitors/MemberExpression.js`.

use super::VisitorContext;
use super::shared::utils::{is_pure_node, is_safe_identifier_node};
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::{AnalysisError, BindingKind, errors};

/// Visit a member expression (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::MemberExpression {
        object,
        property,
        computed,
        ..
    } = node
    {
        let arena = context.parse_arena;
        let obj_node = arena.get_js_node(*object);
        let prop_node = arena.get_js_node(*property);

        // Check for illegal $$-prefixed property access on rest_prop bindings
        if let JsNode::Identifier { name: obj_name, .. } = obj_node
            && let JsNode::Identifier {
                name: prop_name, ..
            } = prop_node
            && let Some(&binding_idx) = context
                .analysis
                .root
                .scope
                .declarations
                .get(obj_name.as_str())
        {
            let binding = &context.analysis.root.bindings[binding_idx];
            if binding.kind == BindingKind::RestProp && prop_name.starts_with("$$") {
                return Err(errors::props_illegal_name());
            }
        }

        // Track expression metadata
        let is_not_pure = !is_pure_node(node, context);

        if let Some(expression) = context.current_expression() {
            expression.set_has_member_expression(true);
            if is_not_pure {
                expression.set_has_state(true);
            }
        }

        // Check if safe identifier
        if !is_safe_identifier_node(node, context) {
            context.analysis.needs_context = true;
        }

        // Legacy mode $$props/$$restProps handling
        if !context.analysis.runes {
            let mut base = node;
            while let JsNode::MemberExpression { object: obj, .. } = base {
                base = arena.get_js_node(*obj);
            }
            if let JsNode::Identifier { name, .. } = base
                && (name.as_str() == "$$props" || name.as_str() == "$$restProps")
            {
                context.analysis.needs_context = true;
            }
        }

        // Visit children
        super::script::walk_js_node_typed(obj_node, context)?;

        if *computed {
            super::script::walk_js_node_typed(prop_node, context)?;
        }
    }

    Ok(())
}
