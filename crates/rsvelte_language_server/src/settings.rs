//! The `rsvelte.*` client settings this server honours.

use std::collections::HashMap;
use std::sync::Arc;

use serde_json::Value;

/// What a `compilerWarnings` entry does to the warning it names.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WarningLevel {
    Ignore,
    Error,
}

/// Per-code overrides for compiler warnings, mirroring the official
/// `svelte.plugin.svelte.compilerWarnings`. Shared so handing the map to the
/// worker costs a refcount.
pub type CompilerWarnings = Arc<HashMap<String, WarningLevel>>;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Settings {
    pub format_enable: bool,
    pub lint_enable: bool,
    pub completion_enable: bool,
    pub hover_enable: bool,
    pub folding_range_enable: bool,
    pub selection_range_enable: bool,
    pub document_symbol_enable: bool,
    pub compiler_warnings: CompilerWarnings,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            format_enable: true,
            lint_enable: true,
            completion_enable: true,
            hover_enable: true,
            folding_range_enable: true,
            selection_range_enable: true,
            document_symbol_enable: true,
            compiler_warnings: CompilerWarnings::default(),
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
            completion_enable: enabled(value, "completion").unwrap_or(default.completion_enable),
            hover_enable: enabled(value, "hover").unwrap_or(default.hover_enable),
            folding_range_enable: enabled(value, "foldingRange")
                .unwrap_or(default.folding_range_enable),
            selection_range_enable: enabled(value, "selectionRange")
                .unwrap_or(default.selection_range_enable),
            document_symbol_enable: enabled(value, "documentSymbol")
                .unwrap_or(default.document_symbol_enable),
            compiler_warnings: compiler_warnings(value),
        }
    }
}

fn enabled(value: &Value, section: &str) -> Option<bool> {
    value.get(section)?.get("enable")?.as_bool()
}

fn compiler_warnings(value: &Value) -> CompilerWarnings {
    let mut levels = HashMap::new();
    if let Some(entries) = value.get("compilerWarnings").and_then(Value::as_object) {
        for (code, level) in entries {
            let level = match level.as_str() {
                Some("ignore") => WarningLevel::Ignore,
                Some("error") => WarningLevel::Error,
                _ => continue,
            };
            levels.insert(code.clone(), level);
        }
    }
    Arc::new(levels)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn reads_every_switch() {
        let s = Settings::from_json(&json!({
            "format": { "enable": false },
            "lint": { "enable": true },
            "completion": { "enable": false },
            "hover": { "enable": false },
            "foldingRange": { "enable": false },
            "selectionRange": { "enable": true },
            "documentSymbol": { "enable": false }
        }));
        assert_eq!(
            s,
            Settings {
                format_enable: false,
                lint_enable: true,
                completion_enable: false,
                hover_enable: false,
                folding_range_enable: false,
                selection_range_enable: true,
                document_symbol_enable: false,
                compiler_warnings: CompilerWarnings::default(),
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

    #[test]
    fn reads_compiler_warning_levels() {
        let s = Settings::from_json(&json!({
            "compilerWarnings": {
                "a11y_missing_attribute": "ignore",
                "state_referenced_locally": "error",
                "css_unused_selector": "warning",
                "a11y_invalid_attribute": 1,
            }
        }));
        assert_eq!(
            s.compiler_warnings.get("a11y_missing_attribute"),
            Some(&WarningLevel::Ignore)
        );
        assert_eq!(
            s.compiler_warnings.get("state_referenced_locally"),
            Some(&WarningLevel::Error)
        );
        // Levels outside the two the official setting defines are dropped.
        assert_eq!(s.compiler_warnings.len(), 2);
    }
}
