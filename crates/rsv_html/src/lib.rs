//! What the HTML-based languages (Svelte, Vue) share. Each language still ports its own tool's
//! lists where they differ (the void elements of Svelte's parser and Vue's are not the same list);
//! what lives here is what both read the same way.

use std::borrow::Cow;

/// The value of a text node or attribute chunk: character references decoded.
#[must_use]
pub fn decode_text(raw: &str) -> Cow<'_, str> {
    if !raw.contains('&') {
        return Cow::Borrowed(raw);
    }
    let mut out = String::with_capacity(raw.len());
    let mut rest = raw;
    while let Some(i) = rest.find('&') {
        out.push_str(&rest[..i]);
        rest = &rest[i..];
        if let Some((c, len)) = decode_reference(rest) {
            out.push(c);
            rest = &rest[len..];
        } else {
            out.push('&');
            rest = &rest[1..];
        }
    }
    out.push_str(rest);
    Cow::Owned(out)
}

/// Named references beyond these are not decoded yet (they stay as written).
const NAMED: &[(&str, char)] = &[
    ("amp", '&'),
    ("lt", '<'),
    ("gt", '>'),
    ("quot", '"'),
    ("apos", '\''),
    ("nbsp", '\u{a0}'),
];

fn decode_reference(s: &str) -> Option<(char, usize)> {
    let end = s.find(';')?;
    let body = &s[1..end];
    let c = if let Some(num) = body.strip_prefix('#') {
        let code = match num.strip_prefix(['x', 'X']) {
            Some(hex) => u32::from_str_radix(hex, 16).ok()?,
            None => num.parse().ok()?,
        };
        char::from_u32(code)?
    } else {
        NAMED.iter().find(|(n, _)| *n == body)?.1
    };
    Some((c, end + 1))
}
