//! AnimateDirective visitor.
//!
//! Analyzes animate: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/AnimateDirective.js`.

use super::VisitorContext;
use crate::ast::template::AnimateDirective;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an animate directive.
///
/// Corresponds to `AnimateDirective` in AnimateDirective.js.
pub fn visit(
    directive: &AnimateDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // TODO: Visit children with expression context
    // In JS: context.next({ ...context.state, expression: node.metadata.expression });
    // This requires implementing expression metadata tracking during parsing

    // TODO: Check for await expressions in the directive expression
    // In JS: if (node.metadata.expression.has_await) { e.illegal_await_expression(node); }
    // This requires expression analysis during parsing to detect await expressions
    if let Some(_expr) = &directive.expression {
        // TODO: Analyze expression and check for await
        // For now, we skip this check until expression metadata is available
    }

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

    Ok(())
}
