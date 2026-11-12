//! Display columns as Prettier's `getStringWidth` counts them.

use rsvelte_kernel::source::characters::is_ecmascript_whitespace;

/// Prettier's `getStringWidth`.
///
/// An emoji sequence its emoji regex matches counts 2. Of the rest, control characters,
/// combining marks (U+0300–U+036F) and variation selectors count 0, the characters Prettier
/// counts as wide 2, and the others 1.
#[inline]
#[must_use]
pub fn string_width(s: &str) -> usize {
    if is_printable_ascii(s) {
        return s.len();
    }
    let mut width = 0;
    let mut rest = s;
    while let Some(c) = rest.chars().next() {
        if let Some(length) = emoji_sequence(rest) {
            width += 2;
            rest = &rest[length..];
            continue;
        }
        width += match u32::from(c) {
            0..=0x1F | 0x7F..=0x9F | 0x300..=0x36F | 0xFE00..=0xFE0F => 0,
            _ if is_wide(c) => 2,
            _ => 1,
        };
        rest = &rest[c.len_utf8()..];
    }
    width
}

/// Whether `s` holds an emoji sequence that oxc's printer, which measures text with
/// `unicode-width`, measures otherwise than [`string_width`]: each run without spaces that holds
/// one is compared.
#[must_use]
pub fn emoji_measured_otherwise(s: &str) -> bool {
    if is_printable_ascii(s) {
        return false;
    }
    s.split(is_ecmascript_whitespace).any(|run| {
        let mut previous = None;
        let emoji = run.char_indices().any(|(i, c)| {
            let next = run[i + c.len_utf8()..].chars().next();
            // A zero width joiner between other characters is a format character, not an emoji.
            let joiner =
                c == '\u{200D}' && (previous.is_some_and(is_wide) || next.is_some_and(is_wide));
            previous = Some(c);
            joiner
                || matches!(u32::from(c), 0xFE0F | 0x1F3FB..=0x1F3FF | 0xE0020..=0xE007F)
                || emoji_sequence(&run[i..]).is_some()
        });
        emoji
            && string_width(run)
                != oxc_formatter_core::text_width(run, oxc_formatter_core::IndentWidth::default())
                    as usize
    })
}

/// The length of the longest emoji sequence of more than one character that `s` starts with.
/// The regex never takes a shorter sequence where a longer one matches, so this is its match.
fn emoji_sequence(s: &str) -> Option<usize> {
    let first = &s[..s.chars().next()?.len_utf8()];
    let start = emoji::SEQUENCES.partition_point(|q| *q < first);
    emoji::SEQUENCES[start..]
        .iter()
        .take_while(|q| q.starts_with(first))
        .filter(|q| s.starts_with(**q))
        .map(|q| q.len())
        .max()
}

/// Whether Prettier counts `c` alone as two columns.
fn is_wide(c: char) -> bool {
    let c = u32::from(c);
    wide::WIDE
        .binary_search_by(|&(start, end)| {
            if end < c {
                std::cmp::Ordering::Less
            } else if start > c {
                std::cmp::Ordering::Greater
            } else {
                std::cmp::Ordering::Equal
            }
        })
        .is_ok()
}

/// Every byte is in `' '..='\x7F'`, Prettier's fast path, so the width is the length.
#[inline]
pub(crate) fn is_printable_ascii(s: &str) -> bool {
    // No early exit, so the loop vectorizes; non-ASCII text is rare.
    s.bytes()
        .fold(true, |ascii, b| ascii & (b.wrapping_sub(b' ') < 96))
}

#[cfg(test)]
mod tests;

mod emoji;
mod wide;
