//! Findings as `ESLint` reports them.

use rsvelte_kernel::computation::task::TaskOutput;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::{LineIndex, Span};

use crate::finding::Finding;

/// Bytes of one finding's pretty JSON beyond its rule and message, with room for large positions,
/// so the output is allocated once.
const FINDING_BYTES: usize = 200;

/// A lint task's output: `lint.json` as [`render_json`] writes it, and each finding with its fix.
pub fn report<'a>(
    out: &mut TaskOutput,
    lines: &LineIndex,
    rules: impl IntoIterator<Item = &'a str> + Clone,
    findings: Vec<Finding>,
) {
    out.file("lint.json", render_json(lines, rules, &findings));
    out.findings
        .extend(findings.into_iter().map(Finding::reported));
}

/// A lint task's output when the document does not parse: `lint.json` as
/// [`render_parse_error`] writes it, and the error as the one finding.
pub fn report_parse_error(out: &mut TaskOutput, lines: &LineIndex, message: &str, offset: u32) {
    out.file("lint.json", render_parse_error(lines, message, offset));
    out.findings.push(rsvelte_kernel::diagnostics::Finding {
        diagnostic: Diagnostic::error("parse_error", message, Span::new(offset, offset))
            .without_end(),
        fix: Vec::new(),
    });
}

/// `{rules, findings: [{rule, message, start: {line, column}, end: {line, column}}]}` with
/// `ESLint`'s positions: 1-based lines and 1-based UTF-16 columns.
///
/// `lines` counts lines as `ESLint` does, with
/// [`LineBreaks::Ecmascript`](rsvelte_kernel::source::positions::LineBreaks).
///
/// `end` is `null` for a finding without one
/// ([`has_end`](rsvelte_kernel::diagnostics::Diagnostic::has_end)).
///
/// `rules` are the rules that ran, so a comparison can tell a rule that found nothing from one
/// that was never run.
#[must_use]
pub fn render_json<'a>(
    lines: &LineIndex,
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
        position(&mut w, lines, d.span.start_offset);
        w.key("end");
        if d.has_end {
            position(&mut w, lines, d.span.end_offset);
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
pub fn render_parse_error(lines: &LineIndex, message: &str, offset: u32) -> String {
    let at = lines.line_column(offset);
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
        .write_number(at.line)
        .key("column")
        .write_number(at.column)
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

fn position(w: &mut StructuredDataWriter, lines: &LineIndex, offset: u32) {
    let at = lines.line_column(offset);
    w.begin_object()
        .key("line")
        .write_number(at.line)
        .key("column")
        .write_number(at.column + 1)
        .end_object();
}

#[cfg(test)]
mod tests;
