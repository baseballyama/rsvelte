use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::LineIndex;

/// `{rules, findings: [{rule, message, start: {line, column}, end: {line, column}}]}` with
/// `ESLint`'s positions: 1-based lines and 1-based UTF-16 columns.
///
/// `end` is `null` for a finding without one ([`Diagnostic::has_end`]).
///
/// `rules` are the rules that ran, so a comparison can tell a rule that found nothing from one
/// that was never run.
#[must_use]
pub fn render_json(lines: &LineIndex, rules: &[&str], findings: &[Diagnostic]) -> String {
    render_json_with_rules(lines, rules.iter().copied(), findings)
}

#[must_use]
pub fn render_json_with_rules(
    lines: &LineIndex,
    rules: impl IntoIterator<Item = impl AsRef<str>>,
    findings: &[Diagnostic],
) -> String {
    let mut w = StructuredDataWriter::new(true);
    w.begin_object().key("rules").begin_array();
    for r in rules {
        w.write_string(r.as_ref());
    }
    w.end_array().key("findings").begin_array();
    for d in findings {
        w.begin_object()
            .key("rule")
            .write_string(&d.code)
            .key("message")
            .write_string(&d.message);
        for (key, at) in [("start", d.span.start_offset), ("end", d.span.end_offset)] {
            w.key(key);
            if key == "end" && !d.has_end {
                w.null();
                continue;
            }
            let lc = lines.line_column(at);
            w.begin_object()
                .key("line")
                .write_number(lc.line)
                .key("column")
                .write_number(lc.column + 1)
                .end_object();
        }
        w.end_object();
    }
    w.end_array().end_object();
    w.finish()
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
        let json = render_json(&LineIndex::new(source_text), &["r"], &[d]);
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
        let json = render_json(&lines, &["point", "range", "empty"], &[point, range]);
        assert_eq!(json.matches("\"end\": null").count(), 1);
        assert_eq!(json.matches("\"end\": {").count(), 1);
        assert!(json.contains("\"empty\""));
        assert_eq!(json.matches("\"rule\":").count(), 2);
    }
}
