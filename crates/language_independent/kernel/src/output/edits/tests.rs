use super::*;

#[test]
#[should_panic(expected = "edit outside the range")]
fn an_edit_before_the_range_is_reported_as_outside_it() {
    let mut e = Edits::default();
    e.insert(1, "x");
    drop(e.apply_in("abcdef", Span::new(2, 4)));
}

#[test]
fn edits_apply_in_order() {
    let mut e = Edits::default();
    e.insert(4, ".h");
    e.replace(Span::new(0, 1), "X");
    assert_eq!(e.apply_in(".big {}", Span::new(0, 7)), "Xbig.h {}");
}

#[test]
fn a_deletion_does_not_reserve_the_deleted_text() {
    let source_text = "x".repeat(64 * 1024);
    let mut e = Edits::default();
    e.replace(Span::new(0, source_text.len() as u32), "");
    let out = e.apply_in(&source_text, Span::new(0, source_text.len() as u32));
    assert_eq!(out, "");
    assert_eq!(out.capacity(), 0);
}
