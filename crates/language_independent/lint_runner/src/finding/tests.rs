use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

use super::*;

fn fixed(span: Span, text: &str) -> Finding {
    let mut finding = Finding::from(Diagnostic::error("r", "m", span));
    finding.fix = Some(Fix::replace(span, text));
    finding
}

#[test]
fn a_merged_fix_keeps_the_text_between_its_edits() {
    let mut fix = Fix::new();
    fix.push(Span::new(4, 5), "D").push(Span::new(0, 1), "A");
    let edit = fix.merged("abcdef").expect("two edits");
    assert_eq!(edit.span, Span::new(0, 5));
    assert_eq!(edit.text, "AbcdD");
}

#[test]
fn overlapping_and_touching_fixes_wait_for_the_next_pass() {
    let findings = [
        fixed(Span::new(2, 4), "Y"),
        fixed(Span::new(0, 2), "X"),
        fixed(Span::new(3, 5), "Z"),
        fixed(Span::new(5, 6), "W"),
    ];
    // `ESLint` skips a fix that starts at or before the last applied end.
    assert_eq!(apply_fixes("abcdef", &findings), "XcZf");
}

#[test]
fn a_suggestion_applies_alone() {
    assert_eq!(apply_fix("abc", &Fix::insert(1, "-")), "a-bc");
    assert_eq!(apply_fix("abc", &Fix::new()), "abc");
}
