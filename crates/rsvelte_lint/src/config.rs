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

/// Whether an explicitly configured global may be assigned to.
///
/// This is intentionally the same value vocabulary as Oxlint and ESLint's
/// legacy config: `false`/`"readable"` mean readonly, `true`/`"writeable"`
/// mean writable, and `"off"` removes an environment global. Keeping the
/// original distinction matters for a future `no-undef`/write diagnostic.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GlobalValue {
    Readonly,
    Writable,
    Off,
}

impl GlobalValue {
    fn parse(value: &Value) -> Option<Self> {
        match value {
            Value::Bool(true) => Some(Self::Writable),
            Value::Bool(false) => Some(Self::Readonly),
            Value::String(value) => match value.as_str() {
                "readonly" | "readable" => Some(Self::Readonly),
                "writable" | "writeable" => Some(Self::Writable),
                "off" => Some(Self::Off),
                _ => None,
            },
            _ => None,
        }
    }
}

/// Globals and environments selected for a lint run.
///
/// The engine records this complete configuration now, before `no-undef` is
/// enabled. That rule must consult an authoritative environment database rather
/// than treating every unresolved OXC reference as an error.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GlobalConfig {
    values: HashMap<String, GlobalValue>,
    environments: HashMap<String, bool>,
}

impl Default for GlobalConfig {
    fn default() -> Self {
        Self {
            values: HashMap::new(),
            // Oxlint treats the ECMAScript builtin environment as enabled by
            // default. An explicit `env` object replaces that default.
            environments: HashMap::from([(String::from("builtin"), true)]),
        }
    }
}

impl GlobalConfig {
    /// The configured mode for `name`, including an explicit `"off"`.
    pub fn value(&self, name: &str) -> Option<GlobalValue> {
        self.values.get(name).copied()
    }

    /// Whether the named environment is enabled.
    pub fn environment_enabled(&self, name: &str) -> bool {
        self.environments.get(name).copied().unwrap_or(false)
    }

    /// Iterate over enabled environment names.
    pub fn enabled_environments(&self) -> impl Iterator<Item = &str> {
        self.environments
            .iter()
            .filter_map(|(name, enabled)| enabled.then_some(name.as_str()))
    }

    fn set_global(&mut self, name: String, value: GlobalValue) {
        self.values.insert(name, value);
    }

    fn set_environment(&mut self, name: String, enabled: bool) {
        self.environments.insert(name, enabled);
    }
}

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
    /// Explicit globals and enabled environments. Native rules do not consume
    /// this yet; retaining it is the contract needed before `no-undef` can be
    /// made correct across the CLI, language server, wasm and NAPI bindings.
    globals: GlobalConfig,
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

    /// Add, override, or disable one global in the Oxlint/ESLint vocabulary.
    pub fn with_global(mut self, name: impl Into<String>, value: GlobalValue) -> Self {
        self.globals.set_global(name.into(), value);
        self
    }

    /// Enable or disable an Oxlint-compatible named environment.
    pub fn with_environment(mut self, name: impl Into<String>, enabled: bool) -> Self {
        self.globals.set_environment(name.into(), enabled);
        self
    }

    /// Globals/environment settings preserved for semantic rules.
    pub fn globals(&self) -> &GlobalConfig {
        &self.globals
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

    /// Layer a single inline (`/* eslint <rule>: … */`) rule entry on top of this
    /// config, returning the modified config. `severity` / `options` are the
    /// already-parsed parts of the rule value (see [`severity_from_value`] /
    /// [`options_from_value`]). Mirrors ESLint's per-file inline-config merge:
    /// an inline entry overrides both the severity and the options for that rule
    /// in the current file only.
    pub(crate) fn with_inline_rule(
        mut self,
        rule: &str,
        severity: Option<Severity>,
        options: Option<Value>,
    ) -> Self {
        if let Some(sev) = severity {
            self.overrides.insert(rule.to_string(), sev);
        }
        if let Some(opts) = options {
            self.options.insert(rule.to_string(), opts);
        }
        self
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
        config.globals = parse_globals(obj.get("globals"))?;
        config.globals.environments = parse_environments(obj.get("env"))?;

        Ok(config)
    }
}

/// Read a severity from a rule value: a scalar or the first element of a
/// `[severity, options]` array.
pub(crate) fn severity_from_value(v: &Value) -> Option<Severity> {
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
pub(crate) fn options_from_value(v: &Value) -> Option<Value> {
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

fn parse_globals(value: Option<&Value>) -> anyhow::Result<GlobalConfig> {
    let Some(value) = value else {
        return Ok(GlobalConfig::default());
    };
    let object = value
        .as_object()
        .ok_or_else(|| anyhow::anyhow!("globals must be a JSON object"))?;
    let mut globals = GlobalConfig::default();
    for (name, value) in object {
        let value = GlobalValue::parse(value).ok_or_else(|| {
            anyhow::anyhow!("globals.{name} must be 'readonly', 'writable', 'off', or a boolean")
        })?;
        globals.set_global(name.clone(), value);
    }
    Ok(globals)
}

fn parse_environments(value: Option<&Value>) -> anyhow::Result<HashMap<String, bool>> {
    let Some(value) = value else {
        return Ok(GlobalConfig::default().environments);
    };
    let object = value
        .as_object()
        .ok_or_else(|| anyhow::anyhow!("env must be a JSON object"))?;
    let mut environments = HashMap::new();
    for (name, value) in object {
        let enabled = value
            .as_bool()
            .ok_or_else(|| anyhow::anyhow!("env.{name} must be a boolean"))?;
        environments.insert(name.clone(), enabled);
    }
    Ok(environments)
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

    #[test]
    fn globals_and_env_follow_oxlint_value_semantics() {
        let cfg = LintConfig::from_json_str(
            r#"{
                "env": { "browser": true, "node": false },
                "globals": {
                    "BUILD_ID": "readonly",
                    "mutableCache": true,
                    "Promise": "off"
                }
            }"#,
        )
        .unwrap();
        assert_eq!(cfg.globals().value("BUILD_ID"), Some(GlobalValue::Readonly));
        assert_eq!(
            cfg.globals().value("mutableCache"),
            Some(GlobalValue::Writable)
        );
        assert_eq!(cfg.globals().value("Promise"), Some(GlobalValue::Off));
        assert!(cfg.globals().environment_enabled("browser"));
        assert!(!cfg.globals().environment_enabled("node"));
        assert!(!cfg.globals().environment_enabled("builtin"));
    }

    #[test]
    fn malformed_globals_and_env_are_config_errors() {
        assert!(LintConfig::from_json_str(r#"{ "globals": { "x": "yes" } }"#).is_err());
        assert!(LintConfig::from_json_str(r#"{ "env": { "browser": "yes" } }"#).is_err());
    }
}
