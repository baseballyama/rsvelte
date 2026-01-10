//! DebugTag visitor.
//!
//! Analyzes {@debug} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/DebugTag.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::utils::validate_opening_tag;
use crate::ast::template::DebugTag;

/// Visit a debug tag.
///
/// The {@debug} tag allows debugging reactive values during development.
/// In runes mode, it must start with '{@' (no whitespace).
///
/// Corresponds to `DebugTag(node, context)` in DebugTag.js.
pub fn visit(tag: &DebugTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // In runes mode, validate that the tag starts with '{@' (no whitespace)
    if context.analysis.runes {
        validate_opening_tag(tag.start as usize, &context.analysis.source, '@')?;
    }

    // The JavaScript implementation calls context.next(), which continues
    // the traversal to child nodes. For {@debug}, we need to visit the
    // identifiers to track their references.
    //
    // TODO: Visit the identifiers in tag.identifiers
    // This requires:
    // 1. Implementing visitor for Expression nodes
    // 2. Tracking identifier references in the analysis
    //
    // For now, we just validate the tag structure

    Ok(())
}
