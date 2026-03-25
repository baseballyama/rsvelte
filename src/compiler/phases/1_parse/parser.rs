//! Parser structure and basic utilities.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to parts of:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/index.js` (Parser class)
//!
//! ## Differences from Svelte
//!
//! - **Separate file**: In Svelte, the Parser class and its methods are defined in
//!   `index.js` along with the `parse()` function. Here, the Parser struct is in a
//!   separate `parser.rs` file, with parsing methods extended via `impl` blocks in
//!   the `state/` and `read/` subdirectories.
//! - **Byte-based indexing**: This implementation uses byte positions for efficient
//!   parsing, while Svelte uses character indices (which are equivalent for ASCII
//!   but differ for multi-byte UTF-8 characters).
//! - **Line offset precomputation**: Line offsets are precomputed during parser
//!   construction for efficient location calculation.

use compact_str::CompactString;
use regex::Regex;
use rustc_hash::FxHashMap;
use std::sync::LazyLock;

use crate::ast::css::StyleSheet;

/// Cached regex for TypeScript detection in script tags.
#[allow(dead_code)]
static REGEX_TYPESCRIPT_LANG: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
        r#"(?x)
        <!--[\s\S]*?-->       # Skip HTML comments ([\s\S] matches any char including newline)
        |
        <script\s+            # <script with whitespace
        (?:[^>]*?)            # Any attributes before lang
        lang=                 # lang attribute
        (?:["'])?             # Optional quote
        (ts)                  # Capture "ts"
        (?:["'])?             # Optional quote
        [^>]*>                # Rest of tag
        "#,
    )
    .expect("Failed to compile TypeScript lang regex")
});
use crate::ast::span::{LineColumn, SourceLocation};
use crate::ast::template::{Script, SvelteOptions};
use crate::error::{ParseError, ParseResult};

use super::ParseOptions;

/// Last auto-closed tag information.
///
/// Corresponds to `LastAutoClosedTag` in `svelte/packages/svelte/src/compiler/phases/1-parse/index.js`.
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct LastAutoClosedTag {
    pub tag: CompactString,
    pub reason: CompactString,
    pub depth: usize,
}

/// The parser state.
///
/// Corresponds to the `Parser` class in `svelte/packages/svelte/src/compiler/phases/1-parse/index.js`.
pub struct Parser<'a> {
    /// The source code being parsed.
    pub(crate) source: &'a str,
    /// Source as bytes for faster indexing.
    pub(crate) bytes: &'a [u8],
    /// Current byte position in the source.
    pub(crate) index: usize,
    /// Parser options.
    #[allow(dead_code)]
    pub(crate) options: ParseOptions,
    /// Stack of open elements/blocks for validation.
    pub(crate) stack: Vec<StackEntry>,
    /// Line offsets for location calculation.
    pub(crate) line_offsets: Vec<usize>,
    /// Parsed instance script (context="default").
    pub(crate) instance_script: Option<Script>,
    /// Parsed module script (context="module").
    pub(crate) module_script: Option<Script>,
    /// Parsed stylesheet.
    pub(crate) stylesheet: Option<StyleSheet>,
    /// Parsed svelte:options.
    pub(crate) svelte_options: Option<SvelteOptions>,
    /// Pending comments that could become leading comments for a script.
    pub(crate) pending_leading_comments: Vec<String>,
    /// Whether we're in TypeScript mode.
    ///
    /// Corresponds to `ts` field in JavaScript Parser.
    #[allow(dead_code)]
    pub(crate) ts: bool,
    /// Meta tags (e.g., svelte:head, svelte:options).
    ///
    /// Corresponds to `meta_tags` field in JavaScript Parser.
    #[allow(dead_code)]
    pub(crate) meta_tags: FxHashMap<String, bool>,
    /// Last auto-closed tag.
    ///
    /// Corresponds to `last_auto_closed_tag` field in JavaScript Parser.
    #[allow(dead_code)]
    pub(crate) last_auto_closed_tag: Option<LastAutoClosedTag>,
    /// Parser-level warnings (e.g., element_implicitly_closed).
    pub(crate) parse_warnings: Vec<crate::ast::template::ParseWarning>,
}

/// An entry on the parser stack.
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub enum StackEntry {
    Root,
    Element {
        name: CompactString,
        start: u32,
        element_type: ElementType,
    },
    IfBlock {
        start: u32,
    },
    EachBlock {
        start: u32,
    },
    AwaitBlock {
        start: u32,
    },
    KeyBlock {
        start: u32,
    },
    SnippetBlock {
        start: u32,
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ElementType {
    Regular,
    Component,
    Slot,
    Title,
    SvelteHead,
    SvelteBody,
    SvelteWindow,
    SvelteDocument,
    SvelteFragment,
    SvelteBoundary,
    SvelteComponent,
    SvelteElement,
    SvelteSelf,
    SvelteOptions,
    ShadowrootTemplate,
}

impl<'a> Parser<'a> {
    /// Create a new parser.
    ///
    /// Corresponds to the `Parser` constructor in `svelte/packages/svelte/src/compiler/phases/1-parse/index.js`.
    pub fn new(source: &'a str, options: ParseOptions) -> Self {
        // Calculate line offsets for location calculation using SIMD-accelerated memchr
        let bytes = source.as_bytes();
        let mut line_offsets = Vec::with_capacity(bytes.len() / 40 + 1); // rough estimate
        line_offsets.push(0);
        let mut pos = 0;
        while let Some(offset) = memchr::memchr(b'\n', &bytes[pos..]) {
            let abs = pos + offset;
            line_offsets.push(abs + 1);
            pos = abs + 1;
        }

        // Detect TypeScript mode by looking for lang="ts" in script tags
        // Corresponds to the TypeScript detection logic in JavaScript Parser constructor
        let ts = Self::detect_typescript_mode(source);

        Self {
            source,
            bytes: source.as_bytes(),
            index: 0,
            options,
            stack: vec![StackEntry::Root],
            line_offsets,
            instance_script: None,
            module_script: None,
            stylesheet: None,
            svelte_options: None,
            pending_leading_comments: Vec::new(),
            ts,
            meta_tags: FxHashMap::default(),
            last_auto_closed_tag: None,
            parse_warnings: Vec::new(),
        }
    }

    /// Detect TypeScript mode by looking for `lang="ts"` or `lang='ts'` in script tags.
    ///
    /// Corresponds to the regex-based TypeScript detection in JavaScript Parser constructor.
    #[allow(dead_code)]
    fn detect_typescript_mode(source: &str) -> bool {
        // Use cached regex for better performance
        if let Some(captures) = REGEX_TYPESCRIPT_LANG.captures(source)
            && let Some(lang) = captures.get(1)
        {
            return lang.as_str() == "ts";
        }

        false
    }

    /// Get line offsets for expression loc creation.
    /// Returns empty slice when skip_expression_loc is enabled (compilation mode),
    /// which causes create_loc functions to return Value::Null instead of allocating objects.
    pub fn expression_line_offsets(&self) -> &[usize] {
        if self.options.skip_expression_loc {
            &[]
        } else {
            &self.line_offsets
        }
    }

    /// Get source location for a position.
    pub fn get_location(&self, pos: usize) -> SourceLocation {
        let line = self
            .line_offsets
            .partition_point(|&offset| offset <= pos)
            .saturating_sub(1);
        let line_start = self.line_offsets.get(line).copied().unwrap_or(0);
        let column = pos - line_start;

        SourceLocation {
            start: LineColumn {
                line: (line + 1) as u32,
                column: column as u32,
                character: pos as u32,
            },
            end: LineColumn {
                line: (line + 1) as u32,
                column: column as u32,
                character: pos as u32,
            },
        }
    }

    /// Get source location for a range.
    #[allow(dead_code)]
    pub fn get_location_range(&self, start: usize, end: usize) -> SourceLocation {
        let start_loc = self.get_location(start);
        let end_loc = self.get_location(end);
        SourceLocation {
            start: start_loc.start,
            end: end_loc.start,
        }
    }

    /// Create name_loc with character field for Svelte compatibility.
    #[inline]
    pub fn create_name_loc(&self, start: usize, end: usize) -> SourceLocation {
        // Inline get_location to avoid two separate binary searches
        let start_line = self
            .line_offsets
            .partition_point(|&offset| offset <= start)
            .saturating_sub(1);
        let start_line_start = self.line_offsets.get(start_line).copied().unwrap_or(0);

        let end_line = self
            .line_offsets
            .partition_point(|&offset| offset <= end)
            .saturating_sub(1);
        let end_line_start = self.line_offsets.get(end_line).copied().unwrap_or(0);

        SourceLocation {
            start: LineColumn {
                line: (start_line + 1) as u32,
                column: (start - start_line_start) as u32,
                character: start as u32,
            },
            end: LineColumn {
                line: (end_line + 1) as u32,
                column: (end - end_line_start) as u32,
                character: end as u32,
            },
        }
    }

    // =========================================================================
    // Low-level parsing utilities
    // =========================================================================

    /// Check if we've reached the end of the source.
    #[inline]
    pub fn is_eof(&self) -> bool {
        self.index >= self.bytes.len()
    }

    /// Get the current character.
    #[inline]
    pub fn current_char(&self) -> char {
        if self.index >= self.bytes.len() {
            '\0'
        } else {
            // Fast path: ASCII byte (covers 99%+ of Svelte source)
            let b = self.bytes[self.index];
            if b < 0x80 {
                b as char
            } else {
                // Slow path: multi-byte UTF-8
                // SAFETY: self.source is valid UTF-8 and self.index < self.bytes.len()
                self.source[self.index..].chars().next().unwrap_or('\0')
            }
        }
    }

    /// Advance the position by one character.
    #[inline]
    pub fn advance(&mut self) {
        if self.index < self.bytes.len() {
            // Fast path: ASCII byte (covers 99%+ of Svelte source)
            let b = self.bytes[self.index];
            if b < 0x80 {
                self.index += 1;
            } else {
                // Slow path: multi-byte UTF-8
                // Determine UTF-8 byte length from the leading byte
                let len = if b < 0xE0 {
                    2
                } else if b < 0xF0 {
                    3
                } else {
                    4
                };
                self.index += len;
            }
        }
    }

    /// Advance by n bytes.
    #[inline]
    pub fn advance_by(&mut self, n: usize) {
        self.index = (self.index + n).min(self.bytes.len());
    }

    /// Check if the source at current position starts with the given string.
    #[inline]
    pub fn match_str(&self, s: &str) -> bool {
        let s_bytes = s.as_bytes();
        let s_len = s_bytes.len();
        let remaining = self.bytes.len() - self.index;
        if remaining < s_len {
            return false;
        }
        // Fast paths for common lengths
        match s_len {
            1 => self.bytes[self.index] == s_bytes[0],
            2 => self.bytes[self.index] == s_bytes[0] && self.bytes[self.index + 1] == s_bytes[1],
            3 => {
                self.bytes[self.index] == s_bytes[0]
                    && self.bytes[self.index + 1] == s_bytes[1]
                    && self.bytes[self.index + 2] == s_bytes[2]
            }
            _ => self.bytes[self.index..self.index + s_len] == *s_bytes,
        }
    }

    /// Check if the byte at the current position matches (ASCII only).
    #[inline]
    pub fn match_byte(&self, b: u8) -> bool {
        self.index < self.bytes.len() && self.bytes[self.index] == b
    }

    /// Consume a string if it matches.
    ///
    /// Corresponds to `eat(str, required = false, required_in_loose = true)` in JavaScript Parser.
    ///
    /// # Parameters
    ///
    /// - `s`: The string to match
    /// - `required`: If true, throws an error if the string doesn't match
    /// - `required_in_loose`: If true, the error is thrown even in loose mode (default: true)
    ///
    /// # Returns
    ///
    /// - `Ok(true)` if the string matches and was consumed
    /// - `Ok(false)` if the string doesn't match and `required` is false
    /// - `Err(ParseError)` if the string doesn't match and `required` is true (and loose mode conditions are met)
    pub fn eat(&mut self, s: &str, required: bool, required_in_loose: bool) -> ParseResult<bool> {
        if self.match_str(s) {
            self.advance_by(s.len());
            return Ok(true);
        }

        if required && (!self.options.loose || required_in_loose) {
            return Err(ParseError::expected_token(s, self.index));
        }

        Ok(false)
    }

    /// Consume a string optionally (equivalent to `eat(s, false, true)` in JavaScript).
    ///
    /// This is the most common use case - try to consume a string, but don't error if it's not there.
    #[inline]
    pub fn eat_optional(&mut self, s: &str) -> bool {
        let s_bytes = s.as_bytes();
        // Fast path for single-byte strings (most common case)
        if s_bytes.len() == 1 {
            if self.index < self.bytes.len() && self.bytes[self.index] == s_bytes[0] {
                self.index += 1;
                return true;
            }
            return false;
        }
        if self.match_str(s) {
            self.index += s_bytes.len();
            true
        } else {
            false
        }
    }

    /// Consume a string, requiring it to be present (equivalent to `eat(s, true, true)` in JavaScript).
    ///
    /// This will error in both strict and loose modes if the string is not found.
    #[inline]
    pub fn eat_required(&mut self, s: &str) -> ParseResult<()> {
        self.eat(s, true, true)?;
        Ok(())
    }

    /// Consume a string, requiring it only in strict mode (equivalent to `eat(s, true, false)` in JavaScript).
    ///
    /// This will error in strict mode but not in loose mode if the string is not found.
    #[inline]
    pub fn eat_required_strict(&mut self, s: &str) -> ParseResult<bool> {
        self.eat(s, true, false)
    }

    /// Consume a string, returning an error if it doesn't match.
    ///
    /// This is equivalent to `eat_required()`.
    pub fn expect(&mut self, s: &str) -> ParseResult<()> {
        self.eat_required(s)
    }

    /// Skip whitespace.
    #[inline]
    pub fn skip_whitespace(&mut self) {
        // Fast path for ASCII whitespace (space, tab, newline, carriage return)
        while self.index < self.bytes.len() {
            let b = self.bytes[self.index];
            if b == b' ' || b == b'\t' || b == b'\n' || b == b'\r' {
                self.index += 1;
            } else if b < 0x80 {
                // ASCII non-whitespace: done
                break;
            } else {
                // Non-ASCII: check for Unicode whitespace via char
                let c = self.source[self.index..].chars().next().unwrap_or('\0');
                if c.is_whitespace() {
                    self.index += c.len_utf8();
                } else {
                    break;
                }
            }
        }
    }

    /// Skip a pattern expression, handling nested braces and brackets.
    ///
    /// This is used for parsing destructuring patterns in await blocks
    /// like `{ a, ...rest }` or `[a, b, ...rest]`.
    ///
    /// Stops when reaching an unmatched `}` that closes the outer block.
    pub fn skip_pattern_expression(&mut self) {
        let mut brace_depth: u32 = 0;
        let mut bracket_depth: u32 = 0;
        let mut paren_depth: u32 = 0;

        while self.index < self.bytes.len() {
            // Fast path: all delimiter chars are ASCII
            let b = self.bytes[self.index];
            match b {
                b'{' => brace_depth += 1,
                b'}' => {
                    if brace_depth == 0 {
                        break;
                    }
                    brace_depth -= 1;
                }
                b'[' => bracket_depth += 1,
                b']' => {
                    bracket_depth = bracket_depth.saturating_sub(1);
                }
                b'(' => paren_depth += 1,
                b')' => {
                    paren_depth = paren_depth.saturating_sub(1);
                }
                _ => {}
            }

            // Advance by byte length
            if b < 0x80 {
                self.index += 1;
            } else {
                self.advance();
            }
        }

        // Trim trailing ASCII whitespace from the pattern
        while self.index > 0 {
            let prev_byte = self.bytes[self.index - 1];
            if prev_byte == b' ' || prev_byte == b'\t' || prev_byte == b'\n' || prev_byte == b'\r' {
                self.index -= 1;
            } else {
                break;
            }
        }
    }

    /// Read an identifier.
    #[inline]
    pub fn read_identifier(&mut self) -> CompactString {
        let start = self.index;

        // Fast path: ASCII identifier characters (a-z, A-Z, 0-9, _, $)
        while self.index < self.bytes.len() {
            let b = self.bytes[self.index];
            if b.is_ascii_alphanumeric() || b == b'_' || b == b'$' {
                self.index += 1;
            } else if b < 0x80 {
                // ASCII non-identifier char: done
                break;
            } else {
                // Non-ASCII: check via char
                let c = self.source[self.index..].chars().next().unwrap_or('\0');
                if c.is_alphanumeric() {
                    self.index += c.len_utf8();
                } else {
                    break;
                }
            }
        }

        CompactString::from(&self.source[start..self.index])
    }

    /// Read a tag name.
    #[inline]
    pub fn read_tag_name(&mut self) -> CompactString {
        let start = self.index;

        // Fast path: tag name characters are ASCII (stop at whitespace, >, /, =)
        while self.index < self.bytes.len() {
            let b = self.bytes[self.index];
            if b == b' '
                || b == b'\t'
                || b == b'\n'
                || b == b'\r'
                || b == b'>'
                || b == b'/'
                || b == b'='
            {
                break;
            } else if b < 0x80 {
                self.index += 1;
            } else {
                let c = self.source[self.index..].chars().next().unwrap_or('\0');
                if c.is_whitespace() {
                    break;
                }
                self.index += c.len_utf8();
            }
        }

        CompactString::from(&self.source[start..self.index])
    }

    /// Read an attribute name.
    #[inline]
    pub fn read_attribute_name(&mut self) -> CompactString {
        let start = self.index;

        // Fast path: attribute name characters are ASCII (stop at whitespace, =, >, /, ", ')
        while self.index < self.bytes.len() {
            let b = self.bytes[self.index];
            if b == b' '
                || b == b'\t'
                || b == b'\n'
                || b == b'\r'
                || b == b'='
                || b == b'>'
                || b == b'/'
                || b == b'"'
                || b == b'\''
            {
                break;
            } else if b < 0x80 {
                self.index += 1;
            } else {
                let c = self.source[self.index..].chars().next().unwrap_or('\0');
                if c.is_whitespace() {
                    break;
                }
                self.index += c.len_utf8();
            }
        }

        CompactString::from(&self.source[start..self.index])
    }

    /// Peek at the next n characters.
    pub fn peek_chars(&self, n: usize) -> String {
        self.source[self.index..].chars().take(n).collect()
    }

    /// Check if the svelte:options has customElement set.
    pub fn has_custom_element_option(&self) -> bool {
        if let Some(opts) = &self.svelte_options {
            opts.custom_element.is_some()
        } else {
            false
        }
    }

    /// Check if we're in runes mode via svelte:options.
    pub fn is_runes_mode(&self) -> bool {
        if let Some(opts) = &self.svelte_options {
            opts.runes == Some(true)
        } else {
            false
        }
    }

    // =========================================================================
    // JavaScript Parser compatibility methods
    // =========================================================================

    /// Get the current element/block from the stack.
    ///
    /// Corresponds to `current()` in JavaScript Parser.
    pub fn current(&self) -> Option<&StackEntry> {
        self.stack.last()
    }

    /// Match a regex at the current index.
    ///
    /// Corresponds to `match_regex()` in JavaScript Parser.
    ///
    /// The pattern should have a `^` anchor at the start so the regex doesn't
    /// search past the beginning, resulting in worse performance.
    pub fn match_regex(&self, pattern: &Regex) -> Option<String> {
        let remaining = &self.source[self.index..];
        if let Some(captures) = pattern.captures(remaining)
            && let Some(m) = captures.get(0)
            && m.start() == 0
        {
            return Some(m.as_str().to_string());
        }
        None
    }

    /// Search for a regex starting at the current index and return the result if it matches.
    ///
    /// Corresponds to `read()` in JavaScript Parser.
    ///
    /// The pattern should have a `^` anchor at the start so the regex doesn't
    /// search past the beginning, resulting in worse performance.
    pub fn read(&mut self, pattern: &Regex) -> Option<String> {
        if let Some(result) = self.match_regex(pattern) {
            self.index += result.len();
            Some(result)
        } else {
            None
        }
    }

    /// Read until a pattern is found.
    ///
    /// Corresponds to `read_until()` in JavaScript Parser.
    pub fn read_until(&mut self, pattern: &Regex) -> ParseResult<String> {
        if self.index >= self.source.len() {
            if self.options.loose {
                return Ok(String::new());
            }
            return Err(ParseError::UnexpectedEof {
                span: (self.source.len(), self.source.len()),
            });
        }

        let start = self.index;
        let remaining = &self.source[start..];

        if let Some(captures) = pattern.captures(remaining)
            && let Some(m) = captures.get(0)
        {
            self.index = start + m.start();
            return Ok(self.source[start..self.index].to_string());
        }

        self.index = self.source.len();
        Ok(self.source[start..].to_string())
    }

    /// Require whitespace at the current position.
    ///
    /// Corresponds to `require_whitespace()` in JavaScript Parser.
    pub fn require_whitespace(&mut self) -> ParseResult<()> {
        if self.is_eof() || !self.current_char().is_whitespace() {
            return Err(ParseError::svelte(
                "expected_whitespace",
                "Expected whitespace",
                (self.index, self.index + 1),
            ));
        }

        self.skip_whitespace();
        Ok(())
    }

    /// Handle an acorn error.
    ///
    /// Corresponds to `acorn_error()` in JavaScript Parser.
    pub fn acorn_error(&self, pos: usize, message: &str) -> ParseError {
        // Remove position indicator from message (e.g., " (10:5)")
        let clean_message = message
            .trim_end_matches(|c: char| c == ')' || c.is_ascii_digit() || c == ':' || c == '(');

        ParseError::svelte("js_parse_error", clean_message, (pos, pos + 1))
    }

    /// Allow whitespace (skip it if present).
    ///
    /// Corresponds to `allow_whitespace()` in JavaScript Parser.
    /// This is just an alias for `skip_whitespace()`.
    pub fn allow_whitespace(&mut self) {
        self.skip_whitespace();
    }

    /// Scan forward from the current position to find the matching closing brace,
    /// tracking nested brace depth. Returns the position of the closing `}`.
    /// Uses byte-level scanning for maximum speed.
    /// Does NOT advance past the closing brace - caller must do that.
    #[inline]
    pub fn scan_to_closing_brace(&mut self) -> usize {
        let mut depth: u32 = 1;
        while self.index < self.bytes.len() && depth > 0 {
            match self.bytes[self.index] {
                b'{' => {
                    depth += 1;
                    self.index += 1;
                }
                b'}' => {
                    depth -= 1;
                    if depth > 0 {
                        self.index += 1;
                    }
                }
                b if b < 0x80 => self.index += 1,
                _ => self.advance(),
            }
        }
        self.index
    }
}
