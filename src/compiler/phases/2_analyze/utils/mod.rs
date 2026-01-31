//! Utility functions for the analyzer.
//!
//! Corresponds to Svelte's `2-analyze/utils/` directory.

mod check_graph_for_cycles;

pub use check_graph_for_cycles::check_graph_for_cycles;

use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    static ref SVELTE_IGNORE_REGEX: Regex = Regex::new(r"^\s*svelte-ignore\s").unwrap();
}

/// Map of legacy warning codes to new codes.
/// Corresponds to `replacements` in Svelte's extract_svelte_ignore.js.
fn get_replacement(code: &str) -> Option<&'static str> {
    match code {
        "non-top-level-reactive-declaration" => Some("reactive_declaration_invalid_placement"),
        "module-script-reactive-declaration" => Some("reactive_declaration_module_script"),
        "empty-block" => Some("block_empty"),
        "avoid-is" => Some("attribute_avoid_is"),
        "invalid-html-attribute" => Some("attribute_invalid_property_name"),
        "a11y-structure" => Some("a11y_figcaption_parent"),
        "illegal-attribute-character" => Some("attribute_illegal_colon"),
        "invalid-rest-eachblock-binding" => Some("bind_invalid_each_rest"),
        "unused-export-let" => Some("export_let_unused"),
        _ => None,
    }
}

/// Extract svelte-ignore codes from a comment.
///
/// Corresponds to `extract_svelte_ignore` in Svelte's extract_svelte_ignore.js.
///
/// # Arguments
///
/// * `text` - The comment text (without the `<!--` and `-->` delimiters)
/// * `runes` - Whether we're in runes mode (affects parsing strictness)
///
/// # Returns
///
/// A vector of warning codes to ignore.
pub fn extract_svelte_ignore(text: &str, runes: bool) -> Vec<String> {
    let Some(captures) = SVELTE_IGNORE_REGEX.find(text) else {
        return Vec::new();
    };

    let rest = &text[captures.end()..];
    let mut ignores = Vec::new();

    if runes {
        // Runes mode: warnings must be separated by commas
        // Everything after the last comma-separated warning is prose
        lazy_static! {
            static ref RUNES_CODE_REGEX: Regex = Regex::new(r"([\w$-]+)(,)?").unwrap();
        }

        for caps in RUNES_CODE_REGEX.captures_iter(rest) {
            let code = &caps[1];

            // Add the code (transform legacy codes)
            if let Some(replacement) = get_replacement(code) {
                ignores.push(replacement.to_string());
            } else {
                // Convert kebab-case to snake_case
                ignores.push(code.replace('-', "_"));
            }

            // Stop if no trailing comma
            if caps.get(2).is_none() {
                break;
            }
        }
    } else {
        // Non-runes mode: lax parsing, collect all word-like tokens
        lazy_static! {
            static ref LEGACY_CODE_REGEX: Regex = Regex::new(r"[\w$-]+").unwrap();
        }

        for mat in LEGACY_CODE_REGEX.find_iter(rest) {
            let code = mat.as_str();
            ignores.push(code.to_string());

            // Also add the replacement/transformed version
            if let Some(replacement) = get_replacement(code) {
                ignores.push(replacement.to_string());
            } else {
                // Convert kebab-case to snake_case
                let transformed = code.replace('-', "_");
                if transformed != code {
                    ignores.push(transformed);
                }
            }
        }
    }

    ignores
}
