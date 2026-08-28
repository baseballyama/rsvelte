//! Lint diagnostic model and its conversion to the shared output type.
//!
//! The output writers use `rsvelte_check`'s [`Diagnostic`].

#[cfg(feature = "native")]
use std::path::Path;

#[cfg(feature = "native")]
use rsvelte_diagnostics::{Diagnostic, DiagnosticSeverity, Position, Range};

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
    /// Upstream reported a bare location rather than a range. Keep `end` for
    /// internal consumers that require a concrete span, but omit it from
    /// compatibility output formats.
    pub omit_end: bool,
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
    /// Whether compatibility output formats must omit the range end.
    pub omit_end: bool,
    pub help: Option<String>,
    /// The `--fix` autofix, when the rule offers one.
    pub fix: Option<Fix>,
    /// Editor-offered suggestions (never auto-applied).
    pub suggestions: Vec<Suggestion>,
}

#[cfg(feature = "native")]
impl From<Diagnostic> for LintMessage {
    fn from(diagnostic: Diagnostic) -> Self {
        Self::from_diagnostic(diagnostic)
    }
}

#[cfg(feature = "native")]
impl LintMessage {
    /// Wrap a rule finding, keeping its fix payload alongside the converted
    /// line/column diagnostic.
    pub(crate) fn from_lint(d: LintDiagnostic, file: &Path, line_index: &LineIndex) -> Self {
        Self {
            diagnostic: d.to_output(file, line_index),
            span: Some((d.start, d.end)),
            omit_end: d.omit_end,
            help: d.help,
            fix: d.fix,
            suggestions: d.suggestions,
        }
    }

    /// Wrap a diagnostic that has no fix payload (validator wrap, source-scan
    /// meta rules).
    #[must_use]
    pub const fn from_diagnostic(diagnostic: Diagnostic) -> Self {
        Self {
            diagnostic,
            span: None,
            omit_end: false,
            help: None,
            fix: None,
            suggestions: Vec::new(),
        }
    }

    /// Wrap a diagnostic whose upstream rule reports only a start location.
    #[must_use]
    pub const fn from_diagnostic_without_end(diagnostic: Diagnostic) -> Self {
        Self {
            diagnostic,
            span: None,
            omit_end: true,
            help: None,
            fix: None,
            suggestions: Vec::new(),
        }
    }
}

/// Rules whose upstream positions come from `sourceCode.getLocFromIndex`, i.e.
/// ESLint's own line table rather than the AST node's `loc`. Only these count
/// U+2028 / U+2029 as line terminators; every other rule reports the parser's
/// lines. Derived from the `getLocFromIndex` call sites in
/// `eslint-plugin-svelte/src/rules`.
fn uses_eslint_line_table(rule: &str) -> bool {
    matches!(
        rule,
        "svelte/comment-directive"
            | "svelte/html-closing-bracket-spacing"
            | "svelte/html-quotes"
            | "svelte/html-self-closing"
            | "svelte/no-spaces-around-equal-signs-in-attribute"
            // Reads `sourceCode.lines` rather than calling `getLocFromIndex`,
            // which is the same line table.
            | "svelte/no-trailing-spaces"
            | "svelte/no-unused-svelte-ignore"
    )
}

impl LintDiagnostic {
    /// Start and end of this finding under the line table its own rule reports
    /// on. Every consumer — CLI, LSP shape and the JSON API the bindings wrap —
    /// must go through here, or two of them answer differently for one finding.
    #[must_use]
    pub fn report_span(&self, line_index: &LineIndex) -> ((u32, u32), (u32, u32)) {
        if uses_eslint_line_table(&self.rule) {
            (
                line_index.position_js(self.start),
                line_index.position_js(self.end),
            )
        } else {
            (
                line_index.position(self.start),
                line_index.position(self.end),
            )
        }
    }

    /// The line this finding is *reported* on, under its own rule's line table.
    ///
    /// Upstream filters disable directives against `message.line`, so a path
    /// that suppresses on the parser table alone disagrees with the report it is
    /// meant to filter wherever the two tables differ (U+2028 / U+2029).
    #[must_use]
    pub fn report_line(&self, line_index: &LineIndex) -> u32 {
        self.report_span(line_index).0.0
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
        let (start, end) = self.report_span(line_index);
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
