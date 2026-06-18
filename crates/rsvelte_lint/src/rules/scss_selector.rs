//! Best-effort SCSS/Less/PostCSS selector extractor for the native lint rules.
//!
//! The rsvelte CSS parser only handles plain CSS. When a `<style>` block has
//! `lang="scss"` / `lang="less"` / `lang="postcss"`, the parsed `StyleSheet`
//! has no `children` (or an empty list). This module tokenises the raw style
//! text and extracts selector tokens so the lint rules can still work on
//! SCSS/Less sources.
//!
//! ## Design: fail-safe tokeniser
//!
//! The tokeniser is deliberately conservative:
//! - It scans the raw text looking for rule blocks (`selector { ... }`).
//! - Inside a **selector position** (text before each `{`), it extracts
//!   `.classname`, `#idname`, and plain-identifier type selectors.
//! - It skips strings, block/line comments, and SCSS interpolation `#{...}`.
//! - On any ambiguity it skips the token rather than guessing wrong.
//!
//! **False-negatives (missed findings) are acceptable; false-positives (wrong
//! findings that disagree with the oracle) are not.**

/// Selector kind extracted from SCSS.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SelectorKind {
    Class,
    Id,
    Type,
}

/// A selector token extracted from SCSS source text.
#[derive(Debug, Clone)]
pub struct ScssSelector {
    pub kind: SelectorKind,
    /// The selector name (without `.`, `#`, or sigil).
    pub name: String,
    /// Byte offset of the sigil (`.`, `#`, or first char of the type-name)
    /// relative to the start of the `content.styles` string.
    pub offset: u32,
    /// Byte offset of the end of the name, relative to `content.styles`.
    pub end: u32,
}

/// Returns `true` when the style block is plain CSS (no `lang` attribute, or
/// `lang="css"`). These should be processed with the regular parsed-AST path.
///
/// Returns `false` for any non-CSS lang (scss, postcss, less, unknown, etc.).
pub fn is_plain_css_lang(attributes: &[serde_json::Value]) -> bool {
    for attr in attributes {
        if attr.get("name").and_then(serde_json::Value::as_str) == Some("lang") {
            let val = attr.get("value");
            if val.and_then(serde_json::Value::as_bool).unwrap_or(false) {
                return true; // bare `lang` → treat as plain CSS
            }
            if let Some(seq) = val.and_then(serde_json::Value::as_array) {
                for part in seq {
                    if part.get("type").and_then(serde_json::Value::as_str) == Some("Text")
                        && let Some(data) = part.get("data").and_then(serde_json::Value::as_str)
                    {
                        let lang = data.to_lowercase();
                        return matches!(lang.as_str(), "" | "css");
                    }
                }
            }
            return false; // lang attribute with unrecognized value
        }
    }
    true // no lang attribute → plain CSS
}

/// Returns `Some(lang_lowercase)` for `lang="scss"` or `lang="postcss"` — the
/// two langs the oracle's postcss pipeline handles. Returns `None` for plain
/// CSS and for any other lang (less, unknown, etc.) which the oracle skips.
pub fn scss_lang(attributes: &[serde_json::Value]) -> Option<String> {
    for attr in attributes {
        if attr.get("name").and_then(serde_json::Value::as_str) == Some("lang") {
            let val = attr.get("value");
            // boolean `true` → bare `lang` attribute → treat as plain / no lang
            if val.and_then(serde_json::Value::as_bool).unwrap_or(false) {
                return None;
            }
            if let Some(seq) = val.and_then(serde_json::Value::as_array) {
                for part in seq {
                    if part.get("type").and_then(serde_json::Value::as_str) == Some("Text")
                        && let Some(data) = part.get("data").and_then(serde_json::Value::as_str)
                    {
                        let lang = data.to_lowercase();
                        // Only handle the langs the oracle's postcss pipeline covers.
                        return match lang.as_str() {
                            "" | "css" => None,
                            "scss" | "postcss" => Some(lang),
                            _ => None, // less, unknown, etc. — skip entirely
                        };
                    }
                }
            }
            // lang attribute present but no recognizable value → skip
            return None;
        }
    }
    None
}

/// Extract all selectors from a SCSS/Less/PostCSS source text.
///
/// `text` is the raw style block content (i.e., `StyleSheet.content.styles`).
/// The returned `ScssSelector.offset` and `.end` are byte offsets into `text`.
pub fn extract_selectors(text: &str) -> Vec<ScssSelector> {
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut pos = 0usize;
    let mut selectors = Vec::new();
    // Stack: each entry is the brace depth at which we entered a rule block.
    // We parse greedily, scanning for { } and collecting selector text before {.
    //
    // Strategy:
    // - Scan forward, skipping strings and comments.
    // - When we see `{`, the text before it (since the last `}` or start)
    //   is a selector list — parse it for tokens.
    // - When we see `}`, pop a brace level.
    // - We track brace depth so we handle nested rules (SCSS nesting).

    let mut rule_start = 0usize; // start of current potential selector text
    let mut brace_depth = 0usize;

    while pos < len {
        // Skip whitespace/comments in any position.
        let Some(advanced) = skip_ws_comments(bytes, pos) else {
            break;
        };
        if advanced == pos {
            // No skip occurred — process the current character.
            let b = bytes[pos];
            match b {
                b'"' | b'\'' => {
                    // Skip a string literal.
                    pos = skip_string(bytes, pos);
                }
                b'{' => {
                    // The text from rule_start..pos is the selector text.
                    let selector_text = &text[rule_start..pos];
                    parse_selector_text(selector_text, rule_start, &mut selectors);
                    brace_depth += 1;
                    pos += 1;
                    rule_start = pos;
                }
                b'}' => {
                    brace_depth = brace_depth.saturating_sub(1);
                    pos += 1;
                    rule_start = pos;
                }
                b'@' => {
                    // @rule — skip the at-keyword and any prelude up to { or ;
                    pos = skip_at_rule_prelude(bytes, pos);
                    rule_start = pos;
                }
                _ => {
                    pos += 1;
                }
            }
        } else {
            pos = advanced;
        }
    }

    selectors
}

/// Conservative structural validity check for SCSS/PostCSS source.
///
/// The corpus oracle drives its CSS-aware rules (no-unused-class-name,
/// consistent-selector-style) from a real `postcss-scss` parse, which **fails**
/// — and therefore reports nothing — on grossly malformed input (e.g. a bare
/// word statement like `end` with no `:` and no block). rsvelte's
/// [`extract_selectors`] is a tolerant regex-style scan that never fails, so it
/// would over-report on such input. This function mirrors postcss-scss's
/// "does it parse at all?" decision well enough to suppress those false
/// positives, while staying conservative so it never rejects *valid* SCSS
/// (false negatives — extracting selectors from genuinely valid SCSS — are
/// always acceptable; false positives are not).
///
/// Returns `false` when the source is definitely not parseable:
/// - unbalanced `{` / `}`, or
/// - a non-empty statement terminated by `;` or `}` that is neither a
///   declaration (`prop: value`) nor an at-rule (`@…`) — i.e. a bare word.
///
/// Comments, string literals, and `#{…}` interpolation are skipped so their
/// contents never trip the heuristic.
pub fn scss_is_parseable(text: &str) -> bool {
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut pos = 0usize;
    let mut depth: i32 = 0;

    // Per-statement flags, reset at every `;` / `{` / `}` boundary.
    let mut seg_content = false;
    let mut seg_colon = false;
    let mut seg_first_at = false;
    let mut seg_first_set = false;

    // A `;`/`}`-terminated statement must be empty, a declaration (has `:`), or
    // an at-rule (starts with `@`). Anything else is a bare word → unparseable.
    let stmt_ok = |content: bool, colon: bool, at: bool| -> bool { !content || colon || at };

    while pos < len {
        let Some(advanced) = skip_ws_comments(bytes, pos) else {
            break;
        };
        if advanced != pos {
            pos = advanced;
            continue;
        }
        let b = bytes[pos];
        match b {
            b'"' | b'\'' => {
                pos = skip_string(bytes, pos);
            }
            b'#' if pos + 1 < len && bytes[pos + 1] == b'{' => {
                // SCSS interpolation `#{ … }` — skip to the matching `}` so its
                // inner braces don't perturb depth tracking.
                let mut p = pos + 2;
                let mut inner = 1i32;
                while p < len && inner > 0 {
                    match bytes[p] {
                        b'{' => inner += 1,
                        b'}' => inner -= 1,
                        _ => {}
                    }
                    p += 1;
                }
                pos = p;
                if !seg_first_set {
                    seg_first_set = true;
                }
                seg_content = true;
            }
            b'{' => {
                // Text before `{` was a selector prelude — always valid; reset.
                depth += 1;
                pos += 1;
                seg_content = false;
                seg_colon = false;
                seg_first_at = false;
                seg_first_set = false;
            }
            b'}' => {
                if !stmt_ok(seg_content, seg_colon, seg_first_at) {
                    return false;
                }
                depth -= 1;
                if depth < 0 {
                    return false;
                }
                pos += 1;
                seg_content = false;
                seg_colon = false;
                seg_first_at = false;
                seg_first_set = false;
            }
            b';' => {
                if !stmt_ok(seg_content, seg_colon, seg_first_at) {
                    return false;
                }
                pos += 1;
                seg_content = false;
                seg_colon = false;
                seg_first_at = false;
                seg_first_set = false;
            }
            _ => {
                if !seg_first_set {
                    seg_first_at = b == b'@';
                    seg_first_set = true;
                }
                seg_content = true;
                if b == b':' {
                    seg_colon = true;
                }
                pos += 1;
            }
        }
    }

    depth == 0
}

/// Try to advance past whitespace and comments from `pos`. Returns the new
/// position (same as `pos` if no advancement), or `None` if we hit end.
fn skip_ws_comments(bytes: &[u8], pos: usize) -> Option<usize> {
    let len = bytes.len();
    if pos >= len {
        return None;
    }
    let b = bytes[pos];
    if b == b' ' || b == b'\t' || b == b'\r' || b == b'\n' {
        return Some(pos + 1);
    }
    // Block comment /* ... */
    if b == b'/' && pos + 1 < len && bytes[pos + 1] == b'*' {
        let mut p = pos + 2;
        while p + 1 < len {
            if bytes[p] == b'*' && bytes[p + 1] == b'/' {
                return Some(p + 2);
            }
            p += 1;
        }
        return Some(len); // unterminated comment
    }
    // Line comment //
    if b == b'/' && pos + 1 < len && bytes[pos + 1] == b'/' {
        let mut p = pos + 2;
        while p < len && bytes[p] != b'\n' {
            p += 1;
        }
        if p < len {
            p += 1; // consume the newline
        }
        return Some(p);
    }
    Some(pos) // no advancement
}

/// Skip a string literal starting at `pos` (which must be `"` or `'`).
fn skip_string(bytes: &[u8], pos: usize) -> usize {
    let len = bytes.len();
    let quote = bytes[pos];
    let mut p = pos + 1;
    while p < len {
        let b = bytes[p];
        if b == b'\\' {
            p += 2;
        } else if b == quote {
            return p + 1;
        } else {
            p += 1;
        }
    }
    len // unterminated string
}

/// Skip an @rule prelude up to the first `{` or `;` (exclusive).
fn skip_at_rule_prelude(bytes: &[u8], pos: usize) -> usize {
    let len = bytes.len();
    let mut p = pos;
    while p < len {
        match bytes[p] {
            b'{' => return p + 1, // consume the `{` so caller starts after it
            b';' => return p + 1,
            b'"' | b'\'' => p = skip_string(bytes, p),
            b'/' if p + 1 < len && bytes[p + 1] == b'*' => {
                let mut q = p + 2;
                while q + 1 < len && !(bytes[q] == b'*' && bytes[q + 1] == b'/') {
                    q += 1;
                }
                p = q + 2;
            }
            _ => p += 1,
        }
    }
    len
}

/// Parse a comma-separated selector list (text before a `{`) and extract
/// individual selector tokens (`.class`, `#id`, element types).
///
/// `offset_base` is the byte offset of `selector_text` within the full
/// SCSS source string.
fn parse_selector_text(selector_text: &str, offset_base: usize, out: &mut Vec<ScssSelector>) {
    // A SCSS selector cannot contain a top-level `;` — that terminates a
    // declaration or at-rule. So anything *after* the last top-level `;` is the
    // real selector list for the following block; earlier text is leftover
    // declarations (e.g. `color: red; .bar {…}`). Trim it so a property value
    // that happens to be an element name (`display: table; .x {…}`) is not
    // mis-read as a type selector.
    let trim = last_top_level_semicolon(selector_text)
        .map(|i| i + 1)
        .unwrap_or(0);
    // The selector text may contain multiple selectors separated by `,`.
    // Split on `,` but we must not split inside `(...)`.
    let segments = split_selector_list(&selector_text[trim..]);
    for seg in segments {
        // `seg` is relative to the trimmed slice; shift back into `selector_text`.
        parse_single_selector(
            selector_text,
            SegRange {
                start: seg.start + trim,
                end: seg.end + trim,
            },
            offset_base,
            out,
        );
    }
}

/// Byte offset of the last `;` at selector-list top level (outside strings,
/// comments, and bracket groups), or `None`. Used to drop leftover declaration
/// text preceding a nested rule's selector.
fn last_top_level_semicolon(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let len = bytes.len();
    let mut depth = 0usize;
    let mut last = None;
    let mut pos = 0;
    while pos < len {
        match bytes[pos] {
            b'(' | b'[' | b'{' => {
                depth += 1;
                pos += 1;
            }
            b')' | b']' | b'}' => {
                depth = depth.saturating_sub(1);
                pos += 1;
            }
            b'"' | b'\'' => pos = skip_string(bytes, pos),
            b'/' if pos + 1 < len && bytes[pos + 1] == b'*' => {
                let mut p = pos + 2;
                while p + 1 < len && !(bytes[p] == b'*' && bytes[p + 1] == b'/') {
                    p += 1;
                }
                pos = (p + 2).min(len);
            }
            b'/' if pos + 1 < len && bytes[pos + 1] == b'/' => {
                let mut p = pos + 2;
                while p < len && bytes[p] != b'\n' {
                    p += 1;
                }
                pos = p;
            }
            b';' if depth == 0 => {
                last = Some(pos);
                pos += 1;
            }
            _ => pos += 1,
        }
    }
    last
}

/// A byte-range within the selector text that represents one selector.
struct SegRange {
    start: usize, // offset within selector_text
    end: usize,
}

/// Split a selector list on `,` while respecting `(...)` nesting.
fn split_selector_list(selector_text: &str) -> Vec<SegRange> {
    let bytes = selector_text.as_bytes();
    let len = bytes.len();
    let mut segments = Vec::new();
    let mut depth = 0usize;
    let mut seg_start = 0usize;
    let mut pos = 0usize;
    while pos < len {
        match bytes[pos] {
            b'(' | b'[' => {
                depth += 1;
                pos += 1;
            }
            b')' | b']' => {
                depth = depth.saturating_sub(1);
                pos += 1;
            }
            b',' if depth == 0 => {
                segments.push(SegRange {
                    start: seg_start,
                    end: pos,
                });
                pos += 1;
                seg_start = pos;
            }
            b'"' | b'\'' => {
                pos = skip_string(bytes, pos);
            }
            _ => {
                pos += 1;
            }
        }
    }
    segments.push(SegRange {
        start: seg_start,
        end: len,
    });
    segments
}

/// Parse one simple/compound/complex selector (no commas) and extract tokens.
fn parse_single_selector(
    selector_text: &str,
    seg: SegRange,
    offset_base: usize,
    out: &mut Vec<ScssSelector>,
) {
    let bytes = selector_text.as_bytes();
    let seg_bytes = &bytes[seg.start..seg.end];
    let seg_len = seg_bytes.len();
    let mut pos = 0usize;

    while pos < seg_len {
        let b = seg_bytes[pos];
        // Absolute offset of this byte within the full SCSS text.
        let abs_pos = offset_base + seg.start + pos;

        match b {
            b' ' | b'\t' | b'\r' | b'\n' => {
                pos += 1;
            }
            b'/' if pos + 1 < seg_len && seg_bytes[pos + 1] == b'*' => {
                // Block comment inside selector (unusual but handle it).
                let mut p = pos + 2;
                while p + 1 < seg_len && !(seg_bytes[p] == b'*' && seg_bytes[p + 1] == b'/') {
                    p += 1;
                }
                pos = p + 2;
            }
            b'/' if pos + 1 < seg_len && seg_bytes[pos + 1] == b'/' => {
                // Line comment (SCSS).
                let mut p = pos + 2;
                while p < seg_len && seg_bytes[p] != b'\n' {
                    p += 1;
                }
                pos = p;
            }
            b'#' => {
                // Could be `#id` or `#{...}` (SCSS interpolation).
                if pos + 1 < seg_len && seg_bytes[pos + 1] == b'{' {
                    // SCSS interpolation — skip the whole `#{...}`.
                    pos = skip_interpolation(seg_bytes, pos + 1);
                } else {
                    // ID selector: `#ident`
                    let name_start = pos + 1;
                    let name_end = consume_ident(seg_bytes, name_start);
                    if name_end > name_start {
                        let name = &selector_text[seg.start + name_start..seg.start + name_end];
                        out.push(ScssSelector {
                            kind: SelectorKind::Id,
                            name: name.to_string(),
                            offset: abs_pos as u32,
                            end: (offset_base + seg.start + name_end) as u32,
                        });
                    }
                    pos = name_end;
                }
            }
            b'.' => {
                // Class selector: `.ident`
                let name_start = pos + 1;
                let name_end = consume_ident(seg_bytes, name_start);
                if name_end > name_start {
                    let name = &selector_text[seg.start + name_start..seg.start + name_end];
                    out.push(ScssSelector {
                        kind: SelectorKind::Class,
                        name: name.to_string(),
                        offset: abs_pos as u32,
                        end: (offset_base + seg.start + name_end) as u32,
                    });
                }
                pos = name_end;
            }
            b'&' => {
                // SCSS `&` parent-selector reference — skip it.
                pos += 1;
            }
            b'>' | b'+' | b'~' | b'|' | b'*' | b':' | b'[' | b'(' => {
                // Combinators, pseudo-classes, attribute selectors, function calls —
                // skip the whole bracket group or just the char.
                match b {
                    b'[' | b'(' => {
                        pos = skip_bracket_group(seg_bytes, pos);
                    }
                    b':' => {
                        // Skip pseudo-class/element: `:name` or `:name(...)`.
                        pos += 1;
                        if pos < seg_len && seg_bytes[pos] == b':' {
                            pos += 1; // `::pseudo-element`
                        }
                        // Skip the pseudo-class name.
                        pos = consume_ident(seg_bytes, pos);
                        // If followed by `(`, skip the argument list.
                        if pos < seg_len && seg_bytes[pos] == b'(' {
                            pos = skip_bracket_group(seg_bytes, pos);
                        }
                    }
                    _ => {
                        pos += 1;
                    }
                }
            }
            b'"' | b'\'' => {
                // String inside attribute selector.
                pos = skip_string(seg_bytes, pos);
            }
            _ => {
                // Possibly a type selector (element name like `div`, `span`, etc.)
                // Only extract if it looks like an identifier.
                if is_ident_start(b) {
                    let name_start = pos;
                    let name_end = consume_ident(seg_bytes, name_start);
                    let name = &selector_text[seg.start + name_start..seg.start + name_end];
                    // Filter out pseudo-class-like keywords that are not type selectors.
                    // A real type selector is a CSS element name (lowercase ASCII ident).
                    // We skip names that look like CSS property values or keywords
                    // that can appear in at-rule preludes.
                    if is_valid_type_selector_name(name) {
                        out.push(ScssSelector {
                            kind: SelectorKind::Type,
                            name: name.to_string(),
                            offset: abs_pos as u32,
                            end: (offset_base + seg.start + name_end) as u32,
                        });
                    }
                    pos = name_end;
                } else {
                    pos += 1;
                }
            }
        }
    }
}

/// Skip a `#{...}` SCSS interpolation starting at the `{` position.
fn skip_interpolation(bytes: &[u8], open_brace: usize) -> usize {
    let len = bytes.len();
    let mut depth = 0usize;
    let mut pos = open_brace;
    while pos < len {
        match bytes[pos] {
            b'{' => {
                depth += 1;
                pos += 1;
            }
            b'}' => {
                if depth <= 1 {
                    return pos + 1;
                }
                depth = depth.saturating_sub(1);
                pos += 1;
            }
            _ => pos += 1,
        }
    }
    len
}

/// Skip a bracket group `[...]` or `(...)` starting at `pos`.
fn skip_bracket_group(bytes: &[u8], pos: usize) -> usize {
    let len = bytes.len();
    let open = bytes[pos];
    let close = if open == b'[' { b']' } else { b')' };
    let mut depth = 0usize;
    let mut p = pos;
    while p < len {
        if bytes[p] == open {
            depth += 1;
        } else if bytes[p] == close {
            depth = depth.saturating_sub(1);
            if depth == 0 {
                return p + 1;
            }
        }
        p += 1;
    }
    len
}

/// Advance `pos` through a CSS identifier character sequence.
fn consume_ident(bytes: &[u8], start: usize) -> usize {
    let len = bytes.len();
    let mut pos = start;
    while pos < len && is_ident_char(bytes[pos]) {
        pos += 1;
    }
    pos
}

/// True for characters that can start a CSS identifier.
fn is_ident_start(b: u8) -> bool {
    b.is_ascii_alphabetic() || b == b'_' || b == b'-' || b >= 0x80
}

/// True for characters that can continue a CSS identifier.
fn is_ident_char(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'-' || b >= 0x80
}

/// Returns true if `name` is a known HTML/SVG element name, i.e. a real type
/// selector.
///
/// SCSS sources interleave declarations, at-rule preludes, and SCSS keywords
/// with selectors, and a bare identifier is ambiguous (it could be a property
/// value like `block`, a function name, a variable, …). Rather than guess, we
/// accept an identifier as a type selector only when it is in the fixed
/// HTML/SVG element allowlist below. This is deliberately conservative: an
/// unknown custom element is missed (a false-negative, acceptable) rather than a
/// non-selector identifier being wrongly reported (a false-positive, not).
fn is_valid_type_selector_name(name: &str) -> bool {
    matches!(
        name,
        "a" | "abbr"
            | "address"
            | "area"
            | "article"
            | "aside"
            | "audio"
            | "b"
            | "base"
            | "bdi"
            | "bdo"
            | "blockquote"
            | "body"
            | "br"
            | "button"
            | "canvas"
            | "caption"
            | "cite"
            | "code"
            | "col"
            | "colgroup"
            | "data"
            | "datalist"
            | "dd"
            | "del"
            | "details"
            | "dfn"
            | "dialog"
            | "div"
            | "dl"
            | "dt"
            | "em"
            | "embed"
            | "fieldset"
            | "figcaption"
            | "figure"
            | "footer"
            | "form"
            | "h1"
            | "h2"
            | "h3"
            | "h4"
            | "h5"
            | "h6"
            | "head"
            | "header"
            | "hgroup"
            | "hr"
            | "html"
            | "i"
            | "iframe"
            | "img"
            | "input"
            | "ins"
            | "kbd"
            | "label"
            | "legend"
            | "li"
            | "link"
            | "main"
            | "map"
            | "mark"
            | "menu"
            | "meta"
            | "meter"
            | "nav"
            | "noscript"
            | "object"
            | "ol"
            | "optgroup"
            | "option"
            | "output"
            | "p"
            | "picture"
            | "pre"
            | "progress"
            | "q"
            | "rp"
            | "rt"
            | "ruby"
            | "s"
            | "samp"
            | "script"
            | "search"
            | "section"
            | "select"
            | "slot"
            | "small"
            | "source"
            | "span"
            | "strong"
            | "style"
            | "sub"
            | "summary"
            | "sup"
            | "table"
            | "tbody"
            | "td"
            | "template"
            | "textarea"
            | "tfoot"
            | "th"
            | "thead"
            | "time"
            | "title"
            | "tr"
            | "track"
            | "u"
            | "ul"
            | "var"
            | "video"
            | "wbr"
            | "svg"
            | "path"
            | "circle"
            | "rect"
            | "line"
            | "polyline"
            | "polygon"
            | "ellipse"
            | "text"
            | "g"
            | "use"
            | "defs"
            | "symbol"
            | "image"
            | "clipPath"
            | "mask"
            | "pattern"
            | "linearGradient"
            | "radialGradient"
            | "stop"
            | "animate"
            | "animateMotion"
            | "animateTransform"
            | "feBlend"
            | "feColorMatrix"
            | "feComposite"
            | "feConvolveMatrix"
            | "feDiffuseLighting"
            | "feDisplacementMap"
            | "feDropShadow"
            | "feFlood"
            | "feFuncA"
            | "feFuncB"
            | "feFuncG"
            | "feFuncR"
            | "feGaussianBlur"
            | "feImage"
            | "feMerge"
            | "feMergeNode"
            | "feMorphology"
            | "feOffset"
            | "fePointLight"
            | "feSpecularLighting"
            | "feSpotLight"
            | "feTile"
            | "feTurbulence"
            | "filter"
            | "foreignObject"
            | "marker"
            | "mpath"
            | "set"
            | "tspan"
            | "view"
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn scss_is_parseable_accepts_valid() {
        // Plain rule, nesting, declarations.
        assert!(scss_is_parseable(
            ".a { color: red; .b { font-weight: bold; } }"
        ));
        // At-rules (`@`), control flow, placeholders, mixins.
        assert!(scss_is_parseable(
            "@if $x { color: red; } @else { color: blue; }"
        ));
        assert!(scss_is_parseable("@each $i in $list { .x { width: $i; } }"));
        assert!(scss_is_parseable(
            "%placeholder { color: red; } .a { @extend %placeholder; }"
        ));
        // SCSS maps (parens), variables, custom properties.
        assert!(scss_is_parseable(
            "$map: ( key: value, other: 1 ); .a { --x: 1; }"
        ));
        // `#{…}` interpolation must not perturb brace depth.
        assert!(scss_is_parseable(".icon-#{$name} { color: red; }"));
        // `//` and `/* */` comments are skipped (their contents never trip it).
        assert!(scss_is_parseable(
            "// a bare word in a comment is fine\n.a { color: red; }"
        ));
        assert!(scss_is_parseable("/* end begin word */ .a { color: red; }"));
        // Strings hide their inner `;`/`{`/`}`.
        assert!(scss_is_parseable(r#".a { content: "a;b{c}"; }"#));
    }

    #[test]
    fn scss_is_parseable_rejects_invalid() {
        // Unbalanced braces.
        assert!(!scss_is_parseable(".a { color: red; "));
        assert!(!scss_is_parseable(".a { } }"));
        // A bare-word statement (terminated by `;`/`}`, no `:` declaration, no
        // `@` at-rule) — the `end` token from the corpus `invalid-scss` fixtures.
        // A single bare word makes the whole block unparseable (≈ postcss-scss).
        assert!(!scss_is_parseable(".a { color: red; end }")); // bare word before `}`
        assert!(!scss_is_parseable("garbage; .a { color: red; }")); // bare word before `;`
        // (A statement that *does* contain a `:` — even with junk around it — is
        // treated as a declaration and passes; the heuristic only flags
        // colon-less bare-word statements. A selector prelude ending in `{` is
        // always accepted.)
    }

    #[test]
    fn extracts_class_selectors() {
        let scss = ".foo { color: red; }";
        let selectors = extract_selectors(scss);
        assert_eq!(selectors.len(), 1);
        assert_eq!(selectors[0].kind, SelectorKind::Class);
        assert_eq!(selectors[0].name, "foo");
        assert_eq!(selectors[0].offset, 0);
    }

    #[test]
    fn extracts_nested_class_selectors() {
        let scss = ".container { .inner { color: red; } }";
        let selectors = extract_selectors(scss);
        let names: Vec<_> = selectors.iter().map(|s| s.name.as_str()).collect();
        assert!(
            names.contains(&"container"),
            "expected container, got {:?}",
            names
        );
        assert!(names.contains(&"inner"), "expected inner, got {:?}", names);
    }

    #[test]
    fn skips_scss_interpolation() {
        let scss = ".#{$var} { color: red; }";
        let selectors = extract_selectors(scss);
        // No selectors extracted (the `#{}` is an interpolation, not an id selector)
        assert!(
            selectors.iter().all(|s| s.kind != SelectorKind::Id),
            "should not extract interpolation as id"
        );
    }

    #[test]
    fn skips_line_comments() {
        let scss = "// comment\n.foo { color: red; }";
        let selectors = extract_selectors(scss);
        assert_eq!(selectors.len(), 1);
        assert_eq!(selectors[0].name, "foo");
    }

    #[test]
    fn extracts_id_selectors() {
        let scss = "#my-id { color: blue; }";
        let selectors = extract_selectors(scss);
        assert_eq!(selectors.len(), 1);
        assert_eq!(selectors[0].kind, SelectorKind::Id);
        assert_eq!(selectors[0].name, "my-id");
    }

    #[test]
    fn extracts_type_selectors() {
        let scss = "div { color: green; }";
        let selectors = extract_selectors(scss);
        assert_eq!(selectors.len(), 1);
        assert_eq!(selectors[0].kind, SelectorKind::Type);
        assert_eq!(selectors[0].name, "div");
    }

    #[test]
    fn handles_comma_separated() {
        let scss = ".foo, .bar { color: red; }";
        let selectors = extract_selectors(scss);
        let names: Vec<_> = selectors.iter().map(|s| s.name.as_str()).collect();
        assert!(names.contains(&"foo"));
        assert!(names.contains(&"bar"));
    }

    #[test]
    fn property_value_before_nested_rule_is_not_a_type_selector() {
        // `table` is a property value here, not a selector — only `.x` should be
        // extracted (the `;` trimming drops the leftover declaration).
        let scss = ".wrap { display: table; .x { color: red; } }";
        let names: Vec<_> = extract_selectors(scss)
            .into_iter()
            .map(|s| (s.kind, s.name))
            .collect();
        assert!(
            names.contains(&(SelectorKind::Class, "wrap".to_string())),
            "{names:?}"
        );
        assert!(
            names.contains(&(SelectorKind::Class, "x".to_string())),
            "{names:?}"
        );
        assert!(
            !names.contains(&(SelectorKind::Type, "table".to_string())),
            "property value `table` must not be a type selector: {names:?}"
        );
    }

    #[test]
    fn offset_is_correct() {
        // `.foo` starts at offset 0.
        let scss = ".foo { }";
        let sels = extract_selectors(scss);
        assert_eq!(sels[0].offset, 0);

        // Two spaces before `.bar` → offset 2.
        let scss2 = "  .bar { }";
        let sels2 = extract_selectors(scss2);
        assert_eq!(sels2[0].offset, 2);
    }
}
