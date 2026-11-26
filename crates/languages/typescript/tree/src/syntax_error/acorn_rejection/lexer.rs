//! What acorn reports where its lexer reads a token oxc's does not.

use oxc_syntax::identifier::is_identifier_start;

use super::number::{Failure, read_at};
use crate::TypeScriptReader;
use crate::acorn_grammar::Rejection;

/// Why acorn's lexer rejects the token that starts at `start` in `text`, in strict code, after
/// `typescript` reads a TypeScript part; `None` for what it reads, and for what oxc's lexer
/// rejects itself. A compiler that erases the types writes each number again and keeps each
/// string, and acorn-typescript reads `@`.
pub(crate) fn lexer_failure(
    text: &str,
    start: u32,
    typescript: Option<TypeScriptReader>,
) -> Option<Rejection> {
    let rest = text.get(start as usize..)?;
    let (message, _) = match *rest.as_bytes().first()? {
        quote @ (b'\'' | b'"') => octal_escape(rest, quote)?,
        _ if typescript == Some(TypeScriptReader::Erasing) => return None,
        b'0'..=b'9' | b'.' => read_at(text, start as usize).err()?,
        b'@' if typescript.is_none() => return Some(Rejection::At),
        b'#' => {
            let after = rest[1..].chars().next();
            if after.is_some_and(|c| is_identifier_start(c) || c == '\\') {
                return None;
            }
            // acorn reads past the end of its input as U+10000.
            return Some(Rejection::Character(after.unwrap_or('\u{10000}')));
        }
        _ => return None,
    };
    Some(Rejection::Lexed(message))
}

/// The length of a valid `\x` or `\u` escape whose letter starts `escape`, its `\` included.
fn hex_escape(escape: &[u8]) -> Option<usize> {
    let hex = |digits: &[u8]| digits.iter().all(u8::is_ascii_hexdigit);
    match escape {
        [b'x', digits @ ..] if digits.len() >= 2 && hex(&digits[..2]) => Some(4),
        [b'u', b'{', rest @ ..] => {
            let close = rest.iter().position(|&b| b == b'}')?;
            let digits = std::str::from_utf8(&rest[..close]).ok()?;
            let valid =
                !digits.is_empty() && u32::from_str_radix(digits, 16).is_ok_and(|v| v <= 0x10_FFFF);
            valid.then_some(close + 4)
        }
        [b'u', digits @ ..] if digits.len() >= 4 && hex(&digits[..4]) => Some(6),
        _ => None,
    }
}

/// acorn's `readEscapedChar` in strict code over the string literal `raw` starts, opened by
/// `quote`, as far as its first escape that strict code forbids; `None` at its end, and at an
/// escape oxc's lexer rejects too.
fn octal_escape(raw: &str, quote: u8) -> Option<Failure> {
    let bytes = raw.as_bytes();
    let mut at = 1;
    while at < bytes.len() {
        if bytes[at] == quote || matches!(bytes[at], b'\n' | b'\r') {
            return None;
        }
        if bytes[at] != b'\\' {
            at += 1;
            continue;
        }
        let escaped = *bytes.get(at + 1)?;
        match escaped {
            b'8' | b'9' => return Some(("Invalid escape sequence", at + 1)),
            b'0'..=b'7' => {
                let digits = bytes[at + 1..]
                    .iter()
                    .take(3)
                    .take_while(|b| (b'0'..=b'7').contains(b));
                let mut length = digits.count();
                let value = |length: usize| {
                    raw[at + 1..at + 1 + length]
                        .bytes()
                        .fold(0, |v, b| v * 8 + u32::from(b - b'0'))
                };
                if value(length) > 255 {
                    length -= 1;
                }
                let next = bytes.get(at + 1 + length).copied();
                if escaped != b'0' || length > 1 || matches!(next, Some(b'8' | b'9')) {
                    return Some(("Octal literal in strict mode", at));
                }
                at += 1 + length;
            }
            b'x' | b'u' => at += hex_escape(&bytes[at + 1..])?,
            b'\r' if bytes.get(at + 2) == Some(&b'\n') => at += 3,
            _ => at += 2,
        }
    }
    None
}
