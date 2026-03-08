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
pub fn visit(tag: &AttachTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark the subtree as dynamic because attach tags require runtime evaluation
    // In JS: mark_subtree_dynamic(context.path);
    mark_subtree_dynamic(&context.path);

    // Walk the attach expression to detect needs_context, imports, etc.
    // This ensures that calls like `mount(Child, ...)` or `flushSync()` inside
    // @attach expressions properly trigger needs_context.
    super::script::walk_expression(&tag.expression, context)?;

    // TODO: Check for await expressions in the attach tag expression
    // In JS: if (node.metadata.expression.has_await) { e.illegal_await_expression(node); }
    // This requires expression analysis during parsing to detect await expressions
    // For now, we skip this check until expression metadata is available

    Ok(())
}
