//! Error type for the svelte2tsx conversion — mirrors `src/utils/error.ts`.

use std::fmt;

/// Error type for svelte2tsx conversion failures.
#[derive(Debug)]
pub enum Svelte2TsxError {
    /// Failed to parse the Svelte source.
    Parse(crate::error::ParseError),
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
            Svelte2TsxError::Parse(e) => write!(f, "Parse error: {:?}", e),
            Svelte2TsxError::Template(msg) => write!(f, "Template error: {}", msg),
            Svelte2TsxError::Script(msg) => write!(f, "Script error: {}", msg),
            Svelte2TsxError::Other(msg) => write!(f, "svelte2tsx error: {}", msg),
        }
    }
}

impl std::error::Error for Svelte2TsxError {}

impl From<crate::error::ParseError> for Svelte2TsxError {
    fn from(err: crate::error::ParseError) -> Self {
        Svelte2TsxError::Parse(err)
    }
}

impl Svelte2TsxError {
    /// Return the `(start, end)` byte-offset span if the error has one.
    ///
    /// Currently only `Svelte2TsxError::Parse` carries position info — the
    /// `Template` / `Script` / `Other` variants are message-only so this
    /// returns `None` for them.
    pub fn span(&self) -> Option<(usize, usize)> {
        match self {
            Svelte2TsxError::Parse(e) => Some(e.span()),
            _ => None,
        }
    }
}
