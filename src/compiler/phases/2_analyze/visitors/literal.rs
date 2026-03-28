//! Literal visitor.
//!
//! Analyzes literal values, specifically checking for bidirectional control characters.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Literal.js`.

use super::VisitorContext;
use crate::ast::typed_expr::{JsNode, LiteralValue};
use crate::compiler::phases::phase2_analyze::{AnalysisError, warnings};
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

/// Visit a literal value.
///
/// Checks string literals for bidirectional control characters which can
/// be used to alter code direction and have security implications.
///
/// # Arguments
///
/// * `node` - The Literal AST node (ESTree format)
/// * `context` - The visitor context
///
/// # Example
///
/// ```javascript
/// const text = "Hello\u202eWorld"; // Would trigger warning
/// ```
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check if the literal is a string
    if let Some(value) = node.get("value")
        && let Some(string_value) = value.as_str()
    {
        // Test for bidirectional control characters
        if get_bidirectional_regex().is_match(string_value) {
            context.emit_warning(warnings::bidirectional_control_characters());
        }
    }

    Ok(())
}

/// Visit a literal value (typed JsNode path).
pub fn visit_typed(node: &JsNode, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    if let JsNode::Literal { value, .. } = node
        && let LiteralValue::String(s) = value
        && get_bidirectional_regex().is_match(s.as_str())
    {
        context.emit_warning(warnings::bidirectional_control_characters());
    }
    Ok(())
}
