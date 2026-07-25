//! Lint configuration discovery and the lint pass itself.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use rsvelte_core::CompileOptions;
use rsvelte_core::svelte_check::diagnostic::Diagnostic;
use rsvelte_lint::{LintConfig, lint_source};

/// Config file names, in the order a directory is probed. The first two are
/// `rsvelte-lint`'s own; an ESLint flat config is the fallback, imported for
/// its `svelte/*` severities so a project that only configures ESLint still
/// gets the rules it asked for.
const CONFIG_NAMES: &[&str] = &["rsvelte-lint.json", ".rsvelte-lintrc.json"];
const ESLINT_CONFIG_NAMES: &[&str] = &[
    "eslint.config.js",
    "eslint.config.mjs",
    "eslint.config.cjs",
    "eslint.config.ts",
    "eslint.config.mts",
];

/// Resolved lint configs, keyed by the directory discovery started from.
/// Discovery walks to the filesystem root, so it is cached rather than redone
/// on every keystroke.
#[derive(Default)]
pub struct LintConfigCache {
    by_dir: HashMap<PathBuf, Arc<LintConfig>>,
}

impl LintConfigCache {
    /// The config governing a document, discovered upward from its directory.
    pub fn get(&mut self, dir: &Path) -> Arc<LintConfig> {
        if let Some(config) = self.by_dir.get(dir) {
            return Arc::clone(config);
        }
        let config = Arc::new(discover(dir).unwrap_or_else(LintConfig::recommended));
        self.by_dir.insert(dir.to_path_buf(), Arc::clone(&config));
        config
    }

    pub fn clear(&mut self) {
        self.by_dir.clear();
    }
}

/// Walk up from `start` for the nearest lint config. An unreadable or invalid
/// config yields `None`, falling back to the recommended preset — a config
/// error must not leave the editor without diagnostics.
fn discover(start: &Path) -> Option<LintConfig> {
    let mut dir = Some(start);
    while let Some(d) = dir {
        for name in CONFIG_NAMES {
            let candidate = d.join(name);
            if candidate.is_file() {
                return std::fs::read_to_string(&candidate)
                    .ok()
                    .and_then(|text| LintConfig::from_json_str(&text).ok());
            }
        }
        for name in ESLINT_CONFIG_NAMES {
            let candidate = d.join(name);
            if candidate.is_file() {
                return std::fs::read_to_string(&candidate).ok().map(from_eslint);
            }
        }
        dir = d.parent();
    }
    None
}

fn from_eslint(text: String) -> LintConfig {
    let mut config = LintConfig::recommended();
    for (rule, severity) in rsvelte_lint::eslint_import::import_svelte_rules(&text) {
        config = config.with_override(rule, severity);
    }
    config
}

/// Lint one open document. Suppression comments (`<!-- svelte-ignore -->`,
/// `eslint-disable`) and inline rule config are applied inside `lint_source`.
pub fn lint(path: &Path, source: &str, config: &LintConfig) -> Vec<Diagnostic> {
    let options = CompileOptions {
        filename: Some(path.display().to_string()),
        ..Default::default()
    };
    lint_source(source, path, &options, config)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn suppression_comments_are_honoured() {
        let path = PathBuf::from("App.svelte");
        let config = LintConfig::recommended();
        let source = "<div>{@html x}</div>";
        assert!(!lint(&path, source, &config).is_empty());

        let suppressed =
            "<!-- eslint-disable-next-line svelte/no-at-html-tags -->\n<div>{@html x}</div>";
        let codes: Vec<_> = lint(&path, suppressed, &config)
            .into_iter()
            .filter_map(|d| d.code)
            .collect();
        assert!(!codes.iter().any(|c| c == "svelte/no-at-html-tags"));
    }

    #[test]
    fn a_config_file_turns_a_rule_off() {
        let dir = std::env::temp_dir().join(format!(
            "rsvelte-ls-lint-config-{}-{:?}",
            std::process::id(),
            std::thread::current().id()
        ));
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(
            dir.join("rsvelte-lint.json"),
            r#"{ "rules": { "svelte/no-at-html-tags": "off" } }"#,
        )
        .unwrap();

        let mut cache = LintConfigCache::default();
        let config = cache.get(&dir);
        let codes: Vec<_> = lint(&dir.join("App.svelte"), "<div>{@html x}</div>", &config)
            .into_iter()
            .filter_map(|d| d.code)
            .collect();
        assert!(!codes.iter().any(|c| c == "svelte/no-at-html-tags"));

        std::fs::remove_dir_all(&dir).ok();
    }
}
