use super::*;

// From Node: `"a\u0085b﻿c".split(/\s+/u)` is `["a\u0085b", "c"]`.
#[test]
fn javascript_whitespace_is_not_rusts() {
    assert_eq!(
        split_javascript_whitespace("a\u{85}b\u{feff}c").collect::<Vec<_>>(),
        ["a\u{85}b", "c"]
    );
    assert_eq!(trim_javascript("\u{feff} a \u{85}"), "a \u{85}");
}
