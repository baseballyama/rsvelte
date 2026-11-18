use crate::UPDATE_VARIABLE;

/// The part of libtest's command line that applies to cases.
pub(crate) struct Arguments {
    pub(crate) filters: Vec<String>,
    pub(crate) exact: bool,
    pub(crate) list: bool,
    pub(crate) update: bool,
}

/// Whether the variable is set to 1; unset is false, and any other value an error.
pub(crate) fn flag(name: &str) -> Result<bool, String> {
    match std::env::var(name) {
        Err(std::env::VarError::NotPresent) => Ok(false),
        Ok(v) if v == "1" => Ok(true),
        Ok(v) => Err(format!("{name}={v}: use 1 or leave it unset")),
        Err(e) => Err(format!("{name}: {e}")),
    }
}

impl Arguments {
    pub(crate) fn parse(arguments: impl Iterator<Item = String>) -> Result<Self, String> {
        let mut parsed = Self {
            filters: Vec::new(),
            exact: false,
            list: false,
            update: flag(UPDATE_VARIABLE)?,
        };
        for a in arguments {
            match a.as_str() {
                "--exact" => parsed.exact = true,
                "--list" => parsed.list = true,
                // Other libtest flags (`--nocapture`, `--test-threads`, ...) do not change which
                // cases run.
                _ if a.starts_with('-') => {}
                _ => parsed.filters.push(a),
            }
        }
        Ok(parsed)
    }

    pub(crate) fn selects(&self, name: &str) -> bool {
        self.filters.is_empty()
            || self.filters.iter().any(|f| {
                if self.exact {
                    name == f
                } else {
                    name.contains(f.as_str())
                }
            })
    }
}
