//! ClassDirective visitor.
//!
//! Analyzes class: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ClassDirective.js`.

use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::utils::walk_js_expression;
use crate::ast::template::ClassDirective;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a class directive.
///
/// Corresponds to ClassDirective() in Svelte's `2-analyze/visitors/ClassDirective.js`.
///
/// This function marks the subtree as dynamic (since class: directives require runtime evaluation)
/// and tracks the expression for dependency analysis.
pub fn visit(
    directive: &ClassDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Mark the subtree containing this directive as dynamic
    // This ensures proper code generation during the transform phase
    mark_subtree_dynamic(&context.path);

    // Track the class name for CSS pruning
    context
        .analysis
        .css
        .used_classes
        .insert(directive.name.to_string());

    // Walk the expression to track dependencies and references
    // This is important for legacy state promotion - if a class directive
    // references a mutable variable, it needs to be tracked as a template reference
    let crate::ast::js::Expression::Value(value) = &directive.expression;
    let mut metadata = crate::ast::template::ExpressionMetadata::default();
    walk_js_expression(value, context, &mut metadata)?;

    Ok(())
}
