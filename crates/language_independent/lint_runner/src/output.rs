//! Findings as `ESLint` reports them.

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::LineIndex;

use crate::finding::Finding;

/// Bytes of one finding's pretty JSON beyond its rule and message, with room for large positions,
/// so the output is allocated once.
const FINDING_BYTES: usize = 200;

/// `{rules, findings: [{rule, message, start: {line, column}, end: {line, column}}]}` with
/// `ESLint`'s positions: 1-based lines and 1-based UTF-16 columns.
///
/// `lines` counts lines as `ESLint` does, with
/// [`LineBreaks::Ecmascript`](rsvelte_kernel::source::positions::LineBreaks).
///
/// `end` is `null` for a finding without one ([`has_end`](rsvelte_kernel::diagnostics::Diagnostic::has_end)).
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
