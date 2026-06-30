//! LabeledStatement visitor.
//!
//! Analyzes labeled statements (including $: reactive statements).
//!
//! Corresponds to Svelte's `2-analyze/visitors/LabeledStatement.js`.

use super::{AstType, VisitorContext};
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::warnings;

/// Visit a labeled statement (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::LabeledStatement { label, body, .. } = node {
        let arena = context.parse_arena;
        let label_node = arena.get_js_node(*label);
        let body_node = arena.get_js_node(*body);

        let label_name = if let JsNode::Identifier { name, .. } = label_node {
            Some(name.as_str())
        } else {
            None
        };

        if label_name == Some("$") {
            // Check if at top level
            let is_at_top_level = context.js_path.len() >= 2
                && context.js_path[context.js_path.len() - 2].get_type_str() == Some("Program");

            let is_instance_script = context.ast_type == AstType::Instance;
            let is_reactive_statement = is_instance_script && is_at_top_level;

            // In runes mode, a top-level `$:` reactive statement is a hard
            // error (upstream LabeledStatement.js `legacy_reactive_statement_invalid`).
            if is_reactive_statement && context.analysis.runes {
                return Err(super::super::errors::legacy_reactive_statement_invalid());
            }

            if !context.analysis.runes
                && !is_reactive_statement
                && (is_instance_script || context.ast_type == AstType::Module)
            {
                context.emit_warning(warnings::reactive_declaration_invalid_placement());
            }
        }

        // Visit the body
        let prev_in_reactive = context.in_reactive_declaration;
        if label_name == Some("$")
            && !context.analysis.runes
            && context.ast_type == AstType::Instance
        {
            context.in_reactive_declaration = true;
        }
        super::script::walk_js_node_typed(body_node, context)?;
        context.in_reactive_declaration = prev_in_reactive;
    }

    Ok(())
}
