//! oxc's syntax errors as the document's diagnostics, with where acorn's expression ends for a
//! host whose parser is acorn.

pub use locator::Locator;
use locator::{Find, locate};
use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::Token;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

/// A syntax error, in oxc's words.
#[derive(Clone, Debug)]
pub struct SyntaxError {
    pub diagnostic: Diagnostic,
    /// Where acorn, which reads no TypeScript, ends the expression before the text oxc rejected:
    /// at a type assertion's keyword, or inside a number it reads shorter. A template goes on
    /// from there, and a program fails there with "Unexpected token".
    pub acorn_stops_at: Option<u32>,
    /// The number of tsc's diagnostic for it, when oxc gives one.
    pub typescript_code: Option<u32>,
    /// For a name declared twice, where the second declaration is, which oxc labels second.
    pub redeclared_at: Option<u32>,
    /// Where typescript-eslint throws it, when that is not where oxc labels it.
    pub typescript_eslint_at: Option<u32>,
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
            acorn_stops_at: None,
            typescript_code: None,
            redeclared_at: None,
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
        acorn_stops_at: acorn_stop(&error, text, (tokens, None), |_| {}).map(|at| at + shift),
        typescript_code: typescript_code(&error),
        redeclared_at: (typescript_code(&error) == Some(2300))
            .then(|| error.labels.get(1).map(|label| label.offset() + shift))
            .flatten(),
        typescript_eslint_at: None,
    }
}

/// The number of `error`'s tsc diagnostic.
pub(crate) fn typescript_code(error: &OxcDiagnostic) -> Option<u32> {
    if error.code.scope.as_deref() != Some("TS") {
        return None;
    }
    error.code.number.as_deref()?.parse().ok()
}

impl SyntaxError {
    /// Where the error is reported: where acorn stops, or where oxc labels it.
    #[must_use]
    pub const fn reported_at(&self) -> u32 {
        match self.acorn_stops_at {
            Some(at) => at,
            None => self.diagnostic.span.start_offset,
        }
    }
}

mod acorn_rejection;
pub(crate) use acorn_rejection::{acorn_stop, lexer_failure, reported, shorter_number};
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
