use std::fmt::Debug;

#[derive(Debug, thiserror::Error)]
pub enum FormatError {
    #[error("svelte parse failed: {0}")]
    Parse(String),
    #[error("script parse failed: {0}")]
    ScriptParse(String),
    #[error("style formatter failed: {0}")]
    StyleFormat(String),
    #[error("json parse failed: {0}")]
    JsonParse(String),
}

impl FormatError {
    pub(crate) fn from_parse<E: Debug>(err: E) -> Self {
        FormatError::Parse(format!("{err:?}"))
    }

    /// Whether this error could be resolved by re-parsing as TypeScript.
    ///
    /// A plain `<script>` may contain TS, and its template expressions must
    /// then parse in the same dialect (#682). With the initial parse deferred,
    /// that failure surfaces here (from the script/expression oxc re-parse) as
    /// `ScriptParse`, so the formatter retries the whole file forcing TS exactly
    /// as the eager path used to. Deliberately excludes `Parse`: it carries only
    /// the svelte *markup* parse failure (dialect-independent) and internal
    /// "span out of bounds" invariants — neither is fixed by forcing TS, so
    /// retrying them would waste a second pass and shadow the real error.
    /// Style/JSON failures are dialect-independent too and never retried.
    pub(crate) fn is_dialect_sensitive(&self) -> bool {
        matches!(self, FormatError::ScriptParse(_))
    }
}
