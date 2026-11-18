use super::{is_ecmascript_whitespace, split_ecmascript_whitespace, trim_ecmascript};

#[test]
fn ecmascript_whitespace_is_unicode_white_space_with_bom_and_without_nel() {
    for c in (0..=0x10_FFFF).filter_map(char::from_u32) {
        let expected = (c.is_whitespace() && c != '\u{85}') || c == '\u{FEFF}';
        assert_eq!(is_ecmascript_whitespace(c), expected, "U+{:04X}", c as u32);
    }
    assert_eq!(trim_ecmascript("\u{FEFF} a\u{85}\u{3000}"), "a\u{85}");
}

// From Node: `"a\u0085b\ufeffc".split(/\s+/u)` is `["a\u0085b", "c"]`.
#[test]
fn ecmascript_whitespace_splits_words() {
    assert_eq!(
        split_ecmascript_whitespace("a\u{85}b\u{FEFF}c").collect::<Vec<_>>(),
        ["a\u{85}b", "c"]
    );
    assert_eq!(split_ecmascript_whitespace(" \t").count(), 0);
}
