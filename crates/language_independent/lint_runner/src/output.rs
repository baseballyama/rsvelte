//! Findings as `ESLint` reports them.

use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::LineIndex;

/// Bytes of one finding's pretty JSON beyond its rule and message, with room for large positions,
/// so the output is allocated once.
const FINDING_BYTES: usize = 200;

/// `{rules, findings: [{rule, message, start: {line, column}, end: {line, column}}]}` with
/// `ESLint`'s positions: 1-based lines and 1-based UTF-16 columns.
///
/// `end` is `null` for a finding without one ([`Diagnostic::has_end`]).
///
/// `rules` are the rules that ran, so a comparison can tell a rule that found nothing from one
/// that was never run.
#[must_use]
pub fn render_json<'a>(
    lines: &LineIndex,
    rules: impl IntoIterator<Item = &'a str> + Clone,
    findings: &[Diagnostic],
) -> String {
    let mut w = StructuredDataWriter::with_capacity(true, capacity(rules.clone(), findings));
    w.begin_object().key("rules").begin_array();
    for r in rules {
        w.write_string(r);
    }
    w.end_array().key("findings").begin_array();
    for d in findings {
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
fn capacity<'a>(rules: impl IntoIterator<Item = &'a str>, findings: &[Diagnostic]) -> usize {
    let rules: usize = rules.into_iter().map(|r| r.len() + 8).sum();
    let findings: usize = findings
        .iter()
        .map(|d| FINDING_BYTES + d.code.len() + d.message.len())
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
mod tests {
    use rsvelte_kernel::source::positions::Span;

    use super::*;

    #[test]
    fn columns_are_one_based_utf16() {
        let source_text = "é\n😀x";
        let at = source_text.find('x').expect("test contains x") as u32;
        let d = Diagnostic::error("r", "m", Span::new(at, at + 1));
        let json = render_json(&LineIndex::new(source_text), ["r"], &[d]);
        assert!(
            json.contains("\"line\": 2,\n\t\t\t\t\"column\": 3"),
            "{json}"
        );
    }

    #[test]
    fn point_reports_have_no_end_and_empty_ranges_keep_their_end() {
        let lines = LineIndex::new("x");
        let point = Diagnostic::error("point", "message", Span::new(0, 0)).without_end();
        let range = Diagnostic::error("range", "message", Span::new(0, 0));
        let json = render_json(&lines, ["point", "range", "empty"], &[point, range]);
        assert_eq!(json.matches("\"end\": null").count(), 1);
        assert_eq!(json.matches("\"end\": {").count(), 1);
        assert!(json.contains("\"empty\""));
        assert_eq!(json.matches("\"rule\":").count(), 2);
    }

    #[test]
    fn the_estimate_holds_the_whole_report() {
        let source_text = "a\n".repeat(100_000);
        let lines = LineIndex::new(&source_text);
        let end = source_text.len() as u32;
        let findings: Vec<_> = (0..50)
            .map(|_| Diagnostic::error("rule", "a \"quoted\" message", Span::new(end - 1, end)))
            .collect();
        let json = render_json(&lines, ["rule"], &findings);
        // A grown string has a capacity other than the one it started with.
        assert_eq!(
            json.capacity(),
            capacity(["rule"], &findings),
            "{}",
            json.len()
        );
    }
}
