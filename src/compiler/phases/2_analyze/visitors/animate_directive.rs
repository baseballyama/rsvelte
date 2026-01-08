//! AnimateDirective visitor.
//!
//! Analyzes animate: directives.
//!
//! Corresponds to Svelte's `2-analyze/visitors/AnimateDirective.js`.

use super::VisitorContext;
use crate::ast::template::AnimateDirective;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an animate directive.
pub fn visit(
    _directive: &AnimateDirective,
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

    Ok(())
}
