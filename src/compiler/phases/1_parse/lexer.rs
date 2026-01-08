//! Lexer utilities for the Svelte parser.
//!
//! This module provides low-level utilities for tokenizing Svelte source code.

/// Check if a character is a valid start of a JavaScript identifier.
#[inline]
#[allow(dead_code)]
pub fn is_identifier_start(c: char) -> bool {
    c.is_ascii_alphabetic() || c == '_' || c == '$'
}

/// Check if a character is a valid part of a JavaScript identifier.
#[inline]
#[allow(dead_code)]
pub fn is_identifier_char(c: char) -> bool {
    c.is_ascii_alphanumeric() || c == '_' || c == '$'
}

/// Check if a character is whitespace.
#[inline]
#[allow(dead_code)]
pub fn is_whitespace(c: char) -> bool {
    matches!(c, ' ' | '\t' | '\n' | '\r' | '\x0C')
}

/// Check if a string is a valid HTML void element (self-closing).
#[allow(dead_code)]
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

/// HTML entities for decoding.
pub fn decode_html_entity(entity: &str) -> Option<char> {
    match entity {
        "amp" => Some('&'),
        "lt" => Some('<'),
        "gt" => Some('>'),
        "quot" => Some('"'),
        "apos" => Some('\''),
        "nbsp" => Some('\u{00A0}'),
        // Add more entities as needed
        _ => None,
    }
}

/// Decode HTML entities in a string.
pub fn decode_html_entities(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '&' {
            let mut entity = String::new();
            let mut found_semicolon = false;
            let mut terminator: Option<char> = None;

            // Collect entity characters
            while let Some(&next_c) = chars.peek() {
                if next_c == ';' {
                    found_semicolon = true;
                    chars.next();
                    break;
                }
                // Stop at non-alphanumeric (except #) - this is a potential entity terminator
                if !next_c.is_alphanumeric() && next_c != '#' {
                    terminator = Some(next_c);
                    break;
                }
                entity.push(next_c);
                chars.next();
                if entity.len() > 10 {
                    break;
                }
            }

            // If at end of input, terminator is implicit
            if !found_semicolon && terminator.is_none() && chars.peek().is_none() {
                terminator = Some(' '); // Treat end-of-string as terminator
            }

            let decoded = if found_semicolon {
                // Try to decode with semicolon
                if let Some(stripped) = entity.strip_prefix('#') {
                    // Numeric entity
                    let num = if let Some(hex) = stripped
                        .strip_prefix('x')
                        .or_else(|| stripped.strip_prefix('X'))
                    {
                        u32::from_str_radix(hex, 16).ok()
                    } else {
                        stripped.parse().ok()
                    };
                    num.and_then(char::from_u32)
                } else {
                    decode_html_entity(&entity)
                }
            } else if terminator.is_some() {
                // Legacy behavior: decode known entities without semicolon
                // when followed by whitespace, end of string, or non-alphanumeric
                decode_html_entity(&entity)
            } else {
                None
            };

            if let Some(decoded_char) = decoded {
                result.push(decoded_char);
            } else {
                // Not a valid entity, output as-is
                result.push('&');
                result.push_str(&entity);
                if found_semicolon {
                    result.push(';');
                }
            }
        } else {
            result.push(c);
        }
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_decode_html_entities() {
        assert_eq!(decode_html_entities("&amp;"), "&");
        assert_eq!(decode_html_entities("&lt;div&gt;"), "<div>");
        assert_eq!(decode_html_entities("&#65;"), "A");
        assert_eq!(decode_html_entities("&#x41;"), "A");
        assert_eq!(decode_html_entities("no entities"), "no entities");
    }

    #[test]
    fn test_is_void_element() {
        assert!(is_void_element("br"));
        assert!(is_void_element("input"));
        assert!(!is_void_element("div"));
        assert!(!is_void_element("span"));
    }
}
