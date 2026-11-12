use super::{Replacement, apply_fixes};
use crate::source::positions::Span;

fn replace(start: u32, end: u32, text: &str) -> Replacement {
    Replacement {
        span: Span::new(start, end),
        text: text.to_owned(),
    }
}

#[test]
fn fixes_apply_in_range_order_and_overlaps_wait() {
    let fixes = [replace(4, 5, "Z"), replace(0, 2, "X"), replace(1, 3, "Y")];
    assert_eq!(apply_fixes("abcdef", &fixes), "XcdZf");
    assert_eq!(apply_fixes("abc", []), "abc");
}

#[test]
fn a_fix_that_starts_where_the_last_ends_waits() {
    let fixes = [replace(0, 1, "X"), replace(1, 1, "Y")];
    assert_eq!(apply_fixes("ab", &fixes), "Xb");
}
