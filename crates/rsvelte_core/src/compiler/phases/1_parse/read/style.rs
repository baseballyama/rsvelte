//! Style tag and CSS parsing.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/read/style.js`
//!
//! ## Differences from Svelte
//!
//! - **Standalone CSS parser**: Svelte uses CSS-Tree for CSS parsing, while this
//!   implementation includes a custom CSS parser to avoid external dependencies.
//! - **Selector parsing**: The selector parser is implemented from scratch to
//!   produce an AST compatible with Svelte's expected format.
//! - **Declaration/rule parsing**: Handles CSS rules, at-rules, and declarations
//!   with position tracking for source maps.

use memchr::memmem;
use serde_json::{Map, Value};

use crate::ast::css::{StyleSheet, StyleSheetContent, StyleSheetType};
use crate::ast::template::{AttributeValue, AttributeValuePart, TemplateNode};
use crate::error::ParseResult;

use super::super::parser::{MAX_NESTING_DEPTH, Parser, is_js_whitespace};
use super::super::utils::TrimWs;

/// Returns `true` when the `<style>` has a `lang` attribute whose value is not
/// plain CSS (e.g. `sass`, `scss`, `stylus`, `less`, `postcss`). Such a block
/// is preprocessed before the compiler normally sees it, so its body is NOT
/// CSS — used (in lenient/lint mode only) to skip CSS-shaped validation that
/// would otherwise abort the whole-file parse.
fn has_non_css_lang<'a>(attributes: &[crate::ast::Attribute<'a>]) -> bool {
    for attr in attributes {
        if let crate::ast::Attribute::Attribute(node) = attr
            && node.name.as_str() == "lang"
            && let AttributeValue::Sequence(parts) = &node.value
            && let Some(AttributeValuePart::Text(t)) = parts.first()
        {
            let lang = t.data.as_ref().trim_ws().to_ascii_lowercase();
            return !lang.is_empty() && lang != "css";
        }
    }
    false
}

// ============================================================================
// Public API
// ============================================================================

/// Parse CSS content and return the children array for StyleSheet.
pub fn parse_css(content: &str, offset: usize) -> Vec<Value> {
    let mut parser = CssParser::new(content, offset);
    parser.parse()
}

/// Parse CSS content like `parse_css`, but propagate parser errors instead
/// of silently swallowing them. Used by the style-tag parser to surface
/// `css_expected_identifier` (and similar) errors that the official Svelte
/// CSS parser raises in `read_identifier` / `read_selector`.
pub(crate) fn parse_css_strict(
    content: &str,
    offset: usize,
) -> Result<Vec<Value>, crate::error::ParseError> {
    let mut parser = CssParser::new(content, offset);
    let rules = parser.parse();
    if let Some(err) = parser.error.take() {
        return Err(err);
    }
    Ok(rules)
}

fn collect_css_comments(content: &str, offset: usize) -> Vec<Value> {
    let mut comments = Vec::new();
    let bytes = content.as_bytes();
    let mut index = 0;
    let mut quote = None;

    while index < bytes.len() {
        let byte = bytes[index];
        if byte == b'\\' {
            index += 1;
            if index < bytes.len() {
                index += content[index..].chars().next().map_or(1, char::len_utf8);
            }
            continue;
        }
        if let Some(mark) = quote {
            if byte == mark {
                quote = None;
            }
            index += 1;
            continue;
        }
        if byte == b'\'' || byte == b'\"' {
            quote = Some(byte);
            index += 1;
            continue;
        }
        if byte == b'/' && bytes.get(index + 1) == Some(&b'*') {
            let start = index;
            index += 2;
            let value_start = index;
            while index + 1 < bytes.len() && !(bytes[index] == b'*' && bytes[index + 1] == b'/') {
                index += content[index..].chars().next().map_or(1, char::len_utf8);
            }
            let value_end = index;
            if index + 1 < bytes.len() {
                index += 2;
            }
            let prev = content[..start].chars().rev().find(|c| !c.is_whitespace());
            let next = content[index..].chars().find(|c| !c.is_whitespace());
            if prev.is_some_and(|c| c.is_ascii_alphanumeric() || c == '-')
                && next.is_some_and(|c| c.is_ascii_alphanumeric() || c == '-')
            {
                continue;
            }
            let mut comment = Map::new();
            comment.insert("type".to_string(), Value::String("CSSComment".to_string()));
            comment.insert(
                "value".to_string(),
                Value::String(content[value_start..value_end].to_string()),
            );
            comment.insert(
                "start".to_string(),
                Value::Number(((offset + start) as i64).into()),
            );
            comment.insert(
                "end".to_string(),
                Value::Number(((offset + index) as i64).into()),
            );
            comments.push(Value::Object(comment));
            continue;
        }
        index += content[index..].chars().next().map_or(1, char::len_utf8);
    }

    comments
}

/// Helper: build a CSS `Block` node.
/// The combinator token starting at `i`, mirroring upstream's
/// `REGEX_COMBINATOR = /(\+|~|>|\|\|)/y` — a lone `|` is a namespace separator.
fn combinator_at(bytes: &[u8], i: usize) -> Option<&'static str> {
    match bytes[i] {
        b'+' => Some("+"),
        b'>' => Some(">"),
        b'~' => Some("~"),
        b'|' if bytes.get(i + 1) == Some(&b'|') => Some("||"),
        _ => None,
    }
}

fn block_value(start: usize, end: usize, children: Vec<Value>) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Block".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("children".to_string(), Value::Array(children));
    Value::Object(obj)
}

/// Helper: record a selector-level error on a `CssParser`'s shared error
/// cell, preserving the first error encountered.
fn record_first_error(
    cell: &std::cell::Cell<Option<crate::error::ParseError>>,
    err: crate::error::ParseError,
) {
    let existing = cell.take();
    if existing.is_some() {
        cell.set(existing);
    } else {
        cell.set(Some(err));
    }
}

/// Length of the leading JS-whitespace run of `text`.
fn leading_ws_len(text: &str) -> usize {
    text.len() - text.trim_start_ws().len()
}

/// Port of upstream's sticky `REGEX_NTH_OF` (`1-parse/read/style.js`):
/// `(even|odd|\+?(\d+|\d*n(\s*[+-]\s*\d+)?)|-\d*n(\s*\+\s*\d+))((?=\s*[,)])|\s+of\s+)`
///
/// `text` must start at the candidate token. The caller has already stripped the
/// enclosing parentheses and split on top-level commas, so end-of-text stands in
/// for the `,`/`)` the lookahead requires. Returns the whole match length (the
/// `Nth` node's text, `of` separator included).
fn match_nth_of(text: &str) -> Option<usize> {
    for anb in nth_anb_candidates(text) {
        if let Some(total) = nth_of_tail(text, anb) {
            return Some(total);
        }
    }
    None
}

/// End offsets for the An+B part, in the alternation/backtracking order a JS
/// regex would try them.
fn nth_anb_candidates(text: &str) -> Vec<usize> {
    let b = text.as_bytes();
    let mut out = Vec::new();

    if text.starts_with("even") {
        out.push(4);
    }
    if text.starts_with("odd") {
        out.push(3);
    }

    // `\+?(\d+|\d*n(\s*[+-]\s*\d+)?)`
    let p = usize::from(b.first() == Some(&b'+'));
    let mut d = p;
    while d < b.len() && b[d].is_ascii_digit() {
        d += 1;
    }
    // `\d+` is greedy and backtracks one digit at a time.
    let mut k = d;
    while k > p {
        out.push(k);
        k -= 1;
    }
    push_nth_n_form(text, p, false, &mut out);

    // `-\d*n(\s*\+\s*\d+)`
    if b.first() == Some(&b'-') {
        push_nth_n_form(text, 1, true, &mut out);
    }

    out
}

/// `\d*n(\s*[+-]\s*\d+)?` (or, when `plus_only`, a required `(\s*\+\s*\d+)`)
/// starting at `p`.
fn push_nth_n_form(text: &str, p: usize, plus_only: bool, out: &mut Vec<usize>) {
    let b = text.as_bytes();
    let mut d = p;
    while d < b.len() && b[d].is_ascii_digit() {
        d += 1;
    }
    if b.get(d) != Some(&b'n') {
        return;
    }
    let q = d + 1;

    // The trailing group is greedy, so it is attempted before the empty match.
    let mut i = q + leading_ws_len(&text[q..]);
    let sign_ok = match b.get(i) {
        Some(&b'+') => true,
        Some(&b'-') => !plus_only,
        _ => false,
    };
    if sign_ok {
        i += 1;
        i += leading_ws_len(&text[i..]);
        let digits_start = i;
        while i < b.len() && b[i].is_ascii_digit() {
            i += 1;
        }
        let mut k = i;
        while k > digits_start {
            out.push(k);
            k -= 1;
        }
    }

    if !plus_only {
        out.push(q);
    }
}

/// `((?=\s*[,)])|\s+of\s+)` at `anb`. Returns the total match length.
fn nth_of_tail(text: &str, anb: usize) -> Option<usize> {
    let rest = &text[anb..];
    let after_ws = rest.trim_start_ws();
    if after_ws.is_empty() || after_ws.starts_with(',') || after_ws.starts_with(')') {
        return Some(anb);
    }

    // `\s+of` followed by whitespace or an unambiguous selector-start token.
    let ws = leading_ws_len(rest);
    if ws == 0 {
        return None;
    }
    let after = &rest[ws..];
    let after = after.strip_prefix("of")?;
    let trailing_ws = leading_ws_len(after);
    if trailing_ws > 0 {
        return Some(anb + ws + 2 + trailing_ws);
    }

    matches!(
        after.as_bytes().first(),
        Some(b'.' | b'#' | b'[' | b'*' | b':' | b'&')
    )
    .then_some(anb + ws + 2)
}

/// A comment where a compound selector should begin. Upstream's `read_selector`
/// tolerates one only immediately before `,`, `{` or `)`; anywhere else the loop
/// falls through to `read_identifier`, which rejects the `/`.
fn record_selector_comment_error(
    cell: &std::cell::Cell<Option<crate::error::ParseError>>,
    pos: usize,
) {
    record_first_error(
        cell,
        crate::error::ParseError::svelte(
            "css_expected_identifier",
            "Expected a valid CSS identifier",
            (pos, pos),
        ),
    );
}

// ============================================================================
// Parser implementation for style tags
// ============================================================================

impl<'a> Parser<'a> {
    /// Advance `self.index` to the `</style` that closes the current block,
    /// mirroring the CSS tokenisation upstream's readers perform: a `</style`
    /// inside a CSS string, a `/* */` or `<!-- -->` comment, or an unquoted
    /// `url(...)` is content, not a closing tag.
    ///
    /// Returns the first `<` that could not start a closing tag (used for the
    /// `css_expected_identifier` diagnostic), whether the scan ran out of
    /// input inside a `url(`, and the first CSS-invalid `//`. The last value is
    /// needed because an apostrophe later in an SCSS line comment must not hide
    /// the earlier identifier error behind `unexpected_eof`.
    ///
    /// `tokenise` is off for a non-CSS `lang` block in lenient (lint) mode: a
    /// SCSS `// don't` would otherwise open a string that never closes.
    fn scan_to_style_close(&mut self, tokenise: bool) -> (Option<usize>, bool, Option<usize>) {
        let content_start = self.index;
        let bytes = self.bytes;
        let len = bytes.len();
        let mut first_invalid_lt: Option<usize> = None;
        let mut first_line_comment: Option<usize> = None;
        let mut quote: Option<u8> = None;
        let mut in_url = false;
        let mut escaped = false;
        // Upstream tests `</style` only between rules, so a `<` inside a block or
        // a parenthesised value is CSS text: `.a { color: red; </style> }` is a
        // `css_empty_declaration` and `calc(</style>)` a declaration value.
        let mut brace_depth = 0usize;
        let mut paren_depth = 0usize;
        let mut i = self.index;

        if !tokenise {
            while let Some(offset) = memchr::memchr(b'<', &bytes[i..]) {
                i += offset;
                self.index = i;
                if self.is_valid_closing_tag("</style") {
                    return (first_invalid_lt, false, None);
                }
                if first_invalid_lt.is_none() {
                    first_invalid_lt = Some(i);
                }
                i += 1;
            }
            self.index = len;
            return (first_invalid_lt, false, None);
        }

        while i < len {
            let ch = bytes[i];
            // Mirrors the branch order of upstream's `read_value`.
            if escaped {
                escaped = false;
            } else if ch == b'\\' {
                escaped = true;
            } else if Some(ch) == quote {
                quote = None;
            } else if ch == b')' {
                in_url = false;
                if quote.is_none() {
                    paren_depth = paren_depth.saturating_sub(1);
                }
            } else if quote.is_none() && (ch == b'"' || ch == b'\'') {
                quote = Some(ch);
            } else if ch == b'(' && i >= content_start + 3 && &bytes[i - 3..i] == b"url" {
                in_url = true;
                paren_depth += 1;
            } else if quote.is_none() && !in_url {
                if ch == b'(' {
                    paren_depth += 1;
                } else if ch == b'{' {
                    brace_depth += 1;
                } else if ch == b'}' {
                    brace_depth = brace_depth.saturating_sub(1);
                } else if ch == b'/' && bytes.get(i + 1) == Some(&b'*') {
                    // An unterminated comment keeps the old behaviour: fall
                    // through so the CSS parse reports it.
                    if let Some(off) = memchr::memmem::find(&bytes[i + 2..], b"*/") {
                        i += 2 + off + 2;
                        continue;
                    }
                } else if ch == b'/' && bytes.get(i + 1) == Some(&b'/') {
                    first_line_comment.get_or_insert(i);
                } else if ch == b'<' {
                    if bytes[i..].starts_with(b"<!--")
                        && let Some(off) = memchr::memmem::find(&bytes[i + 4..], b"-->")
                    {
                        i += 4 + off + 3;
                        continue;
                    }
                    if brace_depth == 0 && paren_depth == 0 {
                        self.index = i;
                        if self.is_valid_closing_tag("</style") {
                            return (first_invalid_lt, false, first_line_comment);
                        }
                        if first_invalid_lt.is_none() {
                            first_invalid_lt = Some(i);
                        }
                    }
                }
            }
            i += 1;
        }

        self.index = len;
        (first_invalid_lt, in_url, first_line_comment)
    }

    /// Parse a `<style>` tag and store it in stylesheet.
    pub fn parse_style_tag(
        &mut self,
        start: usize,
        attributes: Vec<crate::ast::Attribute>,
        self_closing: bool,
    ) -> ParseResult<Option<TemplateNode<'a>>> {
        // Check for duplicate style tags
        if self.stylesheet.is_some() {
            return Err(crate::error::ParseError::svelte(
                "style_duplicate",
                "A component can have a single top-level `<style>` element",
                (start, start),
            ));
        }

        // A self-closed `<style />` (lenient/lint mode only) has no content and
        // no closing tag — produce an empty stylesheet spanning `<style … />` so
        // layout/style lint rules can still see it. Mirrors svelte-eslint-parser.
        if self_closing {
            let here = self.index;
            let style_attributes: Vec<serde_json::Value> = attributes
                .iter()
                .filter_map(|attr| {
                    if let crate::ast::Attribute::Attribute(attr_node) = attr {
                        serde_json::to_value(attr_node).ok()
                    } else {
                        None
                    }
                })
                .collect();
            self.stylesheet = Some(StyleSheet {
                node_type: StyleSheetType::StyleSheet,
                start: start as u32,
                end: here as u32,
                attributes: style_attributes,
                children: Vec::new(),
                comments: Vec::new(),
                content: StyleSheetContent {
                    start: here as u32,
                    end: here as u32,
                    styles: String::new(),
                    comment: self.pending_leading_comments.last().cloned(),
                },
            });
            return Ok(None);
        }

        // Lenient (lint) mode only: a non-CSS `lang` block (sass/scss/stylus/…)
        // is not CSS, so its body must not drive CSS-shaped validation — that
        // would spuriously abort the whole template parse and suppress every
        // other lint on the file. Plain-CSS `<style>` keeps full strictness, so
        // invalid plain CSS still fails to parse exactly as the official
        // compiler (and the eslint oracle) treats it.
        let lenient_non_css = (self.options.lenient_script || self.options.skip_non_css_lang_style)
            && has_non_css_lang(&attributes);

        let content_start = self.index;

        // Upstream never scans the block as raw text: `read_body` only tests
        // `parser.match('</style')` at a rule boundary, so a `</style` inside a
        // CSS string, comment or `url()` is swallowed by `read_value` /
        // `read_comment` / `allow_comment_or_whitespace`. Mirror that
        // tokenisation instead of a plain byte search.
        let (first_invalid_lt, unterminated_url, first_line_comment) =
            self.scan_to_style_close(!lenient_non_css);

        let content_end = self.index;
        let style_content = &self.source[content_start..content_end];

        // Check for mismatched/unclosed CSS string quotes.
        // A string that starts with `"` must end with `"`, and `'` must end with `'`.
        // If a string is not properly closed, we report `unexpected_eof`.
        // This corresponds to CSS-Tree's lexer error handling in the official Svelte compiler.
        //
        // Skipped only for a non-CSS `lang` block in lenient (lint) mode (see
        // `lenient_non_css` above). Plain CSS keeps this check, so invalid plain
        // CSS still errors exactly as the compiler/oracle do.
        if !lenient_non_css {
            let mut in_string = false;
            let mut string_byte = 0u8;
            let mut in_block_comment = false;
            let css_bytes = style_content.as_bytes();
            let mut i = 0;
            while i < css_bytes.len() {
                let ch = css_bytes[i];
                if in_block_comment {
                    if ch == b'*' && i + 1 < css_bytes.len() && css_bytes[i + 1] == b'/' {
                        in_block_comment = false;
                        i += 2;
                        continue;
                    }
                    i += 1;
                    continue;
                }
                if in_string {
                    if ch == b'\\' {
                        // Escape sequence - skip next char
                        i += 2;
                        continue;
                    }
                    if ch == string_byte {
                        in_string = false;
                    }
                    i += 1;
                    continue;
                }
                if ch == b'/' && i + 1 < css_bytes.len() && css_bytes[i + 1] == b'*' {
                    in_block_comment = true;
                    i += 2;
                    continue;
                }
                if ch == b'"' || ch == b'\'' {
                    in_string = true;
                    string_byte = ch;
                }
                i += 1;
            }
            if in_string || unterminated_url {
                // `//` is not a CSS comment. Upstream reaches that slash and
                // raises from `read_identifier` before text later on the same
                // SCSS line (for example `don't`) can look like the start of an
                // unterminated CSS string to this closing-tag scan.
                if let Some(pos) = first_line_comment {
                    return Err(crate::error::ParseError::svelte(
                        "css_expected_identifier",
                        "Expected a valid CSS identifier",
                        (pos, pos),
                    ));
                }
                // Upstream's CSS reader always reports EOF at `parser.template.length`,
                // and its template is the source with trailing whitespace trimmed.
                return Err(crate::error::ParseError::svelte(
                    "unexpected_eof",
                    "Unexpected end of input",
                    (self.content_end, self.content_end),
                ));
            }
        }

        if self.match_str("</style") {
            self.advance_by(7); // consume '</style'
            // Upstream reads `/\s*>/y`, so the run is consumed only when a `>`
            // really follows: `</style x>` leaves ` x>` as template text.
            let after_name = self.index;
            while !self.is_eof() && is_js_whitespace(self.current_char()) {
                self.advance();
            }
            if !self.eat_optional(">") {
                self.index = after_name;
            }
        } else if self.is_eof() {
            // Style tag was not closed - check if there was invalid '<' in content
            if let Some(lt_pos) = first_invalid_lt {
                return Err(crate::error::ParseError::svelte(
                    "css_expected_identifier",
                    "Expected a valid CSS identifier",
                    (lt_pos, lt_pos),
                ));
            }
            // A CSS-invalid `//` can make the closing-tag scan treat later
            // apostrophes as quotes. If two of those apostrophes balance, the
            // quote check above passes, but braces skipped between them can
            // still leave the scanner unable to see the real `</style>`.
            // Upstream stops at the earlier slash instead.
            if let Some(pos) = first_line_comment {
                return Err(crate::error::ParseError::svelte(
                    "css_expected_identifier",
                    "Expected a valid CSS identifier",
                    (pos, pos),
                ));
            }
            // Style tag was not closed. Upstream's `eat('</style', true)` runs
            // against the right-trimmed template, so the point is its end.
            return Err(crate::error::ParseError::expected_token(
                "</style",
                self.content_end,
            ));
        }

        let end = self.index;

        // Convert attributes to JSON values
        let style_attributes: Vec<serde_json::Value> = attributes
            .iter()
            .filter_map(|attr| {
                if let crate::ast::Attribute::Attribute(attr_node) = attr {
                    serde_json::to_value(attr_node).ok()
                } else {
                    None
                }
            })
            .collect();

        // Validate CSS content before parsing.
        // If the content has non-whitespace, non-comment text but no '{' character,
        // it cannot be valid CSS (no rules can be formed).
        // This corresponds to CSS-Tree's error when encountering invalid CSS in the
        // official Svelte compiler.
        //
        // Skipped only for a non-CSS `lang` block in lenient (lint) mode (see
        // the string-quote check above).
        if !lenient_non_css {
            let trimmed = style_content.trim_ws();
            if !trimmed.is_empty() {
                // Fast path: no block comments present, so there is nothing to
                // strip and `trimmed` itself already reflects the real content.
                if !trimmed.contains("/*") {
                    if !trimmed.contains('{') && !trimmed.contains(';') && !trimmed.starts_with('@')
                    {
                        // Non-empty CSS content with no blocks and no at-rules - invalid
                        let err_pos =
                            first_line_comment.unwrap_or(content_start + style_content.len());
                        return Err(crate::error::ParseError::svelte(
                            "css_expected_identifier",
                            "Expected a valid CSS identifier",
                            (err_pos, err_pos),
                        ));
                    }
                } else {
                    // Strip CSS comments to check if there's real content
                    let mut stripped = String::new();
                    let bytes = trimmed.as_bytes();
                    let mut i = 0;
                    let mut segment_start = 0;
                    while i < bytes.len() {
                        if i + 1 < bytes.len() && bytes[i] == b'/' && bytes[i + 1] == b'*' {
                            // Flush non-comment segment
                            if segment_start < i {
                                stripped.push_str(&trimmed[segment_start..i]);
                            }
                            // Skip block comment
                            i += 2;
                            while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/')
                            {
                                i += 1;
                            }
                            if i + 1 < bytes.len() {
                                i += 2; // skip */
                            }
                            segment_start = i;
                        } else {
                            i += 1;
                        }
                    }
                    // Flush remaining segment
                    if segment_start < bytes.len() {
                        stripped.push_str(&trimmed[segment_start..]);
                    }
                    let stripped = stripped.trim_ws();
                    if !stripped.is_empty()
                        && !stripped.contains('{')
                        && !stripped.contains(';')
                        && !stripped.starts_with('@')
                    {
                        // Non-empty CSS content with no blocks and no at-rules - invalid
                        let err_pos =
                            first_line_comment.unwrap_or(content_start + style_content.len());
                        return Err(crate::error::ParseError::svelte(
                            "css_expected_identifier",
                            "Expected a valid CSS identifier",
                            (err_pos, err_pos),
                        ));
                    }
                }
            }
        }

        // Parse CSS content (deferred when defer_script_parse is enabled).
        // Use the strict variant inside `parse_style_tag` so that errors raised
        // by the underlying CSS parser (e.g. `css_expected_identifier` for
        // tokens like `$blue`) propagate to the user instead of being
        // silently dropped.
        let css_children = if self.should_defer_template_parse() {
            Vec::new() // Will be resolved by ensure_css_parsed() before analysis
        } else if lenient_non_css {
            // Non-CSS `lang` block in lint mode: the body is sass/scss/stylus/…,
            // not CSS — don't parse it as CSS (CSS-aware rules handle the raw
            // text themselves via their own `lang` branch). Yields no CSS AST
            // children, so the surrounding template still lints normally.
            Vec::new()
        } else {
            parse_css_strict(style_content, content_start)?
        };

        // Capture the preceding HTML comment for svelte-ignore support.
        // In the official Svelte compiler (element.js L351), the parser stores the preceding
        // HTML comment in `content.content.comment` so that the analysis phase can check
        // if `svelte-ignore css_unused_selector` is present.
        // We use `pending_leading_comments` which accumulates comment data as comments are parsed.
        let comment = self.pending_leading_comments.last().cloned();

        let stylesheet = StyleSheet {
            node_type: StyleSheetType::StyleSheet,
            start: start as u32,
            end: end as u32,
            attributes: style_attributes,
            children: css_children,
            comments: collect_css_comments(style_content, content_start),
            content: StyleSheetContent {
                start: content_start as u32,
                end: content_end as u32,
                styles: style_content.to_string(),
                comment,
            },
        };

        self.stylesheet = Some(stylesheet);

        // Return None - style tags don't appear in the fragment
        Ok(None)
    }
}

// ============================================================================
// CSS Parser
// ============================================================================

struct CssParser<'a> {
    source: &'a str,
    offset: usize,
    index: usize,
    /// Stores the first parse error encountered, if any. The error is reported
    /// via `parse_css_strict`; `parse_css` (the non-strict entry point) ignores
    /// it and returns a best-effort AST for backwards compatibility with
    /// callers that operate on already-validated content. Wrapped in `Cell`
    /// so that helper methods which take `&self` (because they mutate only
    /// `self.index` indirectly via sub-parsers) can still record errors.
    error: std::cell::Cell<Option<crate::error::ParseError>>,
    /// Current nested-rule depth, bounded by `MAX_NESTING_DEPTH`.
    depth: u32,
}

impl<'a> CssParser<'a> {
    fn new(source: &'a str, offset: usize) -> Self {
        Self {
            source,
            offset,
            index: 0,
            error: std::cell::Cell::new(None),
            depth: 0,
        }
    }

    fn parse(&mut self) -> Vec<Value> {
        let mut rules = Vec::new();

        while !self.is_eof() {
            self.skip_whitespace();
            if self.is_eof() {
                break;
            }

            // Check for comments (CSS and HTML)
            if self.match_str("/*") {
                self.skip_block_comment();
                continue;
            }
            if self.match_str("<!--") {
                self.skip_html_comment();
                continue;
            }

            let index_before = self.index;

            // Check for at-rules
            if self.current_char() == '@' {
                if let Some(rule) = self.parse_atrule() {
                    rules.push(rule);
                }
            } else if let Some(rule) = self.parse_rule() {
                // Parse regular rule
                rules.push(rule);
            }

            // Progress guard: if the sub-parser consumed no input (e.g. an empty
            // selector at a block start like `{}`, where `parse_rule` records
            // `css_expected_identifier` and returns `None`), stop instead of
            // spinning forever.
            if self.index == index_before {
                break;
            }
        }

        rules
    }

    fn parse_atrule(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        self.advance(); // consume '@'

        // Read at-rule name
        let name_start = self.offset + self.index;
        // Upstream's `read_identifier` rejects a name starting `-?\d` before reading it.
        let leading_digit = {
            let rest = &self.source[self.index..];
            let rest = rest.strip_prefix('-').unwrap_or(rest);
            rest.starts_with(|c: char| c.is_ascii_digit())
        };
        let name = self.read_identifier();
        if leading_digit || name.is_empty() {
            record_first_error(
                &self.error,
                crate::error::ParseError::svelte(
                    "css_expected_identifier",
                    "Expected a valid CSS identifier",
                    (name_start, name_start),
                ),
            );
            return None;
        }
        self.skip_whitespace();

        // Read prelude (until { or ;)
        let prelude_start = self.index;
        let mut depth = 0;
        while !self.is_eof() {
            let c = self.current_char();
            if c == '(' {
                depth += 1;
            } else if c == ')' {
                depth -= 1;
            } else if depth == 0 && (c == '{' || c == ';') {
                break;
            }
            self.advance();
        }
        let prelude = self.source[prelude_start..self.index].trim_ws().to_string();

        // Check if there's a block
        let block = if self.current_char() == '{' {
            let block_start = self.offset + self.index;
            self.advance(); // consume '{'
            self.with_block_depth(block_start, |parser| parser.parse_atrule_block(block_start))
        } else {
            self.eat_optional(";");
            Value::Null
        };

        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert("type".to_string(), Value::String("Atrule".to_string()));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("name".to_string(), Value::String(name.to_string()));
        obj.insert("prelude".to_string(), Value::String(prelude));
        obj.insert("block".to_string(), block);

        Some(Value::Object(obj))
    }

    /// Parse the body of an at-rule, whose `{` has already been consumed.
    fn parse_atrule_block(&mut self, block_start: usize) -> Value {
        self.skip_whitespace();

        // Parse rules inside the block
        let mut children = Vec::new();
        while !self.is_eof() && self.current_char() != '}' {
            self.skip_whitespace();
            if self.is_eof() || self.current_char() == '}' {
                break;
            }
            let index_before = self.index;

            // Skip comments so they don't get folded into the next child's
            // span (they're preserved via source gap copying in the printer).
            if self.match_str("/*") {
                self.skip_block_comment();
                continue;
            }

            // Check for nested at-rule
            if self.current_char() == '@' {
                if let Some(rule) = self.parse_atrule() {
                    children.push(rule);
                }
            } else if self.peek_block_item_is_rule() {
                // Selector followed by `{` → rule (e.g. `0% { ... }` in @keyframes,
                // `.foo { ... }` in @media/@supports).
                if let Some(rule) = self.parse_rule() {
                    children.push(rule);
                }
            } else if let Some(decl) = self.parse_declaration() {
                // `prop: value;` declaration (used by @page, @font-face,
                // @counter-style, @property, etc., which take declarations
                // directly inside their block instead of nested rules).
                children.push(decl);
            } else {
                // Couldn't make progress — bail to avoid infinite loop.
                self.advance();
            }
            // `parse_rule` consumes nothing when the selector is empty (a block
            // item starting at `{`), which upstream rejects outright.
            if self.index == index_before {
                self.advance();
            }
            self.skip_whitespace();
        }

        // Consume closing brace
        self.eat_optional("}");
        let block_end = self.offset + self.index;

        block_value(block_start, block_end, children)
    }

    /// Peek ahead from the current position (without advancing) to decide
    /// whether the upcoming block item is a nested rule or a declaration.
    /// Mirrors the official `read_block_item` look-ahead (style.js:444-457):
    /// scan past strings/parens/brackets/escapes and return `true` when the
    /// first significant terminator is `{` (rule), `false` when it is `;`,
    /// `}`, or EOF (declaration).
    fn peek_block_item_is_rule(&self) -> bool {
        let bytes = self.source.as_bytes();
        let mut i = self.index;

        // A custom property remains a declaration when its value starts with a
        // block (`--tokens: { ... }`). Without this early classification the
        // first `{` below makes declaration-taking at-rules parse `--tokens:` as
        // a nested selector.
        if bytes.get(i..i + 2) == Some(b"--") {
            i += 2;
            while i < bytes.len() {
                match bytes[i] {
                    b'\\' if i + 1 < bytes.len() => i += 2,
                    b':' => return false,
                    b'{' | b';' | b'}' => break,
                    _ => i += 1,
                }
            }
            i = self.index;
        }

        let mut paren_depth = 0i32;
        let mut bracket_depth = 0i32;
        let mut in_string: Option<u8> = None;
        while i < bytes.len() {
            let b = bytes[i];
            // CSS escape: `\<x>` — skip both bytes verbatim, no semantic effect.
            if b == b'\\' && i + 1 < bytes.len() {
                i += 2;
                continue;
            }
            if let Some(q) = in_string {
                if b == q {
                    in_string = None;
                }
                i += 1;
                continue;
            }
            if b == b'"' || b == b'\'' {
                in_string = Some(b);
                i += 1;
                continue;
            }
            // CSS block comments don't appear inside parens for declarations,
            // but skip them defensively to avoid false-positives.
            if b == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'*' {
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                if i + 1 < bytes.len() {
                    i += 2;
                }
                continue;
            }
            match b {
                b'(' => paren_depth += 1,
                b')' => paren_depth -= 1,
                b'[' => bracket_depth += 1,
                b']' => bracket_depth -= 1,
                b'{' if paren_depth == 0 && bracket_depth == 0 => return true,
                b';' | b'}' if paren_depth == 0 && bracket_depth == 0 => return false,
                _ => {}
            }
            i += 1;
        }
        false
    }

    fn parse_rule(&mut self) -> Option<Value> {
        let start = self.offset + self.index;

        // Parse selector
        let selector_start = self.index;
        self.skip_until_block_start();
        let selector_end = self.index;
        let selector_text = &self.source[selector_start..selector_end];

        if selector_text.trim_ws().is_empty() {
            // An empty selector at a block start (e.g. `{}`) mirrors the official
            // `read_selector` → `read_identifier` path, which raises
            // `css_expected_identifier` at the block-start position.
            if !self.is_eof() {
                let pos = self.offset + self.index;
                record_first_error(
                    &self.error,
                    crate::error::ParseError::svelte(
                        "css_expected_identifier",
                        "Expected a valid CSS identifier",
                        (pos, pos),
                    ),
                );
            }
            return None;
        }

        // Calculate the actual start position (skipping leading whitespace)
        let leading_ws = selector_text.len() - selector_text.trim_start_ws().len();
        let adjusted_start = self.offset + selector_start + leading_ws;

        let prelude = self.parse_selector_list(selector_text, adjusted_start);

        // Parse block
        if !self.eat_optional("{") {
            return None;
        }

        let block = self.parse_block();

        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert("type".to_string(), Value::String("Rule".to_string()));
        obj.insert("prelude".to_string(), prelude);
        obj.insert("block".to_string(), block);
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Some(Value::Object(obj))
    }

    fn parse_selector_list(&self, text: &str, offset: usize) -> Value {
        let start = offset;
        // Calculate end position excluding trailing whitespace, but preserve
        // whitespace that terminates a CSS hex escape sequence (e.g., `\33 `).
        let trailing_ws = Self::css_safe_trailing_ws_and_comments_len(text);
        let end = offset + text.len() - trailing_ws;

        // Split by comma for multiple selectors, but respect parentheses and comments
        let selectors: Vec<Value> = self
            .split_by_comma_respecting_parens(text, offset)
            .into_iter()
            .filter(|(s, selector_offset)| {
                if !Self::is_only_whitespace_and_comments(s) {
                    return true;
                }
                // Upstream runs `read_selector` on every comma-separated
                // segment, so an empty one reaches `read_identifier` and raises
                // there — at the index the leading whitespace and comments have
                // been consumed to.
                let pos = *selector_offset + Self::leading_ws_and_comments_len(s);
                record_first_error(
                    &self.error,
                    crate::error::ParseError::svelte(
                        "css_expected_identifier",
                        "Expected a valid CSS identifier",
                        (pos, pos),
                    ),
                );
                false
            })
            .map(|(selector, selector_offset)| {
                // Strip leading whitespace AND CSS comments to find the actual selector start
                let leading_skip = Self::leading_ws_and_comments_len(selector);
                let adjusted_offset = selector_offset + leading_skip;
                let stripped = &selector[leading_skip..];
                // Also strip trailing whitespace and comments, preserving CSS
                // escape-terminating whitespace.
                let trailing_skip = Self::css_safe_trailing_ws_and_comments_len(stripped);
                let trimmed = &stripped[..stripped.len() - trailing_skip];
                self.parse_complex_selector(trimmed, adjusted_offset)
            })
            .collect();

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("SelectorList".to_string()),
        );
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("children".to_string(), Value::Array(selectors));

        Value::Object(obj)
    }

    fn parse_complex_selector(&self, text: &str, offset: usize) -> Value {
        let start = offset;
        let end = offset + text.len();

        // Parse relative selectors with combinator handling
        let relative_selectors = self.parse_relative_selectors_with_combinators(text, offset);

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("ComplexSelector".to_string()),
        );
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("children".to_string(), Value::Array(relative_selectors));

        Value::Object(obj)
    }

    fn create_empty_relative_selector_with_combinator(
        &self,
        comb: &str,
        comb_start: usize,
        comb_end: usize,
    ) -> Value {
        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("RelativeSelector".to_string()),
        );

        let mut comb_obj = Map::new();
        comb_obj.insert("type".to_string(), Value::String("Combinator".to_string()));
        comb_obj.insert("name".to_string(), Value::String(comb.to_string()));
        comb_obj.insert(
            "start".to_string(),
            Value::Number((comb_start as i64).into()),
        );
        comb_obj.insert("end".to_string(), Value::Number((comb_end as i64).into()));
        obj.insert("combinator".to_string(), Value::Object(comb_obj));

        obj.insert("selectors".to_string(), Value::Array(Vec::new()));
        obj.insert(
            "start".to_string(),
            Value::Number((comb_start as i64).into()),
        );
        obj.insert("end".to_string(), Value::Number((comb_end as i64).into()));

        Value::Object(obj)
    }

    /// Check if text contains only whitespace and CSS comments (no actual selector content)
    fn is_only_whitespace_and_comments(text: &str) -> bool {
        Self::leading_ws_and_comments_len(text) == text.len()
    }

    /// Returns the number of leading bytes that are whitespace or CSS comments
    fn leading_ws_and_comments_len(text: &str) -> usize {
        let bytes = text.as_bytes();
        let mut i = 0;
        while i < bytes.len() {
            if bytes[i].is_ascii_whitespace() {
                i += 1;
                continue;
            }
            if !bytes[i].is_ascii()
                && let Some(ch) = text[i..].chars().next()
                && is_js_whitespace(ch)
            {
                i += ch.len_utf8();
                continue;
            }
            if i + 1 < bytes.len() && bytes[i] == b'/' && bytes[i + 1] == b'*' {
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                if i + 1 < bytes.len() {
                    i += 2;
                }
                continue;
            }
            break;
        }
        i
    }

    /// Returns the number of trailing bytes that are whitespace or CSS comments
    fn trailing_ws_and_comments_len(text: &str) -> usize {
        let bytes = text.as_bytes();
        let mut end = bytes.len();
        loop {
            while end > 0 && bytes[end - 1].is_ascii_whitespace() {
                end -= 1;
            }
            if end >= 4 && bytes[end - 2] == b'*' && bytes[end - 1] == b'/' {
                let comment_close = end;
                let mut found = false;
                let mut j = end - 3;
                loop {
                    if bytes[j] == b'/' && j + 1 < comment_close && bytes[j + 1] == b'*' {
                        end = j;
                        found = true;
                        break;
                    }
                    if j == 0 {
                        break;
                    }
                    j -= 1;
                }
                if found {
                    continue;
                }
            }
            break;
        }
        bytes.len() - end
    }

    /// Check if text ends with an unterminated CSS hex escape sequence.
    /// In CSS, `\HH` (1-5 hex digits) can be terminated by a whitespace character
    /// that is consumed as part of the escape. If the text ends with such hex
    /// digits (fewer than 6) without a whitespace terminator, the next whitespace
    /// character in the source is the escape terminator and should be preserved
    /// in position calculations.
    fn ends_with_css_hex_escape(text: &str) -> bool {
        let bytes = text.as_bytes();
        let len = bytes.len();
        if len < 2 {
            return false;
        }

        let mut i = 0;
        while i < len {
            if bytes[i] == b'\\' && i + 1 < len {
                i += 1; // skip backslash
                if bytes[i].is_ascii_hexdigit() {
                    // Hex escape: consume up to 6 hex digits
                    let mut hex_count = 0;
                    while i < len && hex_count < 6 && bytes[i].is_ascii_hexdigit() {
                        i += 1;
                        hex_count += 1;
                    }
                    // If we've reached the end of the string, the escape is unterminated
                    if i == len {
                        return true;
                    }
                    // Consume optional single whitespace terminator
                    if bytes[i] == b' ' || bytes[i] == b'\t' || bytes[i] == b'\n' {
                        i += 1;
                    }
                } else {
                    // Single-char escape (e.g., \. or \@) - skip the escaped char
                    i += 1;
                }
            } else {
                i += 1;
            }
        }
        false
    }

    /// Returns the number of trailing bytes that are whitespace or CSS comments,
    /// but preserves one whitespace character if it serves as a CSS hex escape
    /// terminator. This ensures positions in the AST correctly include escape-
    /// terminating whitespace.
    fn css_safe_trailing_ws_and_comments_len(text: &str) -> usize {
        let raw_trailing = Self::trailing_ws_and_comments_len(text);
        if raw_trailing == 0 {
            return 0;
        }
        let trimmed = &text[..text.len() - raw_trailing];
        if Self::ends_with_css_hex_escape(trimmed) {
            // The first whitespace character after the hex escape is the terminator;
            // preserve it by reducing the amount we trim by 1.
            raw_trailing.saturating_sub(1)
        } else {
            raw_trailing
        }
    }

    fn parse_relative_selectors_with_combinators(
        &self,
        text: &str,
        base_offset: usize,
    ) -> Vec<Value> {
        let mut result = Vec::new();
        let mut current_start = 0;
        let mut i = 0;
        let bytes = text.as_bytes();
        let mut last_combinator: Option<(&'static str, usize, usize)> = None;

        while i < bytes.len() {
            let c = bytes[i];

            // Leading and trailing comments were stripped before this scan, so one
            // reached here starts a compound — where upstream reads an identifier.
            if c == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'*' {
                record_selector_comment_error(&self.error, base_offset + i);
                i += 2; // skip /*
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                if i + 1 < bytes.len() {
                    i += 2; // skip */
                }
                continue;
            }

            // Skip content in parentheses
            if c == b'(' {
                let mut depth = 1;
                i += 1;
                while i < bytes.len() && depth > 0 {
                    // Handle escaped characters
                    if bytes[i] == b'\\' && i + 1 < bytes.len() {
                        i += 2; // Skip backslash and next char
                        continue;
                    }
                    if bytes[i] == b'(' {
                        depth += 1;
                    } else if bytes[i] == b')' {
                        depth -= 1;
                    }
                    i += 1;
                }
                continue;
            }

            // Skip content in brackets
            if c == b'[' {
                let mut depth = 1;
                i += 1;
                while i < bytes.len() && depth > 0 {
                    // Handle escaped characters
                    if bytes[i] == b'\\' && i + 1 < bytes.len() {
                        i += 2; // Skip backslash and next char
                        continue;
                    }
                    if bytes[i] == b'[' {
                        depth += 1;
                    } else if bytes[i] == b']' {
                        depth -= 1;
                    }
                    i += 1;
                }
                continue;
            }

            // Handle CSS escape sequences: \XX (backslash followed by hex or any char)
            // Skip over escape sequences so we don't misinterpret their terminating
            // whitespace as a descendant combinator.
            // E.g., `.a\1f642 b` is a SINGLE class selector `.a🙂b`, not `.a🙂` descendant `b`.
            if c == b'\\' && i + 1 < bytes.len() {
                i += 1; // skip backslash
                if bytes[i].is_ascii_hexdigit() {
                    // Consume up to 6 hex digits
                    let mut hex_count = 0;
                    while i < bytes.len() && hex_count < 6 && bytes[i].is_ascii_hexdigit() {
                        i += 1;
                        hex_count += 1;
                    }
                    // Consume optional single whitespace terminator
                    // This whitespace is part of the escape, NOT a combinator
                    if i < bytes.len() && bytes[i].is_ascii_whitespace() {
                        i += 1;
                    }
                } else {
                    // \c - escape of a single character
                    i += 1;
                }
                continue;
            }

            // Check for combinators (+, >, ~)
            if let Some(comb_name) = combinator_at(bytes, i) {
                let selector_text = text[current_start..i].trim_ws();
                if !selector_text.is_empty() {
                    let selector_offset = base_offset + current_start;
                    let rel_selector = self.create_relative_selector(
                        selector_text,
                        selector_offset,
                        last_combinator,
                    );
                    result.push(rel_selector);
                }

                let combinator_start = base_offset + i;
                let combinator_end = combinator_start + comb_name.len();
                last_combinator = Some((comb_name, combinator_start, combinator_end));

                i += comb_name.len();
                // Skip whitespace after combinator
                while i < bytes.len() && bytes[i].is_ascii_whitespace() {
                    i += 1;
                }
                current_start = i;
                continue;
            }

            // Check for descendant combinator (whitespace between selectors)
            if c.is_ascii_whitespace() {
                // Look ahead to see if this is followed by a selector (not a combinator)
                let mut j = i + 1;
                while j < bytes.len() && bytes[j].is_ascii_whitespace() {
                    j += 1;
                }
                // Also skip comments in look-ahead
                while j + 1 < bytes.len() && bytes[j] == b'/' && bytes[j + 1] == b'*' {
                    record_selector_comment_error(&self.error, base_offset + j);
                    j += 2; // skip /*
                    while j + 1 < bytes.len() && !(bytes[j] == b'*' && bytes[j + 1] == b'/') {
                        j += 1;
                    }
                    if j + 1 < bytes.len() {
                        j += 2; // skip */
                    }
                    // Skip whitespace after comment
                    while j < bytes.len() && bytes[j].is_ascii_whitespace() {
                        j += 1;
                    }
                }
                if j < bytes.len() && !matches!(bytes[j], b'+' | b'>' | b'~' | b'|' | b')' | b']') {
                    // Check if next is a selector start
                    if bytes[j].is_ascii_alphabetic()
                        || bytes[j] == b':'
                        || bytes[j] == b'.'
                        || bytes[j] == b'#'
                        || bytes[j] == b'['
                        || bytes[j] == b'*'
                        || bytes[j] == b'&'
                    {
                        // This is a descendant combinator (space)
                        let selector_text = text[current_start..i].trim_ws();
                        // Only treat as descendant if there's actual selector content before the whitespace
                        // (not just whitespace and comments)
                        if !selector_text.is_empty()
                            && !Self::is_only_whitespace_and_comments(selector_text)
                        {
                            let selector_offset = base_offset + current_start;
                            let rel_selector = self.create_relative_selector(
                                selector_text,
                                selector_offset,
                                last_combinator,
                            );
                            result.push(rel_selector);

                            // Set up space combinator for next selector
                            let combinator_start = base_offset + i;
                            let combinator_end = combinator_start + 1;
                            last_combinator = Some((" ", combinator_start, combinator_end));

                            // Skip whitespace and continue from next selector
                            i = j;
                            current_start = i;
                            continue;
                        }
                    }
                }
            }

            i += 1;
        }

        // Add the last selector
        if current_start < text.len() {
            let selector_text = &text[current_start..];
            if !selector_text.trim_ws().is_empty() {
                // Calculate offset skipping leading whitespace
                let leading_ws = selector_text.len() - selector_text.trim_start_ws().len();
                let selector_offset = base_offset + current_start + leading_ws;
                let rel_selector =
                    self.create_relative_selector(selector_text, selector_offset, last_combinator);
                result.push(rel_selector);
            } else if let Some((comb, comb_start, comb_end)) = last_combinator {
                // Trailing combinator with no selector after it - create empty RelativeSelector
                // This allows CSS validation to detect invalid selectors like "p > "
                let rel_selector =
                    self.create_empty_relative_selector_with_combinator(comb, comb_start, comb_end);
                result.push(rel_selector);
            }
        } else if let Some((comb, comb_start, comb_end)) = last_combinator {
            // Trailing combinator with no selector after it
            let rel_selector =
                self.create_empty_relative_selector_with_combinator(comb, comb_start, comb_end);
            result.push(rel_selector);
        }

        // If no selectors were found, create one for the whole text
        if result.is_empty() && !text.trim_ws().is_empty() {
            // Calculate offset skipping leading whitespace
            let leading_ws = text.len() - text.trim_start_ws().len();
            let adjusted_offset = base_offset + leading_ws;
            let rel_selector = self.create_relative_selector(text, adjusted_offset, None);
            result.push(rel_selector);
        }

        result
    }

    fn create_relative_selector(
        &self,
        text: &str,
        offset: usize,
        combinator: Option<(&'static str, usize, usize)>,
    ) -> Value {
        let start = if let Some((_, comb_start, _)) = combinator {
            comb_start
        } else {
            offset
        };
        let end = offset + text.len();

        let selectors = self.parse_simple_selectors(text, offset);

        let combinator_value = if let Some((c, comb_start, comb_end)) = combinator {
            let mut comb_obj = Map::new();
            comb_obj.insert("type".to_string(), Value::String("Combinator".to_string()));
            comb_obj.insert("name".to_string(), Value::String(c.to_string()));
            comb_obj.insert(
                "start".to_string(),
                Value::Number((comb_start as i64).into()),
            );
            comb_obj.insert("end".to_string(), Value::Number((comb_end as i64).into()));
            Value::Object(comb_obj)
        } else {
            Value::Null
        };

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("RelativeSelector".to_string()),
        );
        obj.insert("combinator".to_string(), combinator_value);
        obj.insert("selectors".to_string(), Value::Array(selectors));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Value::Object(obj)
    }

    fn parse_simple_selectors(&self, text: &str, offset: usize) -> Vec<Value> {
        let mut selectors = Vec::new();

        // Don't trim the text - we need to preserve Unicode escape sequence terminators
        // which may be whitespace characters
        if text.trim_ws().is_empty() {
            return selectors;
        }

        let mut parser = SelectorParser::new(text, offset);
        parser.parse_selectors(&mut selectors);
        if let Some(err) = parser.error.take() {
            record_first_error(&self.error, err);
        }
        selectors
    }

    fn split_by_comma_respecting_parens<'b>(
        &self,
        text: &'b str,
        base_offset: usize,
    ) -> Vec<(&'b str, usize)> {
        let mut result = Vec::new();
        let mut depth = 0; // `(` … `)` nesting (`:is(.a, .b)` etc.)
        let mut bracket_depth = 0; // `[` … `]` nesting (attribute selectors)
        let mut last_start = 0;
        let mut in_comment = false;
        let mut string_char: Option<u8> = None; // open quote of the current string

        let bytes = text.as_bytes();
        let mut i = 0;
        while i < bytes.len() {
            // Handle escaped characters (also handles `\"` inside a string).
            if bytes[i] == b'\\' && i + 1 < bytes.len() {
                i += 2; // Skip backslash and next char
                continue;
            }

            // Inside a string only the matching close-quote ends it — commas,
            // brackets and `/*` are literal content (e.g. `[x=",("]`).
            if let Some(quote) = string_char {
                if bytes[i] == quote {
                    string_char = None;
                }
                i += 1;
                continue;
            }

            // Handle comments
            if i + 1 < bytes.len() && bytes[i] == b'/' && bytes[i + 1] == b'*' {
                in_comment = true;
                i += 2;
                continue;
            }
            if in_comment && i + 1 < bytes.len() && bytes[i] == b'*' && bytes[i + 1] == b'/' {
                in_comment = false;
                i += 2;
                continue;
            }
            if in_comment {
                i += 1;
                continue;
            }

            match bytes[i] {
                b'"' | b'\'' => string_char = Some(bytes[i]),
                b'(' => depth += 1,
                b')' => depth -= 1,
                b'[' => bracket_depth += 1,
                b']' => bracket_depth -= 1,
                b',' if depth == 0 && bracket_depth == 0 => {
                    let selector = &text[last_start..i];
                    result.push((selector, base_offset + last_start));
                    last_start = i + 1;
                }
                _ => {}
            }
            i += 1;
        }

        // Add the last selector
        if last_start < text.len() {
            let selector = &text[last_start..];
            result.push((selector, base_offset + last_start));
        }

        result
    }

    /// Parse a `{ … }` body one level deeper. Nested rules and at-rules recurse
    /// through here, so this is where CSS nesting is bounded: past the limit the
    /// body is skipped rather than descended into, and the error is recorded for
    /// `parse_css_strict` to report.
    fn with_block_depth(
        &mut self,
        block_start: usize,
        parse: impl FnOnce(&mut Self) -> Value,
    ) -> Value {
        if self.depth >= MAX_NESTING_DEPTH {
            record_first_error(
                &self.error,
                crate::error::ParseError::svelte(
                    "css_nesting_too_deep",
                    format!("CSS is nested more than {MAX_NESTING_DEPTH} levels deep"),
                    (block_start, block_start + 1),
                ),
            );
            self.skip_until_block_end();
            return block_value(block_start, self.offset + self.index, Vec::new());
        }

        self.depth += 1;
        let block = parse(self);
        self.depth -= 1;
        block
    }

    fn parse_block(&mut self) -> Value {
        let start = self.offset + self.index - 1; // -1 to include the '{'
        self.with_block_depth(start, |parser| parser.parse_block_inner(start))
    }

    fn parse_block_inner(&mut self, start: usize) -> Value {
        let mut declarations = Vec::new();

        self.skip_whitespace();

        while !self.is_eof() && self.current_char() != '}' {
            // Skip comments
            if self.match_str("/*") {
                self.skip_block_comment();
                self.skip_whitespace();
                continue;
            }

            // Handle nested at-rules (like @media, @supports, etc.) using the same
            // parsing as top-level at-rules so the block children (declarations and
            // nested rules) are fully populated. Mirrors the official parser, where
            // `read_block_item` recurses into at-rules regardless of nesting depth.
            if self.current_char() == '@' {
                if let Some(at_rule) = self.parse_atrule() {
                    declarations.push(at_rule);
                }
                self.skip_whitespace();
                continue;
            }

            // Check if this looks like a nested rule (selector followed by {)
            // using the same value scan as upstream's `read_block_item`.
            if self.peek_block_item_is_rule() {
                let index_before = self.index;
                if let Some(rule) = self.parse_rule() {
                    declarations.push(rule);
                } else if self.index == index_before {
                    // Empty selector (`{` at a block-item position): `parse_rule`
                    // records the error and consumes nothing.
                    self.advance();
                }
                self.skip_whitespace();
                continue;
            }

            if let Some(decl) = self.parse_declaration() {
                declarations.push(decl);
            } else {
                // If declaration parsing failed, skip to next ; or } to avoid infinite loop
                while !self.is_eof() && self.current_char() != ';' && self.current_char() != '}' {
                    self.advance();
                }
                self.eat_optional(";");
            }
            self.skip_whitespace();
        }

        self.eat_optional("}");
        let end = self.offset + self.index;

        block_value(start, end, declarations)
    }

    /// Consume the remainder of the block whose `{` was already eaten, without
    /// recursing into it.
    fn skip_until_block_end(&mut self) {
        let mut brace_depth = 1;
        let mut in_string = false;
        let mut string_char = '\0';

        while !self.is_eof() {
            let c = self.current_char();

            if c == '\\' {
                self.advance();
                if !self.is_eof() {
                    self.advance();
                }
                continue;
            }

            if in_string {
                if c == string_char {
                    in_string = false;
                }
                self.advance();
                continue;
            }

            if c == '"' || c == '\'' {
                in_string = true;
                string_char = c;
                self.advance();
                continue;
            }

            if self.match_str("/*") {
                self.skip_block_comment();
                continue;
            }

            if c == '{' {
                brace_depth += 1;
            } else if c == '}' {
                brace_depth -= 1;
                if brace_depth == 0 {
                    self.advance();
                    return;
                }
            }
            self.advance();
        }
    }

    fn parse_declaration(&mut self) -> Option<Value> {
        self.skip_whitespace();
        let start = self.offset + self.index;
        let property_start = self.index;

        // Upstream's `read_declaration` reads the property only up to the first
        // whitespace or `:`. This matters for invalid SCSS `//` comments: the
        // first word becomes the property and the rest of the comment becomes
        // the value, so semicolons and quotes in prose determine where the next
        // block item starts.
        while !self.is_eof() {
            let c = self.current_char();
            if is_js_whitespace(c) || c == ':' {
                break;
            }
            self.advance();
        }
        let property = self.source[property_start..self.index].to_string();

        self.skip_whitespace();
        self.eat_optional(":");
        let empty_declaration_end = self.offset + self.index;
        self.skip_whitespace();

        // Read value, respecting parentheses, strings, and CSS escape sequences so
        // values like `content: "{};[]";` or `content: ';'` aren't terminated by
        // a `;`/`}` that lives inside a string literal or after a backslash escape.
        // A custom property's `<declaration-value>` additionally admits balanced
        // square- and curly-bracket blocks. The outer rule's `}` only terminates
        // the value after those blocks close.
        let is_custom_property = property.starts_with("--");
        let value_start = self.index;
        let mut paren_depth = 0;
        let mut bracket_depth = 0;
        let mut brace_depth = 0;
        let mut in_string: Option<char> = None;
        while !self.is_eof() {
            let c = self.current_char();
            // CSS escape: `\<x>` — consume both bytes verbatim.
            if c == '\\' {
                self.advance();
                if !self.is_eof() {
                    self.advance();
                }
                continue;
            }
            if let Some(quote) = in_string {
                if c == quote {
                    in_string = None;
                }
                self.advance();
                continue;
            }
            if c == '"' || c == '\'' {
                in_string = Some(c);
                self.advance();
                continue;
            }

            if is_custom_property && self.match_str("/*") {
                self.skip_block_comment();
                continue;
            }

            match c {
                '(' => paren_depth += 1,
                ')' => paren_depth -= 1,
                '[' if is_custom_property => bracket_depth += 1,
                ']' if is_custom_property && bracket_depth > 0 => bracket_depth -= 1,
                '{' if is_custom_property => brace_depth += 1,
                '}' if is_custom_property && brace_depth > 0 => brace_depth -= 1,
                '}' if paren_depth == 0
                    && (!is_custom_property || (bracket_depth == 0 && brace_depth == 0)) =>
                {
                    break;
                }
                ';' if paren_depth == 0
                    && (!is_custom_property || (bracket_depth == 0 && brace_depth == 0)) =>
                {
                    break;
                }
                _ => {}
            }
            self.advance();
        }
        let value = self.source[value_start..self.index].trim_ws().to_string();

        if value.is_empty() && !property.starts_with("--") {
            record_first_error(
                &self.error,
                crate::error::ParseError::svelte(
                    "css_empty_declaration",
                    "Declaration cannot be empty",
                    (start, empty_declaration_end),
                ),
            );
        }

        // End position is before the semicolon
        let end = self.offset + self.index;
        self.eat_optional(";");

        let mut obj = Map::new();
        obj.insert("type".to_string(), Value::String("Declaration".to_string()));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("property".to_string(), Value::String(property));
        obj.insert("value".to_string(), Value::String(value));

        Some(Value::Object(obj))
    }

    fn skip_until_block_start(&mut self) {
        let mut paren_depth = 0;
        let mut bracket_depth = 0;
        let mut in_string = false;
        let mut string_char = '\0';

        while !self.is_eof() {
            let c = self.current_char();

            // Handle escape sequences (both inside and outside strings)
            // CSS allows escapes like .abc\) or \31 23
            if c == '\\' {
                self.advance();
                if !self.is_eof() {
                    self.advance();
                }
                continue;
            }

            // Handle string boundaries
            if (c == '"' || c == '\'') && !in_string {
                in_string = true;
                string_char = c;
                self.advance();
                continue;
            }

            if in_string && c == string_char {
                in_string = false;
                string_char = '\0';
                self.advance();
                continue;
            }

            // Skip content inside strings
            if in_string {
                self.advance();
                continue;
            }

            // Track nesting
            if c == '(' {
                paren_depth += 1;
            } else if c == ')' {
                paren_depth -= 1;
            } else if c == '[' {
                bracket_depth += 1;
            } else if c == ']' {
                bracket_depth -= 1;
            } else if paren_depth == 0 && bracket_depth == 0 && c == '{' {
                break;
            }
            self.advance();
        }
    }

    fn skip_block_comment(&mut self) {
        self.advance_by(2); // consume '/*'
        while !self.is_eof() && !self.match_str("*/") {
            self.advance();
        }
        self.advance_by(2); // consume '*/'
    }

    fn skip_html_comment(&mut self) {
        self.advance_by(4); // consume '<!--'
        while !self.is_eof() && !self.match_str("-->") {
            self.advance();
        }
        self.advance_by(3); // consume '-->'
    }

    fn is_eof(&self) -> bool {
        self.index >= self.source.len()
    }

    fn current_char(&self) -> char {
        if self.is_eof() {
            '\0'
        } else {
            self.source[self.index..].chars().next().unwrap_or('\0')
        }
    }

    fn advance(&mut self) {
        if !self.is_eof() {
            let c = self.current_char();
            self.index += c.len_utf8();
        }
    }

    fn advance_by(&mut self, n: usize) {
        self.index = (self.index + n).min(self.source.len());
    }

    fn match_str(&self, s: &str) -> bool {
        self.source[self.index..].starts_with(s)
    }

    fn eat(&mut self, s: &str) -> bool {
        if self.match_str(s) {
            self.advance_by(s.len());
            true
        } else {
            false
        }
    }

    /// Alias for eat() to match the naming in Parser.
    /// In CssParser, all eat() calls are optional (no error throwing).
    #[inline]
    fn eat_optional(&mut self, s: &str) -> bool {
        self.eat(s)
    }

    fn skip_whitespace(&mut self) {
        while !self.is_eof() && is_js_whitespace(self.current_char()) {
            self.advance();
        }
    }

    /// Read a CSS identifier, decoding CSS escape sequences.
    fn read_identifier(&mut self) -> String {
        read_css_identifier(self.source, &mut self.index)
    }
}

/// Read a CSS identifier starting at `*index` in `source`, decoding escape
/// sequences exactly the way the official `read_identifier` does.
///
/// The AST stores the *decoded* name — `\31 23` is the identifier `123` — and
/// the printer re-escapes it on the way out (`escape_identifier`). Returning the
/// raw source slice instead would double-escape every name that contains an
/// escape sequence.
///
/// Two cases, mirroring upstream's `REGEX_UNICODE_SEQUENCE`:
/// - `\` + 1-6 hex digits + an optional `\r\n` or single whitespace character
///   decodes to that code point. A decoded backslash is re-emitted as `\\` so
///   that the name still says "one literal backslash" rather than starting a
///   fresh escape.
/// - `\` + any other single character is kept verbatim (`\.` stays `\.`).
fn read_css_identifier(source: &str, index: &mut usize) -> String {
    let mut identifier = String::new();

    while *index < source.len() {
        let rest = &source[*index..];
        let Some(c) = rest.chars().next() else { break };

        if c == '\\' {
            let after = &rest[1..];
            // Hex digits are ASCII, so the char count is also the byte length.
            let hex_len = after
                .chars()
                .take(6)
                .take_while(char::is_ascii_hexdigit)
                .count();

            if hex_len > 0 {
                let code = u32::from_str_radix(&after[..hex_len], 16).unwrap_or(0);
                let mut consumed = 1 + hex_len;

                // One optional whitespace terminator, with `\r\n` counting as one.
                let tail = &after[hex_len..];
                if tail.starts_with("\r\n") {
                    consumed += 2;
                } else if let Some(w) = tail.chars().next()
                    && w.is_whitespace()
                {
                    consumed += w.len_utf8();
                }

                match char::from_u32(code) {
                    Some('\\') => identifier.push_str("\\\\"),
                    Some(ch) => identifier.push(ch),
                    // Surrogates and out-of-range code points are not characters;
                    // CSS replaces them with U+FFFD.
                    None => identifier.push('\u{FFFD}'),
                }

                *index += consumed;
                continue;
            }

            match after.chars().next() {
                Some(n) => {
                    identifier.push('\\');
                    identifier.push(n);
                    *index += 1 + n.len_utf8();
                }
                None => {
                    // Trailing backslash at EOF — keep it; the printer escapes it.
                    identifier.push('\\');
                    *index += 1;
                }
            }
            continue;
        }

        // Upstream's valid-character set: `[a-zA-Z0-9_-]` plus every code point
        // >= 160 (CSS treats those as identifier characters, e.g. `×`).
        if (c as u32) >= 160 || c.is_ascii_alphanumeric() || c == '_' || c == '-' {
            identifier.push(c);
            *index += c.len_utf8();
        } else {
            break;
        }
    }

    identifier
}

// ============================================================================
// Selector Parser
// ============================================================================

/// Parser for CSS selectors
struct SelectorParser<'a> {
    source: &'a str,
    offset: usize,
    index: usize,
    /// First parse error encountered while reading selector tokens. Mirrors the
    /// "throw on first invalid identifier" behaviour of the official Svelte
    /// CSS parser without adding a `Result` return type to every helper.
    /// `Cell` so the `&self` helpers that spawn sub-parsers for pseudo-class
    /// arguments can hand the sub-parser's error back up.
    error: std::cell::Cell<Option<crate::error::ParseError>>,
    /// Depth of enclosing pseudo-class argument lists (`:is(:is(…))`), bounded
    /// by `MAX_NESTING_DEPTH`. Carried across sub-parsers because the
    /// recursion runs through freshly constructed `SelectorParser`s.
    depth: u32,
}

impl<'a> SelectorParser<'a> {
    fn new(source: &'a str, offset: usize) -> Self {
        Self {
            source,
            offset,
            index: 0,
            error: std::cell::Cell::new(None),
            depth: 0,
        }
    }

    /// A sub-parser for the arguments of a pseudo-class inside this selector.
    /// See [`Self::absorb_nesting_error`] for how its errors are handled.
    fn nested(&self, source: &'a str, offset: usize) -> Self {
        Self {
            source,
            offset,
            index: 0,
            error: std::cell::Cell::new(None),
            depth: self.depth + 1,
        }
    }

    /// Take over a sub-parser's error. Upstream parses pseudo-class arguments
    /// with the same recursive `read_selector`, so a token that cannot start a
    /// selector is rejected inside `:global(…)` exactly as it is outside.
    fn absorb_nesting_error(&self, sub: &Self) {
        let Some(err) = sub.error.take() else {
            return;
        };
        record_first_error(&self.error, err);
    }

    fn parse_selectors(&mut self, selectors: &mut Vec<Value>) {
        while !self.is_eof() {
            self.skip_whitespace();
            if self.is_eof() {
                break;
            }

            // Skip comments
            if self.match_str("/*") {
                self.skip_block_comment();
                continue;
            }

            let c = self.current_char();

            if c == ':' {
                // Pseudo-element (::) or pseudo-class (:)
                if self.peek_next_char() == ':' {
                    // Pseudo-element selector
                    if let Some(selector) = self.parse_pseudo_element_selector() {
                        selectors.push(selector);
                    }
                } else {
                    // Pseudo-class selector
                    if let Some(selector) = self.parse_pseudo_class_selector() {
                        selectors.push(selector);
                    }
                }
            } else if c == '.' {
                // Class selector
                if let Some(selector) = self.parse_class_selector() {
                    selectors.push(selector);
                }
            } else if c == '#' {
                // ID selector
                if let Some(selector) = self.parse_id_selector() {
                    selectors.push(selector);
                }
            } else if c == '[' {
                // Attribute selector
                match self.parse_attribute_selector() {
                    Some(selector) => selectors.push(selector),
                    // The error is already recorded; upstream throws here, so
                    // nothing after it is part of the selector.
                    None => break,
                }
            } else if c == '*' {
                // Universal selector
                let start = self.offset + self.index;
                self.advance();
                // `*|el` / `*|*` — `*` is the namespace and is kept, so the
                // printer can put it back and the scoping pass can tell a bare
                // `*` (which it rewrites in place) from a namespaced one.
                let mut name = "*".to_string();
                let mut namespace: Option<String> = None;
                if self.current_char() == '|' {
                    self.advance();
                    namespace = Some(name);
                    if self.current_char() == '*' {
                        self.advance();
                        name = "*".to_string();
                    } else {
                        match self.read_namespaced_local_name() {
                            Some(local) => name = local,
                            None => break,
                        }
                    }
                }
                let end = self.offset + self.index;

                let mut obj = Map::new();
                obj.insert(
                    "type".to_string(),
                    Value::String("TypeSelector".to_string()),
                );
                obj.insert("name".to_string(), Value::String(name));
                if let Some(ns) = namespace {
                    obj.insert("namespace".to_string(), Value::String(ns));
                }
                obj.insert("start".to_string(), Value::Number((start as i64).into()));
                obj.insert("end".to_string(), Value::Number((end as i64).into()));
                selectors.push(Value::Object(obj));
            } else if c == '&' {
                // Nesting selector
                let start = self.offset + self.index;
                self.advance();
                let end = self.offset + self.index;

                let mut obj = Map::new();
                obj.insert(
                    "type".to_string(),
                    Value::String("NestingSelector".to_string()),
                );
                obj.insert("name".to_string(), Value::String("&".to_string()));
                obj.insert("start".to_string(), Value::Number((start as i64).into()));
                obj.insert("end".to_string(), Value::Number((end as i64).into()));
                selectors.push(Value::Object(obj));
            } else if c.is_alphabetic()
                || (c == '-' && !self.peek_next_char().is_ascii_digit())
                || c == '_'
                || c == '\\'
                || (c as u32) >= 160
            {
                // Type selector (element name) - mirrors the official
                // `read_identifier` valid character set: ASCII letters/digits,
                // `-`, `_`, code points >= 160, and `\`-escapes.
                if let Some(selector) = self.parse_type_selector() {
                    selectors.push(selector);
                } else {
                    // An empty identifier here would leave `self.index`
                    // unchanged and spin the loop; mirror the official
                    // `read_identifier` empty-identifier error and stop.
                    let pos = self.offset + self.index;
                    record_first_error(
                        &self.error,
                        crate::error::ParseError::svelte(
                            "css_expected_identifier",
                            "Expected a valid CSS identifier",
                            (pos, pos),
                        ),
                    );
                    break;
                }
            } else if c.is_ascii_digit() || (c == '.' && self.peek_next_char().is_ascii_digit()) {
                // Percentage selector (used inside @keyframes blocks): `0%`, `33.3%`, `.5%`.
                // Mirrors official `read_selector` which matches REGEX_PERCENTAGE
                // (style.js:302-308) and emits a `Percentage` selector node.
                if let Some(selector) = self.parse_percentage_selector() {
                    selectors.push(selector);
                } else {
                    // Not a valid percentage — fall through to the identifier error.
                    let pos = self.offset + self.index;
                    record_first_error(
                        &self.error,
                        crate::error::ParseError::svelte(
                            "css_expected_identifier",
                            "Expected a valid CSS identifier",
                            (pos, pos),
                        ),
                    );
                    break;
                }
            } else {
                // Mirror the official Svelte CSS parser: when `read_selector`
                // falls through to `read_identifier` and the first character
                // is not a valid identifier-start, `read_identifier` returns
                // an empty string and raises `css_expected_identifier`.
                let pos = self.offset + self.index;
                record_first_error(
                    &self.error,
                    crate::error::ParseError::svelte(
                        "css_expected_identifier",
                        "Expected a valid CSS identifier",
                        (pos, pos),
                    ),
                );
                // Stop parsing further selectors once we've recorded an error;
                // the surrounding parser will surface it.
                break;
            }
        }
    }

    /// Parse a CSS percentage selector like `0%`, `33.3%`, or `100%`.
    /// Used inside `@keyframes` blocks where keyframe selectors are percentages
    /// (or `from`/`to`, which are handled by the identifier branch).
    /// Returns None if the current position doesn't actually start a percentage
    /// literal (i.e. no digits/`.` followed by `%`).
    fn parse_percentage_selector(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        let value_start = self.index;
        // Optional digits before decimal point
        while !self.is_eof() && self.current_char().is_ascii_digit() {
            self.advance();
        }
        // Optional `.` followed by digits
        if !self.is_eof() && self.current_char() == '.' {
            self.advance();
            while !self.is_eof() && self.current_char().is_ascii_digit() {
                self.advance();
            }
        }
        // Required `%` terminator
        if self.is_eof() || self.current_char() != '%' {
            // Rewind so the error-fallback in the caller can report at the
            // original position.
            self.index = value_start;
            return None;
        }
        self.advance();
        let end = self.offset + self.index;
        let value = self.source[value_start..self.index].to_string();

        let mut obj = Map::new();
        obj.insert("type".to_string(), Value::String("Percentage".to_string()));
        obj.insert("value".to_string(), Value::String(value));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        Some(Value::Object(obj))
    }

    fn parse_pseudo_element_selector(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        self.advance(); // consume first ':'
        self.advance(); // consume second ':'

        let name = self.read_identifier();

        let args = if self.current_char() == '(' {
            let args_start = self.offset + self.index + 1;
            self.advance(); // consume '('
            let content_start = self.index;
            let mut depth = 1;
            while !self.is_eof() && depth > 0 {
                let c = self.current_char();
                // CSS escape sequence — skip backslash + next char so `\)` doesn't
                // close the args early.
                if c == '\\' {
                    self.advance();
                    if !self.is_eof() {
                        self.advance();
                    }
                    continue;
                }
                if c == '(' {
                    depth += 1;
                } else if c == ')' {
                    depth -= 1;
                    if depth == 0 {
                        break;
                    }
                }
                self.advance();
            }
            let content_end = self.index;
            self.advance(); // consume ')'

            let content = &self.source[content_start..content_end];
            let leading = content.len() - content.trim_start_ws().len();
            let trailing = content.len() - content.trim_end_ws().len();
            Some(self.parse_args_selector_list(
                content.trim_ws(),
                args_start + leading,
                self.offset + content_end - trailing,
            ))
        } else {
            None
        };

        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("PseudoElementSelector".to_string()),
        );
        obj.insert("name".to_string(), Value::String(name));
        if let Some(args) = args {
            obj.insert("args".to_string(), args);
        }
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Some(Value::Object(obj))
    }

    fn parse_pseudo_class_selector(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        self.advance(); // consume ':'

        let name_start = self.offset + self.index;
        let name = self.read_identifier();
        if name.is_empty() {
            // Upstream delegates the name to `read_identifier`, which throws
            // at the byte immediately after `:` when there is no identifier.
            // This also matters for unprocessed indented Sass: `color: red`
            // is first read as a descendant selector, and this is its earliest
            // syntax error rather than the eventual end of the style block.
            record_first_error(
                &self.error,
                crate::error::ParseError::svelte(
                    "css_expected_identifier",
                    "Expected a valid CSS identifier",
                    (name_start, name_start),
                ),
            );
            return None;
        }
        // Check for arguments in parentheses
        let args = if self.current_char() == '(' {
            let args_start = self.offset + self.index + 1;
            self.advance(); // consume '('

            // Read content inside parentheses
            let content_start = self.index;
            let mut depth = 1;
            while !self.is_eof() && depth > 0 {
                let c = self.current_char();
                // CSS escape sequence: `\(` / `\)` etc. should not affect paren depth.
                // Skip the backslash and the next character verbatim so a selector like
                // `:global(.abc\))` keeps the literal `\)` inside the args and only
                // closes on the outer paren.
                if c == '\\' {
                    self.advance();
                    if !self.is_eof() {
                        self.advance();
                    }
                    continue;
                }
                if c == '(' {
                    depth += 1;
                } else if c == ')' {
                    depth -= 1;
                    if depth == 0 {
                        break;
                    }
                }
                self.advance();
            }
            let content_end = self.index;
            let content = &self.source[content_start..content_end];

            self.advance(); // consume ')'

            // The arguments are the only recursive part of selector parsing, so
            // this is where the nesting bound applies. The parenthesised text is
            // already consumed above, so bailing out costs only the args AST.
            if self.depth >= MAX_NESTING_DEPTH {
                record_first_error(
                    &self.error,
                    crate::error::ParseError::svelte(
                        "css_nesting_too_deep",
                        format!("CSS is nested more than {MAX_NESTING_DEPTH} levels deep"),
                        (start, start + 1),
                    ),
                );
                None
            } else {
                // Calculate trimmed content positions (strip whitespace and leading comments)
                let mut trimmed = content.trim_ws();
                let mut leading_skip = content.len() - content.trim_start_ws().len();

                // Also skip leading comments for the SelectorList start
                // And update `trimmed` to not include the leading comment
                loop {
                    if trimmed.starts_with("/*") {
                        if let Some(end_pos) = memmem::find(trimmed.as_bytes(), b"*/") {
                            leading_skip += end_pos + 2;
                            trimmed = &trimmed[end_pos + 2..];
                            let ws_skip = trimmed.len() - trimmed.trim_start_ws().len();
                            leading_skip += ws_skip;
                            trimmed = trimmed.trim_start_ws();
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }

                // Upstream ends the list at the last selector, so a comment before
                // the `)` belongs to the enclosing pseudo-class, not to the list.
                let trailing_ws = CssParser::css_safe_trailing_ws_and_comments_len(content);
                let trimmed_start = args_start + leading_skip;
                let trimmed_end = self.offset + content_end - trailing_ws;

                // Parse the content as a selector list
                Some(self.parse_args_selector_list(trimmed, trimmed_start, trimmed_end))
            }
        } else {
            None
        };

        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("PseudoClassSelector".to_string()),
        );
        obj.insert("name".to_string(), Value::String(name));
        if let Some(args_value) = args {
            obj.insert("args".to_string(), args_value);
        }
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Some(Value::Object(obj))
    }

    fn parse_args_selector_list(&self, text: &str, start: usize, end: usize) -> Value {
        // Parse selector list inside pseudo-class arguments
        // Split by comma for multiple selectors
        let children: Vec<Value> = self
            .split_selectors_by_comma(text, start)
            .into_iter()
            .map(|(selector_text, selector_offset)| {
                // Adjust offset for leading whitespace when trimming
                let leading_ws = selector_text.len() - selector_text.trim_start_ws().len();
                let adjusted_offset = selector_offset + leading_ws;
                self.parse_complex_selector_from_text(selector_text.trim_ws(), adjusted_offset)
            })
            .collect();

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("SelectorList".to_string()),
        );
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("children".to_string(), Value::Array(children));

        Value::Object(obj)
    }

    fn split_selectors_by_comma<'b>(
        &self,
        text: &'b str,
        base_offset: usize,
    ) -> Vec<(&'b str, usize)> {
        let mut result = Vec::new();
        let mut depth = 0;
        let mut last_start = 0;
        let mut in_comment = false;

        let bytes = text.as_bytes();
        let mut i = 0;
        while i < bytes.len() {
            if i + 1 < bytes.len() && bytes[i] == b'/' && bytes[i + 1] == b'*' {
                in_comment = true;
                i += 2;
                continue;
            }
            if in_comment && i + 1 < bytes.len() && bytes[i] == b'*' && bytes[i + 1] == b'/' {
                in_comment = false;
                i += 2;
                continue;
            }
            if in_comment {
                i += 1;
                continue;
            }

            let c = bytes[i] as char;
            if c == '\\' {
                // A CSS escape makes the next character literal, so `\,` never separates.
                i += 1;
                i += text[i..].chars().next().map_or(0, char::len_utf8);
                continue;
            }
            if c == '"' || c == '\'' {
                let quote = bytes[i];
                i += 1;
                while i < bytes.len() && bytes[i] != quote {
                    i += if bytes[i] == b'\\' { 2 } else { 1 };
                }
                i += 1;
                continue;
            }
            if c == '(' || c == '[' {
                depth += 1;
            } else if c == ')' || c == ']' {
                depth -= 1;
            } else if c == ',' && depth == 0 {
                let selector = &text[last_start..i];
                result.push((selector, base_offset + last_start));
                last_start = i + 1;
            }
            i += 1;
        }

        // Add the last selector
        if last_start < text.len() {
            let selector = &text[last_start..];
            result.push((selector, base_offset + last_start));
        }

        result
    }

    fn parse_complex_selector_from_text(&self, text: &str, offset: usize) -> Value {
        // Strip leading whitespace and comments
        let mut current = text;
        let mut current_offset = offset;

        loop {
            let before_len = current.len();
            // Strip leading whitespace
            let trimmed = current.trim_start_ws();
            current_offset += before_len - trimmed.len();
            current = trimmed;

            // Strip leading comment
            if current.starts_with("/*") {
                if let Some(end_pos) = memmem::find(current.as_bytes(), b"*/") {
                    current_offset += end_pos + 2;
                    current = &current[end_pos + 2..];
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        // Upstream gates the `An+B` branch on `inside_pseudo_class` alone, not on
        // the pseudo-class name, and every caller of this function is a
        // pseudo-class/-element argument list.
        if let Some(nth_len) = match_nth_of(current) {
            return self.build_nth_complex_selector(current, current_offset, nth_len);
        }

        // Strip trailing whitespace and comments
        let mut end_current = current;
        loop {
            let trimmed = end_current.trim_end_ws();
            end_current = trimmed;

            // Strip trailing comment
            if end_current.ends_with("*/") {
                if let Some(start_pos) = memchr::memmem::rfind(end_current.as_bytes(), b"/*") {
                    end_current = &end_current[..start_pos];
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        let trimmed = end_current.trim_ws();
        let start = current_offset;
        let end = start + trimmed.len();

        // Parse relative selectors (handle combinators like +, >, ~)
        let relative_selectors = self.parse_relative_selectors_from_text(trimmed, start);

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("ComplexSelector".to_string()),
        );
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("children".to_string(), Value::Array(relative_selectors));

        Value::Object(obj)
    }

    /// Build the `ComplexSelector` for an argument list that starts with an
    /// `An+B` token. `text[..nth_len]` is the `Nth` node; anything after it is
    /// the `of S` selector, which shares the `Nth`'s relative selector.
    fn build_nth_complex_selector(&self, text: &str, offset: usize, nth_len: usize) -> Value {
        let nth_end = offset + nth_len;

        let mut nth_obj = Map::new();
        nth_obj.insert("type".to_string(), Value::String("Nth".to_string()));
        nth_obj.insert(
            "value".to_string(),
            Value::String(text[..nth_len].to_string()),
        );
        nth_obj.insert("start".to_string(), Value::Number((offset as i64).into()));
        nth_obj.insert("end".to_string(), Value::Number((nth_end as i64).into()));

        let rest_raw = &text[nth_len..];
        let rest_offset = nth_end + leading_ws_len(rest_raw);
        let mut rest = rest_raw.trim_ws();
        loop {
            rest = rest.trim_end_ws();
            match rest
                .strip_suffix("*/")
                .and_then(|head| memchr::memmem::rfind(head.as_bytes(), b"/*"))
            {
                Some(pos) => rest = &rest[..pos],
                None => break,
            }
        }

        let mut children = if rest.is_empty() {
            Vec::new()
        } else {
            self.parse_relative_selectors_from_text(rest, rest_offset)
        };

        let end = if rest.is_empty() {
            nth_end
        } else {
            rest_offset + rest.len()
        };

        match children.first_mut() {
            Some(first) => {
                if let Some(o) = first.as_object_mut() {
                    o.insert("start".to_string(), Value::Number((offset as i64).into()));
                    if let Some(sels) = o.get_mut("selectors").and_then(|s| s.as_array_mut()) {
                        sels.insert(0, Value::Object(nth_obj));
                    }
                }
            }
            None => {
                let mut rel_sel = Map::new();
                rel_sel.insert(
                    "type".to_string(),
                    Value::String("RelativeSelector".to_string()),
                );
                rel_sel.insert("combinator".to_string(), Value::Null);
                rel_sel.insert(
                    "selectors".to_string(),
                    Value::Array(vec![Value::Object(nth_obj)]),
                );
                rel_sel.insert("start".to_string(), Value::Number((offset as i64).into()));
                rel_sel.insert("end".to_string(), Value::Number((end as i64).into()));
                children.push(Value::Object(rel_sel));
            }
        }

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("ComplexSelector".to_string()),
        );
        obj.insert("start".to_string(), Value::Number((offset as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("children".to_string(), Value::Array(children));

        Value::Object(obj)
    }

    fn parse_relative_selectors_from_text(&self, text: &str, base_offset: usize) -> Vec<Value> {
        let mut result = Vec::new();
        let mut current_start = 0;
        let mut i = 0;
        let bytes = text.as_bytes();
        let mut last_combinator: Option<(&'static str, usize, usize)> = None;

        while i < bytes.len() {
            let c = bytes[i];

            // Leading and trailing comments were stripped before this scan, so one
            // reached here starts a compound — where upstream reads an identifier.
            if c == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'*' {
                record_selector_comment_error(&self.error, base_offset + i);
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                if i + 1 < bytes.len() {
                    i += 2;
                }
                continue;
            }

            // Skip content in parentheses
            if c == b'(' {
                let mut depth = 1;
                i += 1;
                while i < bytes.len() && depth > 0 {
                    // Handle escaped characters
                    if bytes[i] == b'\\' && i + 1 < bytes.len() {
                        i += 2; // Skip backslash and next char
                        continue;
                    }
                    if bytes[i] == b'(' {
                        depth += 1;
                    } else if bytes[i] == b')' {
                        depth -= 1;
                    }
                    i += 1;
                }
                continue;
            }

            // An attribute selector is one simple selector however much whitespace
            // its quoted value carries, so no combinator can be found inside it.
            if c == b'[' {
                let mut depth = 1;
                let mut quote: Option<u8> = None;
                i += 1;
                while i < bytes.len() && depth > 0 {
                    let b = bytes[i];
                    if b == b'\\' && i + 1 < bytes.len() {
                        i += 2;
                        continue;
                    }
                    match quote {
                        Some(q) if b == q => quote = None,
                        Some(_) => {}
                        None if b == b'"' || b == b'\'' => quote = Some(b),
                        None if b == b'[' => depth += 1,
                        None if b == b']' => depth -= 1,
                        None => {}
                    }
                    i += 1;
                }
                continue;
            }

            // Handle CSS escape sequences in :has()/:is()/:not() argument parsing too
            if c == b'\\' && i + 1 < bytes.len() {
                i += 1;
                if bytes[i].is_ascii_hexdigit() {
                    let mut hex_count = 0;
                    while i < bytes.len() && hex_count < 6 && bytes[i].is_ascii_hexdigit() {
                        i += 1;
                        hex_count += 1;
                    }
                    if i < bytes.len() && bytes[i].is_ascii_whitespace() {
                        i += 1;
                    }
                } else {
                    i += 1;
                }
                continue;
            }

            // Check for combinators
            if let Some(comb_name) = combinator_at(bytes, i) {
                // Found a combinator
                let selector_text = text[current_start..i].trim_ws();
                if !selector_text.is_empty() {
                    let selector_offset = base_offset + current_start;
                    let rel_selector = self.create_relative_selector(
                        selector_text,
                        selector_offset,
                        last_combinator,
                    );
                    result.push(rel_selector);
                }

                let combinator_start = base_offset + i;
                let combinator_end = combinator_start + comb_name.len();
                last_combinator = Some((comb_name, combinator_start, combinator_end));

                i += comb_name.len();
                // Skip whitespace after combinator
                while i < bytes.len() && bytes[i].is_ascii_whitespace() {
                    i += 1;
                }
                current_start = i;
                continue;
            }

            // Check for descendant combinator (whitespace between selectors)
            if c.is_ascii_whitespace() {
                // Look ahead to see if this is followed by a selector (not a combinator)
                let mut j = i + 1;
                while j < bytes.len() && bytes[j].is_ascii_whitespace() {
                    j += 1;
                }
                if j < bytes.len()
                    && !matches!(bytes[j], b'+' | b'>' | b'~' | b'|' | b')')
                    && bytes[j] != b'('
                {
                    // Check if next is a selector start
                    if bytes[j].is_ascii_alphabetic()
                        || bytes[j] == b':'
                        || bytes[j] == b'.'
                        || bytes[j] == b'#'
                        || bytes[j] == b'['
                        || bytes[j] == b'*'
                        || bytes[j] == b'&'
                    {
                        // This is a descendant combinator (space)
                        let selector_text = text[current_start..i].trim_ws();
                        if !selector_text.is_empty() {
                            let selector_offset = base_offset + current_start;
                            let rel_selector = self.create_relative_selector(
                                selector_text,
                                selector_offset,
                                last_combinator,
                            );
                            result.push(rel_selector);

                            // Set up space combinator for next selector
                            let combinator_start = base_offset + i;
                            let combinator_end = combinator_start + 1;
                            last_combinator = Some((" ", combinator_start, combinator_end));

                            // Skip whitespace and continue from next selector
                            i = j;
                            current_start = i;
                            continue;
                        }
                    }
                }
            }

            i += 1;
        }

        // Add the last selector
        if current_start < text.len() {
            let selector_text = &text[current_start..];
            if !selector_text.trim_ws().is_empty() {
                // Calculate offset skipping leading whitespace
                let leading_ws = selector_text.len() - selector_text.trim_start_ws().len();
                let selector_offset = base_offset + current_start + leading_ws;
                let rel_selector =
                    self.create_relative_selector(selector_text, selector_offset, last_combinator);
                result.push(rel_selector);
            }
        }

        // Upstream reads a combinator and then requires a compound after it;
        // hitting the argument list's `)` instead is `css_selector_invalid`.
        if last_combinator.is_some() && text[current_start..].trim_ws().is_empty() {
            let pos = base_offset + text.len();
            record_first_error(
                &self.error,
                crate::error::ParseError::svelte(
                    "css_selector_invalid",
                    "Invalid selector",
                    (pos, pos),
                ),
            );
        }

        // If no selectors were found, create one for the whole text
        if result.is_empty() && !text.trim_ws().is_empty() {
            // Calculate offset skipping leading whitespace
            let leading_ws = text.len() - text.trim_start_ws().len();
            let adjusted_offset = base_offset + leading_ws;
            let rel_selector = self.create_relative_selector(text, adjusted_offset, None);
            result.push(rel_selector);
        }

        result
    }

    fn create_relative_selector(
        &self,
        text: &str,
        offset: usize,
        combinator: Option<(&'static str, usize, usize)>,
    ) -> Value {
        let start = if let Some((_, comb_start, _)) = combinator {
            comb_start
        } else {
            offset
        };
        let end = offset + text.len();

        let mut selectors = Vec::new();
        let mut parser = self.nested(text, offset);
        parser.parse_selectors(&mut selectors);
        self.absorb_nesting_error(&parser);

        let combinator_value = if let Some((c, comb_start, comb_end)) = combinator {
            let mut comb_obj = Map::new();
            comb_obj.insert("type".to_string(), Value::String("Combinator".to_string()));
            comb_obj.insert("name".to_string(), Value::String(c.to_string()));
            comb_obj.insert(
                "start".to_string(),
                Value::Number((comb_start as i64).into()),
            );
            comb_obj.insert("end".to_string(), Value::Number((comb_end as i64).into()));
            Value::Object(comb_obj)
        } else {
            Value::Null
        };

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("RelativeSelector".to_string()),
        );
        obj.insert("combinator".to_string(), combinator_value);
        obj.insert("selectors".to_string(), Value::Array(selectors));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Value::Object(obj)
    }

    fn parse_class_selector(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        self.advance(); // consume '.'

        let name = self.read_identifier();
        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("ClassSelector".to_string()),
        );
        obj.insert("name".to_string(), Value::String(name));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Some(Value::Object(obj))
    }

    fn parse_id_selector(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        self.advance(); // consume '#'

        let name = self.read_identifier();
        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert("type".to_string(), Value::String("IdSelector".to_string()));
        obj.insert("name".to_string(), Value::String(name));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Some(Value::Object(obj))
    }

    fn parse_attribute_selector(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        self.advance(); // consume '['

        // Skip whitespace
        while !self.is_eof() && is_js_whitespace(self.current_char()) {
            self.advance();
        }

        // Read attribute name (identifier)
        let name_pos = self.offset + self.index;
        let name = self.read_identifier();
        if name.is_empty() {
            // Upstream reads the name with the same `read_identifier`, which
            // rejects an empty one — there is no namespace syntax inside `[…]`.
            record_first_error(
                &self.error,
                crate::error::ParseError::svelte(
                    "css_expected_identifier",
                    "Expected a valid CSS identifier",
                    (name_pos, name_pos),
                ),
            );
            return None;
        }

        // Skip whitespace
        while !self.is_eof() && is_js_whitespace(self.current_char()) {
            self.advance();
        }

        // Try to read matcher operator (~=, |=, ^=, $=, *=, =)
        let mut matcher: Option<String> = None;
        let mut value: Option<String> = None;
        let mut flags: Option<String> = None;

        // `/[~^$*|]?=/y` — a sticky match, so a prefix char with no `=` after it
        // consumes nothing and leaves the `]` check to reject the selector.
        let c = self.current_char();
        if (c == '~' || c == '|' || c == '^' || c == '$' || c == '*')
            && self.peek_next_char() == '='
        {
            self.advance();
            self.advance();
            matcher = Some(format!("{}=", c));
        } else if c == '=' {
            self.advance();
            matcher = Some("=".to_string());
        }

        if matcher.is_some() {
            // Skip whitespace
            while !self.is_eof() && is_js_whitespace(self.current_char()) {
                self.advance();
            }

            // Read value (quoted string or unquoted identifier)
            let c = self.current_char();
            if c == '"' || c == '\'' {
                let quote = c;
                let val_start = self.index;
                self.advance(); // consume opening quote
                while !self.is_eof() {
                    let ch = self.current_char();
                    if ch == '\\' {
                        self.advance();
                        if !self.is_eof() {
                            self.advance();
                        }
                        continue;
                    }
                    if ch == quote {
                        break;
                    }
                    self.advance();
                }
                self.advance(); // consume closing quote
                // Include quotes in value to preserve original quote style
                value = Some(self.source[val_start..self.index].to_string());
            } else {
                // Unquoted value
                let val_start = self.index;
                while !self.is_eof() {
                    let ch = self.current_char();
                    if ch == ']' || is_js_whitespace(ch) {
                        break;
                    }
                    self.advance();
                }
                if self.index > val_start {
                    value = Some(self.source[val_start..self.index].to_string());
                }
            }

            // Skip whitespace
            while !self.is_eof() && is_js_whitespace(self.current_char()) {
                self.advance();
            }
        }

        // Read flags (e.g., 'i' or 's')
        let c = self.current_char();
        if c != ']' && c.is_alphabetic() {
            let flags_start = self.index;
            while !self.is_eof() && self.current_char().is_alphabetic() {
                self.advance();
            }
            flags = Some(self.source[flags_start..self.index].to_string());

            // Skip whitespace
            while !self.is_eof() && is_js_whitespace(self.current_char()) {
                self.advance();
            }
        }

        // consume ']' — upstream's `parser.eat(']', true)`, so anything else
        // ends the selector rather than being skipped over.
        if self.is_eof() || self.current_char() != ']' {
            let pos = self.offset + self.index;
            record_first_error(
                &self.error,
                crate::error::ParseError::svelte("expected_token", "Expected token ]", (pos, pos)),
            );
            return None;
        }
        self.advance();
        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("AttributeSelector".to_string()),
        );
        obj.insert("name".to_string(), Value::String(name));
        if let Some(m) = matcher {
            obj.insert("matcher".to_string(), Value::String(m));
        } else {
            obj.insert("matcher".to_string(), Value::Null);
        }
        if let Some(v) = value {
            obj.insert("value".to_string(), Value::String(v));
        } else {
            obj.insert("value".to_string(), Value::Null);
        }
        if let Some(f) = flags {
            obj.insert("flags".to_string(), Value::String(f));
        } else {
            obj.insert("flags".to_string(), Value::Null);
        }
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Some(Value::Object(obj))
    }

    fn parse_type_selector(&mut self) -> Option<Value> {
        let start = self.offset + self.index;
        let mut name = self.read_identifier();

        if name.is_empty() {
            return None;
        }

        // `ns|el` / `ns|*` — the namespace is kept alongside the local name.
        let mut namespace: Option<String> = None;
        if self.current_char() == '|' {
            self.advance();
            namespace = Some(name);
            if self.current_char() == '*' {
                self.advance();
                name = "*".to_string();
            } else {
                name = self.read_namespaced_local_name()?;
            }
        }

        let end = self.offset + self.index;

        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("TypeSelector".to_string()),
        );
        obj.insert("name".to_string(), Value::String(name));
        if let Some(ns) = namespace {
            obj.insert("namespace".to_string(), Value::String(ns));
        }
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        Some(Value::Object(obj))
    }

    /// Read the local name after a `|` namespace separator, which upstream
    /// reads with the same `read_identifier` — so an empty one is an error.
    fn read_namespaced_local_name(&mut self) -> Option<String> {
        let pos = self.offset + self.index;
        if self.current_char() == '*' {
            self.advance();
            return Some("*".to_string());
        }
        let local = self.read_identifier();
        if local.is_empty() {
            record_first_error(
                &self.error,
                crate::error::ParseError::svelte(
                    "css_expected_identifier",
                    "Expected a valid CSS identifier",
                    (pos, pos),
                ),
            );
            return None;
        }
        Some(local)
    }

    fn is_eof(&self) -> bool {
        self.index >= self.source.len()
    }

    fn current_char(&self) -> char {
        if self.is_eof() {
            '\0'
        } else {
            self.source[self.index..].chars().next().unwrap_or('\0')
        }
    }

    fn peek_next_char(&self) -> char {
        let mut chars = self.source[self.index..].chars();
        chars.next(); // skip current
        chars.next().unwrap_or('\0')
    }

    fn advance(&mut self) {
        if !self.is_eof() {
            let c = self.current_char();
            self.index += c.len_utf8();
        }
    }

    fn skip_whitespace(&mut self) {
        while !self.is_eof() && is_js_whitespace(self.current_char()) {
            self.advance();
        }
    }

    fn match_str(&self, s: &str) -> bool {
        self.source[self.index..].starts_with(s)
    }

    fn skip_block_comment(&mut self) {
        if !self.match_str("/*") {
            return;
        }
        self.advance(); // consume '/'
        self.advance(); // consume '*'
        while !self.is_eof() {
            if self.match_str("*/") {
                self.advance(); // consume '*'
                self.advance(); // consume '/'
                break;
            }
            self.advance();
        }
    }

    /// Read a CSS identifier, decoding CSS escape sequences.
    fn read_identifier(&mut self) -> String {
        read_css_identifier(self.source, &mut self.index)
    }
}
