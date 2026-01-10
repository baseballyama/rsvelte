//! ExpressionStatement visitor.
//!
//! Analyzes expression statements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExpressionStatement.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit an expression statement.
///
/// This visitor processes the expression within the statement.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    eprintln!("DEBUG expression_statement: visiting");
    // Visit the expression
    if let Some(expression) = node.get("expression") {
        eprintln!("DEBUG expression_statement: expression type = {:?}", expression.get("type"));
        super::script::walk_js_node(expression, context)?;
    }

    Ok(())
}
