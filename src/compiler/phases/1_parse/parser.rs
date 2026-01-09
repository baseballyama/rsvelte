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
use std::collections::HashMap;

use crate::ast::css::StyleSheet;
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
    pub(crate) meta_tags: HashMap<String, bool>,
    /// Last auto-closed tag.
    ///
    /// Corresponds to `last_auto_closed_tag` field in JavaScript Parser.
    #[allow(dead_code)]
    pub(crate) last_auto_closed_tag: Option<LastAutoClosedTag>,
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
        // Calculate line offsets for location calculation
        let mut line_offsets = vec![0];
        for (i, c) in source.char_indices() {
            if c == '\n' {
                line_offsets.push(i + 1);
            }
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
            meta_tags: HashMap::new(),
            last_auto_closed_tag: None,
        }
    }

    /// Detect TypeScript mode by looking for `lang="ts"` or `lang='ts'` in script tags.
    ///
    /// Corresponds to the regex-based TypeScript detection in JavaScript Parser constructor.
    fn detect_typescript_mode(source: &str) -> bool {
        // regex_lang_attribute from JavaScript:
        // /<!--[^]*?-->|<script\s+(?:[^>]*|(?:[^=>'"/]+=(?:"[^"]*"|'[^']*'|[^>\s]+)\s+)*)lang=(["'])?([^"' >]+)\1[^>]*>/g
        //
        // This regex:
        // 1. Skips HTML comments: <!--[\s\S]*?--> ([\s\S] is equivalent to [^] in JS)
        // 2. Matches script tags with lang attribute
        // 3. Captures the lang value
        //
        // For simplicity and performance, we use a simpler approach:
        // Look for <script with lang="ts" or lang='ts'
        let re = Regex::new(
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
        .unwrap();

        if let Some(captures) = re.captures(source) {
            if let Some(lang) = captures.get(1) {
                return lang.as_str() == "ts";
            }
        }

        false
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
    pub fn create_name_loc(&self, start: usize, end: usize) -> SourceLocation {
        let start_loc = self.get_location(start);
        let end_loc = self.get_location(end);

        SourceLocation {
            start: LineColumn {
                line: start_loc.start.line,
                column: start_loc.start.column,
                character: start_loc.start.character,
            },
            end: LineColumn {
                line: end_loc.start.line,
                column: end_loc.start.column,
                character: end_loc.start.character,
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
        if self.is_eof() {
            '\0'
        } else {
            self.source[self.index..].chars().next().unwrap_or('\0')
        }
    }

    /// Advance the position by one character.
    #[inline]
    pub fn advance(&mut self) {
        if !self.is_eof() {
            let c = self.current_char();
            self.index += c.len_utf8();
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
        self.source[self.index..].starts_with(s)
    }

    /// Consume a string if it matches.
    pub fn eat(&mut self, s: &str) -> bool {
        if self.match_str(s) {
            self.advance_by(s.len());
            true
        } else {
            false
        }
    }

    /// Consume a string, returning an error if it doesn't match.
    pub fn expect(&mut self, s: &str) -> ParseResult<()> {
        if self.eat(s) {
            Ok(())
        } else {
            Err(ParseError::UnexpectedToken {
                expected: s.to_string(),
                found: self.peek_chars(s.len()),
                span: (self.index, self.index + 1),
            })
        }
    }

    /// Skip whitespace.
    pub fn skip_whitespace(&mut self) {
        while !self.is_eof() {
            let c = self.current_char();
            if !c.is_whitespace() {
                break;
            }
            self.advance();
        }
    }

    /// Read an identifier.
    pub fn read_identifier(&mut self) -> CompactString {
        let start = self.index;

        while !self.is_eof() {
            let c = self.current_char();
            if !c.is_alphanumeric() && c != '_' && c != '$' {
                break;
            }
            self.advance();
        }

        CompactString::from(&self.source[start..self.index])
    }

    /// Read a tag name.
    pub fn read_tag_name(&mut self) -> CompactString {
        let start = self.index;

        while !self.is_eof() {
            let c = self.current_char();
            if c.is_whitespace() || c == '>' || c == '/' || c == '=' {
                break;
            }
            self.advance();
        }

        CompactString::from(&self.source[start..self.index])
    }

    /// Read an attribute name.
    pub fn read_attribute_name(&mut self) -> CompactString {
        let start = self.index;

        while !self.is_eof() {
            let c = self.current_char();
            if c.is_whitespace() || c == '=' || c == '>' || c == '/' || c == '"' || c == '\'' {
                break;
            }
            self.advance();
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
        if let Some(captures) = pattern.captures(remaining) {
            if let Some(m) = captures.get(0) {
                if m.start() == 0 {
                    return Some(m.as_str().to_string());
                }
            }
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

        if let Some(captures) = pattern.captures(remaining) {
            if let Some(m) = captures.get(0) {
                self.index = start + m.start();
                return Ok(self.source[start..self.index].to_string());
            }
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
}
