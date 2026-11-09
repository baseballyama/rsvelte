//! Character references (`&amp;`, `&#38;`, `&#x26;`), decoded the way a language's own parser
//! decodes them. The names are HTML's; [`Rules`] is what Svelte and Vue do differently.

use std::borrow::Cow;

/// Sorted by name: the name without its semicolon, the code point, a second code point (0 for
/// none) and whether the name is also recognized without a semicolon.
static NAMED: &[(&str, u32, u32, bool)] = &include!("vendor/entities.rs");
/// The longest name, and the longest one recognized without a semicolon.
const NAME_BYTES: usize = 31;
const LEGACY_NAME_BYTES: usize = 6;
/// What 128..=159 stand for, as browsers read them.
const WINDOWS_1252: [u32; 32] = [
    8364, 129, 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352, 8249, 338, 141, 381, 143, 144,
    8216, 8217, 8220, 8221, 8226, 8211, 8212, 732, 8482, 353, 8250, 339, 157, 382, 376,
];

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Place {
    Text,
    /// An attribute value, where a name without its semicolon is not a reference when a letter,
    /// a digit or `=` follows it.
    Attribute,
}

/// Whose parser the result must match.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Rules {
    /// Svelte's `decode_character_references`: a name decodes to one code point, `&#10;` in text
    /// to a space, a zero number stays as written and a number outside its planes to NUL; `_`
    /// also stops a name without a semicolon in an attribute.
    Svelte,
    /// The HTML parsing spec, which Vue's template parser follows: a zero, surrogate or
    /// out-of-range number decodes to U+FFFD.
    Html,
}

/// `text` with its references decoded by Svelte's rules for text.
#[must_use]
pub fn decode_text(text: &str) -> Cow<'_, str> {
    decode(text, Place::Text, Rules::Svelte)
}

/// `text` with its references decoded by Svelte's rules for an attribute value.
#[must_use]
pub fn decode_attribute(text: &str) -> Cow<'_, str> {
    decode(text, Place::Attribute, Rules::Svelte)
}

#[must_use]
pub fn decode(text: &str, place: Place, rules: Rules) -> Cow<'_, str> {
    let mut output = None;
    let mut copied = 0;
    let mut from = 0;
    while let Some(offset) = text[from..].find('&') {
        let start = from + offset;
        let Some((length, decoded)) = reference(&text[start + 1..], place, rules) else {
            from = start + 1;
            continue;
        };
        let output = output.get_or_insert_with(|| String::with_capacity(text.len()));
        output.push_str(&text[copied..start]);
        output.extend(decoded.into_iter().flatten());
        copied = start + 1 + length;
        from = copied;
    }
    output.map_or(Cow::Borrowed(text), |mut output: String| {
        output.push_str(&text[copied..]);
        Cow::Owned(output)
    })
}

/// The bytes after `&` that form a reference, and what it decodes to.
fn reference(text: &str, place: Place, rules: Rules) -> Option<(usize, [Option<char>; 2])> {
    if let Some(number) = text.strip_prefix('#') {
        let (length, code) = numeric(number)?;
        return Some((1 + length, [Some(code_point(code, place, rules)?), None]));
    }
    let bytes = text.as_bytes();
    let run = bytes
        .iter()
        .take(NAME_BYTES + 1)
        .take_while(|byte| byte.is_ascii_alphanumeric())
        .count();
    if bytes.get(run) == Some(&b';')
        && let Some(row) = named(&text[..run])
    {
        return Some((run + 1, characters(row, place, rules)));
    }
    // Without a semicolon only a legacy name counts, and the longest one that matches wins.
    for length in (1..=run.min(LEGACY_NAME_BYTES)).rev() {
        let Some(row) = named(&text[..length]).filter(|row| row.3) else {
            continue;
        };
        let next = bytes.get(length).copied();
        let stops = |byte: u8| {
            byte.is_ascii_alphanumeric() || byte == b'=' || (rules == Rules::Svelte && byte == b'_')
        };
        if place == Place::Attribute && next.is_some_and(stops) {
            continue;
        }
        return Some((length, characters(row, place, rules)));
    }
    None
}

fn named(name: &str) -> Option<&'static (&'static str, u32, u32, bool)> {
    NAMED
        .binary_search_by(|row| row.0.cmp(name))
        .ok()
        .map(|index| &NAMED[index])
}

fn characters(
    &(_, first, second, _): &(&str, u32, u32, bool),
    place: Place,
    rules: Rules,
) -> [Option<char>; 2] {
    match rules {
        // Svelte checks a named reference's code point as it checks a number (`&NewLine;`).
        Rules::Svelte => [code_point(first, place, rules), None],
        Rules::Html => [first, second].map(|code| char::from_u32(code).filter(|_| code != 0)),
    }
}

/// The bytes of `&#…` after `#`, and its number (saturated when it overflows).
fn numeric(number: &str) -> Option<(usize, u32)> {
    let (digits, radix, prefix) = number
        .strip_prefix(['x', 'X'])
        .map_or((number, 10, 0), |digits| (digits, 16, 1));
    let mut length = 0;
    let mut code = 0_u32;
    for byte in digits.bytes() {
        let Some(digit) = char::from(byte).to_digit(radix) else {
            break;
        };
        code = code.saturating_mul(radix).saturating_add(digit);
        length += 1;
    }
    let semicolon = usize::from(digits.as_bytes().get(length) == Some(&b';'));
    (length > 0).then_some((prefix + length + semicolon, code))
}

/// What a numeric reference decodes to; `None` leaves it as written.
fn code_point(code: u32, place: Place, rules: Rules) -> Option<char> {
    let windows = |code: u32| WINDOWS_1252[(code - 128) as usize];
    let code = match rules {
        Rules::Svelte => match code {
            0 => return None,
            10 if place == Place::Text => 32,
            1..=127 | 160..=55_295 | 57_344..=196_607 | 917_504..=917_631 | 917_760..=917_999 => {
                code
            }
            128..=159 => windows(code),
            _ => 0,
        },
        Rules::Html => match code {
            0 => 0xFFFD,
            128..=159 => windows(code),
            _ => code,
        },
    };
    Some(char::from_u32(code).unwrap_or('\u{FFFD}'))
}

#[cfg(test)]
mod tests;
