//! ClassDirective visitor.
//!
//! Analyzes class: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ClassDirective.js`.

use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::utils::walk_js_expression_node;
use crate::ast::template::ClassDirective;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a class directive.
///
/// Corresponds to ClassDirective() in Svelte's `2-analyze/visitors/ClassDirective.js`.
///
/// This function marks the subtree as dynamic (since class: directives require runtime evaluation)
/// and tracks the expression for dependency analysis.
pub fn visit(
    directive: &mut ClassDirective,
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

    // Walk the expression to track dependencies and references and populate
    // `directive.metadata.expression` so Phase 3 can read `has_call` /
    // `has_state` / `has_await` without re-walking the expression.
    let node = directive.expression.as_node();
    walk_js_expression_node(&node, context, &mut directive.metadata.expression)?;

    Ok(())
}
