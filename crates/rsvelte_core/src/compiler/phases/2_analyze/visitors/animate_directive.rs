//! AnimateDirective visitor.
//!
//! Analyzes animate: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/AnimateDirective.js`.

use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::utils::walk_js_expression_node;
use crate::ast::template::{AnimateDirective, ExpressionMetadata};
use crate::compiler::phases::phase2_analyze::{AnalysisError, errors};

/// Visit an animate directive.
///
/// Corresponds to `AnimateDirective` in `2-analyze/visitors/AnimateDirective.js`.
///
/// 1. Validates that the directive is on a direct child of a keyed `{#each}` block.
/// 2. Marks the surrounding subtree as dynamic.
/// 3. Walks the directive expression so identifier dependencies and `has_await`
///    are populated.
/// 4. Errors on `await` inside the directive expression (matches the official
///    `e.illegal_await_expression(node)`).
pub fn visit(
    directive: &AnimateDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Animate directives must be inside an {#each} block with a key
    let in_keyed_each = context.path.iter().rev().any(|node| {
        if let crate::ast::template::TemplateNode::EachBlock(each) = node {
            each.key.is_some()
        } else {
            false
        }
    });

    if !in_keyed_each {
        return Err(AnalysisError::Validation(
            "animate directive can only be used on an element that is the immediate child of a keyed {#each} block".to_string(),
        ));
    }

    // The directive participates in DOM mutation, so the subtree is dynamic.
    mark_subtree_dynamic(&context.path);

    // Walk the directive expression to populate metadata (has_await,
    // dependencies, etc.) and reject await in the expression.
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
