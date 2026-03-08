//! DebugTag visitor.
//!
//! Analyzes {@debug} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/DebugTag.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::VisitorContext;
use super::shared::fragment::mark_subtree_dynamic;
use super::shared::utils::{validate_opening_tag, walk_js_expression};
use crate::ast::template::DebugTag;

/// Visit a debug tag.
///
/// The {@debug} tag allows debugging reactive values during development.
/// In runes mode, it must start with '{@' (no whitespace).
/// Arguments must be identifiers, not arbitrary expressions.
///
/// Corresponds to `DebugTag(node, context)` in DebugTag.js.
pub fn visit(tag: &mut DebugTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // In runes mode, validate that the tag starts with '{@' (no whitespace)
    if context.analysis.runes {
        validate_opening_tag(tag.start as usize, &context.analysis.source, '@')?;
    }

    // Validate that all arguments are identifiers
    // In the official Svelte parser, this is done in Phase 1, but our parser doesn't
    // have this check, so we do it here.
    for identifier in &tag.identifiers {
        if identifier.node_type() != Some("Identifier") {
            return Err(errors::debug_tag_invalid_arguments());
        }
    }

    // Mark the subtree as dynamic when there are identifiers.
    // In the official compiler, this happens via the Identifier visitor called from
    // context.next(). Since our walk_js_expression doesn't route through the
    // Identifier visitor, we call mark_subtree_dynamic explicitly here.
    if !tag.identifiers.is_empty() {
        mark_subtree_dynamic(&context.path);
    }

    // Visit the identifiers to track their references
    for identifier in &tag.identifiers {
        let value = identifier.as_json();
        walk_js_expression(value, context, &mut tag.metadata.expression)?;
    }

    Ok(())
}
