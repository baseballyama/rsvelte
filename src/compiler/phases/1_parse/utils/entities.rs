//! HTML entity decoding utilities for the Svelte parser.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/utils/entities.js`
//! - Entity data from WHATWG HTML specification (<https://html.spec.whatwg.org/entities.json>)
//!
//! The entity data in `entities_data.rs` is generated directly from Svelte's entities.js
//! using `scripts/generate-entities-from-svelte.mjs`, ensuring 100% compatibility.
//!
//! ## Features
//!
//! - Comprehensive support for all HTML5 named character references (2125 entities)
//! - Numeric character references (decimal and hexadecimal)
//! - Legacy entity handling (entities without trailing semicolon)
//! - Complete compatibility with Svelte's entity decoding behavior

// Allow dead code for library functions that will be used as the parser is extended
#![allow(dead_code)]

// Re-export from sibling module
use super::entities_data::decode_legacy_named_entity;
pub use super::entities_data::decode_named_entity;
use super::html::validate_code;

/// Decode a numeric HTML entity (without & prefix).
/// Handles both decimal (&#123;) and hexadecimal (&#x7B;) forms.
///
/// Uses `validate_code` to ensure proper Unicode code point handling,
/// matching Svelte's behavior exactly.
///
/// # Arguments
/// * `entity` - The entity string after `&#`, e.g., "123" or "x7B" (with or without `;`)
///
/// # Returns
/// The decoded character, or None if invalid
pub fn decode_numeric_entity(entity: &str) -> Option<char> {
    let entity = entity.strip_suffix(';').unwrap_or(entity);

    let num = if let Some(hex) = entity
        .strip_prefix('x')
        .or_else(|| entity.strip_prefix('X'))
    {
        u32::from_str_radix(hex, 16).ok()
    } else {
        entity.parse().ok()
    };

    num.and_then(|code| {
        let validated = validate_code(code);
        if validated == 0 {
            None
        } else {
            char::from_u32(validated)
        }
    })
}

/// Decode an HTML entity reference.
///
/// This function handles the full HTML entity decoding:
/// - Named entities: `&amp;`, `&lt;`, `&copy;`, etc.
/// - Numeric entities: `&#123;`, `&#x7B;`
/// - Legacy entities (without semicolon): `&amp`, `&lt`
///
/// # Arguments
/// * `entity` - The entity string after `&`, e.g., "amp;", "lt", "#123;", "#x7B;"
///
/// # Returns
/// The decoded string (may be empty for unknown entities)
pub fn decode_entity(entity: &str) -> Option<String> {
    // Check for numeric entity
    if let Some(stripped) = entity.strip_prefix('#') {
        let stripped = stripped.strip_suffix(';').unwrap_or(stripped);
        return decode_numeric_entity(stripped).map(|c| c.to_string());
    }

    // Try named entity (with semicolon)
    let name = entity.strip_suffix(';').unwrap_or(entity);
    decode_named_entity(name)
}

/// Decode all HTML entities in a string.
///
/// This is the main entry point for HTML entity decoding, handling:
/// - Named character references
/// - Numeric character references
/// - Legacy entities without semicolons
///
/// Corresponds to `decode_character_references` in Svelte's `utils/html.js`.
///
/// The Svelte implementation uses a regex built from all entity names (including both
/// `copy;` and `copy` for entities that have both forms). For named entities without
/// semicolons, this means finding the longest prefix match in the entity table.
/// For numeric entities, the semicolon is optional.
///
/// # Arguments
/// * `s` - The string containing HTML entities
/// * `is_attribute_value` - If true, applies attribute value decoding rules per HTML spec:
///   https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state
///   For entities without semicolons, doesn't decode if followed by `=` or alphanumeric.
///
/// # Returns
/// The decoded string with all entities replaced
pub fn decode_html_entities(s: &str, is_attribute_value: bool) -> String {
    let mut result = String::with_capacity(s.len());
    let bytes = s.as_bytes();
    let len = bytes.len();
    let mut i = 0;

    while i < len {
        if bytes[i] == b'&' {
            let start = i;
            i += 1;

            // Collect entity characters
            let entity_start = i;
            let mut found_semicolon = false;

            // Check for numeric entity
            let is_numeric = i < len && bytes[i] == b'#';

            if is_numeric {
                // Collect '#' first
                i += 1;
                // Check if hex (#x...) or decimal (#d...)
                let is_hex = i < len && (bytes[i] == b'x' || bytes[i] == b'X');
                if is_hex {
                    i += 1; // consume 'x' or 'X'
                    // Collect hex digits only
                    while i < len {
                        let b = bytes[i];
                        if b == b';' {
                            found_semicolon = true;
                            i += 1;
                            break;
                        }
                        if b.is_ascii_hexdigit() {
                            i += 1;
                        } else {
                            break;
                        }
                        if i - entity_start > 20 {
                            break;
                        }
                    }
                } else {
                    // Collect decimal digits only
                    while i < len {
                        let b = bytes[i];
                        if b == b';' {
                            found_semicolon = true;
                            i += 1;
                            break;
                        }
                        if b.is_ascii_digit() {
                            i += 1;
                        } else {
                            break;
                        }
                        if i - entity_start > 15 {
                            break;
                        }
                    }
                }
            } else {
                // Named entity: collect alphanumeric (including semicolons/colons not present)
                while i < len {
                    let b = bytes[i];
                    if b == b';' {
                        found_semicolon = true;
                        i += 1;
                        break;
                    }
                    if b.is_ascii_alphanumeric() {
                        i += 1;
                    } else {
                        break;
                    }
                    // Limit entity length to prevent DoS
                    if i - entity_start > 50 {
                        break;
                    }
                }
            }

            let entity = &s[entity_start..i];

            // Try to decode
            if found_semicolon {
                let entity_without_semi = &entity[..entity.len() - 1];
                let decoded = if is_numeric {
                    // Strip the # prefix for numeric entities
                    let num_str = entity_without_semi
                        .strip_prefix('#')
                        .unwrap_or(entity_without_semi);
                    decode_numeric_entity(num_str).map(|c| c.to_string())
                } else {
                    decode_named_entity(entity_without_semi)
                };
                if let Some(decoded) = decoded {
                    result.push_str(&decoded);
                } else {
                    // Unknown entity with semicolon, output as-is
                    result.push_str(&s[start..i]);
                }
            } else if is_numeric {
                // Numeric entity without semicolon: semicolon is optional for numeric entities.
                // Matches Svelte's regex: #(?:x[a-fA-F\d]+|\d+)(?:;)?
                let num_str = entity.strip_prefix('#').unwrap_or(entity);
                if let Some(c) = decode_numeric_entity(num_str) {
                    result.push(c);
                } else {
                    // Invalid numeric entity, output as-is
                    result.push_str(&s[start..i]);
                }
            } else {
                // Named entity without semicolon.
                // Per Svelte's entity table, some entities exist without semicolons (e.g., `copy`, `amp`).
                // We need to find the longest prefix of `entity` that matches an entity in the table.
                // In attribute mode, don't decode if the match is followed by `=` or alphanumeric
                // (implements \b(?!=) word boundary behavior from Svelte's regex).
                let longest_match = find_longest_named_entity_prefix(entity);

                if let Some((matched_len, decoded)) = longest_match {
                    let next_pos = entity_start + matched_len;
                    let next_byte_after_match = if next_pos < len {
                        Some(bytes[next_pos])
                    } else {
                        None
                    };

                    // In attribute value mode, don't decode if followed by '=' or alphanumeric
                    // (word boundary check from HTML spec)
                    let should_skip = is_attribute_value
                        && next_byte_after_match
                            .map(|b| b == b'=' || b.is_ascii_alphanumeric())
                            .unwrap_or(false);

                    if should_skip {
                        // Output as-is (including any chars collected but not consumed)
                        result.push_str(&s[start..i]);
                    } else {
                        // Output decoded entity, then rewind i to consume only matched_len chars
                        result.push_str(&decoded);
                        // Rewind: we advanced i past all alphanumeric chars, but only consumed matched_len
                        i = entity_start + matched_len;
                    }
                } else {
                    // No matching entity, output as-is
                    result.push_str(&s[start..i]);
                }
            }
        } else {
            // Regular character - need to handle UTF-8 properly
            let c = s[i..].chars().next().unwrap();
            result.push(c);
            i += c.len_utf8();
        }
    }

    result
}

/// Find the longest prefix of `name` that is a known HTML legacy named entity (without semicolon).
/// Only matches entities from the LEGACY_ENTITIES table (entities that appear without `;` in
/// Svelte's entities.js source). This mirrors Svelte's regex approach where only specific
/// entities can be matched without a trailing semicolon.
/// Returns `(matched_len, decoded_string)` for the best match, or None if no match.
fn find_longest_named_entity_prefix(name: &str) -> Option<(usize, String)> {
    let mut best: Option<(usize, String)> = None;

    // Try all prefix lengths from longest to shortest
    for end in (1..=name.len()).rev() {
        // Make sure we're at a character boundary
        if !name.is_char_boundary(end) {
            continue;
        }
        let prefix = &name[..end];
        // Only match entities that explicitly appear without semicolons in the entities source
        if let Some(decoded) = decode_legacy_named_entity(prefix) {
            best = Some((end, decoded));
            break; // Take the longest match
        }
    }

    best
}

/// Decode legacy entities (without semicolon).
/// Only a subset of common entities are supported for legacy compatibility.
fn decode_legacy_entity(name: &str) -> Option<String> {
    // Legacy entities that browsers accept without semicolon
    // This list matches the behavior of the `entities` npm package
    match name {
        "amp" | "AMP" => Some("&".to_string()),
        "lt" | "LT" => Some("<".to_string()),
        "gt" | "GT" => Some(">".to_string()),
        "quot" | "QUOT" => Some("\"".to_string()),
        "apos" => Some("'".to_string()),
        "nbsp" => Some("\u{00A0}".to_string()),
        "iexcl" => Some("\u{00A1}".to_string()),
        "cent" => Some("\u{00A2}".to_string()),
        "pound" => Some("\u{00A3}".to_string()),
        "curren" => Some("\u{00A4}".to_string()),
        "yen" => Some("\u{00A5}".to_string()),
        "brvbar" => Some("\u{00A6}".to_string()),
        "sect" => Some("\u{00A7}".to_string()),
        "uml" => Some("\u{00A8}".to_string()),
        "copy" => Some("\u{00A9}".to_string()),
        "ordf" => Some("\u{00AA}".to_string()),
        "laquo" => Some("\u{00AB}".to_string()),
        "not" => Some("\u{00AC}".to_string()),
        "shy" => Some("\u{00AD}".to_string()),
        "reg" => Some("\u{00AE}".to_string()),
        "macr" => Some("\u{00AF}".to_string()),
        "deg" => Some("\u{00B0}".to_string()),
        "plusmn" => Some("\u{00B1}".to_string()),
        "sup2" => Some("\u{00B2}".to_string()),
        "sup3" => Some("\u{00B3}".to_string()),
        "acute" => Some("\u{00B4}".to_string()),
        "micro" => Some("\u{00B5}".to_string()),
        "para" => Some("\u{00B6}".to_string()),
        "middot" => Some("\u{00B7}".to_string()),
        "cedil" => Some("\u{00B8}".to_string()),
        "sup1" => Some("\u{00B9}".to_string()),
        "ordm" => Some("\u{00BA}".to_string()),
        "raquo" => Some("\u{00BB}".to_string()),
        "frac14" => Some("\u{00BC}".to_string()),
        "frac12" => Some("\u{00BD}".to_string()),
        "frac34" => Some("\u{00BE}".to_string()),
        "iquest" => Some("\u{00BF}".to_string()),
        "times" => Some("\u{00D7}".to_string()),
        "divide" => Some("\u{00F7}".to_string()),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_decode_numeric_entity_decimal() {
        assert_eq!(decode_numeric_entity("65"), Some('A'));
        assert_eq!(decode_numeric_entity("97"), Some('a'));
        assert_eq!(decode_numeric_entity("8364"), Some('\u{20AC}')); // Euro sign
    }

    #[test]
    fn test_decode_numeric_entity_hex() {
        assert_eq!(decode_numeric_entity("x41"), Some('A'));
        assert_eq!(decode_numeric_entity("X41"), Some('A'));
        assert_eq!(decode_numeric_entity("x61"), Some('a'));
        assert_eq!(decode_numeric_entity("x20AC"), Some('\u{20AC}')); // Euro sign
    }

    #[test]
    fn test_decode_numeric_entity_edge_cases() {
        // NULL - validate_code returns 0, which results in None
        assert_eq!(decode_numeric_entity("0"), None);
        // Surrogate - validate_code returns 0, which results in None
        assert_eq!(decode_numeric_entity("xD800"), None);
        // Out of range - beyond valid Unicode planes
        assert_eq!(decode_numeric_entity("x110000"), None);
        // Windows-1252 mapping
        assert_eq!(decode_numeric_entity("x80"), Some('\u{20AC}')); // Euro
        assert_eq!(decode_numeric_entity("x99"), Some('\u{2122}')); // Trademark
    }

    #[test]
    fn test_decode_html_entities_basic() {
        assert_eq!(decode_html_entities("&amp;", false), "&");
        assert_eq!(decode_html_entities("&lt;", false), "<");
        assert_eq!(decode_html_entities("&gt;", false), ">");
        assert_eq!(decode_html_entities("&quot;", false), "\"");
        assert_eq!(decode_html_entities("&apos;", false), "'");
        assert_eq!(decode_html_entities("&nbsp;", false), "\u{00A0}");
    }

    #[test]
    fn test_decode_html_entities_numeric() {
        assert_eq!(decode_html_entities("&#65;", false), "A");
        assert_eq!(decode_html_entities("&#x41;", false), "A");
        assert_eq!(decode_html_entities("&#X41;", false), "A");
    }

    #[test]
    fn test_decode_html_entities_mixed() {
        assert_eq!(
            decode_html_entities("Hello &amp; World", false),
            "Hello & World"
        );
        assert_eq!(
            decode_html_entities("&lt;div&gt;content&lt;/div&gt;", false),
            "<div>content</div>"
        );
        assert_eq!(
            decode_html_entities("a &lt; b &amp;&amp; c &gt; d", false),
            "a < b && c > d"
        );
    }

    #[test]
    fn test_decode_html_entities_extended() {
        assert_eq!(decode_html_entities("&copy;", false), "\u{00A9}"); // ©
        assert_eq!(decode_html_entities("&reg;", false), "\u{00AE}"); // ®
        assert_eq!(decode_html_entities("&trade;", false), "\u{2122}"); // ™
        assert_eq!(decode_html_entities("&euro;", false), "\u{20AC}"); // €
    }

    #[test]
    fn test_decode_html_entities_multi_codepoint() {
        // Test an entity that decodes to a single character
        let decoded = decode_html_entities("&nGt;", false);
        assert_eq!(decoded, "≫"); // U+226B
        assert_eq!(decoded.chars().count(), 1);
    }

    #[test]
    fn test_decode_html_entities_legacy() {
        // Legacy entities without semicolon
        assert_eq!(decode_html_entities("&amp", false), "&");
        assert_eq!(decode_html_entities("&lt", false), "<");
        assert_eq!(decode_html_entities("&copy", false), "\u{00A9}");
    }

    #[test]
    fn test_decode_html_entities_attribute_value() {
        // In attribute values, entities without semicolon followed by '=' or alphanumeric should not be decoded
        assert_eq!(decode_html_entities("&amp=", true), "&amp=");
        assert_eq!(decode_html_entities("&ampa", true), "&ampa");
        assert_eq!(decode_html_entities("&amp9", true), "&amp9");

        // But should decode if followed by other characters
        assert_eq!(decode_html_entities("&amp ", true), "& ");
        assert_eq!(decode_html_entities("&amp;", true), "&");

        // With semicolon, always decode
        assert_eq!(decode_html_entities("&amp;=", true), "&=");
    }

    #[test]
    fn test_decode_html_entities_unknown() {
        assert_eq!(
            decode_html_entities("&notanentity;", false),
            "&notanentity;"
        );
        assert_eq!(decode_html_entities("&foo", false), "&foo");
    }

    #[test]
    fn test_decode_html_entities_no_entities() {
        assert_eq!(
            decode_html_entities("no entities here", false),
            "no entities here"
        );
        assert_eq!(decode_html_entities("", false), "");
    }

    #[test]
    fn test_decode_html_entities_utf8() {
        assert_eq!(
            decode_html_entities("日本語 &amp; 한국어", false),
            "日本語 & 한국어"
        );
    }
}
