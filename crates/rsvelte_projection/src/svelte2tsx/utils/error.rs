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
        match self {
            Svelte2TsxError::Parse { message, .. } => write!(f, "Parse error: {message}"),
            Svelte2TsxError::Template(msg) => write!(f, "Template error: {}", msg),
            Svelte2TsxError::Script(msg) => write!(f, "Script error: {}", msg),
            Svelte2TsxError::Other(msg) => write!(f, "svelte2tsx error: {}", msg),
        }
    }
}

impl std::error::Error for Svelte2TsxError {}

impl From<crate::error::ParseError> for Svelte2TsxError {
    fn from(err: crate::error::ParseError) -> Self {
        let span = err.span();
        Svelte2TsxError::Parse {
            message: err.to_string(),
            span,
        }
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
    pub fn span(&self) -> Option<(usize, usize)> {
        match self {
            Svelte2TsxError::Parse { span, .. } => Some(*span),
            _ => None,
        }
    }
}
