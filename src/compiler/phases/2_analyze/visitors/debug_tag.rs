//! DebugTag visitor.
//!
//! Analyzes {@debug} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/DebugTag.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::utils::{validate_opening_tag, walk_js_expression};
use crate::ast::template::DebugTag;

/// Visit a debug tag.
///
/// The {@debug} tag allows debugging reactive values during development.
/// In runes mode, it must start with '{@' (no whitespace).
///
/// Corresponds to `DebugTag(node, context)` in DebugTag.js.
pub fn visit(tag: &mut DebugTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // In runes mode, validate that the tag starts with '{@' (no whitespace)
    if context.analysis.runes {
        validate_opening_tag(tag.start as usize, &context.analysis.source, '@')?;
    }

    // Visit the identifiers to track their references
    for identifier in &tag.identifiers {
        let crate::ast::js::Expression::Value(value) = identifier;
        walk_js_expression(value, context, &mut tag.metadata.expression)?;
    }

    Ok(())
}
