//! What acorn reports where it reads a number oxc does not.

use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::Token;
use oxc_syntax::identifier::is_identifier_start;

use super::fails;
use crate::syntax_error::Acorn;

/// oxc's message for a name or a digit right after a number.
const AFTER_NUMBER: &str = "Invalid characters after number";

/// Where acorn, having read `tokens`, fails in the number oxc's lexer rejects at `start`, or stops
/// after it.
pub(super) fn number(
    error: &OxcDiagnostic,
    text: &str,
    start: u32,
    tokens: impl Iterator<Item = Token>,
) -> Option<Acorn> {
    let before = tokens.take_while(|token| token.start() < start).last();
    let from = match before {
        Some(token) if token.end() >= start => token.start(),
        before => {
            // No whitespace and no comment ends in a character of a number.
            let gap = text.get(before.map_or(0, |token| token.end()) as usize..start as usize)?;
            let read = gap.trim_end_matches(|character: char| {
                character.is_ascii_alphanumeric() || matches!(character, '_' | '.' | '+' | '-')
            });
            let number = &gap[read.len()..];
            // The host reads the `...` of a spread attribute, so it is not a token.
            let number = number.strip_prefix("...").unwrap_or(number);
            start - u32::try_from(number.len()).ok()?
        }
    };
    let mut reader = Reader {
        text,
        at: from as usize,
    };
    if !reader.at_number() {
        return None;
    }
    let mut read = reader.read();
    if read.is_ok() && error.message == AFTER_NUMBER {
        let stop = u32::try_from(reader.at).ok()?;
        // acorn reads the token after the number before it stops there.
        if reader.at_number() {
            read = reader.read();
        }
        if read.is_ok() {
            return Some(Acorn::Stops(stop));
        }
    }
    let (message, at) = read.err()?;
    Some(fails(message, u32::try_from(at).ok()?))
}

/// What acorn throws, and where.
type Failure = (&'static str, usize);

/// acorn's reader of a number in `text`, as far as `at`.
struct Reader<'t> {
    text: &'t str,
    at: usize,
}

impl Reader<'_> {
    fn peek(&self) -> Option<u8> {
        self.text.as_bytes().get(self.at).copied()
    }

    fn eat(&mut self, accepted: &[u8]) -> bool {
        let eats = self.peek().is_some_and(|byte| accepted.contains(&byte));
        self.at += usize::from(eats);
        eats
    }

    /// Whether a number starts here.
    fn at_number(&self) -> bool {
        let rest = self.text.as_bytes().get(self.at..).unwrap_or_default();
        let digits = rest.strip_prefix(b".").unwrap_or(rest);
        digits.first().is_some_and(u8::is_ascii_digit)
    }

    /// acorn's `readRadixNumber` or `readNumber`.
    fn read(&mut self) -> Result<(), Failure> {
        let radix = match self.text.as_bytes().get(self.at..self.at + 2) {
            Some(b"0x" | b"0X") => Some((16, "Expected number in radix 16")),
            Some(b"0o" | b"0O") => Some((8, "Expected number in radix 8")),
            Some(b"0b" | b"0B") => Some((2, "Expected number in radix 2")),
            _ => None,
        };
        if let Some((radix, expected)) = radix {
            self.at += 2;
            let digits = self.at;
            if !self.integer(radix, false)? {
                return Err((expected, digits));
            }
            // acorn checks nothing after the `n` of one with a prefix.
            return if self.eat(b"n") { Ok(()) } else { self.end() };
        }
        self.decimal()
    }

    /// acorn's `readNumber`.
    fn decimal(&mut self) -> Result<(), Failure> {
        let start = self.at;
        let invalid = ("Invalid number", start);
        let dot = self.peek() == Some(b'.');
        if !dot {
            let zero = self.peek() == Some(b'0');
            self.integer(10, zero)?;
            if zero && self.at - start >= 2 {
                return Err(invalid);
            }
            if self.eat(b"n") {
                return self.end();
            }
        }
        if self.eat(b".") {
            self.integer(10, false)?;
        }
        if self.eat(b"eE") {
            self.eat(b"+-");
            if !self.integer(10, false)? {
                return Err(invalid);
            }
        }
        self.end()
    }

    /// acorn's `readInt`: whether there are digits of `radix`; `legacy_octal` when a leading zero
    /// allows no separator.
    fn integer(&mut self, radix: u32, legacy_octal: bool) -> Result<bool, Failure> {
        let start = self.at;
        let mut separator = false;
        while let Some(byte) = self.peek() {
            if byte == b'_' {
                let misplaced = if legacy_octal {
                    Some("Numeric separator is not allowed in legacy octal numeric literals")
                } else if separator {
                    Some("Numeric separator must be exactly one underscore")
                } else if self.at == start {
                    Some("Numeric separator is not allowed at the first of digits")
                } else {
                    None
                };
                if let Some(message) = misplaced {
                    return Err((message, self.at));
                }
            } else if !char::from(byte).is_digit(radix) {
                break;
            }
            separator = byte == b'_';
            self.at += 1;
        }
        if separator {
            return Err((
                "Numeric separator is not allowed at the last of digits",
                self.at - 1,
            ));
        }
        Ok(self.at > start)
    }

    /// The check that no name starts where the number ends.
    fn end(&self) -> Result<(), Failure> {
        let next = self
            .text
            .get(self.at..)
            .and_then(|rest| rest.chars().next());
        if next.is_some_and(is_identifier_start) {
            return Err(("Identifier directly after number", self.at));
        }
        Ok(())
    }
}
