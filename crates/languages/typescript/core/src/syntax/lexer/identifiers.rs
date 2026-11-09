//! Unicode escapes in identifiers.

use super::{Lexer, R};

/// An identifier token's name, with its `\u` escapes decoded; the lexer has checked each escape.
#[must_use]
pub fn identifier_name(raw: &str) -> std::borrow::Cow<'_, str> {
    if !raw.contains('\\') {
        return std::borrow::Cow::Borrowed(raw);
    }
    let mut out = String::with_capacity(raw.len());
    let mut rest = raw;
    while let Some(at) = rest.find('\\') {
        out.push_str(&rest[..at]);
        let escape = rest.get(at + 2..).unwrap_or("");
        let (digits, after) = escape.strip_prefix('{').map_or_else(
            || escape.split_at(4.min(escape.len())),
            |braced| braced.split_once('}').unwrap_or((braced, "")),
        );
        out.extend(hex_value(digits.as_bytes()).and_then(char::from_u32));
        rest = after;
    }
    out.push_str(rest);
    std::borrow::Cow::Owned(out)
}

/// The value of hex digits, or `None` past `u32`.
fn hex_value(digits: &[u8]) -> Option<u32> {
    digits.iter().try_fold(0u32, |v, &d| {
        let d = char::from(d).to_digit(16)?;
        v.checked_mul(16)?.checked_add(d)
    })
}

impl Lexer<'_> {
    /// `\uXXXX` or `\u{X…}` in an identifier; [`identifier_name`] decodes it.
    pub(super) fn identifier_escape(&mut self) -> R<()> {
        let start_offset = self.position;
        if self.peek(1) != b'u' {
            return self.err("invalid escape in identifier", start_offset);
        }
        self.position += 2;
        let value = if self.peek(0) == b'{' {
            self.position += 1;
            let digits = self.position;
            while self.peek(0).is_ascii_hexdigit() {
                self.position += 1;
            }
            let value = hex_value(&self.source_text[digits..self.position]);
            if self.position == digits || self.peek(0) != b'}' {
                return self.err("invalid unicode escape in identifier", start_offset);
            }
            self.position += 1;
            value
        } else {
            let digits = self.position;
            while self.position < digits + 4 && self.peek(0).is_ascii_hexdigit() {
                self.position += 1;
            }
            if self.position != digits + 4 {
                return self.err("invalid unicode escape in identifier", start_offset);
            }
            hex_value(&self.source_text[digits..self.position])
        };
        if value.and_then(char::from_u32).is_none() {
            return self.err("invalid unicode escape in identifier", start_offset);
        }
        Ok(())
    }
}
