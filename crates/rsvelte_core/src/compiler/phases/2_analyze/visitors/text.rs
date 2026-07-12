//! Text visitor.
//!
//! Analyzes text nodes.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Text.js`.

use super::VisitorContext;
use super::regular_element::is_tag_valid_with_parent;
use crate::ast::template::Text;
use crate::compiler::phases::phase2_analyze::{AnalysisError, errors, warnings};
use regex::Regex;
use std::sync::LazyLock;

/// Regex pattern for detecting bidirectional control characters.
static REGEX_BIDIRECTIONAL_CONTROL_CHARACTERS: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"[\u{202a}\u{202b}\u{202c}\u{202d}\u{202e}\u{2066}\u{2067}\u{2068}\u{2069}]+")
        .expect("Failed to compile bidirectional control characters regex")
});

/// Regex pattern for non-whitespace characters.
static REGEX_NOT_WHITESPACE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"\S").expect("Failed to compile non-whitespace regex"));

/// Visit a text node.
pub fn visit(text: &Text, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate text placement - non-whitespace text cannot be in elements that don't allow #text
    // Reference: svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/Text.js L16-25
    if let Some(ref parent_element) = context.parent_element
        && REGEX_NOT_WHITESPACE.is_match(&text.data)
        && let Some(message) = is_tag_valid_with_parent("#text", parent_element)
    {
        return Err(errors::node_invalid_placement(&message));
    }

    // Check for bidirectional control characters
    for _m in REGEX_BIDIRECTIONAL_CONTROL_CHARACTERS.find_iter(&text.data) {
        context.emit_warning(warnings::bidirectional_control_characters());
    }

    Ok(())
}
