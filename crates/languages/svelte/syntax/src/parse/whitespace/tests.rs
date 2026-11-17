use super::{trim_whitespace_start, whitespace_len};

#[test]
fn whitespace_after_ascii_whitespace_is_trimmed_too() {
    assert_eq!(trim_whitespace_start(" \t\n\u{0B}\u{0C}\ra"), "a");
    assert_eq!(trim_whitespace_start(" \u{A0}\u{FEFF} \u{3000}a"), "a");
    assert_eq!(trim_whitespace_start(" \u{85}a"), "\u{85}a");
    assert_eq!(trim_whitespace_start(" é"), "é");
    assert_eq!(trim_whitespace_start("  "), "");
    assert_eq!(whitespace_len("\u{2028} a"), 4);
}
