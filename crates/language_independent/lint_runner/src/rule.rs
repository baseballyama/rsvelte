//! What a lint rule implements, and the only way it reports.

use rsvelte_kernel::diagnostics::{Diagnostic, Severity};
use rsvelte_kernel::source::positions::Span;

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

/// Where a rule reports. It stamps the rule's identifier and severity on each finding, so a rule
/// cannot report under another rule's name.
#[derive(Debug)]
pub struct Reporter<'a> {
    rule: &'static str,
    severity: Severity,
    out: &'a mut Vec<Diagnostic>,
}

impl<'a> Reporter<'a> {
    pub(crate) fn new<C: ?Sized, R: Rule<C> + ?Sized>(
        rule: &R,
        out: &'a mut Vec<Diagnostic>,
    ) -> Self {
        Self {
            rule: rule.identifier(),
            severity: rule.severity(),
            out,
        }
    }

    /// A finding over `span`.
    pub fn range(&mut self, message: impl Into<String>, span: Span) {
        self.push(message.into(), span, true);
    }

    /// A finding at `offset` with no end, which `ESLint` prints as `end: null`.
    pub fn point(&mut self, message: impl Into<String>, offset: u32) {
        self.push(message.into(), Span::new(offset, offset), false);
    }

    fn push(&mut self, message: String, span: Span, has_end: bool) {
        self.out.push(Diagnostic {
            severity: self.severity,
            code: self.rule.into(),
            message,
            span,
            has_end,
        });
    }
}
