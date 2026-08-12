//! TransitionDirective visitor.
//!
//! Analyzes transition:, in:, and out: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/TransitionDirective.js`.

use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::utils::walk_js_expression_node;
use crate::ast::template::{ExpressionMetadata, TransitionDirective};
use crate::compiler::phases::phase2_analyze::{AnalysisError, errors};

/// Visit a transition directive (`transition:`, `in:`, `out:`).
///
/// Corresponds to `TransitionDirective` in
/// `2-analyze/visitors/TransitionDirective.js`.
///
/// 1. Marks the surrounding subtree as dynamic (transitions trigger DOM
///    insertion / removal effects, which must run at runtime).
/// 2. Walks the directive expression so identifier dependencies and
///    `has_await` are populated.
/// 3. Errors on `await` inside the directive expression (matches the
///    official `e.illegal_await_expression(node)`).
///
/// Duplicate / `in:` vs `out:` conflict checking is performed in the
/// element validator (`shared/element.rs`) so it does not need to run here.
pub fn visit(
    directive: &TransitionDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    mark_subtree_dynamic(&context.path);

    if let Some(ref expr) = directive.expression {
        let mut scratch = ExpressionMetadata::default();
        let node = expr.as_node();
        walk_js_expression_node(&node, context, &mut scratch)?;
        if scratch.has_await() {
            return Err(errors::illegal_await_expression());
        }
    }

    Ok(())
}
