//! [`LintContext`] — the handle a rule uses to report findings.
//!
//! The visitor sets the "current rule" + its resolved severity before invoking
//! each hook, so `report*` calls don't have to thread the rule id or severity
//! through every call site (port of `vize_patina`'s `context.rs`). The context
//! also borrows the resolved [`LintConfig`] so a rule can read its own parsed
//! options via [`LintContext::option_bool`] / [`LintContext::option_str_list`].

use std::path::Path;

use serde_json::Value;

use crate::config::LintConfig;
use crate::diagnostic::{Fix, LintDiagnostic, Suggestion};
use crate::rule::{RuleMeta, Severity};

/// Per-file lint context shared across all rules during the single AST walk.
pub struct LintContext<'a> {
    diagnostics: Vec<LintDiagnostic>,
    cur_rule: &'static str,
    cur_severity: Severity,
    config: &'a LintConfig,
    source: &'a str,
    /// The file name (base name only, e.g. `+page.svelte`), used by rules that
    /// need to gate on the SvelteKit route file type.
    filename: &'a str,
    /// Path of the file being linted, when known. `None` in contexts with no
    /// filesystem (the wasm playground, or linting an in-memory string). Rules
    /// that inspect sibling files on disk (e.g.
    /// `svelte/no-companion-module-shadow`) must no-op when this is `None`.
    path: Option<&'a Path>,
}

impl<'a> LintContext<'a> {
    pub fn new(config: &'a LintConfig, source: &'a str, filename: &'a str) -> Self {
        Self {
            diagnostics: Vec::new(),
            cur_rule: "",
            cur_severity: Severity::Warn,
            config,
            source,
            filename,
            path: None,
        }
    }

    /// Attach the path of the file being linted (builder style). Left `None` by
    /// default so string / wasm callers are unaffected.
    pub fn with_path(mut self, path: Option<&'a Path>) -> Self {
        self.path = path;
        self
    }

    /// The path of the file being linted, when known. `None` for in-memory /
    /// wasm linting (no filesystem).
    pub fn path(&self) -> Option<&'a Path> {
        self.path
    }

    /// The base file name of the file being linted (e.g. `+page.svelte`).
    pub fn filename(&self) -> &'a str {
        self.filename
    }

    /// The full source text of the file being linted.
    pub fn source(&self) -> &'a str {
        self.source
    }

    /// The source slice for a byte range, clamped to the source bounds.
    pub fn slice(&self, start: u32, end: u32) -> &'a str {
        let (s, e) = (start as usize, end as usize);
        if s <= e && e <= self.source.len() {
            &self.source[s..e]
        } else {
            ""
        }
    }

    /// Called by the visitor immediately before dispatching a hook on `meta`.
    pub fn enter_rule(&mut self, meta: &RuleMeta, severity: Severity) {
        self.cur_rule = meta.name;
        self.cur_severity = severity;
    }

    /// The raw options for the current rule: the `[…]` array of everything
    /// after the severity (ESLint rule options are variadic). `None` when the
    /// rule was configured without options.
    pub fn options(&self) -> Option<&Value> {
        self.config.options_for(self.cur_rule)
    }

    /// The first options element (`options[0]`) — the conventional single
    /// options object most rules use.
    pub fn option0(&self) -> Option<&Value> {
        match self.options()? {
            Value::Array(a) => a.first(),
            v => Some(v),
        }
    }

    /// Read a boolean from the first options object, falling back to `default`.
    pub fn option_bool(&self, key: &str, default: bool) -> bool {
        self.option0()
            .and_then(|o| o.get(key))
            .and_then(Value::as_bool)
            .unwrap_or(default)
    }

    /// Read a `string[]` from the first options object (empty when absent).
    pub fn option_str_list(&self, key: &str) -> Vec<String> {
        self.option0()
            .and_then(|o| o.get(key))
            .and_then(Value::as_array)
            .map(|a| {
                a.iter()
                    .filter_map(|v| v.as_str().map(str::to_string))
                    .collect()
            })
            .unwrap_or_default()
    }

    /// Report a finding spanning `[start, end)` (UTF-8 byte offsets).
    pub fn report(&mut self, start: u32, end: u32, message: impl Into<String>) {
        self.push(start, end, message.into(), None, None, Vec::new());
    }

    /// Report with an attached `help:` note.
    pub fn report_with_help(
        &mut self,
        start: u32,
        end: u32,
        message: impl Into<String>,
        help: impl Into<String>,
    ) {
        self.push(
            start,
            end,
            message.into(),
            Some(help.into()),
            None,
            Vec::new(),
        );
    }

    /// Report with an autofix.
    pub fn report_with_fix(&mut self, start: u32, end: u32, message: impl Into<String>, fix: Fix) {
        self.push(start, end, message.into(), None, Some(fix), Vec::new());
    }

    /// Report with editor suggestions (code actions never applied by `--fix`).
    /// Mirrors ESLint's `suggest`: the finding itself has no autofix, but offers
    /// one or more named suggestions.
    pub fn report_with_suggestions(
        &mut self,
        start: u32,
        end: u32,
        message: impl Into<String>,
        suggestions: Vec<Suggestion>,
    ) {
        self.push(start, end, message.into(), None, None, suggestions);
    }

    fn push(
        &mut self,
        start: u32,
        end: u32,
        message: String,
        help: Option<String>,
        fix: Option<Fix>,
        suggestions: Vec<Suggestion>,
    ) {
        self.diagnostics.push(LintDiagnostic {
            rule: self.cur_rule.to_string(),
            severity: self.cur_severity,
            message,
            start,
            end,
            help,
            fix,
            suggestions,
        });
    }

    /// Consume the context, returning the collected findings.
    pub fn into_diagnostics(self) -> Vec<LintDiagnostic> {
        self.diagnostics
    }
}
