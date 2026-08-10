//! Bracket matching utilities for the Svelte parser.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to `svelte/packages/svelte/src/compiler/phases/1-parse/utils/bracket.js`

use crate::compiler::phases::phase3_transform::shared::js_scan::slash_starts_regex_at;
use memchr::memchr;

static BLOCK_COMMENT_END_FINDER: std::sync::LazyLock<memchr::memmem::Finder<'static>> =
    std::sync::LazyLock::new(|| memchr::memmem::Finder::new(b"*/"));

/// Find the end of a string expression.
///
/// # Arguments
/// * `string` - The string to search
/// * `search_start_index` - The index to start searching at
/// * `string_start_char` - The character that started this string (`'`, `"`, or `` ` ``)
///
/// # Returns
/// The index of the end of this string expression, or `usize::MAX` if not found
fn find_string_end(string: &str, search_start_index: usize, string_start_char: u8) -> usize {
    let string_to_search = if string_start_char == b'`' {
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
    find_unescaped_char(string, search_start_index, b'/')
}

/// Find the closing backtick of a template literal, properly handling `${...}`
/// interpolations (which may themselves contain regex literals with backticks,
/// nested template literals, strings, and comments).
///
/// # Arguments
/// * `string` - The full string being searched
/// * `start` - The index to start searching at (immediately after the opening `` ` ``)
///
/// # Returns
/// The index of the closing `` ` ``, or `usize::MAX` if not found
fn find_template_literal_end(string: &str, start: usize) -> usize {
    let bytes = string.as_bytes();
    let mut i = start;
    while i < bytes.len() {
        match bytes[i] {
            b'\\' => {
                // Escaped character — skip both the backslash and the next byte.
                i += 2;
            }
            b'`' => {
                // Unescaped closing backtick.
                return i;
            }
            b'$' if i + 1 < bytes.len() && bytes[i + 1] == b'{' => {
                // Template expression `${...}`. Use `find_matching_bracket` to
                // skip the entire expression — it handles nested strings, regex
                // literals (including those that contain backticks), comments,
                // and nested template literals correctly.
                match find_matching_bracket(string, i + 2, '{') {
                    Some(close) => {
                        // `close` is the index of the matching `}`.
                        i = close + 1;
                    }
                    None => {
                        // Unterminated interpolation — bail to EOF.
                        return usize::MAX;
                    }
                }
            }
            _ => {
                i += 1;
            }
        }
    }
    usize::MAX
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
fn find_unescaped_char(string: &str, search_start_index: usize, ch: u8) -> usize {
    let bytes = string.as_bytes();
    let mut i = search_start_index;
    loop {
        let Some(found_index) = memchr(ch, &bytes[i..]).map(|p| i + p) else {
            return usize::MAX;
        };

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

/// Bytes that can hide a bracket (string, template literal, comment or regex
/// openers) and therefore need the state machine.
static OPAQUE_BYTE: [bool; 256] = {
    let mut table = [false; 256];
    table[b'\'' as usize] = true;
    table[b'"' as usize] = true;
    table[b'`' as usize] = true;
    table[b'/' as usize] = true;
    table
};

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
    let open_byte = open as u8;
    let close_byte = close as u8;

    let mut brackets = 1;
    let mut i = index;

    // Track the previous non-whitespace character to distinguish division from regex.
    // When `/` follows an identifier char, `)`, `]`, `++`, `--`, it is division.
    let mut prev_non_ws: Option<u8> = None;

    while brackets > 0 && i < template.len() {
        // Only quotes, `/` and the bracket pair itself can change the state;
        // every other byte (operators, identifiers, non-ASCII) just shifts
        // `prev_non_ws`, so whole runs of them are skipped in one go.
        let run_start = i;
        while i < bytes.len() {
            let b = bytes[i];
            if OPAQUE_BYTE[b as usize] || b == open_byte || b == close_byte {
                break;
            }
            i += 1;
        }
        if i > run_start {
            let mut k = i;
            while k > run_start {
                k -= 1;
                if !bytes[k].is_ascii_whitespace() {
                    prev_non_ws = Some(bytes[k]);
                    break;
                }
            }
            if i >= template.len() {
                break;
            }
        }

        let ch = bytes[i] as char;

        match ch {
            '\'' | '"' => {
                i = find_string_end(template, i + 1, bytes[i]);
                if i == usize::MAX {
                    i = template.len();
                } else {
                    prev_non_ws = Some(bytes[i]);
                    i += 1;
                }
                continue;
            }
            '`' => {
                // Use the template-literal-aware scanner so that backticks
                // inside `${...}` interpolations (e.g. inside a regex like
                // `/`(.+?)`/g`) do not prematurely terminate the template.
                i = find_template_literal_end(template, i + 1);
                if i == usize::MAX {
                    i = template.len();
                } else {
                    prev_non_ws = Some(b'`');
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
                    // Line comment. An unterminated `//` (no trailing newline)
                    // bails to EOF so the outer loop terminates and returns None.
                    i = match memchr(b'\n', &bytes[i + 1..]) {
                        Some(p) => i + 1 + p + "\n".len(),
                        None => template.len(),
                    };
                    continue;
                }

                if next_char == '*' {
                    // Block comment. An unterminated `/*` (no closing `*/`)
                    // bails to EOF so the outer loop terminates and returns None.
                    i = match BLOCK_COMMENT_END_FINDER.find(&bytes[i + 1..]) {
                        Some(p) => i + 1 + p + "*/".len(),
                        None => template.len(),
                    };
                    continue;
                }

                if !slash_starts_regex_at(bytes, i, prev_non_ws) {
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_count_leading_backslashes() {
        assert_eq!(count_leading_backslashes(r"\\\foo", 2), 3);
        assert_eq!(count_leading_backslashes(r"\\foo", 1), 2);
        assert_eq!(count_leading_backslashes(r"\foo", 0), 1);
        assert_eq!(count_leading_backslashes("foo", 1), 0);
    }

    #[test]
    fn test_find_unescaped_char() {
        assert_eq!(find_unescaped_char("hello'world", 0, b'\''), 5);
        assert_eq!(find_unescaped_char(r"hello\'world'", 0, b'\''), 12);
        assert_eq!(find_unescaped_char("hello", 0, b'\''), usize::MAX);
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
    fn test_find_matching_bracket_unterminated_comment() {
        // Unterminated `//` and `/*` must not panic (debug) or livelock (release);
        // the scan bails to EOF and reports no matching bracket. Covers expression
        // tags, attribute values, and block headers since all route through here.

        // Expression tag: `{foo // unterminated`
        assert_eq!(find_matching_bracket("{foo // unterminated", 1, '{'), None);
        // Attribute value: `class={foo /* unterminated}>` — the `/*` swallows the
        // closing `}` because no `*/` ever follows.
        assert_eq!(
            find_matching_bracket("{foo /* unterminated}>", 1, '{'),
            None
        );
        // `{#if}` header: `{#if foo // unterminated`
        assert_eq!(find_matching_bracket("{#if foo // bar", 1, '{'), None);
        // `{#each}` / `{#await}` header with unterminated block comment.
        assert_eq!(find_matching_bracket("{#each items /* x", 1, '{'), None);
        assert_eq!(find_matching_bracket("{#await p /* x", 1, '{'), None);

        // Terminated comments still resolve correctly (no behavior change).
        assert_eq!(find_matching_bracket("{foo // ok\n}", 1, '{'), Some(11));
        assert_eq!(find_matching_bracket("{foo /* ok */}", 1, '{'), Some(13));
    }

    #[test]
    fn test_find_matching_bracket_with_division() {
        // Division operator should not be treated as regex
        assert_eq!(find_matching_bracket("{width/4}", 1, '{'), Some(8));
        assert_eq!(find_matching_bracket("{width/4*3}", 1, '{'), Some(10));
        assert_eq!(find_matching_bracket("{a + b/c}", 1, '{'), Some(8));
    }
}
