//! Document formatting, run in process through `rsvelte_fmt`'s pipeline.

use std::collections::HashMap;
use std::path::{Path, PathBuf};

use anyhow::Result;
use oxc_formatter::QuoteStyle;
use rsvelte_fmt::FormatSession;
use rsvelte_formatter::{
    CssFormatOptions, CssSingleQuote, FormatOptions, LineWidth, SortOrderSpec,
    native_style_formatter,
};

use crate::settings::FormatConfig;

/// Formatting sessions keyed by document directory.
///
/// A session discovers the project `oxfmt` configuration, so it is reused by
/// documents in the same directory.
#[derive(Default)]
pub struct FormatSessions {
    by_dir: HashMap<PathBuf, FormatSession>,
}

impl FormatSessions {
    /// # Errors
    ///
    /// Returns an error when resolving the formatter configuration for `path` fails.
    pub fn get(&mut self, path: &Path) -> Result<&FormatSession> {
        let dir = path.parent().unwrap_or(Path::new(".")).to_path_buf();
        if !self.by_dir.contains_key(&dir) {
            self.by_dir
                .insert(dir.clone(), FormatSession::resolve(path)?);
        }
        Ok(&self.by_dir[&dir])
    }

    pub fn clear(&mut self) {
        self.by_dir.clear();
    }
}

/// Apply the VS Code Svelte formatter settings after project configuration.
/// Upstream ignores these defaults whenever a formatter config exists.
pub fn apply_editor_config(source: &str, path: &Path, config: &FormatConfig) -> Result<String> {
    if has_project_config(path) {
        return Ok(source.to_string());
    }
    let mut options = FormatOptions::default();
    if let Some(sort_order) = config.sort_order.as_deref()
        && let Some(sort_order) = SortOrderSpec::parse(sort_order)
    {
        options.sort_order = sort_order;
    }
    if let Some(allow_shorthand) = config.allow_shorthand {
        options.attributes.allow_shorthand = allow_shorthand;
    }
    if let Some(bracket_new_line) = config.bracket_new_line {
        options.bracket_same_line = !bracket_new_line;
    }
    if let Some(indent) = config.indent_script_and_style {
        options.indent_script_and_style = indent;
    }
    if let Some(width) = config.print_width
        && let Ok(width) = LineWidth::try_from(width)
    {
        options.js.line_width = width;
    }
    if let Some(single_quote) = config.single_quote {
        options.js.quote_style = if single_quote {
            QuoteStyle::Single
        } else {
            QuoteStyle::Double
        };
    }
    let mut css = CssFormatOptions::default();
    if let Some(single_quote) = config.single_quote {
        css.single_quote = CssSingleQuote::from(single_quote);
    }
    options.style_formatter = Some(native_style_formatter(css));
    Ok(rsvelte_formatter::format(source, &options)?)
}

fn has_project_config(path: &Path) -> bool {
    const NAMES: &[&str] = &[
        ".prettierrc",
        ".prettierrc.json",
        ".prettierrc.json5",
        ".prettierrc.yaml",
        ".prettierrc.yml",
        ".prettierrc.toml",
        ".prettierrc.js",
        ".prettierrc.cjs",
        ".prettierrc.mjs",
        ".prettierrc.ts",
        "prettier.config.js",
        "prettier.config.cjs",
        "prettier.config.mjs",
        "prettier.config.ts",
        ".oxfmtrc.json",
        ".oxfmtrc.jsonc",
        "oxfmt.config.ts",
        "oxfmt.config.mts",
    ];
    let mut directory = path.parent();
    while let Some(current) = directory {
        if NAMES.iter().any(|name| current.join(name).is_file()) {
            return true;
        }
        if current.join("package.json").is_file()
            && std::fs::read_to_string(current.join("package.json"))
                .ok()
                .and_then(|text| serde_json::from_str::<serde_json::Value>(&text).ok())
                .is_some_and(|package| package.get("prettier").is_some())
        {
            return true;
        }
        directory = current.parent();
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn applies_upstream_editor_defaults_without_a_project_config() {
        let config = FormatConfig {
            sort_order: None,
            strict_mode: None,
            allow_shorthand: Some(false),
            bracket_new_line: None,
            indent_script_and_style: None,
            print_width: None,
            single_quote: Some(true),
        };
        let output = apply_editor_config(
            "<script>let value = \"x\";</script><input value={value} />",
            Path::new("/tmp/no-project/App.svelte"),
            &config,
        )
        .unwrap();
        assert!(output.contains("'x'"));
        assert!(output.contains("value={value}"));
    }
}
