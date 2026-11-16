//! What acorn reports where its lexer reads a token oxc's does not.

use oxc_parser::{Kind, Token};

use super::{Acorn, fails};

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
        if matches!(character, '\r' | '\n' | '\u{2028}' | '\u{2029}') {
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
