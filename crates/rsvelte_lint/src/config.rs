//! Lint configuration.
//!
//! Wave 1 keeps this intentionally small: a map of per-rule severity overrides
//! on top of each rule's `default_severity`. Per-rule options, glob `files`/
//! `ignores`, `extends`, and the `eslint.config.js` importer (design doc §D
//! course-correction 3) layer on top of this in Wave 1–2 without changing the
//! resolution contract used by [`LintContext`](crate::context::LintContext).

use std::collections::HashMap;

use crate::rule::{RuleMeta, Severity};

/// Resolved configuration for a lint run.
#[derive(Debug, Clone, Default)]
pub struct LintConfig {
    /// Severity overrides keyed by rule id. Absent → use the rule's default.
    overrides: HashMap<String, Severity>,
    /// When true, every rule not explicitly overridden is `Off`. Used by an
    /// (eventual) `--no-default` mode; defaults to false (recommended preset).
    all_off_by_default: bool,
}

impl LintConfig {
    /// The recommended preset: every rule runs at its declared default
    /// severity unless explicitly overridden.
    pub fn recommended() -> Self {
        Self::default()
    }

    /// Override a single rule's severity. Chainable.
    pub fn with_override(mut self, rule: impl Into<String>, severity: Severity) -> Self {
        self.overrides.insert(rule.into(), severity);
        self
    }

    /// Start from a baseline where nothing runs unless explicitly enabled.
    pub fn empty() -> Self {
        Self {
            overrides: HashMap::new(),
            all_off_by_default: true,
        }
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
}
