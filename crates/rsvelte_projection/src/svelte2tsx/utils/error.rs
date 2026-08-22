//! Error type for the svelte2tsx conversion — mirrors `src/utils/error.ts`.

#![deny(missing_docs)]

use std::fmt;

/// Error type for svelte2tsx conversion failures.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Svelte2TsxError {
    /// Failed to parse the Svelte source.
    Parse {
        /// Parser message with no parser implementation type attached.
        message: String,
        /// Half-open UTF-8 byte range in the original Svelte source.
        span: (usize, usize),
    },
    /// Failed during template processing.
    Template(String),
    /// Failed during script processing.
    Script(String),
    /// Generic error.
    Other(String),
}

impl fmt::Display for Svelte2TsxError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        // Upstream throws `new Error(message)`, so the variant name must not
        // reach anything that shows this string to a user.
        match self {
            Self::Parse { message, .. } => f.write_str(message),
            Self::Template(msg) | Self::Script(msg) | Self::Other(msg) => f.write_str(msg),
        }
    }
}

impl std::error::Error for Svelte2TsxError {}

impl From<crate::error::ParseError> for Svelte2TsxError {
    fn from(err: crate::error::ParseError) -> Self {
        let span = err.span();
        // Upstream re-throws the svelte compiler's own error, whose `message` is
        // the sentence plus the docs link — the code is a separate field there,
        // where `ParseError`'s `Display` folds it into the text.
        let message = match &err {
            crate::error::ParseError::SvelteError { code, message, .. } => {
                let docs_url = format!("\nhttps://svelte.dev/e/{code}");
                if message.ends_with(&docs_url) {
                    message.clone()
                } else {
                    format!("{message}{docs_url}")
                }
            }
            other => other.to_string(),
        };
        Self::Parse { message, span }
    }
}

impl Svelte2TsxError {
    /// Return a stable, projection-specific diagnostic code.
    #[must_use]
    pub const fn code(&self) -> &'static str {
        match self {
            Self::Parse { .. } => "projection_parse_error",
            Self::Template(_) => "projection_template_error",
            Self::Script(_) => "projection_script_error",
            Self::Other(_) => "projection_error",
        }
    }

    /// Return the `(start, end)` byte-offset span if the error has one.
    ///
    /// Currently only `Svelte2TsxError::Parse` carries position info — the
    /// `Template` / `Script` / `Other` variants are message-only so this
    /// returns `None` for them.
    #[must_use]
    pub const fn span(&self) -> Option<(usize, usize)> {
        match self {
            Self::Parse { span, .. } => Some(*span),
            _ => None,
        }
    }
}
