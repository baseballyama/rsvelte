use std::fmt::Debug;

#[derive(Debug, thiserror::Error)]
pub enum FormatError {
    #[error("svelte parse failed: {0}")]
    Parse(String),
    #[error("script parse failed: {0}")]
    ScriptParse(String),
    #[error("style formatter failed: {0}")]
    StyleFormat(String),
}

impl FormatError {
    pub(crate) fn from_parse<E: Debug>(err: E) -> Self {
        FormatError::Parse(format!("{err:?}"))
    }
}
