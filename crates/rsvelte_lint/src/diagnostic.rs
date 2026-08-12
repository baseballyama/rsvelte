//! Lint diagnostic model and its conversion to the shared output type.
//!
//! The output writers use `rsvelte_check`'s [`Diagnostic`].

#[cfg(feature = "native")]
use std::path::Path;

#[cfg(feature = "native")]
use rsvelte_diagnostics::{Diagnostic, DiagnosticSeverity, Position, Range};

#[cfg(feature = "native")]
use crate::line_index::LineIndex;
use crate::rule::Severity;

/// A single text replacement that makes up part of a [`Fix`].
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TextEdit {
    /// Byte offset (UTF-8) of the start of the replaced range.
    pub start: u32,
    /// Byte offset (UTF-8) of the end of the replaced range.
    pub end: u32,
    pub new_text: String,
}

/// An autofix: a message plus the edits that apply it.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Fix {
    pub message: String,
    pub edits: Vec<TextEdit>,
}

/// Editor-offered suggestion.
///
/// A suggestion: an editor-offered code action that is **never** auto-applied
/// by `--fix` (mirrors `ESLint`'s `suggest` / `meta.hasSuggestions`). Each carries
/// a human-readable description and the edits that apply it. eslint-plugin-svelte
/// fixtures store these as `{ desc, output }`, where `output` is the source after
/// applying this one suggestion's [`Fix`].
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Suggestion {
    /// The user-facing description (`ESLint`'s resolved `desc`).
    pub desc: String,
    /// The edits this suggestion would apply.
    pub fix: Fix,
}

impl Fix {
    /// Apply the edits to `source`, producing the fixed string. Edits are
    /// applied right-to-left so earlier offsets stay valid.
    #[must_use]
    pub fn apply(&self, source: &str) -> String {
        let mut edits = self.edits.clone();
        edits.sort_by_key(|e| std::cmp::Reverse(e.start));
        let mut out = source.to_string();
        for e in edits {
            let (s, en) = (e.start as usize, e.end as usize);
            if s <= en && en <= out.len() && out.is_char_boundary(s) && out.is_char_boundary(en) {
                out.replace_range(s..en, &e.new_text);
            }
        }
        out
    }
}

/// A lint finding produced by a rule (native or validator-wrapped). Spans are
/// UTF-8 byte offsets into the source; conversion to line/column happens once
/// at output time via the [`LineIndex`].
#[derive(Debug, Clone)]
pub struct LintDiagnostic {
    /// The rule id, e.g. `"svelte/no-at-html-tags"` or a compiler code like
    /// `"a11y_img_redundant_alt"`.
    pub rule: String,
    pub severity: Severity,
    pub message: String,
    /// Inclusive-start byte offset.
    pub start: u32,
    /// Exclusive-end byte offset.
    pub end: u32,
    pub help: Option<String>,
    pub fix: Option<Fix>,
    /// Editor-offered suggestions (never auto-applied). Empty for most findings.
    pub suggestions: Vec<Suggestion>,
}

/// One finding of a full lint pass: the output-ready [`Diagnostic`] plus the
/// fix payload the editor needs for code actions.
///
/// Findings reach the output list from two sources with different position
/// models — native rules carry UTF-8 byte spans, the validator wrap carries
/// compiler line/column positions (and none at all for a hard compile error).
/// Keeping the output `Diagnostic` verbatim and attaching the byte-span payload
/// only where it exists means neither side is round-tripped through the other's
/// coordinates.
#[cfg(feature = "native")]
#[derive(Debug, Clone)]
pub struct LintMessage {
    /// Identical to the element [`lint_source`](crate::lint_source) yields.
    pub diagnostic: Diagnostic,
    /// `(start, end)` UTF-8 byte offsets; `None` for validator-wrap findings.
    pub span: Option<(u32, u32)>,
    pub help: Option<String>,
    /// The `--fix` autofix, when the rule offers one.
    pub fix: Option<Fix>,
    /// Editor-offered suggestions (never auto-applied).
    pub suggestions: Vec<Suggestion>,
}

#[cfg(feature = "native")]
impl LintMessage {
    /// Wrap a rule finding, keeping its fix payload alongside the converted
    /// line/column diagnostic.
    pub(crate) fn from_lint(d: LintDiagnostic, file: &Path, line_index: &LineIndex) -> Self {
        Self {
            diagnostic: d.to_output(file, line_index),
            span: Some((d.start, d.end)),
            help: d.help,
            fix: d.fix,
            suggestions: d.suggestions,
        }
    }

    /// Wrap a diagnostic that has no fix payload (validator wrap, source-scan
    /// meta rules).
    pub(crate) const fn from_diagnostic(diagnostic: Diagnostic) -> Self {
        Self {
            diagnostic,
            span: None,
            help: None,
            fix: None,
            suggestions: Vec::new(),
        }
    }
}

#[cfg(feature = "native")]
impl LintDiagnostic {
    /// Convert to the shared output diagnostic. `Off`-severity findings should
    /// already have been filtered out; they map to `Warning` defensively.
    #[must_use]
    pub fn to_output(&self, file: &Path, line_index: &LineIndex) -> Diagnostic {
        let severity = match self.severity {
            Severity::Error => DiagnosticSeverity::Error,
            Severity::Warn | Severity::Off => DiagnosticSeverity::Warning,
        };
        let start = line_index.position(self.start);
        let end = line_index.position(self.end);
        Diagnostic {
            file: file.to_path_buf(),
            severity,
            code: Some(self.rule.clone()),
            message: self.message.clone(),
            range: Some(Range {
                start: Position {
                    line: start.0,
                    column: start.1,
                },
                end: Position {
                    line: end.0,
                    column: end.1,
                },
            }),
            source: "svelte",
        }
    }
}
