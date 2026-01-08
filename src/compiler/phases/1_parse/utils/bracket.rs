//! Bracket matching utilities for the Svelte parser.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to `svelte/packages/svelte/src/compiler/phases/1-parse/utils/bracket.js`
//!
//! It provides utilities for:
//! - Finding matching brackets (parentheses, braces, square brackets)
//! - Skipping over quoted strings and template literals
//! - Tracking bracket depth while parsing

// Allow dead code for library functions that will be used as the parser is extended
#![allow(dead_code)]

/// Character types for bracket matching
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BracketType {
    /// Round parenthesis: ( )
    Paren,
    /// Curly brace: { }
    Brace,
    /// Square bracket: [ ]
    Square,
}

impl BracketType {
    /// Get the opening character for this bracket type
    #[inline]
    pub fn open_char(self) -> char {
        match self {
            BracketType::Paren => '(',
            BracketType::Brace => '{',
            BracketType::Square => '[',
        }
    }

    /// Get the closing character for this bracket type
    #[inline]
    pub fn close_char(self) -> char {
        match self {
            BracketType::Paren => ')',
            BracketType::Brace => '}',
            BracketType::Square => ']',
        }
    }

    /// Create a BracketType from an opening character
    pub fn from_open_char(c: char) -> Option<Self> {
        match c {
            '(' => Some(BracketType::Paren),
            '{' => Some(BracketType::Brace),
            '[' => Some(BracketType::Square),
            _ => None,
        }
    }

    /// Create a BracketType from a closing character
    pub fn from_close_char(c: char) -> Option<Self> {
        match c {
            ')' => Some(BracketType::Paren),
            '}' => Some(BracketType::Brace),
            ']' => Some(BracketType::Square),
            _ => None,
        }
    }
}

/// Check if a character is an opening bracket
#[inline]
pub fn is_opening_bracket(c: char) -> bool {
    matches!(c, '(' | '{' | '[')
}

/// Check if a character is a closing bracket
#[inline]
pub fn is_closing_bracket(c: char) -> bool {
    matches!(c, ')' | '}' | ']')
}

/// Check if a character is a quote character
#[inline]
pub fn is_quote(c: char) -> bool {
    matches!(c, '\'' | '"' | '`')
}

/// Find the position of the matching closing bracket.
///
/// This function handles nested brackets and properly skips over
/// string literals and template literals.
///
/// # Arguments
/// * `source` - The source string
/// * `start` - The position of the opening bracket
///
/// # Returns
/// The position of the matching closing bracket, or None if not found
pub fn find_matching_bracket(source: &str, start: usize) -> Option<usize> {
    let bytes = source.as_bytes();
    if start >= bytes.len() {
        return None;
    }

    let open_char = bytes[start] as char;
    let bracket_type = BracketType::from_open_char(open_char)?;
    let close_char = bracket_type.close_char();

    let mut depth = 1;
    let mut i = start + 1;

    while i < bytes.len() && depth > 0 {
        let c = bytes[i] as char;

        // Skip string literals
        if c == '\'' || c == '"' {
            i = skip_string_literal(source, i)?;
            continue;
        }

        // Skip template literals
        if c == '`' {
            i = skip_template_literal(source, i)?;
            continue;
        }

        // Skip comments
        if c == '/' && i + 1 < bytes.len() {
            let next = bytes[i + 1] as char;
            if next == '/' {
                // Line comment - skip to end of line
                i += 2;
                while i < bytes.len() && bytes[i] != b'\n' {
                    i += 1;
                }
                if i < bytes.len() {
                    i += 1; // skip newline
                }
                continue;
            } else if next == '*' {
                // Block comment - skip to */
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                if i + 1 < bytes.len() {
                    i += 2; // skip */
                }
                continue;
            }
        }

        if c == open_char {
            depth += 1;
        } else if c == close_char {
            depth -= 1;
            if depth == 0 {
                return Some(i);
            }
        }

        i += 1;
    }

    None
}

/// Skip over a string literal (single or double quoted).
///
/// # Arguments
/// * `source` - The source string
/// * `start` - The position of the opening quote
///
/// # Returns
/// The position after the closing quote, or None if not found
pub fn skip_string_literal(source: &str, start: usize) -> Option<usize> {
    let bytes = source.as_bytes();
    if start >= bytes.len() {
        return None;
    }

    let quote = bytes[start];
    if quote != b'\'' && quote != b'"' {
        return None;
    }

    let mut i = start + 1;
    while i < bytes.len() {
        let c = bytes[i];
        if c == quote {
            return Some(i + 1); // Position after closing quote
        }
        if c == b'\\' && i + 1 < bytes.len() {
            i += 2; // Skip escape sequence
        } else {
            i += 1;
        }
    }

    None // Unclosed string
}

/// Skip over a template literal (backtick quoted).
///
/// This properly handles nested template expressions `${...}`.
///
/// # Arguments
/// * `source` - The source string
/// * `start` - The position of the opening backtick
///
/// # Returns
/// The position after the closing backtick, or None if not found
pub fn skip_template_literal(source: &str, start: usize) -> Option<usize> {
    let bytes = source.as_bytes();
    if start >= bytes.len() || bytes[start] != b'`' {
        return None;
    }

    let mut i = start + 1;
    while i < bytes.len() {
        let c = bytes[i];

        if c == b'`' {
            return Some(i + 1); // Position after closing backtick
        }

        if c == b'\\' && i + 1 < bytes.len() {
            i += 2; // Skip escape sequence
            continue;
        }

        // Handle template expression ${...}
        if c == b'$' && i + 1 < bytes.len() && bytes[i + 1] == b'{' {
            i += 2; // Skip ${
            let mut expr_depth = 1;

            while i < bytes.len() && expr_depth > 0 {
                let ec = bytes[i];

                if ec == b'\\' && i + 1 < bytes.len() {
                    i += 2;
                    continue;
                }

                // Handle strings inside template expression
                if ec == b'\'' || ec == b'"' {
                    if let Some(end) = skip_string_literal(source, i) {
                        i = end;
                        continue;
                    }
                }

                // Handle nested template literals
                if ec == b'`' {
                    if let Some(end) = skip_template_literal(source, i) {
                        i = end;
                        continue;
                    }
                }

                if ec == b'{' {
                    expr_depth += 1;
                } else if ec == b'}' {
                    expr_depth -= 1;
                }

                if expr_depth > 0 {
                    i += 1;
                }
            }

            if i < bytes.len() {
                i += 1; // Skip closing }
            }
            continue;
        }

        i += 1;
    }

    None // Unclosed template literal
}

/// Find the end of an expression, stopping at specified terminators.
///
/// This function properly handles nested brackets and string literals.
///
/// # Arguments
/// * `source` - The source string
/// * `start` - The starting position
/// * `terminators` - Characters that terminate the expression (at depth 0)
/// * `include_all_brackets` - If true, all bracket types affect depth
///
/// # Returns
/// The position of the terminator, or None if end of string reached
pub fn find_expression_end(
    source: &str,
    start: usize,
    terminators: &[char],
    include_all_brackets: bool,
) -> Option<usize> {
    let bytes = source.as_bytes();
    let mut i = start;
    let mut depth: i32 = 0;

    while i < bytes.len() {
        let c = bytes[i] as char;

        // Skip string literals
        if c == '\'' || c == '"' {
            if let Some(end) = skip_string_literal(source, i) {
                i = end;
                continue;
            }
        }

        // Skip template literals
        if c == '`' {
            if let Some(end) = skip_template_literal(source, i) {
                i = end;
                continue;
            }
        }

        // Check terminators at depth 0
        if depth == 0 && terminators.contains(&c) {
            return Some(i);
        }

        // Track bracket depth
        if include_all_brackets {
            if is_opening_bracket(c) {
                depth += 1;
            } else if is_closing_bracket(c) {
                if depth == 0 && terminators.contains(&c) {
                    return Some(i);
                }
                depth = depth.saturating_sub(1);
            }
        } else {
            // Only track braces
            if c == '{' {
                depth += 1;
            } else if c == '}' {
                if depth == 0 {
                    return Some(i);
                }
                depth -= 1;
            }
        }

        i += 1;
    }

    None
}

/// A helper struct for tracking bracket depth during parsing.
#[derive(Debug, Default, Clone, Copy)]
pub struct BracketDepth {
    /// Depth of round parentheses
    pub paren: i32,
    /// Depth of curly braces
    pub brace: i32,
    /// Depth of square brackets
    pub square: i32,
}

impl BracketDepth {
    /// Create a new BracketDepth with all counts at zero
    pub fn new() -> Self {
        Self::default()
    }

    /// Update depth based on a character
    #[inline]
    pub fn update(&mut self, c: char) {
        match c {
            '(' => self.paren += 1,
            ')' => self.paren -= 1,
            '{' => self.brace += 1,
            '}' => self.brace -= 1,
            '[' => self.square += 1,
            ']' => self.square -= 1,
            _ => {}
        }
    }

    /// Check if we're at the top level (all depths are zero or less)
    #[inline]
    pub fn is_top_level(&self) -> bool {
        self.paren <= 0 && self.brace <= 0 && self.square <= 0
    }

    /// Get total depth across all bracket types
    #[inline]
    pub fn total(&self) -> i32 {
        self.paren.max(0) + self.brace.max(0) + self.square.max(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_find_matching_bracket_simple() {
        assert_eq!(find_matching_bracket("(a + b)", 0), Some(6));
        assert_eq!(find_matching_bracket("{x: 1}", 0), Some(5));
        assert_eq!(find_matching_bracket("[1, 2]", 0), Some(5));
    }

    #[test]
    fn test_find_matching_bracket_nested() {
        assert_eq!(find_matching_bracket("(a + (b * c))", 0), Some(12));
        assert_eq!(find_matching_bracket("{x: {y: 1}}", 0), Some(10));
        assert_eq!(find_matching_bracket("[[1], [2]]", 0), Some(9));
    }

    #[test]
    fn test_find_matching_bracket_with_strings() {
        assert_eq!(find_matching_bracket("(')')", 0), Some(4));
        assert_eq!(find_matching_bracket("(\")\")", 0), Some(4));
        assert_eq!(find_matching_bracket("(`}`)", 0), Some(4));
    }

    #[test]
    fn test_find_matching_bracket_with_escaped_quotes() {
        assert_eq!(find_matching_bracket(r"('\'')", 0), Some(5));
        assert_eq!(find_matching_bracket(r#"("\"")"#, 0), Some(5));
    }

    #[test]
    fn test_skip_string_literal() {
        assert_eq!(skip_string_literal("'hello'", 0), Some(7));
        assert_eq!(skip_string_literal("\"world\"", 0), Some(7));
        assert_eq!(skip_string_literal(r"'it\'s'", 0), Some(7));
    }

    #[test]
    fn test_skip_template_literal() {
        assert_eq!(skip_template_literal("`hello`", 0), Some(7));
        assert_eq!(skip_template_literal("`${x}`", 0), Some(6));
        assert_eq!(skip_template_literal("`${x + y}`", 0), Some(10));
        assert_eq!(skip_template_literal("`${{a: 1}}`", 0), Some(11));
    }

    #[test]
    fn test_skip_template_literal_nested() {
        // Nested template literal
        assert_eq!(skip_template_literal("`${`nested`}`", 0), Some(13));
    }

    #[test]
    fn test_find_expression_end() {
        assert_eq!(find_expression_end("a, b", 0, &[','], true), Some(1));
        assert_eq!(find_expression_end("(a, b), c", 0, &[','], true), Some(6));
        assert_eq!(find_expression_end("{a: 1}, b", 0, &[','], true), Some(6));
    }

    #[test]
    fn test_bracket_depth() {
        let mut depth = BracketDepth::new();
        assert!(depth.is_top_level());

        depth.update('(');
        assert!(!depth.is_top_level());
        assert_eq!(depth.paren, 1);

        depth.update(')');
        assert!(depth.is_top_level());
        assert_eq!(depth.paren, 0);
    }

    #[test]
    fn test_find_matching_bracket_with_comments() {
        // Line comment
        assert_eq!(find_matching_bracket("(a // )\n)", 0), Some(8));
        // Block comment
        assert_eq!(find_matching_bracket("(a /* ) */ )", 0), Some(11));
    }
}
