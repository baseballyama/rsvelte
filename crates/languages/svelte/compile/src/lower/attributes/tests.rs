use std::borrow::Cow;

use super::{lowercase, scoped_class};
use crate::input::Target;

#[test]
fn a_scoped_class_trims_its_start_on_the_server_only() {
    for (value, client, server) in [
        ("", "h", "h"),
        ("a", "a h", "a h"),
        (" a", " a h", "a h"),
        ("  ", "   h", "h"),
    ] {
        assert_eq!(
            scoped_class(value, "h", Target::Client),
            client,
            "{value:?}"
        );
        assert_eq!(
            scoped_class(value, "h", Target::Server),
            server,
            "{value:?}"
        );
    }
}

#[test]
fn lowercase_borrows_a_name_with_nothing_to_lower() {
    assert!(matches!(lowercase("div"), Cow::Borrowed("div")));
    assert!(matches!(lowercase("my-element"), Cow::Borrowed(_)));
    assert_eq!(lowercase("DIV"), "div");
    assert_eq!(lowercase("onClick"), "onclick");
    assert_eq!(lowercase("\u{c4}x"), "\u{e4}x");
}
