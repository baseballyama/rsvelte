use rsvelte_kernel::source::characters::is_ecmascript_whitespace;

#[cfg(test)]
mod tests;

/// The length of the whitespace that starts `text`, as upstream's `is_whitespace` (`/\s/`) reads
/// it.
pub(super) fn whitespace_len(text: &str) -> usize {
    text.len() - trim_whitespace_start(text).len()
}

pub(super) fn trim_whitespace_start(text: &str) -> &str {
    // Most whitespace is ASCII, which needs no decoding.
    let ascii = text
        .bytes()
        .position(|b| !is_ascii_ecmascript_whitespace(b))
        .unwrap_or(text.len());
    let rest = &text[ascii..];
    if rest.as_bytes().first().is_none_or(u8::is_ascii) {
        return rest;
    }
    rest.trim_start_matches(is_ecmascript_whitespace)
}

/// The ASCII characters of [`is_ecmascript_whitespace`].
pub(super) const fn is_ascii_ecmascript_whitespace(b: u8) -> bool {
    matches!(b, b'\t' | b'\n' | 0x0B | 0x0C | b'\r' | b' ')
}
