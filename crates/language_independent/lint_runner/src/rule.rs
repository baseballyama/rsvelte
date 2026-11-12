//! What a lint rule implements, and the only way it reports.

use std::borrow::Cow;

use rsvelte_kernel::diagnostics::{Diagnostic, Severity};
use rsvelte_kernel::source::positions::Span;

use crate::finding::{Finding, Fix, Suggestion};

/// A lint rule over a context type `C` that the language chooses.
pub trait Rule<C: ?Sized>: Send + Sync {
    /// The rule identifier as the upstream tool spells it (`no-unused-vars`,
    /// `svelte/button-has-type`). Every finding of the rule carries it.
    fn identifier(&self) -> &'static str;

    /// The severity of every finding of the rule.
    fn severity(&self) -> Severity {
        Severity::Error
    }

    fn check(&self, context: &C, reporter: &mut Reporter<'_>);
}

impl<C: ?Sized, R: Rule<C> + ?Sized> Rule<C> for &R {
    fn identifier(&self) -> &'static str {
        (**self).identifier()
    }

    fn severity(&self) -> Severity {
        (**self).severity()
    }

    fn check(&self, context: &C, reporter: &mut Reporter<'_>) {
        (**self).check(context, reporter);
    }
}

/// Where a rule reports. It stamps the rule's identifier and severity on each finding, so a rule
/// cannot report under another rule's name.
#[derive(Debug)]
pub struct Reporter<'a> {
    rule: &'static str,
    severity: Severity,
    out: &'a mut Vec<Finding>,
    failure: &'a mut Option<Diagnostic>,
}

/// One report before the reporter stamps it: `ESLint`'s `context.report` descriptor.
#[derive(Debug)]
#[must_use = "a report is sent with `Reporter::report`"]
pub struct Report {
    message: String,
    span: Span,
    has_end: bool,
    message_id: Option<Cow<'static, str>>,
    fix: Option<Fix>,
    suggestions: Vec<Suggestion>,
}

impl Report {
    /// A report over `span`.
    pub fn range(message: impl Into<String>, span: Span) -> Self {
        Self {
            message: message.into(),
            span,
            has_end: true,
            message_id: None,
            fix: None,
            suggestions: Vec::new(),
        }
    }

    /// A report at `offset` with no end, which `ESLint` prints as `end: null`.
    pub fn point(message: impl Into<String>, offset: u32) -> Self {
        Self {
            has_end: false,
            ..Self::range(message, Span::new(offset, offset))
        }
    }

    pub fn message_id(mut self, message_id: impl Into<Cow<'static, str>>) -> Self {
        self.message_id = Some(message_id.into());
        self
    }

    /// An empty fix is no fix, as `ESLint` drops a fixer that returns nothing.
    pub fn fix(mut self, fix: Fix) -> Self {
        if !fix.is_empty() {
            self.fix = Some(fix);
        }
        self
    }

    /// A suggestion without edits is dropped, as `ESLint` drops one whose fixer returns nothing.
    pub fn suggest(mut self, suggestion: Suggestion) -> Self {
        if !suggestion.fix.is_empty() {
            self.suggestions.push(suggestion);
        }
        self
    }
}

impl<'a> Reporter<'a> {
    pub(crate) fn new<C: ?Sized, R: Rule<C> + ?Sized>(
        rule: &R,
        out: &'a mut Vec<Finding>,
        failure: &'a mut Option<Diagnostic>,
    ) -> Self {
        Self {
            rule: rule.identifier(),
            severity: rule.severity(),
            out,
            failure,
        }
    }

    /// The rule could not check the document, as when an `ESLint` rule throws: linting the
    /// document fails instead of reporting a finding. The first failure wins.
    pub fn fail(&mut self, message: impl std::fmt::Display) {
        if self.failure.is_none() {
            *self.failure = Some(Diagnostic::error(
                "rule_failed",
                format!("rule `{}` failed: {message}", self.rule),
                Span::new(0, 0),
            ));
        }
    }

    /// A finding over `span`.
    pub fn range(&mut self, message: impl Into<String>, span: Span) {
        self.report(Report::range(message, span));
    }

    /// A finding at `offset` with no end, which `ESLint` prints as `end: null`.
    pub fn point(&mut self, message: impl Into<String>, offset: u32) {
        self.report(Report::point(message, offset));
    }

    pub fn report(&mut self, report: Report) {
        self.out.push(Finding {
            diagnostic: Diagnostic {
                severity: self.severity,
                code: self.rule.into(),
                message: report.message,
                span: report.span,
                has_end: report.has_end,
            },
            message_id: report.message_id,
            fix: report.fix,
            suggestions: report.suggestions,
        });
    }
}
