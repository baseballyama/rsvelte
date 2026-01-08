//! ClassDirective visitor.
//!
//! Analyzes class: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ClassDirective.js`.

use super::VisitorContext;
use crate::ast::template::ClassDirective;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a class directive.
pub fn visit(
    directive: &ClassDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Track the class name for CSS pruning
    context
        .analysis
        .css
        .used_classes
        .insert(directive.name.to_string());

    // Analyze the expression if present
    // If no expression, the class is toggled based on a variable with the same name

    Ok(())
}
