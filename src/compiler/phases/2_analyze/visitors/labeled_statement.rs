//! LabeledStatement visitor.
//!
//! Analyzes labeled statements (including $: reactive statements).
//!
//! Corresponds to Svelte's `2-analyze/visitors/LabeledStatement.js`.

use super::{AstType, VisitorContext};
use crate::ast::typed_expr::JsNode;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use crate::compiler::phases::phase2_analyze::warnings;
use serde_json::Value;

/// Visit a labeled statement.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check if the label is "$" (reactive statement)
    let label_name = node
        .get("label")
        .and_then(|l| l.get("name"))
        .and_then(|n| n.as_str());

    if label_name == Some("$") {
        // Check if we're at the top level of the instance script
        // The parent should be a Program node (js_path[-2] is Program when this is a direct child)
        let is_at_top_level = context.js_path.len() >= 2
            && context
                .js_path
                .get(context.js_path.len() - 2)
                .and_then(|n| n.get("type"))
                .and_then(|t| t.as_str())
                == Some("Program");

        let is_instance_script = context.ast_type == AstType::Instance;
        let is_reactive_statement = is_instance_script && is_at_top_level;

        if !context.analysis.runes && !is_reactive_statement {
            // In non-runes mode, $: outside of top level of instance script is a warning.
            // This includes:
            // - $: inside a function in the instance script (not at top level)
            // - $: in module script
            if is_instance_script || context.ast_type == AstType::Module {
                context.emit_warning(warnings::reactive_declaration_invalid_placement());
            }
        }
    }

    // Visit the body of the labeled statement
    // This is important for analyzing expressions inside reactive statements
    if let Some(body) = node.get("body") {
        // Set in_reactive_declaration flag when entering a $: block in the instance script.
        // This is needed for the reactive_declaration_module_script_dependency warning.
        // Only set it for instance script (not module script) $: blocks, matching the official
        // Svelte compiler where `reactive_statement` is only set for instance-level reactive
        // declarations. In module scripts, $: is just a regular label.
        let prev_in_reactive = context.in_reactive_declaration;
        if label_name == Some("$")
            && !context.analysis.runes
            && context.ast_type == AstType::Instance
        {
            context.in_reactive_declaration = true;
        }
        super::script::walk_js_node(body, context)?;
        context.in_reactive_declaration = prev_in_reactive;
    }

    Ok(())
}

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
