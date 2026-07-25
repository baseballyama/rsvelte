//! The `rsvelte.*` client settings this server honours.

use serde_json::Value;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Settings {
    pub format_enable: bool,
    pub lint_enable: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            format_enable: true,
            lint_enable: true,
        }
    }
}

impl Settings {
    /// Read the `rsvelte` configuration section a client returned. Anything
    /// missing or of the wrong type keeps its default.
    pub fn from_json(value: &Value) -> Self {
        let default = Self::default();
        Self {
            format_enable: enabled(value, "format").unwrap_or(default.format_enable),
            lint_enable: enabled(value, "lint").unwrap_or(default.lint_enable),
        }
    }
}

fn enabled(value: &Value, section: &str) -> Option<bool> {
    value.get(section)?.get("enable")?.as_bool()
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn reads_both_switches() {
        let s = Settings::from_json(&json!({
            "format": { "enable": false },
            "lint": { "enable": true }
        }));
        assert_eq!(
            s,
            Settings {
                format_enable: false,
                lint_enable: true
            }
        );
    }

    #[test]
    fn absent_and_malformed_sections_keep_the_defaults() {
        assert_eq!(Settings::from_json(&json!(null)), Settings::default());
        assert_eq!(
            Settings::from_json(&json!({ "format": "yes", "lint": { "enable": 1 } })),
            Settings::default()
        );
    }
}
