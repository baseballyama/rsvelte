use super::string_width;

#[test]
fn measures_text_columns() {
    assert_eq!(string_width(""), 0);
    assert_eq!(string_width("hello"), 5);
    assert_eq!(string_width("日本語"), 6);
    assert_eq!(string_width("e\u{301}"), 1);
    assert_eq!(string_width("·"), 1);
    assert_eq!(string_width("\t"), 1);
}

#[test]
fn measures_emoji_sequences_as_clusters() {
    assert_eq!(string_width("🚀"), 2);
    assert_eq!(string_width("👋🏽"), 2);
    assert_eq!(string_width("👨‍👩‍👧‍👦"), 2);
    assert_eq!(string_width("🇯🇵"), 2);
    assert_eq!(string_width("1️⃣"), 2);
}
