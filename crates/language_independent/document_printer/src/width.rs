//! Display columns as Prettier's `getStringWidth` counts them.

/// Prettier's `getStringWidth`.
///
/// Control characters, combining marks (U+0300–U+036F) and variation selectors count 0, East
/// Asian wide and fullwidth characters 2, the rest 1, and an emoji sequence it recognizes 2.
/// Sequences this function cannot tell apart are named by [`has_emoji_sequence`].
#[inline]
#[must_use]
pub fn string_width(s: &str) -> usize {
    if is_printable_ascii(s) {
        return s.len();
    }
    let mut width = 0;
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        let next = chars.peek().copied();
        // A keycap, a flag, or a text-style emoji made colorful: one emoji, two columns.
        if is_keycap_base(c) && matches!(next, Some('\u{FE0F}' | '\u{20E3}')) {
            let mut rest = chars.clone();
            rest.next_if_eq(&'\u{FE0F}');
            if rest.next_if_eq(&'\u{20E3}').is_some() {
                chars = rest;
                width += 2;
                continue;
            }
        }
        if is_regional_indicator(c) && next.is_some_and(is_regional_indicator) {
            chars.next();
            width += 2;
            continue;
        }
        if is_narrow_emoji(c) && next == Some('\u{FE0F}') {
            chars.next();
            width += 2;
            continue;
        }
        width += match u32::from(c) {
            0..=0x1F | 0x7F..=0x9F | 0x300..=0x36F | 0xFE00..=0xFE0F => 0,
            _ if is_wide(c) => 2,
            _ => 1,
        };
    }
    width
}

/// Whether `s` holds an emoji sequence [`string_width`] may count otherwise than Prettier.
///
/// These are a skin tone, a tag, a zero width joiner beside an emoji, or a variation selector 16
/// after a character whose emoji form is not known here.
#[must_use]
pub fn has_emoji_sequence(s: &str) -> bool {
    if is_printable_ascii(s) {
        return false;
    }
    let mut previous: Option<char> = None;
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        let next = chars.peek().copied();
        let emoji = |c: Option<char>| c.is_some_and(|c| is_wide(c) || is_narrow_emoji(c));
        let uncertain = match u32::from(c) {
            0x1F3FB..=0x1F3FF | 0xE0020..=0xE007F => true,
            0x200D => emoji(previous) || emoji(next),
            0xFE0F => {
                !previous.is_some_and(|p| is_wide(p) || is_narrow_emoji(p) || is_keycap_base(p))
            }
            _ => false,
        };
        if uncertain {
            return true;
        }
        previous = Some(c);
    }
    false
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

const fn is_keycap_base(c: char) -> bool {
    matches!(c, '0'..='9' | '#' | '*')
}

const fn is_regional_indicator(c: char) -> bool {
    matches!(c, '\u{1F1E6}'..='\u{1F1FF}')
}

/// Prettier's `narrowEmojiRegexp`, its characters in the Basic Multilingual Plane: text-style
/// emoji whose `U+FE0F` form is an emoji.
const fn is_narrow_emoji(c: char) -> bool {
    matches!(
        c,
        '\u{A9}' | '\u{AE}' | '\u{203C}' | '\u{2049}' | '\u{2122}' | '\u{2139}'
            | '\u{2194}'..='\u{2199}' | '\u{21A9}' | '\u{21AA}' | '\u{2328}' | '\u{23CF}'
            | '\u{23ED}'..='\u{23EF}' | '\u{23F1}' | '\u{23F2}' | '\u{23F8}'..='\u{23FA}'
            | '\u{24C2}' | '\u{25AA}' | '\u{25AB}' | '\u{25B6}' | '\u{25C0}' | '\u{25FB}'
            | '\u{25FC}' | '\u{2600}'..='\u{2604}' | '\u{260E}' | '\u{2611}' | '\u{2618}'
            | '\u{2620}' | '\u{2622}' | '\u{2623}' | '\u{2626}' | '\u{262A}' | '\u{262E}'
            | '\u{262F}' | '\u{2638}'..='\u{263A}' | '\u{2640}' | '\u{2642}' | '\u{265F}'
            | '\u{2660}' | '\u{2663}' | '\u{2665}' | '\u{2666}' | '\u{2668}' | '\u{267B}'
            | '\u{267E}' | '\u{2692}' | '\u{2694}'..='\u{2697}' | '\u{2699}' | '\u{269B}'
            | '\u{269C}' | '\u{26A0}' | '\u{26A7}' | '\u{26B0}' | '\u{26B1}' | '\u{26C8}'
            | '\u{26CF}' | '\u{26D1}' | '\u{26D3}' | '\u{26E9}' | '\u{26F0}' | '\u{26F1}'
            | '\u{26F4}' | '\u{26F7}' | '\u{26F8}' | '\u{2702}' | '\u{2708}' | '\u{2709}'
            | '\u{270F}' | '\u{2712}' | '\u{2714}' | '\u{2716}' | '\u{271D}' | '\u{2721}'
            | '\u{2733}' | '\u{2734}' | '\u{2744}' | '\u{2747}' | '\u{2763}' | '\u{2764}'
            | '\u{27A1}' | '\u{2934}' | '\u{2935}' | '\u{2B05}'..='\u{2B07}'
    )
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

mod wide;
