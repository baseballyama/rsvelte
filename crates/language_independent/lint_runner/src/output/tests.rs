use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

use super::*;

#[test]
fn columns_are_one_based_utf16() {
    let source_text = "é\n😀x";
    let at = source_text.find('x').expect("test contains x") as u32;
    let d = Diagnostic::error("r", "m", Span::new(at, at + 1));
    let lines = LineIndex::new(source_text);
    let json = render_json(Positions::new(&lines, source_text), ["r"], &[d.into()]);
    assert!(
        json.contains("\"line\": 2,\n\t\t\t\t\"column\": 3"),
        "{json}"
    );
}

#[test]
fn columns_of_the_first_line_start_after_a_byte_order_mark() {
    let source_text = "\u{feff}ab\nc";
    let lines = LineIndex::new(source_text);
    let positions = Positions::new(&lines, source_text);
    let at = |text: &str| source_text.find(text).expect("in the source") as u32;
    assert_eq!(positions.at(at("b")), (1, 1));
    assert_eq!(positions.at(0), (1, 0));
    assert_eq!(positions.at(at("c")), (2, 0));
    let plain = LineIndex::new("ab");
    assert_eq!(Positions::new(&plain, "ab").at(1), (1, 1));
}

#[test]
fn point_reports_have_no_end_and_empty_ranges_keep_their_end() {
    let lines = LineIndex::new("x");
    let point = Diagnostic::error("point", "message", Span::new(0, 0)).without_end();
    let range = Diagnostic::error("range", "message", Span::new(0, 0));
    let json = render_json(
        Positions::new(&lines, "x"),
        ["point", "range", "empty"],
        &[point.into(), range.into()],
    );
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
    let findings: Vec<Finding> = (0..50)
        .map(|_| Diagnostic::error("rule", "a \"quoted\" message", Span::new(end - 1, end)).into())
        .collect();
    let json = render_json(Positions::new(&lines, &source_text), ["rule"], &findings);
    // A grown string has a capacity other than the one it started with.
    assert_eq!(
        json.capacity(),
        capacity(["rule"], &findings),
        "{}",
        json.len()
    );
}
