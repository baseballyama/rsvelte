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

use crate::ast::arena::ParseArena;
use crate::ast::css::StyleSheet;
use crate::ast::span::{LineColumn, SourceLocation};
use crate::ast::template::{Script, SvelteOptions};
use crate::error::{ParseError, ParseResult};

use super::ParseOptions;

/// Substring searchers used once per file; building one is not free, so they
/// are shared instead of reconstructed per parse.
static SCRIPT_TAG_FINDER: std::sync::LazyLock<memchr::memmem::Finder<'static>> =
    std::sync::LazyLock::new(|| memchr::memmem::Finder::new(b"<script"));
static HTML_COMMENT_FINDER: std::sync::LazyLock<memchr::memmem::Finder<'static>> =
    std::sync::LazyLock::new(|| memchr::memmem::Finder::new(b"<!--"));
static LANG_FINDER: std::sync::LazyLock<memchr::memmem::Finder<'static>> =
    std::sync::LazyLock::new(|| memchr::memmem::Finder::new(b"lang"));
static COMMENT_END_FINDER: std::sync::LazyLock<memchr::memmem::Finder<'static>> =
    std::sync::LazyLock::new(|| memchr::memmem::Finder::new(b"-->"));

/// ECMAScript `WhiteSpace + LineTerminator` — the set every whitespace decision
/// in upstream's parser consults, whether through `is_whitespace(cc)` in
/// `1-parse/index.js`, a `\s` regex or `String.prototype.trim*`. Rust's
/// `char::is_whitespace` is the Unicode `White_Space` property, which has the
/// same 25 members but excludes `U+FEFF` and includes `U+0085`.
pub(crate) fn is_js_whitespace(c: char) -> bool {
    matches!(
        c,
        '\u{9}'..='\u{d}'
            | '\u{20}'
            | '\u{a0}'
            | '\u{1680}'
            | '\u{2000}'..='\u{200a}'
            | '\u{2028}'
            | '\u{2029}'
            | '\u{202f}'
            | '\u{205f}'
            | '\u{3000}'
            | '\u{feff}'
    )
}

/// ASCII fast path for `is_js_whitespace`, derived from it rather than restated;
/// every non-ASCII byte answers `false` so the caller decodes and asks again.
pub(crate) fn is_js_whitespace_byte(b: u8) -> bool {
    b.is_ascii() && is_js_whitespace(b as char)
}

/// Last auto-closed tag information.
///
/// Corresponds to `LastAutoClosedTag` in `svelte/packages/svelte/src/compiler/phases/1-parse/index.js`.
#[derive(Debug, Clone)]
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
    /// Index just past the last non-whitespace char. Nothing at or after it can
    /// be anything but trailing whitespace, so `remaining_is_whitespace_only`
    /// rejects every earlier position without scanning.
    pub(crate) content_end: usize,
    /// Parser options.
    pub(crate) options: ParseOptions,
    /// Stack of open elements/blocks for validation.
    pub(crate) stack: Vec<StackEntry>,
    /// Line offsets for location calculation.
    pub(crate) line_offsets: Vec<usize>,
    /// Parsed instance script (context="default").
    pub(crate) instance_script: Option<Script<'a>>,
    /// Parsed module script (context="module").
    pub(crate) module_script: Option<Script<'a>>,
    /// Parsed stylesheet.
    pub(crate) stylesheet: Option<StyleSheet>,
    /// Parsed svelte:options.
    pub(crate) svelte_options: Option<SvelteOptions<'a>>,
    /// Pending comments that could become leading comments for a script.
    pub(crate) pending_leading_comments: Vec<String>,
    /// Whether we're in TypeScript mode.
    ///
    /// Corresponds to `ts` field in JavaScript Parser.
    pub(crate) ts: bool,
    /// Parse `<script>` content as TypeScript even without `lang="ts"`, WITHOUT
    /// affecting template-expression parsing. Used by the svelte2tsx pipeline,
    /// which (like official svelte2tsx on acorn-typescript) always parses scripts
    /// TS-aware while keeping template expressions (e.g. snippet params)
    /// lang-respecting. The compiler leaves this `false`.
    pub(crate) script_ts: bool,
    /// Whether attributes are currently being parsed for a top-level
    /// `<script>` / `<style>` tag. Upstream reads these with
    /// `read_static_attribute` (element.js `is_top_level_script_or_style`),
    /// so `{...}` chunks in quoted values (e.g.
    /// `generics="T extends { foo: number }"`) are plain text, never JS
    /// expressions — and must not raise `js_parse_error`.
    pub(crate) in_root_script_or_style: bool,
    /// Whether `<svelte:options>` attributes are currently being parsed.
    /// `read_options` inspects their values (`runes={false}`,
    /// `customElement={{…}}`) during the parse itself, so they can never be
    /// deferred into `Expression::Lazy`.
    pub(crate) in_svelte_options: bool,
    /// Meta tags (e.g., svelte:head, svelte:options).
    ///
    /// Corresponds to `meta_tags` field in JavaScript Parser.
    pub(crate) meta_tags: FxHashMap<String, bool>,
    /// Last auto-closed tag.
    ///
    /// Corresponds to `last_auto_closed_tag` field in JavaScript Parser.
    pub(crate) last_auto_closed_tag: Option<LastAutoClosedTag>,
    /// Parser-level warnings (e.g., element_implicitly_closed).
    pub(crate) parse_warnings: Vec<crate::ast::template::ParseWarning>,
    /// JS-style comments collected across the parse. Mirrors upstream
    /// `parser.root.comments`. Populated by:
    /// - `parse_attribute` for `// …` / `/* … */` comments between attributes
    ///   inside an element opener (Svelte 5.53+).
    /// - script/expression parsing for comments seen by the JS parser.
    ///
    /// `RefCell` because `parse_expression` is called from `&self` methods
    /// (the parser arena/options sit behind `&self` and many existing
    /// callers don't go through a `&mut` route).
    pub(crate) root_comments: std::cell::RefCell<Vec<crate::ast::template::JsComment>>,
    /// Arena allocator for JsNode instances created during parsing.
    pub(crate) arena: ParseArena,
    /// Current template nesting depth, bounded by [`MAX_NESTING_DEPTH`].
    pub(crate) depth: u32,
}

/// Maximum nesting depth accepted by the parser, for both template markup and
/// the CSS inside `<style>`.
///
/// Nothing in the source bounds this recursion, so without the cap deeply
/// nested input overflows the stack — an abort no embedder can contain, since
/// a stack overflow is not a panic. Upstream Svelte needs no equivalent limit
/// because a JS engine turns the same input into a catchable `RangeError`.
///
/// 128 is generous but conservative: the deepest component in the Svelte repo
/// (4,461 files) and in this one nests 21 levels, while a whole compile at the
/// limit stays under ~0.5 MiB of stack in a release build and ~2 MiB in a debug
/// build — inside the 1 MiB a wasm build gets, the 2 MiB of a spawned worker,
/// and the 8 MiB of a default main thread.
pub const MAX_NESTING_DEPTH: u32 = 128;

impl Parser<'_> {
    #[inline]
    pub(crate) fn should_defer_template_parse(&self) -> bool {
        !self.script_ts && self.options.defer_script_parse
    }
}

/// An entry on the parser stack.
#[derive(Debug, Clone)]
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
        // Discard any comments left in the per-thread expression sink from
        // a previous (possibly errored) parse on this thread.
        let _ = crate::compiler::phases::phase1_parse::read::expression::take_expr_comments();

        // Calculate line offsets for location calculation using SIMD-accelerated memchr.
        // Skip entirely in compilation mode where line/column info is never used.
        let bytes = source.as_bytes();
        let line_offsets = if options.skip_expression_loc {
            Vec::new()
        } else {
            let mut offsets = Vec::with_capacity(bytes.len() / 40 + 1); // rough estimate
            offsets.push(0);
            let mut pos = 0;
            while let Some(offset) = memchr::memchr(b'\n', &bytes[pos..]) {
                let abs = pos + offset;
                offsets.push(abs + 1);
                pos = abs + 1;
            }
            offsets
        };

        // Detect TypeScript mode by looking for lang="ts" in script tags
        // Corresponds to the TypeScript detection logic in JavaScript Parser constructor.
        // `force_typescript` (formatter-only) makes a plain `<script>` parse as TS too.
        let ts = options.force_typescript || Self::detect_typescript_mode(source);

        // Pre-allocate with small capacity since most files use few meta tags
        let stack = vec![StackEntry::Root];

        Self {
            source,
            bytes: source.as_bytes(),
            index: 0,
            content_end: source.trim_end().len(),
            options,
            stack,
            line_offsets,
            instance_script: None,
            module_script: None,
            stylesheet: None,
            svelte_options: None,
            pending_leading_comments: Vec::new(),
            ts,
            script_ts: false,
            in_root_script_or_style: false,
            in_svelte_options: false,
            meta_tags: FxHashMap::default(),
            last_auto_closed_tag: None,
            parse_warnings: Vec::new(),
            root_comments: std::cell::RefCell::new(Vec::new()),
            arena: ParseArena::new(),
            depth: 0,
        }
    }

    /// Reset the parser for a new source, reusing internal allocations.
    /// This avoids the cost of creating new Vec/HashMap/Arena instances.
    pub fn reset(&mut self, source: &'a str, options: ParseOptions) {
        self.source = source;
        self.bytes = source.as_bytes();
        self.index = 0;
        self.content_end = source.trim_end().len();
        self.options = options;

        self.stack.clear();
        self.stack.push(StackEntry::Root);

        // Recompute line offsets only if needed
        self.line_offsets.clear();
        if !options.skip_expression_loc {
            self.line_offsets.push(0);
            let bytes = source.as_bytes();
            let mut pos = 0;
            while let Some(offset) = memchr::memchr(b'\n', &bytes[pos..]) {
                let abs = pos + offset;
                self.line_offsets.push(abs + 1);
                pos = abs + 1;
            }
        }

        self.ts = options.force_typescript || Self::detect_typescript_mode(source);
        self.script_ts = false;
        self.in_root_script_or_style = false;
        self.in_svelte_options = false;
        self.instance_script = None;
        self.module_script = None;
        self.stylesheet = None;
        self.svelte_options = None;
        self.pending_leading_comments.clear();
        self.meta_tags.clear();
        self.last_auto_closed_tag = None;
        self.parse_warnings.clear();
        self.root_comments.borrow_mut().clear();
        self.depth = 0;
        let _ = crate::compiler::phases::phase1_parse::read::expression::take_expr_comments();
        self.arena = ParseArena::new(); // Fresh arena per file
    }

    /// Detect TypeScript mode by looking for `lang="ts"` or `lang='ts'` in script tags.
    ///
    /// Uses SIMD-accelerated search for `<script` followed by byte-level attribute scanning.
    fn detect_typescript_mode(source: &str) -> bool {
        let bytes = source.as_bytes();
        let len = bytes.len();

        // Every positive answer needs a literal `lang` attribute, so one cheap
        // pass rules out the two scans below for the whole no-`lang` majority.
        if LANG_FINDER.find(bytes).is_none() {
            return false;
        }

        // Jump straight between `<script` occurrences; HTML-comment spans are
        // resolved lazily so a commented-out script is still ignored.
        let script_finder = &*SCRIPT_TAG_FINDER;
        let comment_finder = &*HTML_COMMENT_FINDER;
        let mut comment_pos = 0usize;
        let mut script_pos = 0usize;

        'outer: while let Some(offset) = script_finder.find(&bytes[script_pos..]) {
            let i = script_pos + offset;

            while comment_pos <= i {
                let Some(coffset) = comment_finder.find(&bytes[comment_pos..]) else {
                    comment_pos = len + 1;
                    break;
                };
                let comment_start = comment_pos + coffset;
                if comment_start > i {
                    comment_pos = comment_start;
                    break;
                }
                let comment_end = match COMMENT_END_FINDER.find(&bytes[comment_start + 4..]) {
                    Some(end_offset) => comment_start + 4 + end_offset + 3,
                    None => len,
                };
                comment_pos = comment_end;
                if comment_end > i {
                    script_pos = comment_end;
                    continue 'outer;
                }
            }

            script_pos = i + 7;

            // Check for <script followed by whitespace or >
            if i + 7 < len
                && (bytes[i + 7] == b' '
                    || bytes[i + 7] == b'\t'
                    || bytes[i + 7] == b'\n'
                    || bytes[i + 7] == b'\r'
                    || bytes[i + 7] == b'>')
            {
                // Scan attributes for lang="ts" or lang='ts'
                let mut j = i + 7;
                while j < len && bytes[j] != b'>' {
                    if j + 4 <= len
                        && bytes[j] == b'l'
                        && bytes[j + 1] == b'a'
                        && bytes[j + 2] == b'n'
                        && bytes[j + 3] == b'g'
                    {
                        let mut k = j + 4;
                        while k < len && (bytes[k] == b' ' || bytes[k] == b'\t') {
                            k += 1;
                        }
                        if k < len && bytes[k] == b'=' {
                            k += 1;
                            while k < len && (bytes[k] == b' ' || bytes[k] == b'\t') {
                                k += 1;
                            }
                            if k < len {
                                if (bytes[k] == b'"' || bytes[k] == b'\'') && k + 3 < len {
                                    let quote = bytes[k];
                                    if bytes[k + 1] == b't'
                                        && bytes[k + 2] == b's'
                                        && bytes[k + 3] == quote
                                    {
                                        return true;
                                    }
                                } else if k + 1 < len
                                    && bytes[k] == b't'
                                    && bytes[k + 1] == b's'
                                    && (k + 2 >= len
                                        || bytes[k + 2] == b' '
                                        || bytes[k + 2] == b'\t'
                                        || bytes[k + 2] == b'>'
                                        || bytes[k + 2] == b'/')
                                {
                                    return true;
                                }
                            }
                        }
                    }
                    j += 1;
                }
                script_pos = if j < len { j + 1 } else { len };
            }
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

    /// Create name_loc with character field for Svelte compatibility.
    #[inline]
    pub fn create_name_loc(&self, start: usize, end: usize) -> SourceLocation {
        // Inline get_location to avoid two separate binary searches
        let start_line = self
            .line_offsets
            .partition_point(|&offset| offset <= start)
            .saturating_sub(1);
        let start_line_start = self.line_offsets.get(start_line).copied().unwrap_or(0);

        let end_line = if self
            .line_offsets
            .get(start_line + 1)
            .is_none_or(|&offset| end < offset)
        {
            start_line
        } else {
            self.line_offsets
                .partition_point(|&offset| offset <= end)
                .saturating_sub(1)
        };
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

    /// Create name_loc, returning None when skip_expression_loc is enabled (compilation mode).
    /// This avoids expensive binary searches for line/column when the data is never used.
    #[inline]
    pub fn create_name_loc_optional(&self, start: usize, end: usize) -> Option<SourceLocation> {
        if self.options.skip_expression_loc {
            None
        } else {
            Some(self.create_name_loc(start, end))
        }
    }

    // =========================================================================
    // Low-level parsing utilities
    // =========================================================================

    /// Check if we've reached the end of the source.
    #[inline(always)]
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
    #[inline(always)]
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
    #[inline(always)]
    pub fn match_byte(&self, b: u8) -> bool {
        self.index < self.bytes.len() && self.bytes[self.index] == b
    }

    /// When positioned at `{`, return the absolute index of the first
    /// non-whitespace byte after it. Upstream `tag()` runs
    /// `parser.allow_whitespace()` between `{` and the marker char
    /// (`#` / `:` / `/` / `@`), so `{   /if}` and `{  :else}` are valid
    /// close/continuation tags.
    fn index_after_open_brace_ws(&self) -> Option<usize> {
        if self.index >= self.bytes.len() || self.bytes[self.index] != b'{' {
            return None;
        }
        let mut i = self.index + 1;
        while i < self.bytes.len() {
            let b = self.bytes[i];
            if b.is_ascii() {
                if !is_js_whitespace_byte(b) {
                    return Some(i);
                }
                i += 1;
            } else {
                let c = self.source[i..].chars().next().unwrap_or('\0');
                if is_js_whitespace(c) {
                    i += c.len_utf8();
                } else {
                    return Some(i);
                }
            }
        }
        None
    }

    /// If the parser is positioned at a block close marker — `{` + optional
    /// whitespace + `/` (but not a `/*` or `//` comment) — return the absolute
    /// index of the `/` byte. Mirrors upstream `tag()`:
    /// `allow_whitespace(); if (parser.match('/')) { if (!parser.match('/*') &&
    /// !parser.match('//')) { … close(parser); } }`.
    pub fn match_block_close_marker(&self) -> Option<usize> {
        let i = self.index_after_open_brace_ws()?;
        if self.bytes[i] != b'/' {
            return None;
        }
        match self.bytes.get(i + 1) {
            Some(b'*') | Some(b'/') => None,
            _ => Some(i),
        }
    }

    /// If the parser is positioned at a block continuation marker — `{` +
    /// optional whitespace + `:` — return the absolute index of the `:` byte.
    /// Mirrors upstream `tag()`: `allow_whitespace(); if (parser.eat(':'))
    /// return next(parser);`. (`{://` / `{:/*` keep rsvelte's existing comment
    /// exclusion.)
    pub fn match_block_continuation_marker(&self) -> Option<usize> {
        let i = self.index_after_open_brace_ws()?;
        if self.bytes[i] != b':' {
            return None;
        }
        if self.bytes.get(i + 1) == Some(&b'/')
            && matches!(self.bytes.get(i + 2), Some(b'*') | Some(b'/'))
        {
            return None;
        }
        Some(i)
    }

    /// `(close, continuation)` markers, sharing the single whitespace skip.
    #[inline]
    pub fn match_block_markers(&self) -> (bool, bool) {
        let Some(i) = self.index_after_open_brace_ws() else {
            return (false, false);
        };
        match self.bytes[i] {
            b'/' => (
                !matches!(self.bytes.get(i + 1), Some(b'*') | Some(b'/')),
                false,
            ),
            b':' => (
                false,
                !(self.bytes.get(i + 1) == Some(&b'/')
                    && matches!(self.bytes.get(i + 2), Some(b'*') | Some(b'/'))),
            ),
            _ => (false, false),
        }
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
    /// Whether the character starting at byte `i` is JS whitespace. Byte-level
    /// scans need this because a multi-byte character's lead byte answers
    /// nothing on its own.
    pub(crate) fn is_js_whitespace_at(&self, i: usize) -> bool {
        match self.bytes.get(i) {
            None => false,
            Some(&b) if b.is_ascii() => is_js_whitespace_byte(b),
            _ => self.source[i..]
                .chars()
                .next()
                .is_some_and(is_js_whitespace),
        }
    }

    /// Byte index of the first non-whitespace character at or after `i`.
    pub(crate) fn skip_js_whitespace_from(&self, mut i: usize) -> usize {
        while self.is_js_whitespace_at(i) {
            i += self.source[i..].chars().next().map_or(1, char::len_utf8);
        }
        i
    }

    pub fn skip_whitespace(&mut self) {
        while self.index < self.bytes.len() {
            let b = self.bytes[self.index];
            if b.is_ascii() {
                if !is_js_whitespace_byte(b) {
                    break;
                }
                self.index += 1;
            } else {
                let c = self.source[self.index..].chars().next().unwrap_or('\0');
                if is_js_whitespace(c) {
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
    /// Read a tag name and return as a source slice (zero-copy).
    pub fn read_tag_name(&mut self) -> &str {
        let start = self.index;

        // Mirrors upstream `read_until(/(\s|\/|>)/)`; `=` additionally ends a
        // name so `<p=` does not swallow the rest of the tag.
        while self.index < self.bytes.len() {
            let b = self.bytes[self.index];
            if b.is_ascii() {
                if is_js_whitespace_byte(b) || b == b'>' || b == b'/' || b == b'=' {
                    break;
                }
                self.index += 1;
            } else {
                let c = self.source[self.index..].chars().next().unwrap_or('\0');
                if is_js_whitespace(c) {
                    break;
                }
                self.index += c.len_utf8();
            }
        }

        &self.source[start..self.index]
    }

    /// Read an attribute name and return as a source slice (zero-copy).
    #[inline]
    pub fn read_attribute_name(&mut self) -> &str {
        let start = self.index;

        // Mirrors upstream `read_until(/[\s=\/>"']/)`.
        while self.index < self.bytes.len() {
            let b = self.bytes[self.index];
            if b.is_ascii() {
                if is_js_whitespace_byte(b) || matches!(b, b'=' | b'>' | b'/' | b'"' | b'\'') {
                    break;
                }
                self.index += 1;
            } else {
                let c = self.source[self.index..].chars().next().unwrap_or('\0');
                if is_js_whitespace(c) {
                    break;
                }
                self.index += c.len_utf8();
            }
        }

        &self.source[start..self.index]
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
        if self.is_eof() || !is_js_whitespace(self.current_char()) {
            return Err(ParseError::svelte(
                "expected_whitespace",
                "Expected whitespace",
                (self.index, self.index + 1),
            ));
        }

        self.skip_whitespace();
        Ok(())
    }

    /// Scan forward from the current position to find the matching closing brace.
    /// Returns the position of the closing `}` (or EOF if unbalanced).
    /// Does NOT advance past the closing brace - caller must do that.
    ///
    /// Uses the JS-lexical-aware `utils::find_matching_bracket` so that braces
    /// inside strings, template literals, comments, and regex literals in a
    /// directive / attribute expression are not miscounted (e.g.
    /// `on:click={() => x("}")}`).
    #[inline]
    pub fn scan_to_closing_brace(&mut self) -> usize {
        self.index = crate::compiler::phases::phase1_parse::utils::find_matching_bracket(
            self.source,
            self.index,
            '{',
        )
        .unwrap_or(self.bytes.len());
        self.index
    }
}
