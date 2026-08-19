//! Oracle-faithful reconstruction of the `this=` attribute on
//! `<svelte:component>` / `<svelte:element>`.
//!
//! svelte-eslint-parser splices a virtual `this` node into the start tag's
//! attribute list (`processThisAttribute` in `parser/converts/element.js`),
//! so layout rules see it as a first-class attribute. rsvelte's parser stores
//! only the inner expression (`el.expression` / `el.tag`); this module
//! recovers the node span the oracle would report.

use super::js_whitespace::is_js_whitespace;

/// The full `this=…` attribute span of a `<svelte:element>` /
/// `<svelte:component>` start tag.
///
/// The parser filters `this` out of `el.attributes`, storing only the inner
/// expression in `el.tag` / `el.expression`, but svelte-eslint-parser keeps it
/// as a `SvelteSpecialDirective` in `startTag.attributes` with key text `this`.
/// Layout rules (`sort-attributes`, `max-attributes-per-line`,
/// `first-attribute-linebreak`) therefore have to see it as an ordinary
/// attribute, at its real position among the others.
///
/// This scans the start tag forward rather than stepping backward from the
/// expression: the expression's own start moves under a leading comment, a
/// parenthesis or a quote, so a backward walk has to guess what it is standing
/// on, while the attribute name is unambiguous where it appears.
///
/// Returns `(attr_start, attr_end)`: the `t` of `this`, and the byte past the
/// end of its value.
#[must_use]
pub fn oracle_this_attr_span(src: &str, el_start: u32) -> Option<(u32, u32)> {
    let bytes = src.as_bytes();
    let mut i = el_start as usize;
    if bytes.get(i) != Some(&b'<') {
        return None;
    }
    i += 1;
    let skip_ws = |src: &str, mut i: usize| {
        while let Some(c) = src[i..].chars().next() {
            if !is_js_whitespace(c) {
                break;
            }
            i += c.len_utf8();
        }
        i
    };
    let at_tag_end = |bytes: &[u8], i: usize| {
        bytes.get(i) == Some(&b'>')
            || (bytes.get(i) == Some(&b'/') && bytes.get(i + 1) == Some(&b'>'))
    };
    // Tag name.
    while i < bytes.len() && !at_tag_end(bytes, i) {
        let c = src[i..].chars().next()?;
        if is_js_whitespace(c) {
            break;
        }
        i += c.len_utf8();
    }
    loop {
        i = skip_ws(src, i);
        if i >= bytes.len() || at_tag_end(bytes, i) {
            return None;
        }
        let name_start = i;
        while i < bytes.len() && !at_tag_end(bytes, i) && bytes[i] != b'=' {
            let c = src[i..].chars().next()?;
            if is_js_whitespace(c) {
                break;
            }
            i += c.len_utf8();
        }
        if i == name_start {
            // Not a name (a stray `=` or an unexpected byte): give up rather
            // than loop forever.
            return None;
        }
        let name = &src[name_start..i];
        let mut value_end = i;
        let after_name = skip_ws(src, i);
        if bytes.get(after_name) == Some(&b'=') {
            let value_start = skip_ws(src, after_name + 1);
            value_end = scan_attribute_value(src, value_start)?;
            i = value_end;
        } else {
            i = after_name;
        }
        if name == "this" {
            // Upstream's `endIndex` scan: from the end of the value, advance to
            // the first `>` or whitespace, so a closing quote is included.
            let mut end = value_end;
            for c in src[value_end..].chars() {
                if c == '>' || is_js_whitespace(c) {
                    break;
                }
                end += c.len_utf8();
            }
            return Some((u32::try_from(name_start).ok()?, u32::try_from(end).ok()?));
        }
    }
}

/// End offset (exclusive) of the attribute value starting at `from`: a quoted
/// string, a `{…}` mustache, or a bare token.
///
/// The mustache walk tracks strings, template literals and comments so a brace
/// inside one does not close it. A regex literal is not modelled — a `/` is
/// ordinary here — which can only matter for a `{…}` value containing an unpaired
/// brace inside a regex.
fn scan_attribute_value(src: &str, from: usize) -> Option<usize> {
    let bytes = src.as_bytes();
    match bytes.get(from)? {
        q @ (b'"' | b'\'') => {
            let quote = *q;
            let mut i = from + 1;
            while i < bytes.len() {
                match bytes[i] {
                    b'{' => i = scan_mustache(src, i)?,
                    b if b == quote => return Some(i + 1),
                    _ => i += 1,
                }
            }
            None
        }
        b'{' => scan_mustache(src, from),
        _ => {
            let mut i = from;
            while i < bytes.len() {
                let c = src[i..].chars().next()?;
                if crate::rules::js_whitespace::is_js_whitespace(c)
                    || c == '>'
                    || (c == '/' && bytes.get(i + 1) == Some(&b'>'))
                {
                    break;
                }
                i += c.len_utf8();
            }
            Some(i)
        }
    }
}

/// End offset (exclusive) of the `{…}` starting at `from`.
fn scan_mustache(src: &str, from: usize) -> Option<usize> {
    let bytes = src.as_bytes();
    let mut depth = 0usize;
    let mut i = from;
    while i < bytes.len() {
        match bytes[i] {
            b'{' => {
                depth += 1;
                i += 1;
            }
            b'}' => {
                depth -= 1;
                i += 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            q @ (b'"' | b'\'' | b'`') => {
                i += 1;
                while i < bytes.len() && bytes[i] != q {
                    i += if bytes[i] == b'\\' { 2 } else { 1 };
                }
                i += 1;
            }
            b'/' if bytes.get(i + 1) == Some(&b'/') => {
                while i < bytes.len()
                    && bytes[i] != b'\n'
                    && bytes[i] != b'\r'
                    && !(bytes[i] == 0xE2
                        && bytes.get(i + 1) == Some(&0x80)
                        && matches!(bytes.get(i + 2), Some(0xA8 | 0xA9)))
                {
                    i += 1;
                }
            }
            b'/' if bytes.get(i + 1) == Some(&b'*') => {
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i += 2;
            }
            _ => i += 1,
        }
    }
    None
}
