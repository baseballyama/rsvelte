//! [`LintContext`] — the handle a rule uses to report findings.
//!
//! The visitor sets the "current rule" + its resolved severity before invoking
//! each hook, so `report*` calls don't have to thread the rule id or severity
//! through every call site (port of `vize_patina`'s `context.rs`).

use crate::diagnostic::{Fix, LintDiagnostic};
use crate::rule::{RuleMeta, Severity};

/// Per-file lint context shared across all rules during the single AST walk.
pub struct LintContext {
    diagnostics: Vec<LintDiagnostic>,
    cur_rule: &'static str,
    cur_severity: Severity,
}

impl LintContext {
    pub fn new() -> Self {
        Self {
            diagnostics: Vec::new(),
            cur_rule: "",
            cur_severity: Severity::Warn,
        }
    }

    /// Called by the visitor immediately before dispatching a hook on `meta`.
    pub fn enter_rule(&mut self, meta: &RuleMeta, severity: Severity) {
        self.cur_rule = meta.name;
        self.cur_severity = severity;
    }

    /// Report a finding spanning `[start, end)` (UTF-8 byte offsets).
    pub fn report(&mut self, start: u32, end: u32, message: impl Into<String>) {
        self.push(start, end, message.into(), None, None);
    }

    /// Report with an attached `help:` note.
    pub fn report_with_help(
        &mut self,
        start: u32,
        end: u32,
        message: impl Into<String>,
        help: impl Into<String>,
    ) {
        self.push(start, end, message.into(), Some(help.into()), None);
    }

    /// Report with an autofix.
    pub fn report_with_fix(&mut self, start: u32, end: u32, message: impl Into<String>, fix: Fix) {
        self.push(start, end, message.into(), None, Some(fix));
    }

    fn push(
        &mut self,
        start: u32,
        end: u32,
        message: String,
        help: Option<String>,
        fix: Option<Fix>,
    ) {
        self.diagnostics.push(LintDiagnostic {
            rule: self.cur_rule.to_string(),
            severity: self.cur_severity,
            message,
            start,
            end,
            help,
            fix,
        });
    }

    /// Consume the context, returning the collected findings.
    pub fn into_diagnostics(self) -> Vec<LintDiagnostic> {
        self.diagnostics
    }
}

impl Default for LintContext {
    fn default() -> Self {
        Self::new()
    }
}
