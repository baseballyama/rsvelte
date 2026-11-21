//! Diagnostics in upstream's shape: the message, then the link to the code's documentation.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

/// Upstream's error `code`.
#[cold]
pub fn error(code: &'static str, message: impl AsRef<str>, span: Span) -> Diagnostic {
    Diagnostic::error(code, documented(code, message.as_ref()), span)
}

/// Upstream's warning `code`.
pub fn warning(code: &'static str, message: impl AsRef<str>, span: Span) -> Diagnostic {
    Diagnostic::warning(code, documented(code, message.as_ref()), span)
}

fn documented(code: &str, message: &str) -> String {
    [message, "\nhttps://svelte.dev/e/", code].concat()
}
