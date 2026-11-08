//! Terminal-style display columns used for line fitting.

use unicode_width::UnicodeWidthStr as UnicodeWidthString;

/// Returns the display columns occupied by `s` under Unicode width rules.
#[inline]
#[must_use]
pub fn string_width(s: &str) -> usize {
    if is_printable_ascii(s) {
        return s.len();
    }
    s.width()
}

/// Every byte is in `' '..='~'`, so the width is the length.
#[inline]
pub(crate) fn is_printable_ascii(s: &str) -> bool {
    // No early exit, so the loop vectorizes; non-ASCII text is rare.
    s.bytes()
        .fold(true, |ascii, b| ascii & (b.wrapping_sub(b' ') < 95))
}

#[cfg(test)]
mod tests;
