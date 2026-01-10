//! TemplateElement visitor.
//!
//! Analyzes template literal elements, specifically checking for bidirectional control characters.
//!
//! Corresponds to Svelte's `2-analyze/visitors/TemplateElement.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use regex::Regex;
use serde_json::Value;
use std::sync::OnceLock;

/// Regex pattern for detecting bidirectional control characters.
///
/// These Unicode characters can be used to alter the visual direction of code
/// and could have unintended security consequences.
///
/// Unicode characters:
/// - U+202A: LEFT-TO-RIGHT EMBEDDING
/// - U+202B: RIGHT-TO-LEFT EMBEDDING
/// - U+202C: POP DIRECTIONAL FORMATTING
/// - U+202D: LEFT-TO-RIGHT OVERRIDE
/// - U+202E: RIGHT-TO-LEFT OVERRIDE
/// - U+2066: LEFT-TO-RIGHT ISOLATE
/// - U+2067: RIGHT-TO-LEFT ISOLATE
/// - U+2068: FIRST STRONG ISOLATE
/// - U+2069: POP DIRECTIONAL ISOLATE
///
/// Corresponds to `regex_bidirectional_control_characters` in Svelte's `patterns.js`.
static REGEX_BIDIRECTIONAL_CONTROL_CHARACTERS: OnceLock<Regex> = OnceLock::new();

fn get_bidirectional_regex() -> &'static Regex {
    REGEX_BIDIRECTIONAL_CONTROL_CHARACTERS.get_or_init(|| {
        Regex::new(r"[\u{202a}\u{202b}\u{202c}\u{202d}\u{202e}\u{2066}\u{2067}\u{2068}\u{2069}]+")
            .expect("Failed to compile bidirectional control characters regex")
    })
}

/// Visit a template element (part of a template literal).
///
/// Checks template literal content for bidirectional control characters which can
/// be used to alter code direction and have security implications.
///
/// # Arguments
///
/// * `node` - The TemplateElement AST node (ESTree format)
/// * `context` - The visitor context
///
/// # Example
///
/// ```javascript
/// const text = `Hello\u202eWorld`; // Would trigger warning
/// ```
pub fn visit(node: &Value, _context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check if the template element has a cooked value
    // ESTree TemplateElement has structure: { value: { cooked: string | null, raw: string } }
    if let Some(value_obj) = node.get("value")
        && let Some(cooked) = value_obj.get("cooked")
    {
        // cooked can be null if the template element contains an invalid escape sequence
        if let Some(cooked_str) = cooked.as_str() {
            // Test for bidirectional control characters
            if get_bidirectional_regex().is_match(cooked_str) {
                // TODO: Once the warning system is implemented, emit warning here:
                // w::bidirectional_control_characters(node);
                //
                // For now, we detect the issue but don't emit warnings since
                // the warning infrastructure isn't fully implemented yet.
                // The warning message should be:
                // "A bidirectional control character was detected in your code.
                //  These characters can be used to alter the visual direction of
                //  your code and could have unintended consequences"
            }
        }
    }

    Ok(())
}
