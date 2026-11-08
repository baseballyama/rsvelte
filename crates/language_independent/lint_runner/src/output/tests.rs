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
