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
    /// that failure surfaces here (from the script/expression re-parse) rather
    /// than at parse time, so the formatter retries the whole file forcing TS
    /// exactly as the eager path used to. Style/JSON failures are dialect-
    /// independent and never retried.
    pub(crate) fn is_dialect_sensitive(&self) -> bool {
        matches!(self, FormatError::Parse(_) | FormatError::ScriptParse(_))
    }
}
