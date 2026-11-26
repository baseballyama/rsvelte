//! What acorn reports where its lexer reads a token oxc's does not.

use oxc_parser::{Kind, Token};
use oxc_syntax::identifier::is_identifier_start;
use rsvelte_kernel::source::characters::is_ecmascript_line_terminator;

use super::escape::{code_point, hex_char, word};
use super::fails;
use super::number::{Failure, read_at};
use crate::TypeScriptReader;
use crate::acorn_grammar::Rejection;
use crate::syntax_error::Acorn;

/// What acorn's lexer throws as it reads the token that starts at `start` in `text`, in strict
/// code, after `typescript` reads a TypeScript part, and where; `None` for what it reads, and for
/// what oxc's lexer rejects in its own words. A compiler that erases the types writes each number
/// again and keeps each string, and acorn-typescript reads `@`.
pub(crate) fn lexer_failure(
    text: &str,
    start: u32,
    typescript: Option<TypeScriptReader>,
) -> Option<(u32, Rejection)> {
    let rest = text.get(start as usize..)?;
    let failure: Failure = match *rest.as_bytes().first()? {
        quote @ (b'\'' | b'"') => {
            let (message, at) = octal_escape(rest, quote)?;
            (message, at + start as usize)
        }
        _ if typescript == Some(TypeScriptReader::Erasing) => return None,
        b'0'..=b'9' | b'.' => read_at(text, start as usize).err()?,
        b'@' if typescript.is_none() => return Some((start, Rejection::At)),
        b'#' => {
            let after = rest[1..].chars().next();
            if after == Some('\\') {
                let (message, at) = word(text, start as usize + 1)?;
                return Some((u32::try_from(at).ok()?, Rejection::Lexed(message)));
            }
            if after.is_some_and(is_identifier_start) {
                return None;
            }
            // acorn reads past the end of its input as U+10000.
            return Some((
                start + 1,
                Rejection::Character(after.unwrap_or('\u{10000}')),
            ));
        }
        b'\\' => word(text, start as usize)?,
        _ if rest.chars().next().is_some_and(is_identifier_start) => word(text, start as usize)?,
        _ => return None,
    };
    let (message, at) = failure;
    Some((u32::try_from(at).ok()?, Rejection::Lexed(message)))
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
            b'x' => match hex_char(bytes, at + 2, 2) {
                Ok((_, end)) => at = end,
                Err(failure) => return Some(failure),
            },
            b'u' => match code_point(bytes, at + 2) {
                Ok((_, end)) => at = end,
                Err(failure) => return Some(failure),
            },
            b'\r' if bytes.get(at + 2) == Some(&b'\n') => at += 3,
            _ => at += 2,
        }
    }
    None
}

/// Where acorn, which reads a `/` after a token of `tokens` that an expression may follow as a
/// regular expression, fails to read one at `start` in `text`; `None` when it reads one.
pub(super) fn regular_expression(
    text: &str,
    start: u32,
    tokens: impl Iterator<Item = Token>,
) -> Option<Acorn> {
    let before = tokens.take_while(|token| token.start() < start).last();
    let starts_expression = before.map(|token| token.kind()).is_none_or(|kind| {
        matches!(
            kind,
            Kind::LCurly
                | Kind::LParen
                | Kind::LBrack
                | Kind::Comma
                | Kind::Semicolon
                | Kind::Colon
                | Kind::Question
                | Kind::Arrow
        ) || kind.is_assignment_operator()
            || kind.is_binary_operator()
    });
    let body = text.get(start as usize..)?.strip_prefix('/')?;
    if !starts_expression {
        return None;
    }
    let unterminated = fails("Unterminated regular expression", start + 1);
    let (mut escaped, mut class) = (false, false);
    let mut end = None;
    for (at, character) in body.char_indices() {
        if is_ecmascript_line_terminator(character) {
            return Some(unterminated);
        }
        if escaped {
            escaped = false;
        } else if character == '[' {
            class = true;
        } else if character == ']' {
            class = false;
        } else if character == '/' && !class {
            end = Some(at + 1);
            break;
        } else {
            escaped = character == '\\';
        }
    }
    let Some(end) = end else {
        return Some(unterminated);
    };
    let flags = body.get(end..)?;
    let length = flags
        .find(|character: char| !(character.is_alphanumeric() || matches!(character, '_' | '$')))
        .unwrap_or(flags.len());
    let flags = &flags[..length];
    // acorn checks each flag in turn, against the valid ones and then the ones after it.
    let message = flags.char_indices().find_map(|(at, flag)| {
        if "dgimsuyv".contains(flag) {
            flags[at + 1..]
                .contains(flag)
                .then_some("Duplicate regular expression flag")
        } else {
            Some("Invalid regular expression flag")
        }
    });
    let both = flags.contains('u') && flags.contains('v');
    message
        .or_else(|| both.then_some("Invalid regular expression flag"))
        .map(|message| fails(message, start + 1))
}
