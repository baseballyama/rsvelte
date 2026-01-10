//! Text visitor.
//!
//! Analyzes text nodes.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Text.js`.

use super::VisitorContext;
use crate::ast::template::Text;
use crate::compiler::phases::phase2_analyze::{AnalysisError, warnings};
use regex::Regex;
use std::sync::LazyLock;

/// Regex pattern for detecting bidirectional control characters.
static REGEX_BIDIRECTIONAL_CONTROL_CHARACTERS: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"[\u{202a}\u{202b}\u{202c}\u{202d}\u{202e}\u{2066}\u{2067}\u{2068}\u{2069}]+")
        .expect("Failed to compile bidirectional control characters regex")
});

/// Visit a text node.
pub fn visit(text: &Text, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for bidirectional control characters
    for _m in REGEX_BIDIRECTIONAL_CONTROL_CHARACTERS.find_iter(&text.data) {
        context.emit_warning(warnings::bidirectional_control_characters());
    }

    Ok(())
}

/// Alias for visit function.
pub fn visit_text(text: &Text, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    visit(text, context)
}
