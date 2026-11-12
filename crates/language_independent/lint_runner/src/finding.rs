//! A finding: a diagnostic with the fix and the suggestions `ESLint` attaches to a report.

use std::borrow::Cow;

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::edits::Edits;
use rsvelte_kernel::source::positions::Span;

#[derive(Clone, Debug)]
pub struct Finding {
    pub diagnostic: Diagnostic,
    /// `ESLint`'s `messageId`, when the rule reports by one.
    pub message_id: Option<Cow<'static, str>>,
    pub fix: Option<Fix>,
    pub suggestions: Vec<Suggestion>,
}

impl From<Diagnostic> for Finding {
    fn from(diagnostic: Diagnostic) -> Self {
        Self {
            diagnostic,
            message_id: None,
            fix: None,
            suggestions: Vec::new(),
        }
    }
}

/// Edits that `ESLint` merges into one fix: they apply together or not at all.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Fix {
    edits: Vec<Edit>,
}

pub use rsvelte_kernel::diagnostics::Replacement as Edit;

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
        self.edits.push(Edit {
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
    pub fn merged(&self, source: &str) -> Option<Edit> {
        rsvelte_kernel::diagnostics::merge(source, &self.edits)
    }
}

#[derive(Clone, Debug)]
pub struct Suggestion {
    pub message_id: Option<Cow<'static, str>>,
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
            fix: self.fix.map(|fix| fix.edits).unwrap_or_default(),
        }
    }
}

/// The source with one fix applied, as `ESLint` applies a suggestion.
#[must_use]
pub fn apply_fix(source: &str, fix: &Fix) -> String {
    let mut edits = Edits::default();
    for edit in &fix.edits {
        edits.replace(edit.span, edit.text.as_str());
    }
    edits.apply(source)
}

#[cfg(test)]
mod tests;
