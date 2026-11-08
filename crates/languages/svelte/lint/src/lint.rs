use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::{Document, DocumentError};
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::Parsed;

use crate::Configuration;

/// # Errors
///
/// The source does not parse.
pub fn lint(
    context: &DocumentContext<'_>,
    configuration: &Configuration,
) -> Result<Vec<Diagnostic>, Diagnostic> {
    context.get::<Parsed>().as_ref().map_err(Clone::clone)?;
    Ok(crate::rules::execute(context, configuration.rules()))
}

/// Lints one source, as `ESLint`'s `Linter.verify(code, config, filename)` does with
/// `eslint-plugin-svelte`. `filename` is where rules that look at the path read it.
///
/// # Errors
///
/// The source does not parse, or is too long for 32-bit positions.
pub fn verify(
    source_text: &str,
    configuration: &Configuration,
    filename: &str,
) -> Result<Vec<Diagnostic>, Diagnostic> {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document = Document::new(filename.to_owned(), source_text.to_owned()).map_err(
        |DocumentError::TooLarge(n)| {
            Diagnostic::error(
                "svelte.lint.too_large",
                format!("the source is {n} bytes, too long for 32-bit positions"),
                Span::new(0, 0),
            )
        },
    )?;
    lint(
        &DocumentContext::new(&document, registry.artifacts()),
        configuration,
    )
}

#[cfg(test)]
mod tests;
