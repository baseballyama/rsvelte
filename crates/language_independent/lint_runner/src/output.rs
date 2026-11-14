//! Findings as `ESLint` reports them.

use rsvelte_kernel::computation::task::TaskOutput;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::{LineIndex, Span};

use crate::finding::Finding;

/// Bytes of one finding's pretty JSON beyond its rule and message, with room for large positions,
/// so the output is allocated once.
const FINDING_BYTES: usize = 200;

/// `ESLint`'s positions in one document: lines as `lines` counts them, which is with
/// [`LineBreaks::Ecmascript`](rsvelte_kernel::source::positions::LineBreaks), and columns of the
/// text after a leading byte order mark, which `ESLint` removes before it lints.
#[derive(Clone, Copy, Debug)]
pub struct Positions<'a> {
    lines: &'a LineIndex,
    byte_order_mark: bool,
}

impl<'a> Positions<'a> {
    #[must_use]
    pub fn new(lines: &'a LineIndex, source_text: &str) -> Self {
        Self {
            lines,
            byte_order_mark: source_text.starts_with('\u{feff}'),
        }
    }

    /// The 1-based line and 0-based UTF-16 column of a byte offset.
    fn at(self, offset: u32) -> (u32, u32) {
        let at = self.lines.line_column(offset);
        let column = if self.byte_order_mark && at.line == 1 {
            at.column.saturating_sub(1)
        } else {
            at.column
        };
        (at.line, column)
    }
}

/// A lint task's output: `lint.json` as [`render_json`] writes it, and each finding with its fix.
pub fn report<'a>(
    out: &mut TaskOutput,
    positions: Positions<'_>,
    rules: impl IntoIterator<Item = &'a str> + Clone,
    findings: Vec<Finding>,
) {
    out.file("lint.json", render_json(positions, rules, &findings));
    out.findings
        .extend(findings.into_iter().map(Finding::reported));
}

/// A lint task's output when the document does not parse: `lint.json` as
/// [`render_parse_error`] writes it, and the error as the one finding.
pub fn report_parse_error(
    out: &mut TaskOutput,
    positions: Positions<'_>,
    message: &str,
    offset: u32,
) {
    out.file("lint.json", render_parse_error(positions, message, offset));
    out.findings.push(rsvelte_kernel::diagnostics::Finding {
        diagnostic: Diagnostic::error("parse_error", message, Span::new(offset, offset))
            .without_end(),
        fix: Vec::new(),
    });
}

/// `{rules, findings: [{rule, message, start: {line, column}, end: {line, column}}]}` with
/// `ESLint`'s positions: 1-based lines and 1-based UTF-16 columns.
///
/// `end` is `null` for a finding without one
/// ([`has_end`](rsvelte_kernel::diagnostics::Diagnostic::has_end)).
///
/// `rules` are the rules that ran, so a comparison can tell a rule that found nothing from one
/// that was never run.
#[must_use]
pub fn render_json<'a>(
    positions: Positions<'_>,
    rules: impl IntoIterator<Item = &'a str> + Clone,
    findings: &[Finding],
) -> String {
    let mut w = StructuredDataWriter::with_capacity(true, capacity(rules.clone(), findings));
    w.begin_object().key("rules").begin_array();
    for r in rules {
        w.write_string(r);
    }
    w.end_array().key("findings").begin_array();
    for d in findings.iter().map(|f| &f.diagnostic) {
        w.begin_object()
            .key("rule")
            .write_string(&d.code)
            .key("message")
            .write_string(&d.message)
            .key("start");
        position(&mut w, positions, d.span.start_offset);
        w.key("end");
        if d.has_end {
            position(&mut w, positions, d.span.end_offset);
        } else {
            w.null();
        }
        w.end_object();
    }
    w.end_array().end_object();
    w.finish()
}

/// `ESLint`'s report of a file whose parser threw `message` at `offset`: no rule runs, and the
/// one finding has no rule, no end, and the parser's 0-based column.
#[must_use]
pub fn render_parse_error(positions: Positions<'_>, message: &str, offset: u32) -> String {
    let (line, column) = positions.at(offset);
    let mut w = StructuredDataWriter::with_capacity(true, FINDING_BYTES + message.len());
    w.begin_object()
        .key("rules")
        .begin_array()
        .end_array()
        .key("findings")
        .begin_array()
        .begin_object()
        .key("rule")
        .null()
        .key("message")
        .write_string(&format!("Parsing error: {message}"))
        .key("start")
        .begin_object()
        .key("line")
        .write_number(line)
        .key("column")
        .write_number(column)
        .end_object()
        .key("end")
        .null()
        .end_object()
        .end_array()
        .end_object();
    w.finish()
}

/// An upper bound on the report's length, unless a message needs many escapes.
fn capacity<'a>(rules: impl IntoIterator<Item = &'a str>, findings: &[Finding]) -> usize {
    let rules: usize = rules.into_iter().map(|r| r.len() + 8).sum();
    let findings: usize = findings
        .iter()
        .map(|f| FINDING_BYTES + f.diagnostic.code.len() + f.diagnostic.message.len())
        .sum();
    64 + rules + findings
}

fn position(w: &mut StructuredDataWriter, positions: Positions<'_>, offset: u32) {
    let (line, column) = positions.at(offset);
    w.begin_object()
        .key("line")
        .write_number(line)
        .key("column")
        .write_number(column + 1)
        .end_object();
}

#[cfg(test)]
mod tests;
