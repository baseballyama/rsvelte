//! acorn's readers of an escape: `readHexChar`, `readCodePoint`, and the escapes of `readWord1`.

use oxc_syntax::identifier::{is_identifier_part, is_identifier_start};

use super::number::Failure;

const BAD_ESCAPE: &str = "Bad character escape sequence";

/// acorn's `readHexChar`: the value of the `length` hex digits at `at`, and where they end.
pub(super) fn hex_char(bytes: &[u8], at: usize, length: usize) -> Result<(u32, usize), Failure> {
    let digits = (bytes.get(at..at + length))
        .filter(|digits| !digits.is_empty() && digits.iter().all(u8::is_ascii_hexdigit));
    let value = digits.map(|digits| {
        (digits.iter()).fold(0_u32, |value, &digit| {
            let digit = char::from(digit).to_digit(16).unwrap_or_default();
            value.saturating_mul(16).saturating_add(digit)
        })
    });
    value
        .map(|value| (value, at + length))
        .ok_or((BAD_ESCAPE, at))
}

/// acorn's `readCodePoint`, after the `u` of an escape: the code point, and where the escape ends.
pub(super) fn code_point(bytes: &[u8], at: usize) -> Result<(u32, usize), Failure> {
    if bytes.get(at) != Some(&b'{') {
        return hex_char(bytes, at, 4);
    }
    let digits = at + 1;
    // acorn reads as far as the next `}` anywhere after the brace.
    let length = (bytes.get(digits..))
        .and_then(|rest| rest.iter().position(|&byte| byte == b'}'))
        .ok_or((BAD_ESCAPE, digits))?;
    let (code, end) = hex_char(bytes, digits, length)?;
    if code > 0x10_FFFF {
        return Err(("Code point out of bounds", digits));
    }
    Ok((code, end + 1))
}

/// What acorn's `readWord1` throws for an escape in the word at `at` of `text`, and where; `None`
/// for a word it reads.
pub(super) fn word(text: &str, mut at: usize) -> Option<Failure> {
    let bytes = text.as_bytes();
    let mut first = true;
    loop {
        let character = text.get(at..)?.chars().next()?;
        if is_identifier_part(character) {
            at += character.len_utf8();
        } else if character == '\\' {
            if bytes.get(at + 1) != Some(&b'u') {
                return Some(("Expecting Unicode escape sequence \\uXXXX", at + 1));
            }
            let (code, end) = match code_point(bytes, at + 2) {
                Ok(read) => read,
                Err(failure) => return Some(failure),
            };
            let names = |character| {
                if first {
                    is_identifier_start(character)
                } else {
                    is_identifier_part(character)
                }
            };
            if !char::from_u32(code).is_some_and(names) {
                return Some(("Invalid Unicode escape", at));
            }
            at = end;
        } else {
            return None;
        }
        first = false;
    }
}
