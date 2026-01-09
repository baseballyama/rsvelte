//! AttachTag visitor.
//!
//! Analyzes {@attach} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/AttachTag.js`.

use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use crate::ast::template::AttachTag;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an attach tag.
///
/// Corresponds to `AttachTag` in AttachTag.js.
///
/// {@attach} tags attach custom behaviors to elements and require dynamic handling.
pub fn visit(_tag: &AttachTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark the subtree as dynamic because attach tags require runtime evaluation
    // In JS: mark_subtree_dynamic(context.path);
    mark_subtree_dynamic(&context.path);

    // TODO: Visit children with expression context
    // In JS: context.next({ ...context.state, expression: node.metadata.expression });
    // This requires implementing expression metadata tracking during parsing

    // TODO: Check for await expressions in the attach tag expression
    // In JS: if (node.metadata.expression.has_await) { e.illegal_await_expression(node); }
    // This requires expression analysis during parsing to detect await expressions
    // For now, we skip this check until expression metadata is available

    Ok(())
}
