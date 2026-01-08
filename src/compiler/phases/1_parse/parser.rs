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

use crate::ast::css::StyleSheet;
use crate::ast::span::{LineColumn, SourceLocation};
use crate::ast::template::{Script, SvelteOptions};
use crate::error::{ParseError, ParseResult};

use super::ParseOptions;

/// The parser state.
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
    pub fn new(source: &'a str, options: ParseOptions) -> Self {
        // Calculate line offsets for location calculation
        let mut line_offsets = vec![0];
        for (i, c) in source.char_indices() {
            if c == '\n' {
                line_offsets.push(i + 1);
            }
        }

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
}
