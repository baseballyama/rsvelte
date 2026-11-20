//! Diagnostics in upstream's shape: the message, then the link to the code's documentation.

use std::fmt::Display;

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

/// Upstream's error `code`.
#[cold]
pub fn error(code: &'static str, message: impl Display, span: Span) -> Diagnostic {
    Diagnostic::error(code, documented(code, message), span)
}

/// Upstream's warning `code`.
pub fn warning(code: &'static str, message: impl Display, span: Span) -> Diagnostic {
    Diagnostic::warning(code, documented(code, message), span)
}

fn documented(code: &str, message: impl Display) -> String {
    format!("{message}\nhttps://svelte.dev/e/{code}")
}
