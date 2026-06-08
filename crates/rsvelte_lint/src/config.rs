//! Lint configuration.
//!
//! A config layers three things on top of each rule's `default_severity`:
//!
//! 1. **Per-rule severity overrides** (`off`/`warn`/`error`), keyed by rule id
//!    (or by a bare compiler code for validator-wrapped findings).
//! 2. **Per-rule options** — an arbitrary JSON value handed to the rule via
//!    [`LintContext`](crate::context::LintContext) (design doc §C course
//!    correction: many target rules are option-driven).
//! 3. **`files`/`ignores` globs** and an **`extends`** preset selector.
//!
//! A config can be authored programmatically (the `with_*` builders) or loaded
//! from a JSON file (`rsvelte-lint.json` / `.rsvelte-lintrc.json`) via
//! [`LintConfig::from_json_str`]. The resolution contract used by
//! [`LintContext`](crate::context::LintContext) never changes — only the inputs
//! grow.

use std::collections::HashMap;

use serde_json::Value;

use crate::rule::{RuleMeta, Severity};

/// Built-in preset names accepted in `extends`.
const PRESET_NONE: &[&str] = &["none", "off", "empty"];

/// Resolved configuration for a lint run.
#[derive(Debug, Clone, Default)]
pub struct LintConfig {
    /// Severity overrides keyed by rule id. Absent → use the rule's default.
    overrides: HashMap<String, Severity>,
    /// Per-rule options (the JSON value after the severity in `["warn", {…}]`).
    options: HashMap<String, Value>,
    /// When true, every rule not explicitly overridden is `Off`. Selected by
    /// `extends: ["none"]`; defaults to false (recommended preset).
    all_off_by_default: bool,
    /// Glob patterns selecting which files to lint. Empty → lint every
    /// candidate the caller passes in.
    files: Vec<String>,
    /// Glob patterns excluding files from linting. Takes precedence over
    /// `files`.
    ignores: Vec<String>,
}

impl LintConfig {
    /// The recommended preset: every rule runs at its declared default
    /// severity unless explicitly overridden.
    pub fn recommended() -> Self {
        Self::default()
    }

    /// Start from a baseline where nothing runs unless explicitly enabled.
    pub fn empty() -> Self {
        Self {
            all_off_by_default: true,
            ..Self::default()
        }
    }

    /// Override a single rule's severity. Chainable.
    pub fn with_override(mut self, rule: impl Into<String>, severity: Severity) -> Self {
        self.overrides.insert(rule.into(), severity);
        self
    }

    /// Attach options for a rule. Chainable.
    pub fn with_options(mut self, rule: impl Into<String>, options: Value) -> Self {
        self.options.insert(rule.into(), options);
        self
    }

    /// Resolve the effective severity for a native rule (default comes from its
    /// [`RuleMeta`]).
    pub fn severity_for(&self, meta: &RuleMeta) -> Severity {
        self.resolve_code(meta.name, meta.default_severity)
    }

    /// Resolve the effective severity for a bare code/id with a known `base`
    /// severity (used by the validator wrap, where compiler warning/error codes
    /// have no [`RuleMeta`]).
    pub fn resolve_code(&self, code: &str, base: Severity) -> Severity {
        if let Some(&s) = self.overrides.get(code) {
            return s;
        }
        if self.all_off_by_default {
            Severity::Off
        } else {
            base
        }
    }

    /// The configured options for a rule, if any.
    pub fn options_for(&self, rule: &str) -> Option<&Value> {
        self.options.get(rule)
    }

    /// Whether a relative path (forward-slash separated) should be linted under
    /// this config's `files`/`ignores` globs. An empty `files` list matches
    /// every candidate; any `ignores` match excludes it.
    pub fn should_lint(&self, rel_path: &str) -> bool {
        let path = rel_path.replace('\\', "/");
        if self.ignores.iter().any(|g| glob_match(g, &path)) {
            return false;
        }
        self.files.is_empty() || self.files.iter().any(|g| glob_match(g, &path))
    }

    /// Whether this config restricts the file set at all (so the CLI knows to
    /// apply `should_lint`).
    pub fn has_file_filters(&self) -> bool {
        !self.files.is_empty() || !self.ignores.is_empty()
    }

    /// Parse a JSON config document.
    ///
    /// Shape:
    /// ```json
    /// {
    ///   "extends": ["recommended"],
    ///   "rules": {
    ///     "svelte/no-at-html-tags": "error",
    ///     "svelte/button-has-type": ["warn", { "submit": true, "reset": false }]
    ///   },
    ///   "files": ["src/**/*.svelte"],
    ///   "ignores": ["**/generated/**"]
    /// }
    /// ```
    /// A rule value is either a severity scalar (`"off"`/`"warn"`/`"error"` or
    /// `0`/`1`/`2`) or a `[severity, options]` pair.
    pub fn from_json_str(s: &str) -> anyhow::Result<Self> {
        let root: Value = serde_json::from_str(s)?;
        let obj = root
            .as_object()
            .ok_or_else(|| anyhow::anyhow!("lint config must be a JSON object"))?;

        // `extends` selects the baseline preset.
        let mut config = if let Some(Value::Array(exts)) = obj.get("extends") {
            if exts
                .iter()
                .filter_map(|e| e.as_str())
                .any(|e| PRESET_NONE.contains(&e))
            {
                LintConfig::empty()
            } else {
                LintConfig::recommended()
            }
        } else {
            LintConfig::recommended()
        };

        if let Some(Value::Object(rules)) = obj.get("rules") {
            for (name, value) in rules {
                if let Some(sev) = severity_from_value(value) {
                    config.overrides.insert(name.clone(), sev);
                }
                if let Some(opts) = options_from_value(value) {
                    config.options.insert(name.clone(), opts);
                }
            }
        }

        config.files = string_array(obj.get("files"));
        config.ignores = string_array(obj.get("ignores"));

        Ok(config)
    }
}

/// Read a severity from a rule value: a scalar or the first element of a
/// `[severity, options]` array.
fn severity_from_value(v: &Value) -> Option<Severity> {
    match v {
        Value::String(s) => Severity::parse(s),
        Value::Number(n) => n.as_i64().and_then(|i| Severity::parse(&i.to_string())),
        Value::Array(a) => a.first().and_then(severity_from_value),
        _ => None,
    }
}

/// Read the options from a `[severity, ...options]` rule value. ESLint rule
/// options are variadic, so everything after the severity is kept as an array
/// (most rules use just `options[0]`).
fn options_from_value(v: &Value) -> Option<Value> {
    match v {
        Value::Array(a) if a.len() >= 2 => Some(Value::Array(a[1..].to_vec())),
        _ => None,
    }
}

fn string_array(v: Option<&Value>) -> Vec<String> {
    match v {
        Some(Value::Array(a)) => a
            .iter()
            .filter_map(|e| e.as_str().map(str::to_string))
            .collect(),
        _ => Vec::new(),
    }
}

/// A small gitignore-flavoured glob matcher over `/`-separated paths.
///
/// `**` matches zero or more path segments; `*` matches any run of characters
/// within a single segment; `?` matches a single non-`/` character. No external
/// glob crate is pulled in for this.
pub(crate) fn glob_match(pattern: &str, path: &str) -> bool {
    let pat: Vec<&str> = pattern.split('/').collect();
    let txt: Vec<&str> = path.split('/').collect();
    match_segments(&pat, &txt)
}

fn match_segments(pat: &[&str], txt: &[&str]) -> bool {
    match pat.split_first() {
        None => txt.is_empty(),
        Some((&"**", rest)) => {
            // `**` consumes zero or more whole segments.
            (0..=txt.len()).any(|i| match_segments(rest, &txt[i..]))
        }
        Some((&first, rest)) => match txt.split_first() {
            Some((&seg, txt_rest)) if segment_match(first, seg) => match_segments(rest, txt_rest),
            _ => false,
        },
    }
}

/// Wildcard match within a single path segment (`*` and `?`), via DP.
fn segment_match(pat: &str, s: &str) -> bool {
    let p: Vec<char> = pat.chars().collect();
    let c: Vec<char> = s.chars().collect();
    let (np, nc) = (p.len(), c.len());
    let mut dp = vec![vec![false; nc + 1]; np + 1];
    dp[0][0] = true;
    for i in 1..=np {
        if p[i - 1] == '*' {
            dp[i][0] = dp[i - 1][0];
        }
    }
    for i in 1..=np {
        for j in 1..=nc {
            dp[i][j] = if p[i - 1] == '*' {
                dp[i - 1][j] || dp[i][j - 1]
            } else if p[i - 1] == '?' || p[i - 1] == c[j - 1] {
                dp[i - 1][j - 1]
            } else {
                false
            };
        }
    }
    dp[np][nc]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn from_json_overrides_and_options() {
        let cfg = LintConfig::from_json_str(
            r#"{
                "rules": {
                    "svelte/no-at-html-tags": "off",
                    "svelte/button-has-type": ["error", { "submit": false }]
                }
            }"#,
        )
        .unwrap();
        assert_eq!(
            cfg.resolve_code("svelte/no-at-html-tags", Severity::Warn),
            Severity::Off
        );
        assert_eq!(
            cfg.resolve_code("svelte/button-has-type", Severity::Warn),
            Severity::Error
        );
        let opts = cfg.options_for("svelte/button-has-type").unwrap();
        let first = &opts.as_array().unwrap()[0];
        assert_eq!(first.get("submit").and_then(|v| v.as_bool()), Some(false));
    }

    #[test]
    fn extends_none_disables_everything_by_default() {
        let cfg = LintConfig::from_json_str(r#"{ "extends": ["none"] }"#).unwrap();
        assert_eq!(
            cfg.resolve_code("svelte/no-at-html-tags", Severity::Error),
            Severity::Off
        );
    }

    #[test]
    fn numeric_severity_is_accepted() {
        let cfg = LintConfig::from_json_str(r#"{ "rules": { "svelte/x": 2 } }"#).unwrap();
        assert_eq!(
            cfg.resolve_code("svelte/x", Severity::Warn),
            Severity::Error
        );
    }

    #[test]
    fn glob_matching() {
        assert!(glob_match("**/*.svelte", "src/lib/Foo.svelte"));
        assert!(glob_match("src/**/*.svelte", "src/a/b/Foo.svelte"));
        assert!(glob_match("*.svelte", "Foo.svelte"));
        assert!(!glob_match("*.svelte", "src/Foo.svelte"));
        assert!(glob_match("src/**", "src/a/b"));
        assert!(glob_match("**/generated/**", "a/generated/b.svelte"));
        assert!(!glob_match("**/generated/**", "a/b.svelte"));
    }

    #[test]
    fn should_lint_honours_files_and_ignores() {
        let cfg = LintConfig::from_json_str(
            r#"{ "files": ["src/**/*.svelte"], "ignores": ["**/_*.svelte"] }"#,
        )
        .unwrap();
        assert!(cfg.should_lint("src/Foo.svelte"));
        assert!(!cfg.should_lint("other/Foo.svelte"));
        assert!(!cfg.should_lint("src/_Private.svelte"));
    }
}
