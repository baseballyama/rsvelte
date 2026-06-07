//! The lint diagnostic model and its conversion to the shared
//! `rsvelte_core::svelte_check` [`Diagnostic`] used by the output writers.

use std::path::Path;

use rsvelte_core::svelte_check::diagnostic::{Diagnostic, DiagnosticSeverity, Position, Range};

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

impl Fix {
    /// Apply the edits to `source`, producing the fixed string. Edits are
    /// applied right-to-left so earlier offsets stay valid.
    pub fn apply(&self, source: &str) -> String {
        let mut edits = self.edits.clone();
        edits.sort_by_key(|e| std::cmp::Reverse(e.start));
        let mut out = source.to_string();
        for e in edits {
            let (s, en) = (e.start as usize, e.end as usize);
            if s <= en && en <= out.len() {
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
}

impl LintDiagnostic {
    /// Convert to the shared output diagnostic. `Off`-severity findings should
    /// already have been filtered out; they map to `Warning` defensively.
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
