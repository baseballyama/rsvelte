//! Bracket matching utilities for the Svelte parser.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to `svelte/packages/svelte/src/compiler/phases/1-parse/utils/bracket.js`

use memchr::{memchr, memmem};

use crate::error::{ParseError, ParseResult};
use rustc_hash::FxHashMap;

use super::super::parser::Parser;

/// Returns `usize::MAX` if `num` is negative, else `num` as usize.
///
/// Corresponds to JS `Infinity` when negative.
#[inline]
fn infinity_if_negative(num: i32) -> usize {
    if num < 0 { usize::MAX } else { num as usize }
}

/// Find the end of a string expression.
///
/// # Arguments
/// * `string` - The string to search
/// * `search_start_index` - The index to start searching at
/// * `string_start_char` - The character that started this string (`'`, `"`, or `` ` ``)
///
/// # Returns
/// The index of the end of this string expression, or `usize::MAX` if not found
fn find_string_end(string: &str, search_start_index: usize, string_start_char: char) -> usize {
    let string_to_search = if string_start_char == '`' {
        string
    } else {
        // we could slice at the search start index, but this way the index remains valid
        // For single/double quotes, search only until the end of the current line
        let newline_pos = memchr(b'\n', &string.as_bytes()[search_start_index..])
            .map(|p| search_start_index + p)
            .unwrap_or(string.len()); // If no newline, use the whole string
        &string[0..newline_pos]
    };

    find_unescaped_char(string_to_search, search_start_index, string_start_char)
}

/// Find the end of a regex expression.
///
/// # Arguments
/// * `string` - The string to search
/// * `search_start_index` - The index to start searching at
///
/// # Returns
/// The index of the end of this regex expression, or `usize::MAX` if not found
fn find_regex_end(string: &str, search_start_index: usize) -> usize {
    find_unescaped_char(string, search_start_index, '/')
}

/// Find the first unescaped instance of a character.
///
/// # Arguments
/// * `string` - The string to search
/// * `search_start_index` - The index to begin the search at
/// * `char` - The character to search for
///
/// # Returns
/// The index of the first unescaped instance of `char`, or `usize::MAX` if not found
fn find_unescaped_char(string: &str, search_start_index: usize, ch: char) -> usize {
    let mut i = search_start_index;
    loop {
        let found_index = string[i..].find(ch).map(|p| i + p).unwrap_or(usize::MAX);

        if found_index == usize::MAX {
            return usize::MAX;
        }

        if found_index == 0 || count_leading_backslashes(string, found_index - 1).is_multiple_of(2)
        {
            return found_index;
        }

        i = found_index + 1;
    }
}

/// Count consecutive leading backslashes before `search_start_index`.
///
/// # Example
/// ```
/// // count_leading_backslashes("\\\\\\foo", 2) == 3
/// // (the backslashes have to be escaped in the string literal)
/// ```
///
/// # Arguments
/// * `string` - The string to search
/// * `search_start_index` - The index to begin the search at (searching backwards)
fn count_leading_backslashes(string: &str, search_start_index: usize) -> usize {
    let bytes = string.as_bytes();
    let mut i = search_start_index;
    let mut count = 0;

    while i < bytes.len() && bytes[i] == b'\\' {
        count += 1;
        if i == 0 {
            break;
        }
        i = i.wrapping_sub(1);
    }

    count
}

/// Finds the corresponding closing bracket, ignoring brackets found inside comments,
/// strings, or regex expressions.
///
/// # Arguments
/// * `template` - The string to search
/// * `index` - The index to begin the search at (after the opening bracket)
/// * `open` - The opening bracket (e.g., `'{'` will search for `'}'`)
///
/// # Returns
/// The index of the closing bracket, or `None` if not found
pub fn find_matching_bracket(template: &str, index: usize, open: char) -> Option<usize> {
    let close = match open {
        '{' => '}',
        '(' => ')',
        '[' => ']',
        _ => return None,
    };
    let bytes = template.as_bytes();

    // Fast path: for simple expressions like `{identifier}` or `{a.b.c}`,
    // scan for the closing bracket directly. If we only encounter identifier
    // characters, dots, whitespace, and no nesting/string/comment characters,
    // we can return immediately without the full state machine.
    if open == '{' {
        let remaining = &bytes[index..];
        // Use memchr to find the first '}' quickly
        if let Some(close_offset) = memchr(b'}', remaining) {
            // Check if the content between open and close is "simple" -
            // contains no characters that require the full state machine:
            // no nested brackets, no strings, no comments, no regex
            let content = &remaining[..close_offset];
            let is_simple = content.iter().all(|&b| {
                b.is_ascii_alphanumeric()
                    || b == b'_'
                    || b == b'$'
                    || b == b'.'
                    || b == b' '
                    || b == b'\t'
                    || b == b'\n'
                    || b == b'\r'
                    || b == b'?'  // optional chaining
                    || b == b','
                    || b == b':'  // ternary, object literal
                    || b == b';'
                    || b == b'+'
                    || b == b'-'
                    || b == b'*'
                    || b == b'%'
                    || b == b'!'
                    || b == b'='
                    || b == b'<'
                    || b == b'>'
                    || b == b'&'
                    || b == b'|'
                    || b == b'^'
                    || b == b'~'
            });
            if is_simple {
                return Some(index + close_offset);
            }
        }
    }

    let mut brackets = 1;
    let mut i = index;

    // Track the previous non-whitespace character to distinguish division from regex.
    // When `/` follows an identifier char, `)`, `]`, `++`, `--`, it is division.
    let mut prev_non_ws: Option<u8> = None;

    while brackets > 0 && i < template.len() {
        let ch = bytes[i] as char;

        match ch {
            '\'' | '"' | '`' => {
                i = find_string_end(template, i + 1, ch);
                if i == usize::MAX {
                    i = template.len();
                } else {
                    prev_non_ws = Some(bytes[i]);
                    i += 1;
                }
                continue;
            }
            '/' => {
                if i + 1 >= template.len() {
                    i += 1;
                    continue;
                }

                let next_char = bytes[i + 1] as char;

                if next_char == '/' {
                    // Line comment
                    let newline_pos = memchr(b'\n', &template.as_bytes()[i + 1..])
                        .map(|p| i + 1 + p)
                        .unwrap_or(-1i32 as usize);
                    i = infinity_if_negative(newline_pos as i32) + "\n".len();
                    continue;
                }

                if next_char == '*' {
                    // Block comment
                    let end_pos = memmem::find(&template.as_bytes()[i + 1..], b"*/")
                        .map(|p| i + 1 + p)
                        .unwrap_or(-1i32 as usize);
                    i = infinity_if_negative(end_pos as i32) + "*/".len();
                    continue;
                }

                // Determine if `/` is a division operator or the start of a regex.
                // After an identifier, closing paren/bracket, or postfix operator,
                // `/` is division.
                let is_division = match prev_non_ws {
                    Some(c) => {
                        c.is_ascii_alphanumeric()
                            || c == b'_'
                            || c == b'$'
                            || c == b')'
                            || c == b']'
                            || c == b'+'
                            || c == b'-'
                    }
                    None => false,
                };

                if is_division {
                    prev_non_ws = Some(b'/');
                    i += 1;
                    continue;
                }

                // Regex
                i = find_regex_end(template, i + 1);
                if i == usize::MAX {
                    i = template.len();
                } else {
                    prev_non_ws = Some(b'/');
                    i += "/".len();
                }
                continue;
            }
            _ => {
                if ch == open {
                    brackets += 1;
                } else if ch == close {
                    brackets -= 1;
                }

                if brackets == 0 {
                    return Some(i);
                }

                if !ch.is_ascii_whitespace() {
                    prev_non_ws = Some(bytes[i]);
                }
                i += 1;
            }
        }
    }

    None
}

/// Match brackets in the parser, handling nested brackets and quoted strings.
///
/// # Arguments
/// * `parser` - The parser instance
/// * `start` - The starting position (at the opening bracket)
/// * `brackets` - Optional custom bracket mappings
///
/// # Returns
/// The position after the closing bracket
///
/// # Errors
/// Returns an error if brackets are mismatched or EOF is reached
#[allow(dead_code)]
pub fn match_bracket(
    parser: &Parser,
    start: usize,
    brackets: Option<&FxHashMap<char, char>>,
) -> ParseResult<usize> {
    let default_brackets: FxHashMap<char, char> = [('{', '}'), ('(', ')'), ('[', ']')]
        .iter()
        .cloned()
        .collect();

    let brackets = brackets.unwrap_or(&default_brackets);
    let close: Vec<char> = brackets.values().cloned().collect();
    let mut bracket_stack: Vec<char> = Vec::new();

    let mut i = start;
    let bytes = parser.source.as_bytes();

    while i < parser.source.len() {
        let ch = bytes[i] as char;
        i += 1;

        if ch == '\'' || ch == '"' || ch == '`' {
            i = match_quote(parser, i, ch)?;
            continue;
        }

        if brackets.contains_key(&ch) {
            bracket_stack.push(ch);
        } else if close.contains(&ch) {
            let popped = bracket_stack
                .pop()
                .ok_or_else(|| ParseError::UnexpectedToken {
                    expected: "opening bracket".to_string(),
                    found: ch.to_string(),
                    span: (i - 1, i),
                })?;

            let expected = brackets.get(&popped).ok_or_else(|| ParseError::Generic {
                message: format!("internal error: unknown bracket '{}'", popped),
                span: (i - 1, i),
            })?;

            if ch != *expected {
                return Err(ParseError::UnexpectedToken {
                    expected: expected.to_string(),
                    found: ch.to_string(),
                    span: (i - 1, i),
                });
            }

            if bracket_stack.is_empty() {
                return Ok(i);
            }
        }
    }

    Err(ParseError::UnexpectedEof {
        span: (parser.source.len(), parser.source.len()),
    })
}

/// Match a quoted string in the parser.
///
/// # Arguments
/// * `parser` - The parser instance
/// * `start` - The position after the opening quote
/// * `quote` - The quote character (`'`, `"`, or `` ` ``)
///
/// # Returns
/// The position after the closing quote
///
/// # Errors
/// Returns an error if the string is not terminated
#[allow(dead_code)]
fn match_quote(parser: &Parser, start: usize, quote: char) -> ParseResult<usize> {
    let mut is_escaped = false;
    let mut i = start;
    let bytes = parser.source.as_bytes();

    while i < parser.source.len() {
        let ch = bytes[i] as char;
        i += 1;

        if is_escaped {
            is_escaped = false;
            continue;
        }

        if ch == quote {
            return Ok(i);
        }

        if ch == '\\' {
            is_escaped = true;
        }

        if quote == '`' && ch == '$' && i < parser.source.len() && bytes[i] == b'{' {
            i = match_bracket(parser, i, None)?;
        }
    }

    Err(ParseError::Generic {
        message: "Unterminated string constant".to_string(),
        span: (start - 1, start),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_infinity_if_negative() {
        assert_eq!(infinity_if_negative(-1), usize::MAX);
        assert_eq!(infinity_if_negative(0), 0);
        assert_eq!(infinity_if_negative(10), 10);
    }

    #[test]
    fn test_count_leading_backslashes() {
        assert_eq!(count_leading_backslashes(r"\\\foo", 2), 3);
        assert_eq!(count_leading_backslashes(r"\\foo", 1), 2);
        assert_eq!(count_leading_backslashes(r"\foo", 0), 1);
        assert_eq!(count_leading_backslashes("foo", 1), 0);
    }

    #[test]
    fn test_find_unescaped_char() {
        assert_eq!(find_unescaped_char("hello'world", 0, '\''), 5);
        assert_eq!(find_unescaped_char(r"hello\'world'", 0, '\''), 12);
        assert_eq!(find_unescaped_char("hello", 0, '\''), usize::MAX);
    }

    #[test]
    fn test_find_matching_bracket() {
        assert_eq!(find_matching_bracket("{}", 1, '{'), Some(1));
        assert_eq!(find_matching_bracket("{a}", 1, '{'), Some(2));
        assert_eq!(find_matching_bracket("{{a}}", 1, '{'), Some(4));
        assert_eq!(find_matching_bracket("{a, b}", 1, '{'), Some(5));
    }

    #[test]
    fn test_find_matching_bracket_with_strings() {
        assert_eq!(find_matching_bracket(r#"{"}"}"#, 1, '{'), Some(4));
        assert_eq!(find_matching_bracket(r"{'}'}", 1, '{'), Some(4));
        assert_eq!(find_matching_bracket("{`}`}", 1, '{'), Some(4));
    }

    #[test]
    fn test_find_matching_bracket_with_comments() {
        assert_eq!(find_matching_bracket("{a // }\n}", 1, '{'), Some(8));
        assert_eq!(find_matching_bracket("{a /* } */}", 1, '{'), Some(10));
    }

    #[test]
    fn test_find_matching_bracket_with_division() {
        // Division operator should not be treated as regex
        assert_eq!(find_matching_bracket("{width/4}", 1, '{'), Some(8));
        assert_eq!(find_matching_bracket("{width/4*3}", 1, '{'), Some(10));
        assert_eq!(find_matching_bracket("{a + b/c}", 1, '{'), Some(8));
    }
}
