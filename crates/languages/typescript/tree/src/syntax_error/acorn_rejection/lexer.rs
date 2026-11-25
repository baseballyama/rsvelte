//! What acorn reports where its lexer reads a token oxc's does not.

use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::{Kind, Token};
use rsvelte_kernel::source::characters::is_ecmascript_line_terminator;

use super::fails;
use crate::syntax_error::Acorn;

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

/// oxc's error for the characters right after a number, which it labels from the first of them.
const AFTER_NUMBER: &str = "Invalid characters after number";

/// What acorn reports for the characters oxc labels at `start..end` right after a number: an
/// identifier there, or digits its radix does not take, which end acorn's number and start one of
/// their own, failing at an identifier after them.
pub(super) fn after_number(
    error: &OxcDiagnostic,
    text: &str,
    start: u32,
    end: u32,
) -> Option<Acorn> {
    if error.message != AFTER_NUMBER {
        return None;
    }
    let label = text.get(start as usize..end as usize)?;
    let digits = label.bytes().take_while(u8::is_ascii_digit).count();
    Some(if digits < label.len() {
        fails(
            "Identifier directly after number",
            start + u32::try_from(digits).ok()?,
        )
    } else {
        Acorn::Stops(start)
    })
}
