use std::borrow::Cow;

use super::lowercase;

#[test]
fn lowercase_borrows_a_name_with_nothing_to_lower() {
    assert!(matches!(lowercase("div"), Cow::Borrowed("div")));
    assert!(matches!(lowercase("my-element"), Cow::Borrowed(_)));
    assert_eq!(lowercase("DIV"), "div");
    assert_eq!(lowercase("onClick"), "onclick");
    assert_eq!(lowercase("\u{c4}x"), "\u{e4}x");
}
