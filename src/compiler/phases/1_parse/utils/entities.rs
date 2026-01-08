//! HTML entity decoding utilities for the Svelte parser.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to the functionality provided by the `entities` npm package
//! that Svelte uses for decoding HTML named character references.
//!
//! ## Features
//!
//! - Comprehensive support for all HTML5 named character references (~2125 entities)
//! - Numeric character references (decimal and hexadecimal)
//! - Legacy entity handling (entities without trailing semicolon)

// Allow dead code for library functions that will be used as the parser is extended
#![allow(dead_code)]

// Re-export from sibling module
pub use super::entities_data::decode_named_entity;

/// Decode a numeric HTML entity (without & prefix).
/// Handles both decimal (&#123;) and hexadecimal (&#x7B;) forms.
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

    num.and_then(|n| {
        // Handle replacement characters for invalid codepoints
        // See: https://html.spec.whatwg.org/multipage/parsing.html#numeric-character-reference-end-state
        match n {
            0 => Some('\u{FFFD}'), // NULL -> REPLACEMENT CHARACTER
            // Surrogate range
            0xD800..=0xDFFF => Some('\u{FFFD}'),
            // Out of range
            n if n > 0x10FFFF => Some('\u{FFFD}'),
            // Control characters that map to specific characters
            0x80 => Some('\u{20AC}'), // EURO SIGN
            0x82 => Some('\u{201A}'), // SINGLE LOW-9 QUOTATION MARK
            0x83 => Some('\u{0192}'), // LATIN SMALL LETTER F WITH HOOK
            0x84 => Some('\u{201E}'), // DOUBLE LOW-9 QUOTATION MARK
            0x85 => Some('\u{2026}'), // HORIZONTAL ELLIPSIS
            0x86 => Some('\u{2020}'), // DAGGER
            0x87 => Some('\u{2021}'), // DOUBLE DAGGER
            0x88 => Some('\u{02C6}'), // MODIFIER LETTER CIRCUMFLEX ACCENT
            0x89 => Some('\u{2030}'), // PER MILLE SIGN
            0x8A => Some('\u{0160}'), // LATIN CAPITAL LETTER S WITH CARON
            0x8B => Some('\u{2039}'), // SINGLE LEFT-POINTING ANGLE QUOTATION MARK
            0x8C => Some('\u{0152}'), // LATIN CAPITAL LIGATURE OE
            0x8E => Some('\u{017D}'), // LATIN CAPITAL LETTER Z WITH CARON
            0x91 => Some('\u{2018}'), // LEFT SINGLE QUOTATION MARK
            0x92 => Some('\u{2019}'), // RIGHT SINGLE QUOTATION MARK
            0x93 => Some('\u{201C}'), // LEFT DOUBLE QUOTATION MARK
            0x94 => Some('\u{201D}'), // RIGHT DOUBLE QUOTATION MARK
            0x95 => Some('\u{2022}'), // BULLET
            0x96 => Some('\u{2013}'), // EN DASH
            0x97 => Some('\u{2014}'), // EM DASH
            0x98 => Some('\u{02DC}'), // SMALL TILDE
            0x99 => Some('\u{2122}'), // TRADE MARK SIGN
            0x9A => Some('\u{0161}'), // LATIN SMALL LETTER S WITH CARON
            0x9B => Some('\u{203A}'), // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK
            0x9C => Some('\u{0153}'), // LATIN SMALL LIGATURE OE
            0x9E => Some('\u{017E}'), // LATIN SMALL LETTER Z WITH CARON
            0x9F => Some('\u{0178}'), // LATIN CAPITAL LETTER Y WITH DIAERESIS
            // Other noncharacters
            0xFFFE | 0xFFFF => Some('\u{FFFD}'),
            // Valid codepoint
            n => char::from_u32(n),
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
/// # Arguments
/// * `s` - The string containing HTML entities
///
/// # Returns
/// The decoded string with all entities replaced
pub fn decode_html_entities(s: &str) -> String {
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

            while i < len {
                let b = bytes[i];
                if b == b';' {
                    found_semicolon = true;
                    i += 1;
                    break;
                }
                // Valid entity character
                if is_numeric {
                    // For numeric: #, digits, x, X
                    if b.is_ascii_alphanumeric() || b == b'#' {
                        i += 1;
                    } else {
                        break;
                    }
                } else {
                    // For named: alphanumeric
                    if b.is_ascii_alphanumeric() {
                        i += 1;
                    } else {
                        break;
                    }
                }

                // Limit entity length to prevent DoS
                if i - entity_start > 32 {
                    break;
                }
            }

            let entity = &s[entity_start..i];

            // Try to decode
            let decoded = if found_semicolon {
                let entity_without_semi = &entity[..entity.len() - 1];
                if is_numeric {
                    // Strip the # prefix for numeric entities
                    let num_str = entity_without_semi
                        .strip_prefix('#')
                        .unwrap_or(entity_without_semi);
                    decode_numeric_entity(num_str).map(|c| c.to_string())
                } else {
                    decode_named_entity(entity_without_semi)
                }
            } else {
                // Legacy: try common entities without semicolon
                decode_legacy_entity(&s[entity_start..i])
            };

            if let Some(decoded) = decoded {
                result.push_str(&decoded);
            } else {
                // Not a valid entity, output as-is
                result.push_str(&s[start..i]);
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
        // NULL replacement
        assert_eq!(decode_numeric_entity("0"), Some('\u{FFFD}'));
        // Surrogate replacement
        assert_eq!(decode_numeric_entity("xD800"), Some('\u{FFFD}'));
        // Out of range replacement
        assert_eq!(decode_numeric_entity("x110000"), Some('\u{FFFD}'));
        // Windows-1252 mapping
        assert_eq!(decode_numeric_entity("x80"), Some('\u{20AC}')); // Euro
        assert_eq!(decode_numeric_entity("x99"), Some('\u{2122}')); // Trademark
    }

    #[test]
    fn test_decode_html_entities_basic() {
        assert_eq!(decode_html_entities("&amp;"), "&");
        assert_eq!(decode_html_entities("&lt;"), "<");
        assert_eq!(decode_html_entities("&gt;"), ">");
        assert_eq!(decode_html_entities("&quot;"), "\"");
        assert_eq!(decode_html_entities("&apos;"), "'");
        assert_eq!(decode_html_entities("&nbsp;"), "\u{00A0}");
    }

    #[test]
    fn test_decode_html_entities_numeric() {
        assert_eq!(decode_html_entities("&#65;"), "A");
        assert_eq!(decode_html_entities("&#x41;"), "A");
        assert_eq!(decode_html_entities("&#X41;"), "A");
    }

    #[test]
    fn test_decode_html_entities_mixed() {
        assert_eq!(decode_html_entities("Hello &amp; World"), "Hello & World");
        assert_eq!(
            decode_html_entities("&lt;div&gt;content&lt;/div&gt;"),
            "<div>content</div>"
        );
        assert_eq!(
            decode_html_entities("a &lt; b &amp;&amp; c &gt; d"),
            "a < b && c > d"
        );
    }

    #[test]
    fn test_decode_html_entities_extended() {
        assert_eq!(decode_html_entities("&copy;"), "\u{00A9}"); // ©
        assert_eq!(decode_html_entities("&reg;"), "\u{00AE}"); // ®
        assert_eq!(decode_html_entities("&trade;"), "\u{2122}"); // ™
        assert_eq!(decode_html_entities("&euro;"), "\u{20AC}"); // €
    }

    #[test]
    fn test_decode_html_entities_multi_codepoint() {
        // Some entities decode to multiple characters
        let decoded = decode_html_entities("&nGt;");
        assert!(decoded.chars().count() == 2); // ≫⃒
    }

    #[test]
    fn test_decode_html_entities_legacy() {
        // Legacy entities without semicolon
        assert_eq!(decode_html_entities("&amp"), "&");
        assert_eq!(decode_html_entities("&lt"), "<");
        assert_eq!(decode_html_entities("&copy"), "\u{00A9}");
    }

    #[test]
    fn test_decode_html_entities_unknown() {
        assert_eq!(decode_html_entities("&notanentity;"), "&notanentity;");
        assert_eq!(decode_html_entities("&foo"), "&foo");
    }

    #[test]
    fn test_decode_html_entities_no_entities() {
        assert_eq!(decode_html_entities("no entities here"), "no entities here");
        assert_eq!(decode_html_entities(""), "");
    }

    #[test]
    fn test_decode_html_entities_utf8() {
        assert_eq!(
            decode_html_entities("日本語 &amp; 한국어"),
            "日本語 & 한국어"
        );
    }
}
