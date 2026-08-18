//! Oracle-faithful reconstruction of the `this=` attribute on
//! `<svelte:component>` / `<svelte:element>`.
//!
//! svelte-eslint-parser splices a virtual `this` node into the start tag's
//! attribute list (`processThisAttribute` in `parser/converts/element.js`),
//! so layout rules see it as a first-class attribute. rsvelte's parser stores
//! only the inner expression (`el.expression` / `el.tag`); this module
//! recovers the node span the oracle would report.

use super::js_whitespace::is_js_whitespace;

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("source offsets are represented as u32")
}

const fn is_ws(b: u8) -> bool {
    matches!(b, b' ' | b'\t' | b'\n' | b'\r')
}

/// The oracle's node span for the virtual `this` attribute: `start` is the `t`
/// of `this`; `end` mirrors `createSvelteSpecialDirective` /
/// `createSvelteAttribute` — for a dynamic `this={expr}` / `this="{expr}"` it
/// is the first `>`-or-whitespace position after the closing `}` (so a closing
/// quote is included), for a static `this="lit"` it is just past the closing
/// quote.
#[must_use]
pub fn oracle_this_attr_span(src: &str, expr_start: u32, expr_end: u32) -> Option<(u32, u32)> {
    let bytes = src.as_bytes();
    let mut pos = expr_start as usize;
    if pos == 0 {
        return None;
    }
    // Step back over optional whitespace before the value opener.
    while pos > 0 && is_ws(bytes[pos - 1]) {
        pos -= 1;
    }
    // Value opener: `{` (optionally quote-wrapped, `this="{expr}"`) for a
    // dynamic value; a bare quote for a static `this="lit"` (whose expression
    // node spans the inner string).
    let dynamic;
    if pos > 0 && bytes[pos - 1] == b'{' {
        dynamic = true;
        pos -= 1;
        if pos > 0 && matches!(bytes[pos - 1], b'"' | b'\'') {
            pos -= 1;
        }
    } else if pos > 0 && matches!(bytes[pos - 1], b'"' | b'\'') {
        dynamic = false;
        pos -= 1;
    } else {
        return None;
    }
    // Step back over optional whitespace before `=`.
    while pos > 0 && is_ws(bytes[pos - 1]) {
        pos -= 1;
    }
    if pos == 0 || bytes[pos - 1] != b'=' {
        return None;
    }
    pos -= 1;
    // Step back over optional whitespace before `this`.
    while pos > 0 && is_ws(bytes[pos - 1]) {
        pos -= 1;
    }
    if pos < 4 || &bytes[pos - 4..pos] != b"this" {
        return None;
    }
    let start = source_offset(pos - 4);

    if !dynamic {
        // Static literal — the oracle's node ends just past the closing quote.
        return Some((start, expr_end + 1));
    }

    // Dynamic: first `}` at/after the expression end, then advance to the
    // first `>` or JS-whitespace character (upstream's endIndex scan).
    let close = bytes[expr_end as usize..]
        .iter()
        .position(|&b| b == b'}')
        .map(|off| expr_end as usize + off)?;
    let mut end = close;
    for c in src[close..].chars() {
        if c == '>' || is_js_whitespace(c) {
            break;
        }
        end += c.len_utf8();
    }
    Some((start, source_offset(end)))
}
