//! UseDirective visitor.
//!
//! Analyzes use: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/UseDirective.js`.

use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use crate::ast::template::UseDirective;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a use directive.
///
/// use: directives attach actions to elements.
/// Actions receive the element and optionally parameters.
/// They return an object with update and destroy methods.
///
/// This visitor:
/// - Marks the subtree as dynamic
/// - Analyzes the expression if present
pub fn visit(directive: &UseDirective, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark subtree as dynamic
    mark_subtree_dynamic(&context.path);

    // Analyze the expression if present
    if let Some(ref expression) = directive.expression {
        let expr_value = expression.as_json();
        super::script::walk_js_node(expr_value, context)?;
    }

    Ok(())
}
