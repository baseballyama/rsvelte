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
        return Err(errors::node_invalid_placement(&message).at(text.start, text.end));
    }

    check_bidirectional_control_characters(&text.data, text.start, context);

    Ok(())
}

/// Scan one `Text` node's data for bidirectional control characters.
///
/// Upstream's `Text` visitor is reached for every `Text` in the AST, which
/// includes the ones inside an attribute or directive value, so this is shared
/// with the attribute walk rather than living in the fragment path.
///
/// Upstream offsets the match into `node.data`, not `node.raw`, so an entity
/// ahead of the match shifts the reported range — mirrored deliberately.
pub fn check_bidirectional_control_characters(
    data: &str,
    node_start: u32,
    context: &mut VisitorContext,
) {
    for m in REGEX_BIDIRECTIONAL_CONTROL_CHARACTERS.find_iter(data) {
        let start = node_start + m.start() as u32;
        context.emit_warning(
            warnings::bidirectional_control_characters().at(start, start + m.len() as u32),
        );
    }
}
