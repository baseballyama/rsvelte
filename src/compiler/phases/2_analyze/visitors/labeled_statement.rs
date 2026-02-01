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

        if !context.analysis.runes {
            // In non-runes mode, $: is only valid at the top level of instance script
            if !is_instance_script || !is_at_top_level {
                context.emit_warning(warnings::reactive_declaration_invalid_placement());
            }
        }
    }

    Ok(())
}
