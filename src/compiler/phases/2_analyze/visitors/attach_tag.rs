//! AttachTag visitor.
//!
//! Analyzes {@attach} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/AttachTag.js`.

use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::utils::walk_js_expression;
use crate::ast::template::AttachTag;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit an attach tag.
///
/// Corresponds to `AttachTag` in AttachTag.js.
///
/// {@attach} tags attach custom behaviors to elements and require dynamic handling.
pub fn visit(tag: &mut AttachTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark the subtree as dynamic because attach tags require runtime evaluation
    // In JS: mark_subtree_dynamic(context.path);
    mark_subtree_dynamic(&context.path);

    // Walk the attach expression to populate metadata (has_call, has_state, dependencies, etc.)
    // and to detect needs_context, imports, etc.
    // This ensures that calls like `mount(Child, ...)` or `flushSync()` inside
    // @attach expressions properly trigger needs_context.
    let value = tag.expression.as_json();
    walk_js_expression(value, context, &mut tag.metadata.expression)?;

    Ok(())
}
