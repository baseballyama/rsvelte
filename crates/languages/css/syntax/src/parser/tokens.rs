//! Identifiers, escapes and strings, as Svelte reads them.

use rsvelte_kernel::source::positions::Span;

use super::{ParseError, Parser, R, selectors};

impl Parser<'_> {
    /// The length of the identifier character at `at`, or 0: Svelte reads ASCII letters, digits,
    /// `_`, `-` and any code point from U+00A0.
    pub(super) fn ident_char(&self, at: usize) -> usize {
        match self.b.get(at) {
            Some(c) if at < self.end && (c.is_ascii_alphanumeric() || matches!(c, b'_' | b'-')) => {
                1
            }
            Some(c) if at < self.end && *c >= 0x80 => self.source_text[at..]
                .chars()
                .next()
                .filter(|c| *c >= '\u{a0}')
                .map_or(0, char::len_utf8),
            _ => 0,
        }
    }

    /// Whether an identifier Svelte accepts starts at `at`.
    pub(super) fn starts_identifier(&self, at: usize) -> bool {
        let digit = at + usize::from(self.b.get(at) == Some(&b'-'));
        (self.b.get(at) == Some(&b'\\') || self.ident_char(at) > 0)
            && !self.b.get(digit).is_some_and(u8::is_ascii_digit)
    }

    /// Svelte's identifier, which is `css_expected_identifier` when empty or when it starts with
    /// a digit.
    pub(super) fn identifier(&mut self) -> R<Span> {
        let start = self.position;
        let digit = start + usize::from(self.peek() == Some(b'-'));
        if digit < self.end && self.b[digit].is_ascii_digit() {
            return Err(selectors::expected_identifier(start));
        }
        let name = self.ident();
        if name.is_empty() {
            return Err(selectors::expected_identifier(start));
        }
        Ok(name)
    }

    pub(super) fn ident(&mut self) -> Span {
        let start = self.position;
        let mut decoded = None::<String>;
        let mut plain = start;
        while let Some(byte) = self.peek() {
            if byte == b'\\' {
                let text = decoded.get_or_insert_with(String::new);
                text.push_str(&self.source_text[plain..self.position]);
                self.position += 1;
                text.push(self.escape());
                plain = self.position;
            } else {
                let length = self.ident_char(self.position);
                if length == 0 {
                    break;
                }
                self.position += length;
            }
        }
        let span = self.span(start);
        if let Some(mut text) = decoded {
            text.push_str(&self.source_text[plain..self.position]);
            self.escaped.insert(span, self.atoms.intern(&text));
        }
        span
    }

    fn escape(&mut self) -> char {
        let start = self.position;
        let mut value = 0;
        while self.position - start < 6 {
            let Some(digit) = self.peek().and_then(|b| char::from(b).to_digit(16)) else {
                break;
            };
            value = value * 16 + digit;
            self.position += 1;
        }
        if self.position > start {
            if self.peek().is_some_and(|b| b.is_ascii_whitespace()) {
                let cr = self.peek() == Some(b'\r');
                self.position += 1;
                if cr && self.peek() == Some(b'\n') {
                    self.position += 1;
                }
            }
            return char::from_u32(value).filter(|c| *c != '\0').unwrap_or('�');
        }
        let Some(c) = self.source_text[self.position..self.end].chars().next() else {
            return '�';
        };
        self.position += c.len_utf8();
        c
    }

    pub(super) fn string(&mut self) -> R<Span> {
        let start = self.position;
        let quote = self.peek().expect("a string starts with a quote");
        self.position += 1;
        let mut plain = self.position;
        let mut decoded = None::<String>;
        while let Some(byte) = self.peek() {
            if byte == quote {
                let end = self.position;
                self.position += 1;
                if let Some(mut text) = decoded {
                    text.push_str(&self.source_text[plain..end]);
                    let span = Span::new(start as u32 + 1, end as u32);
                    self.escaped.insert(span, self.atoms.intern(&text));
                }
                return Ok(self.span(start));
            }
            if byte == b'\\' {
                let text = decoded.get_or_insert_with(String::new);
                text.push_str(&self.source_text[plain..self.position]);
                self.position += 1;
                if self.peek() == Some(b'*') && self.b.get(self.position + 1) == Some(&b'/') {
                    self.comment_closers.push(Span::new(
                        self.position as u32 + 1,
                        self.position as u32 + 2,
                    ));
                }
                if matches!(self.peek(), Some(b'\n' | b'\r')) {
                    let cr = self.peek() == Some(b'\r');
                    self.position += 1;
                    if cr && self.peek() == Some(b'\n') {
                        self.position += 1;
                    }
                } else {
                    text.push(self.escape());
                }
                plain = self.position;
            } else {
                self.position += 1;
                if byte == b'*' && self.peek() == Some(b'/') {
                    self.comment_closers
                        .push(Span::new(self.position as u32, self.position as u32 + 1));
                }
            }
        }
        Err(ParseError {
            code: "unexpected_eof",
            message: "Unexpected end of input".to_owned(),
            span: Span::new(self.end as u32, self.end as u32),
        })
    }
}
