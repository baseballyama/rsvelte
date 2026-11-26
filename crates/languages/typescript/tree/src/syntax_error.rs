//! oxc's syntax errors as the document's diagnostics, keeping what acorn reports for each, for a
//! host that reports as acorn does.

use std::borrow::Cow;

pub use locator::Locator;
use locator::{Find, locate};
use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::Token;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

/// A syntax error, and what acorn reports for it when oxc's code says.
#[derive(Clone, Debug)]
pub struct SyntaxError {
    pub diagnostic: Diagnostic,
    pub acorn: Option<Acorn>,
    /// The number of tsc's diagnostic for it, when oxc gives one.
    pub typescript_code: Option<u32>,
    /// Where typescript-eslint throws it, when that is not where oxc labels it.
    pub typescript_eslint_at: Option<u32>,
}

/// What acorn, which knows no TypeScript, does with the text oxc rejected.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Acorn {
    /// Its expression ends before `at`, where TypeScript-only syntax or a token acorn reads apart
    /// starts; a program fails there with "Unexpected token".
    Stops(u32),
    /// It fails at `at` with `message`.
    Fails { message: Cow<'static, str>, at: u32 },
    /// It fails at `at` with `message` once it has read on to `raised`: a check of a function's
    /// parameters, which acorn makes at the start of its block body or the end of its expression
    /// body.
    FailsLater {
        message: Cow<'static, str>,
        at: u32,
        raised: u32,
    },
}

impl From<SyntaxError> for Diagnostic {
    fn from(error: SyntaxError) -> Self {
        error.diagnostic
    }
}

/// The first error, at the place oxc labels `shift` bytes later, or at `fallback` when it labels
/// none. `text` is what oxc read, which the labels index, and `tokens` what it read of it.
pub fn syntax_error(
    errors: impl IntoIterator<Item = OxcDiagnostic>,
    text: &str,
    tokens: &[Token],
    fallback: u32,
    shift: u32,
) -> SyntaxError {
    let fallback = fallback + shift;
    let Some(error) = errors.into_iter().next() else {
        return SyntaxError {
            diagnostic: Diagnostic::error(
                "parse_error",
                "invalid syntax",
                Span::new(fallback, fallback),
            ),
            acorn: None,
            typescript_code: None,
            typescript_eslint_at: None,
        };
    };
    let span = error.labels.first().map_or_else(
        || Span::new(fallback, fallback),
        |label| {
            let start = label.offset() + shift;
            Span::new(start, start + label.len())
        },
    );
    SyntaxError {
        diagnostic: Diagnostic::error("parse_error", error.message.to_string(), span),
        acorn: acorn(&error, text, (tokens, None), |_| {}).map(|acorn| acorn.shifted(shift)),
        typescript_code: typescript_code(&error),
        typescript_eslint_at: None,
    }
}

/// [`syntax_error`] for an error of the analysis of a whole document, whose nodes `visit` hands
/// to [`Locator::enter`] in the order they were walked.
pub fn analysis_error(
    error: &OxcDiagnostic,
    text: &str,
    visit: impl FnOnce(&mut Locator),
) -> SyntaxError {
    let mut syntax_error = syntax_error([error.clone()], text, &[], 0, 0);
    syntax_error.acorn = acorn(error, text, (&[], None), visit);
    syntax_error
}

/// The number of `error`'s tsc diagnostic.
pub(crate) fn typescript_code(error: &OxcDiagnostic) -> Option<u32> {
    if error.code.scope.as_deref() != Some("TS") {
        return None;
    }
    error.code.number.as_deref()?.parse().ok()
}

impl SyntaxError {
    /// Where acorn reports this error: where it stops, or oxc's place when its code does not say.
    #[must_use]
    pub const fn acorn_at(&self) -> u32 {
        match self.acorn {
            Some(Acorn::Stops(at) | Acorn::Fails { at, .. } | Acorn::FailsLater { at, .. }) => at,
            None => self.diagnostic.span.start_offset,
        }
    }

    /// How far acorn has read when it raises this error, which orders the errors it meets.
    #[must_use]
    pub const fn acorn_raised_at(&self) -> u32 {
        match self.acorn {
            Some(Acorn::FailsLater { raised, .. }) => raised,
            _ => self.acorn_at(),
        }
    }
}

impl Acorn {
    pub(crate) fn shifted(self, shift: u32) -> Self {
        match self {
            Self::Stops(at) => Self::Stops(at + shift),
            Self::Fails { message, at } => Self::Fails {
                message,
                at: at + shift,
            },
            Self::FailsLater {
                message,
                at,
                raised,
            } => Self::FailsLater {
                message,
                at: at + shift,
                raised: raised + shift,
            },
        }
    }
}

mod acorn_rejection;
pub(crate) use acorn_rejection::{acorn, lexer_failure, reported, shorter_number};
mod locator;
mod readers;
mod unreserved;
pub(crate) use unreserved::{Unreserved, UnreservedWords};
mod typescript_eslint;
mod word;

pub use readers::{Reader, babel_typescript_throws, function_as_body, typescript_estree_throws};
pub(crate) use typescript_eslint::typescript_eslint_at;
pub use typescript_eslint::{
    TYPESCRIPT_ESLINT_UNCHECKED, typescript_eslint_check, typescript_eslint_error,
};

#[cfg(test)]
mod tests;
