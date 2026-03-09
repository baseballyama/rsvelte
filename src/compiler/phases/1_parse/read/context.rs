//! Context pattern parsing for Svelte blocks.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to `svelte/packages/svelte/src/compiler/phases/1-parse/read/context.js`
//!
//! It provides pattern parsing for:
//! - `{#each}` block contexts: `{#each items as item}`, `{#each items as { name, id }}`
//! - `{#snippet}` block parameters: `{#snippet foo(arg1, arg2)}`
//! - Type annotations: `{#each items as item: Item}`

use crate::ast::js::Expression;
use crate::compiler::phases::phase1_parse::utils::bracket::find_matching_bracket;

/// Read a context pattern from the parser's current position.
///
/// This handles:
/// - Simple identifiers: `item`
/// - Object patterns: `{ name, id }`
/// - Array patterns: `[first, ...rest]`
/// - Type annotations: `item: ItemType`
///
/// # Arguments
/// * `source` - The source string
/// * `start` - Starting position in the source
/// * `line_offsets` - Line offset table for position calculations
///
/// # Returns
/// A tuple of (Pattern Expression, end position)
#[allow(dead_code)]
pub fn read_pattern(source: &str, start: usize, line_offsets: &[usize]) -> (Expression, usize) {
    let bytes = source.as_bytes();
    let mut i = start;

    // Skip leading whitespace
    while i < bytes.len() && is_whitespace(bytes[i]) {
        i += 1;
    }

    if i >= bytes.len() {
        return (
            create_simple_identifier("", start, start, line_offsets),
            start,
        );
    }

    let c = bytes[i];

    // Check for destructuring pattern
    if c == b'{' || c == b'[' {
        // Find matching bracket
        let open_char = c as char;
        if let Some(end_pos) = find_matching_bracket(source, i + 1, open_char) {
            let pattern_str = &source[i..=end_pos];
            let pattern = super::expression::parse_binding_pattern(pattern_str, i, line_offsets)
                .unwrap_or_else(|_| {
                    crate::ast::js::Expression::Value(
                        serde_json::json!({"type": "Identifier", "name": "", "start": i, "end": i}),
                    )
                });

            // Check for type annotation after the pattern
            let (type_annotation, final_pos) =
                read_type_annotation(source, end_pos + 1, line_offsets);

            if type_annotation.is_some() {
                // TODO: Attach type annotation to pattern
                return (pattern, final_pos);
            }

            return (pattern, end_pos + 1);
        }
    }

    // Simple identifier
    let id_start = i;
    while i < bytes.len() && is_identifier_char(bytes[i]) {
        i += 1;
    }

    let id_name = &source[id_start..i];
    if id_name.is_empty() {
        return (
            create_simple_identifier("", start, start, line_offsets),
            start,
        );
    }

    // Check for type annotation
    let (type_annotation, final_pos) = read_type_annotation(source, i, line_offsets);

    let pattern = create_simple_identifier(id_name, id_start, i, line_offsets);

    if type_annotation.is_some() {
        // TODO: Attach type annotation to pattern when TypeScript support is needed
        return (pattern, final_pos);
    }

    (pattern, i)
}

/// Read a type annotation if present.
///
/// # Arguments
/// * `source` - The source string
/// * `start` - Starting position (after the pattern)
/// * `line_offsets` - Line offset table
///
/// # Returns
/// A tuple of (Option<TypeAnnotation>, end position)
fn read_type_annotation(
    source: &str,
    start: usize,
    _line_offsets: &[usize],
) -> (Option<TypeAnnotation>, usize) {
    let bytes = source.as_bytes();
    let mut i = start;

    // Skip whitespace
    while i < bytes.len() && is_whitespace(bytes[i]) {
        i += 1;
    }

    // Check for colon
    if i >= bytes.len() || bytes[i] != b':' {
        return (None, start);
    }

    i += 1; // Skip ':'

    // Skip whitespace after colon
    while i < bytes.len() && is_whitespace(bytes[i]) {
        i += 1;
    }

    // Read the type expression
    // For now, we just skip to the next comma, closing paren/bracket, or end of expression
    let type_start = i;
    let mut depth = 0;

    while i < bytes.len() {
        let c = bytes[i];

        // Track nested brackets
        if c == b'(' || c == b'[' || c == b'{' || c == b'<' {
            depth += 1;
        } else if c == b')' || c == b']' || c == b'}' || c == b'>' {
            if depth == 0 {
                break;
            }
            depth -= 1;
        } else if depth == 0 && (c == b',' || c == b'=' || c == b'\n') {
            break;
        }

        i += 1;
    }

    if i > type_start {
        let _type_content = &source[type_start..i];
        // For now, we don't fully parse the type - just track its position
        return (Some(TypeAnnotation { start, end: i }), i);
    }

    (None, start)
}

/// Simple type annotation placeholder.
/// Full TypeScript type parsing would require more complex implementation.
#[derive(Debug, Clone)]
#[allow(dead_code)]
struct TypeAnnotation {
    start: usize,
    end: usize,
}

/// Check if a byte is a whitespace character.
#[inline]
fn is_whitespace(b: u8) -> bool {
    matches!(b, b' ' | b'\t' | b'\n' | b'\r')
}

/// Check if a byte is valid in an identifier.
#[inline]
fn is_identifier_char(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'$'
}

/// Create a simple identifier expression.
fn create_simple_identifier(
    name: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    super::expression::create_identifier_with_character(name, start, end, line_offsets)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn get_line_offsets(source: &str) -> Vec<usize> {
        let mut offsets = vec![0];
        for (i, c) in source.char_indices() {
            if c == '\n' {
                offsets.push(i + 1);
            }
        }
        offsets
    }

    #[test]
    fn test_read_simple_identifier() {
        let source = "item";
        let line_offsets = get_line_offsets(source);
        let (pattern, end) = read_pattern(source, 0, &line_offsets);

        assert_eq!(end, 4);
        let val = pattern.as_json();
        assert_eq!(val["type"], "Identifier");
        assert_eq!(val["name"], "item");
    }

    #[test]
    fn test_read_pattern_with_whitespace() {
        let source = "  item  ";
        let line_offsets = get_line_offsets(source);
        let (pattern, end) = read_pattern(source, 0, &line_offsets);

        assert_eq!(end, 6);
        let val = pattern.as_json();
        assert_eq!(val["type"], "Identifier");
        assert_eq!(val["name"], "item");
    }

    #[test]
    fn test_read_object_pattern() {
        let source = "{ name, id }";
        let line_offsets = get_line_offsets(source);
        let (pattern, end) = read_pattern(source, 0, &line_offsets);

        assert_eq!(end, 12);
        let val = pattern.as_json();
        assert_eq!(val["type"], "ObjectPattern");
    }

    #[test]
    fn test_read_array_pattern() {
        let source = "[first, second]";
        let line_offsets = get_line_offsets(source);
        let (pattern, end) = read_pattern(source, 0, &line_offsets);

        assert_eq!(end, 15);
        let val = pattern.as_json();
        assert_eq!(val["type"], "ArrayPattern");
    }

    #[test]
    fn test_read_identifier_with_type_annotation() {
        let source = "item: string";
        let line_offsets = get_line_offsets(source);
        let (_pattern, end) = read_pattern(source, 0, &line_offsets);

        // End should be after the type annotation
        assert_eq!(end, 12);
    }
}
