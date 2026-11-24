//! A finding: a diagnostic with the fix and the suggestions `ESLint` attaches to a report.

use rsvelte_kernel::diagnostics::{Diagnostic, Replacement};
use rsvelte_kernel::source::positions::Span;

/// The code of `ESLint`'s own report of an unused directive comment, which names no rule.
pub const UNUSED_DIRECTIVE: &str = "unused-disable-directive";

/// The code of the one finding of a document that does not parse, which names no rule.
pub const PARSE_ERROR: &str = "parse_error";

#[derive(Clone, Debug)]
pub struct Finding {
    pub diagnostic: Diagnostic,
    pub fix: Option<Fix>,
    pub suggestions: Vec<Suggestion>,
}

impl From<Diagnostic> for Finding {
    fn from(diagnostic: Diagnostic) -> Self {
        Self {
            diagnostic,
            fix: None,
            suggestions: Vec::new(),
        }
    }
}

/// Edits that `ESLint` merges into one fix: they apply together or not at all.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Fix {
    edits: Vec<Replacement>,
}

impl Fix {
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    #[must_use]
    pub fn replace(span: Span, text: impl Into<String>) -> Self {
        let mut fix = Self::new();
        fix.push(span, text);
        fix
    }

    #[must_use]
    pub fn insert(at: u32, text: impl Into<String>) -> Self {
        Self::replace(Span::new(at, at), text)
    }

    #[must_use]
    pub fn remove(span: Span) -> Self {
        Self::replace(span, "")
    }

    /// Adds an edit. Edits of one fix must not overlap, as `ESLint` requires.
    pub fn push(&mut self, span: Span, text: impl Into<String>) -> &mut Self {
        self.edits.push(Replacement {
            span,
            text: text.into(),
        });
        self
    }

    #[must_use]
    pub const fn is_empty(&self) -> bool {
        self.edits.is_empty()
    }

    /// `ESLint`'s `mergeFixes`: one edit over the range all edits cover, with the text between
    /// them kept.
    ///
    /// # Panics
    ///
    /// Two edits overlap, which a rule must not report.
    #[must_use]
    pub fn merged(&self, source: &str) -> Option<Replacement> {
        rsvelte_kernel::diagnostics::merge(source, &self.edits)
    }
}

#[derive(Clone, Debug)]
pub struct Suggestion {
    pub message: String,
    pub fix: Fix,
}

/// `ESLint`'s `SourceCodeFixer.applyFixes` for one pass, over the findings' fixes.
#[must_use]
pub fn apply_fixes(source: &str, findings: &[Finding]) -> String {
    rsvelte_kernel::diagnostics::apply_fixes(
        source,
        findings
            .iter()
            .filter_map(|f| f.fix.as_ref().map(|fix| fix.edits.as_slice())),
    )
}

impl Finding {
    /// The finding as a task reports it: its diagnostic and its fix's edits, moved.
    #[must_use]
    pub fn reported(self) -> rsvelte_kernel::diagnostics::Finding {
        rsvelte_kernel::diagnostics::Finding {
            diagnostic: self.diagnostic,
            fix: self.fix.map_or_default(|fix| fix.edits),
        }
    }
}

/// The source with one fix applied, as `ESLint` applies a suggestion.
#[must_use]
pub fn apply_fix(source: &str, fix: &Fix) -> String {
    rsvelte_kernel::diagnostics::apply_fixes(source, [fix.edits.as_slice()])
}

#[cfg(test)]
mod tests;
