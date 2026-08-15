//! Editor settings understood by the language server.

use std::collections::HashMap;
use std::sync::Arc;

use serde_json::Value;

/// What a `compilerWarnings` entry does to the warning it names.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WarningLevel {
    Ignore,
    Error,
}

pub type CompilerWarnings = Arc<HashMap<String, WarningLevel>>;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FormatConfig {
    pub sort_order: Option<String>,
    pub strict_mode: Option<bool>,
    pub allow_shorthand: Option<bool>,
    pub bracket_new_line: Option<bool>,
    pub indent_script_and_style: Option<bool>,
    pub print_width: Option<u16>,
    pub single_quote: Option<bool>,
}

impl FormatConfig {
    fn from_json(value: Option<&Value>) -> Self {
        Self {
            sort_order: string(value, "svelteSortOrder"),
            strict_mode: boolean(value, "svelteStrictMode"),
            allow_shorthand: boolean(value, "svelteAllowShorthand"),
            bracket_new_line: boolean(value, "svelteBracketNewLine"),
            indent_script_and_style: boolean(value, "svelteIndentScriptAndStyle"),
            print_width: integer(value, "printWidth"),
            single_quote: boolean(value, "singleQuote"),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TypeScriptSettings {
    pub enable: bool,
    pub diagnostics: bool,
    pub hover: bool,
    pub document_symbols: bool,
    pub completions: bool,
    pub code_actions: bool,
    pub selection_range: bool,
    pub signature_help: bool,
    pub semantic_tokens: bool,
    pub workspace_symbols: bool,
}

impl Default for TypeScriptSettings {
    fn default() -> Self {
        Self {
            enable: true,
            diagnostics: true,
            hover: true,
            document_symbols: true,
            completions: true,
            code_actions: true,
            selection_range: true,
            signature_help: true,
            semantic_tokens: true,
            workspace_symbols: true,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CssSettings {
    pub enable: bool,
    pub globals: String,
    pub diagnostics: bool,
    pub hover: bool,
    pub completions: bool,
    pub emmet: bool,
    pub document_colors: bool,
    pub color_presentations: bool,
    pub document_symbols: bool,
    pub selection_range: bool,
}

impl Default for CssSettings {
    fn default() -> Self {
        Self {
            enable: true,
            globals: String::new(),
            diagnostics: true,
            hover: true,
            completions: true,
            emmet: true,
            document_colors: true,
            color_presentations: true,
            document_symbols: true,
            selection_range: true,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HtmlSettings {
    pub enable: bool,
    pub hover: bool,
    pub completions: bool,
    pub emmet: bool,
    pub tag_complete: bool,
    pub document_symbols: bool,
    pub linked_editing: bool,
}

impl Default for HtmlSettings {
    fn default() -> Self {
        Self {
            enable: true,
            hover: true,
            completions: true,
            emmet: true,
            tag_complete: true,
            document_symbols: true,
            linked_editing: true,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SvelteSettings {
    pub enable: bool,
    pub diagnostics: bool,
    pub format: bool,
    pub completions: bool,
    pub hover: bool,
    pub code_actions: bool,
    pub selection_range: bool,
    pub rename: bool,
    pub runes_legacy_mode_code_lens: bool,
    pub default_script_language: String,
    pub document_highlight: bool,
}

impl Default for SvelteSettings {
    fn default() -> Self {
        Self {
            enable: true,
            diagnostics: true,
            format: true,
            completions: true,
            hover: true,
            code_actions: true,
            selection_range: true,
            rename: true,
            runes_legacy_mode_code_lens: true,
            default_script_language: "none".to_string(),
            document_highlight: true,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Settings {
    pub format_enable: bool,
    pub lint_enable: bool,
    pub completion_enable: bool,
    pub hover_enable: bool,
    pub folding_range_enable: bool,
    pub selection_range_enable: bool,
    pub document_symbol_enable: bool,
    pub runes_legacy_mode_code_lens_enable: bool,
    pub preprocess_enable: bool,
    pub compiler_warnings: CompilerWarnings,
    pub format_config: FormatConfig,
    pub typescript: TypeScriptSettings,
    pub css: CssSettings,
    pub html: HtmlSettings,
    pub svelte: SvelteSettings,
}

impl Default for Settings {
    fn default() -> Self {
        let typescript = TypeScriptSettings::default();
        let css = CssSettings::default();
        let html = HtmlSettings::default();
        let svelte = SvelteSettings::default();
        let mut settings = Self {
            format_enable: true,
            lint_enable: true,
            completion_enable: true,
            hover_enable: true,
            folding_range_enable: true,
            selection_range_enable: true,
            document_symbol_enable: true,
            runes_legacy_mode_code_lens_enable: true,
            preprocess_enable: true,
            compiler_warnings: CompilerWarnings::default(),
            format_config: FormatConfig::from_json(None),
            typescript,
            css,
            html,
            svelte,
        };
        settings.recompute();
        settings
    }
}

impl Settings {
    /// Read the legacy `rsvelte` section by itself.
    #[must_use]
    pub fn from_json(value: &Value) -> Self {
        Self::from_sections(value, &Value::Null)
    }

    /// Merge official `svelte.plugin.*` settings with the legacy `rsvelte.*`
    /// master switches, which remain additional gates.
    #[must_use]
    pub fn from_sections(rsvelte: &Value, official: &Value) -> Self {
        let mut settings = Self::default();
        settings.apply_official(official);
        settings.apply_rsvelte(rsvelte);
        settings.recompute();
        settings
    }

    #[must_use]
    pub fn native_completion_enabled(&self) -> bool {
        self.svelte.enable && self.svelte.completions
            || self.html.enable && self.html.completions
            || self.css.enable && self.css.completions
    }

    #[must_use]
    pub fn native_hover_enabled(&self) -> bool {
        self.svelte.enable && self.svelte.hover
            || self.html.enable && self.html.hover
            || self.css.enable && self.css.hover
    }

    #[must_use]
    pub fn tsgo_method_enabled(&self, method: &str) -> bool {
        match method {
            "textDocument/completion" | "completionItem/resolve" => {
                self.typescript.enable && self.typescript.completions
            }
            "textDocument/hover" => self.typescript.enable && self.typescript.hover,
            "textDocument/documentSymbol" => {
                self.typescript.enable && self.typescript.document_symbols
            }
            "textDocument/codeAction" => self.typescript.enable && self.typescript.code_actions,
            "textDocument/selectionRange" => {
                self.typescript.enable && self.typescript.selection_range
            }
            "textDocument/signatureHelp" => {
                self.typescript.enable && self.typescript.signature_help
            }
            "textDocument/semanticTokens/full" | "textDocument/semanticTokens/range" => {
                self.typescript.enable && self.typescript.semantic_tokens
            }
            "workspace/symbol" | "workspaceSymbol/resolve" => {
                self.typescript.enable && self.typescript.workspace_symbols
            }
            "textDocument/diagnostic" => self.typescript.enable && self.typescript.diagnostics,
            _ => true,
        }
    }

    fn apply_official(&mut self, value: &Value) {
        let plugin = value.get("plugin").unwrap_or(value);
        if let Some(value) = plugin.get("typescript") {
            apply_switch(&mut self.typescript.enable, value, "enable");
            apply_feature(&mut self.typescript.diagnostics, value, "diagnostics");
            apply_feature(&mut self.typescript.hover, value, "hover");
            apply_feature(
                &mut self.typescript.document_symbols,
                value,
                "documentSymbols",
            );
            apply_feature(&mut self.typescript.completions, value, "completions");
            apply_feature(&mut self.typescript.code_actions, value, "codeActions");
            apply_feature(
                &mut self.typescript.selection_range,
                value,
                "selectionRange",
            );
            apply_feature(&mut self.typescript.signature_help, value, "signatureHelp");
            apply_feature(
                &mut self.typescript.semantic_tokens,
                value,
                "semanticTokens",
            );
            apply_feature(
                &mut self.typescript.workspace_symbols,
                value,
                "workspaceSymbols",
            );
        }
        if let Some(value) = plugin.get("css") {
            apply_switch(&mut self.css.enable, value, "enable");
            if let Some(globals) = value.get("globals").and_then(Value::as_str) {
                self.css.globals = globals.to_string();
            }
            apply_feature(&mut self.css.diagnostics, value, "diagnostics");
            apply_feature(&mut self.css.hover, value, "hover");
            apply_feature(&mut self.css.completions, value, "completions");
            if let Some(emmet) = value.pointer("/completions/emmet").and_then(Value::as_bool) {
                self.css.emmet = emmet;
            }
            apply_feature(&mut self.css.document_colors, value, "documentColors");
            apply_feature(
                &mut self.css.color_presentations,
                value,
                "colorPresentations",
            );
            apply_feature(&mut self.css.document_symbols, value, "documentSymbols");
            apply_feature(&mut self.css.selection_range, value, "selectionRange");
        }
        if let Some(value) = plugin.get("html") {
            apply_switch(&mut self.html.enable, value, "enable");
            apply_feature(&mut self.html.hover, value, "hover");
            apply_feature(&mut self.html.completions, value, "completions");
            if let Some(emmet) = value.pointer("/completions/emmet").and_then(Value::as_bool) {
                self.html.emmet = emmet;
            }
            apply_feature(&mut self.html.tag_complete, value, "tagComplete");
            apply_feature(&mut self.html.document_symbols, value, "documentSymbols");
            apply_feature(&mut self.html.linked_editing, value, "linkedEditing");
        }
        if let Some(value) = plugin.get("svelte") {
            apply_switch(&mut self.svelte.enable, value, "enable");
            apply_feature(&mut self.svelte.diagnostics, value, "diagnostics");
            apply_feature(&mut self.svelte.format, value, "format");
            apply_feature(&mut self.svelte.completions, value, "completions");
            apply_feature(&mut self.svelte.hover, value, "hover");
            apply_feature(&mut self.svelte.code_actions, value, "codeActions");
            apply_feature(&mut self.svelte.selection_range, value, "selectionRange");
            apply_feature(&mut self.svelte.rename, value, "rename");
            apply_feature(
                &mut self.svelte.runes_legacy_mode_code_lens,
                value,
                "runesLegacyModeCodeLens",
            );
            apply_feature(
                &mut self.svelte.document_highlight,
                value,
                "documentHighlight",
            );
            if let Some(language) = value
                .get("defaultScriptLanguage")
                .and_then(Value::as_str)
                .filter(|language| matches!(*language, "none" | "ts"))
            {
                self.svelte.default_script_language = language.to_string();
            }
            self.compiler_warnings = compiler_warnings(value);
            self.format_config = FormatConfig::from_json(value.pointer("/format/config"));
        }
    }

    fn apply_rsvelte(&mut self, value: &Value) {
        override_bool(&mut self.format_enable, enabled(value, "format"));
        override_bool(&mut self.lint_enable, enabled(value, "lint"));
        override_bool(&mut self.completion_enable, enabled(value, "completion"));
        override_bool(&mut self.hover_enable, enabled(value, "hover"));
        override_bool(
            &mut self.folding_range_enable,
            enabled(value, "foldingRange"),
        );
        override_bool(
            &mut self.selection_range_enable,
            enabled(value, "selectionRange"),
        );
        override_bool(
            &mut self.document_symbol_enable,
            enabled(value, "documentSymbol"),
        );
        override_bool(
            &mut self.runes_legacy_mode_code_lens_enable,
            enabled(value, "runesLegacyModeCodeLens"),
        );
        override_bool(&mut self.preprocess_enable, enabled(value, "preprocess"));
        if value.get("compilerWarnings").is_some() {
            self.compiler_warnings = compiler_warnings(value);
        }
    }

    fn recompute(&mut self) {
        self.format_enable &= self.svelte.enable && self.svelte.format;
        self.lint_enable &= self.svelte.enable && self.svelte.diagnostics
            || self.css.enable && self.css.diagnostics;
        self.completion_enable &= self.native_completion_enabled()
            || self.typescript.enable && self.typescript.completions;
        self.hover_enable &=
            self.native_hover_enabled() || self.typescript.enable && self.typescript.hover;
        self.selection_range_enable &= self.svelte.enable && self.svelte.selection_range
            || self.css.enable && self.css.selection_range
            || self.typescript.enable && self.typescript.selection_range;
        self.document_symbol_enable &= self.svelte.enable
            || self.html.enable && self.html.document_symbols
            || self.css.enable && self.css.document_symbols
            || self.typescript.enable && self.typescript.document_symbols;
        self.runes_legacy_mode_code_lens_enable &=
            self.svelte.enable && self.svelte.runes_legacy_mode_code_lens;
    }
}

fn enabled(value: &Value, section: &str) -> Option<bool> {
    value.get(section)?.get("enable")?.as_bool()
}

fn apply_switch(target: &mut bool, value: &Value, key: &str) {
    if let Some(enabled) = value.get(key).and_then(Value::as_bool) {
        *target = enabled;
    }
}

fn apply_feature(target: &mut bool, value: &Value, key: &str) {
    if let Some(enabled) = value
        .pointer(&format!("/{key}/enable"))
        .and_then(Value::as_bool)
    {
        *target = enabled;
    }
}

fn override_bool(target: &mut bool, value: Option<bool>) {
    if let Some(value) = value {
        *target = value;
    }
}

fn boolean(value: Option<&Value>, key: &str) -> Option<bool> {
    value?.get(key)?.as_bool()
}

fn string(value: Option<&Value>, key: &str) -> Option<String> {
    value?.get(key)?.as_str().map(str::to_string)
}

fn integer(value: Option<&Value>, key: &str) -> Option<u16> {
    u16::try_from(value?.get(key)?.as_u64()?).ok()
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
    fn reads_legacy_switches() {
        let settings = Settings::from_json(&json!({
            "format": { "enable": false },
            "lint": { "enable": true },
            "completion": { "enable": false },
            "hover": { "enable": false },
            "foldingRange": { "enable": false },
            "selectionRange": { "enable": true },
            "documentSymbol": { "enable": false },
            "runesLegacyModeCodeLens": { "enable": true },
            "preprocess": { "enable": false }
        }));
        assert!(!settings.format_enable);
        assert!(settings.lint_enable);
        assert!(!settings.completion_enable);
        assert!(!settings.hover_enable);
        assert!(!settings.folding_range_enable);
        assert!(settings.selection_range_enable);
        assert!(!settings.document_symbol_enable);
        assert!(settings.runes_legacy_mode_code_lens_enable);
        assert!(!settings.preprocess_enable);
    }

    #[test]
    fn reads_all_official_plugin_groups_and_format_options() {
        let settings = Settings::from_sections(
            &Value::Null,
            &json!({ "plugin": {
                "typescript": {
                    "enable": true, "diagnostics": {"enable": false},
                    "hover": {"enable": false}, "documentSymbols": {"enable": false},
                    "completions": {"enable": false}, "codeActions": {"enable": false},
                    "selectionRange": {"enable": false}, "signatureHelp": {"enable": false},
                    "semanticTokens": {"enable": false}, "workspaceSymbols": {"enable": false}
                },
                "css": {
                    "enable": true, "globals": "src/global.css", "diagnostics": {"enable": false},
                    "hover": {"enable": false}, "completions": {"enable": false, "emmet": false},
                    "documentColors": {"enable": false}, "colorPresentations": {"enable": false},
                    "documentSymbols": {"enable": false}, "selectionRange": {"enable": false}
                },
                "html": {
                    "enable": true, "hover": {"enable": false},
                    "completions": {"enable": false, "emmet": false},
                    "tagComplete": {"enable": false}, "documentSymbols": {"enable": false},
                    "linkedEditing": {"enable": false}
                },
                "svelte": {
                    "enable": true, "diagnostics": {"enable": false},
                    "format": {"enable": false, "config": {
                        "svelteSortOrder": "scripts-markup-styles-options",
                        "svelteStrictMode": true, "svelteAllowShorthand": false,
                        "svelteBracketNewLine": false, "svelteIndentScriptAndStyle": false,
                        "printWidth": 100, "singleQuote": true
                    }},
                    "completions": {"enable": false}, "hover": {"enable": false},
                    "codeActions": {"enable": false}, "selectionRange": {"enable": false},
                    "rename": {"enable": false}, "runesLegacyModeCodeLens": {"enable": false},
                    "defaultScriptLanguage": "ts", "documentHighlight": {"enable": false},
                    "compilerWarnings": {"a11y_missing_attribute": "ignore"}
                }
            }}),
        );
        assert!(!settings.typescript.diagnostics);
        assert!(!settings.typescript.semantic_tokens);
        assert_eq!(settings.css.globals, "src/global.css");
        assert!(!settings.css.emmet);
        assert!(!settings.html.tag_complete);
        assert!(!settings.html.linked_editing);
        assert!(!settings.svelte.rename);
        assert_eq!(settings.svelte.default_script_language, "ts");
        assert_eq!(settings.format_config.print_width, Some(100));
        assert_eq!(settings.format_config.single_quote, Some(true));
        assert_eq!(
            settings.compiler_warnings.get("a11y_missing_attribute"),
            Some(&WarningLevel::Ignore)
        );
    }

    #[test]
    fn legacy_switches_can_further_disable_official_features() {
        let settings = Settings::from_sections(
            &json!({ "format": {"enable": true}, "completion": {"enable": false} }),
            &json!({ "plugin": {
                "svelte": {"format": {"enable": false}},
                "typescript": {"completions": {"enable": true}}
            }}),
        );
        // A plugin-level disable remains authoritative; the legacy setting
        // cannot re-enable an upstream feature that is itself off.
        assert!(!settings.format_enable);
        assert!(!settings.completion_enable);
    }

    #[test]
    fn malformed_sections_keep_defaults_and_warning_levels_are_filtered() {
        assert_eq!(Settings::from_json(&json!(null)), Settings::default());
        let settings = Settings::from_json(&json!({
            "compilerWarnings": {
                "a11y_missing_attribute": "ignore",
                "state_referenced_locally": "error",
                "css_unused_selector": "warning"
            }
        }));
        assert_eq!(settings.compiler_warnings.len(), 2);
    }
}
