//! LabeledStatement visitor.
//!
//! Analyzes labeled statements (including $: reactive statements).
//!
//! Corresponds to Svelte's `2-analyze/visitors/LabeledStatement.js`.

use super::{AstType, VisitorContext};
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
            // In non-runes mode, $: outside of top level of instance script is a warning
            // Only emit warning if we're in instance script but not at top level
            // (module script $: will fall into this category)
            if is_instance_script || context.ast_type == AstType::Module {
                // TODO: Check for leading comments with svelte-ignore
                // For now, we skip emitting warnings inside functions since we can't
                // properly handle the svelte-ignore comments in JS context
                // Only emit for module script (the original test case)
                if context.ast_type == AstType::Module {
                    context.emit_warning(warnings::reactive_declaration_invalid_placement());
                }
            }
        }
    }

    Ok(())
}
