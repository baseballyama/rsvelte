//! HTML utility functions.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/utils/html.js`
//!
//! It provides HTML-related utility functions such as checking for void elements
//! and decoding HTML character references.

use super::entities::decode_html_entities;

/// Windows-1252 character mapping for code points 128-159.
/// These are invalid in Unicode but browsers map them to specific characters.
///
/// Corresponds to `windows_1252` array in Svelte's html.js.
const WINDOWS_1252: [u32; 32] = [
    8364, 129, 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352, 8249, 338, 141, 381, 143, 144,
    8216, 8217, 8220, 8221, 8226, 8211, 8212, 732, 8482, 353, 8250, 339, 157, 382, 376,
];

const NUL: u32 = 0;

/// Validate and normalize a Unicode code point according to HTML parsing rules.
///
/// Corresponds to `validate_code` function in Svelte's html.js.
///
/// # Arguments
/// * `code` - The code point to validate
///
/// # Returns
/// The validated/normalized code point
pub fn validate_code(code: u32) -> u32 {
    // Line feed becomes generic whitespace
    if code == 10 {
        return 32;
    }

    // ASCII range
    if code < 128 {
        return code;
    }

    // Code points 128-159 are dealt with leniently by browsers, but they're incorrect.
    // We need to correct the mistake or we'll end up with missing € signs and so on
    if code <= 159 {
        return WINDOWS_1252[(code - 128) as usize];
    }

    // Basic multilingual plane
    if code < 55296 {
        return code;
    }

    // UTF-16 surrogate halves
    if code <= 57343 {
        return NUL;
    }

    // Rest of the basic multilingual plane
    if code <= 65535 {
        return code;
    }

    // Supplementary multilingual plane 0x10000 - 0x1ffff
    if (65536..=131071).contains(&code) {
        return code;
    }

    // Supplementary ideographic plane 0x20000 - 0x2ffff
    if (131072..=196607).contains(&code) {
        return code;
    }

    // Supplementary special-purpose plane 0xe0000 - 0xe07f and 0xe0100 - 0xe01ef
    if (917504..=917631).contains(&code) || (917760..=917999).contains(&code) {
        return code;
    }

    NUL
}

/// Decode HTML character references in a string.
///
/// This function corresponds to `decode_character_references` in Svelte's html.js.
/// It handles named entities (`&amp;`, `&lt;`, etc.), numeric entities (`&#123;`, `&#x7B;`),
/// and legacy entities without semicolons.
///
/// # Arguments
/// * `html` - The HTML string containing character references
/// * `is_attribute_value` - If true, applies attribute value decoding rules per HTML spec.
///   For entities without semicolons, doesn't decode if followed by `=` or alphanumeric.
///
/// # Returns
/// The decoded string with all character references replaced
#[allow(dead_code)]
pub fn decode_character_references(html: &str, is_attribute_value: bool) -> String {
    decode_html_entities(html, is_attribute_value)
}

/// Check if an element is a void element.
pub fn is_void_element(name: &str) -> bool {
    matches!(
        name,
        "area"
            | "base"
            | "br"
            | "col"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_code_line_feed() {
        assert_eq!(validate_code(10), 32); // Line feed becomes space
    }

    #[test]
    fn test_validate_code_ascii() {
        assert_eq!(validate_code(65), 65); // 'A'
        assert_eq!(validate_code(97), 97); // 'a'
        assert_eq!(validate_code(32), 32); // space
    }

    #[test]
    fn test_validate_code_windows_1252() {
        assert_eq!(validate_code(128), 8364); // Euro sign
        assert_eq!(validate_code(130), 8218); // Single low-9 quotation mark
        assert_eq!(validate_code(153), 8482); // Trademark
        assert_eq!(validate_code(159), 376); // Y with diaeresis
    }

    #[test]
    fn test_validate_code_surrogate_halves() {
        assert_eq!(validate_code(55296), NUL); // Start of surrogate range
        assert_eq!(validate_code(57343), NUL); // End of surrogate range
    }

    #[test]
    fn test_validate_code_valid_ranges() {
        assert_eq!(validate_code(200), 200); // Basic multilingual plane
        assert_eq!(validate_code(65535), 65535); // End of BMP
        assert_eq!(validate_code(65536), 65536); // Supplementary multilingual plane
        assert_eq!(validate_code(131071), 131071); // End of SMP
        assert_eq!(validate_code(131072), 131072); // Supplementary ideographic plane
        assert_eq!(validate_code(196607), 196607); // End of SIP
        assert_eq!(validate_code(917504), 917504); // Supplementary special-purpose plane
        assert_eq!(validate_code(917999), 917999); // End of SSP range
    }

    #[test]
    fn test_validate_code_invalid() {
        assert_eq!(validate_code(196608), NUL); // Beyond SIP
        assert_eq!(validate_code(917503), NUL); // Before SSP
        assert_eq!(validate_code(918000), NUL); // After SSP
        assert_eq!(validate_code(1000000), NUL); // Way beyond
    }

    #[test]
    fn test_decode_character_references() {
        assert_eq!(decode_character_references("&amp;", false), "&");
        assert_eq!(decode_character_references("&lt;div&gt;", false), "<div>");
        assert_eq!(decode_character_references("&#65;&#x42;", false), "AB");
    }

    #[test]
    fn test_decode_character_references_attribute() {
        // In attribute values, entities without semicolon followed by '=' should not be decoded
        assert_eq!(decode_character_references("&amp=", true), "&amp=");
        // But should decode if followed by semicolon
        assert_eq!(decode_character_references("&amp;", true), "&");
    }
}
