//! JavaScript string-semantics whitespace helpers.
//!
//! Upstream rules run in JS, where `\s`, `trim()` and `trimEnd()` include
//! U+FEFF and exclude U+0085, while Rust's `char::is_whitespace` does the
//! opposite. Layout rules that mirror upstream whitespace decisions must go
//! through these helpers instead of the std ones.

/// JS `\s` / `String.prototype.trim` whitespace class.
#[inline]
#[must_use]
pub fn is_js_whitespace(c: char) -> bool {
    c == '\u{FEFF}' || (c.is_whitespace() && c != '\u{0085}')
}

/// Upstream's `[^\S\n\r]` class: JS whitespace that is not `\n` / `\r`.
#[inline]
#[must_use]
pub fn is_js_space_not_crlf(c: char) -> bool {
    c != '\n' && c != '\r' && is_js_whitespace(c)
}

/// JS `String.prototype.trim`.
#[must_use]
pub fn js_trim(s: &str) -> &str {
    js_trim_end(s.trim_start_matches(is_js_whitespace))
}

/// JS `String.prototype.trimEnd`.
#[must_use]
pub fn js_trim_end(s: &str) -> &str {
    s.trim_end_matches(is_js_whitespace)
}

/// JS `String.prototype.trimStart`.
#[must_use]
pub fn js_trim_start(s: &str) -> &str {
    s.trim_start_matches(is_js_whitespace)
}

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("source offsets are represented as u32")
}

/// First byte offset in `[from, end)` whose character is not JS whitespace
/// (returns `end` when the whole span is whitespace). `from`/`end` must lie on
/// char boundaries.
#[must_use]
pub fn skip_js_ws_forward(src: &str, from: u32, end: u32) -> u32 {
    let end = (end as usize).min(src.len());
    let slice = &src[from as usize..end];
    let trimmed = slice.trim_start_matches(is_js_whitespace);
    from + source_offset(slice.len() - trimmed.len())
}

/// Byte offset just past the last non-JS-whitespace character in
/// `[floor, from)` (returns `floor` when the whole span is whitespace).
#[must_use]
pub fn skip_js_ws_backward(src: &str, floor: u32, from: u32) -> u32 {
    let from = (from as usize).min(src.len());
    let slice = &src[floor as usize..from];
    let trimmed = js_trim_end(slice);
    floor + source_offset(trimmed.len())
}
