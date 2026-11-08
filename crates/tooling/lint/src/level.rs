use rsvelte_kernel::diagnostics::diagnostic::Severity;
use serde::Deserialize;

/// A rule's level in lint options, as `ESLint` writes it: `off`, `warn`, `error`, `0`, `1` or `2`.
#[derive(Debug, Deserialize)]
#[serde(untagged)]
pub enum Level {
    Name(String),
    Number(u8),
}

impl Level {
    /// `None` turns the rule off.
    ///
    /// # Errors
    ///
    /// The level is none of the six.
    pub fn severity(&self) -> Result<Option<Severity>, String> {
        match self {
            Self::Name(name) if name == "off" => Ok(None),
            Self::Name(name) if name == "warn" => Ok(Some(Severity::Warning)),
            Self::Name(name) if name == "error" => Ok(Some(Severity::Error)),
            Self::Number(0) => Ok(None),
            Self::Number(1) => Ok(Some(Severity::Warning)),
            Self::Number(2) => Ok(Some(Severity::Error)),
            _ => Err("rule severity must be off, warn, error, 0, 1 or 2".to_owned()),
        }
    }
}
