use super::{has_emoji_sequence, string_width};

/// Each width is Prettier 3.9.10's, measured as the narrowest `printWidth` that keeps
/// `group([text, line, "x"])` flat, minus two.
#[test]
fn measures_text_as_prettier_does() {
    for (text, width) in [
        ("", 0),
        ("hello", 5),
        ("日本語", 6),
        ("e\u{301}", 1),
        ("·", 1),
        ("\t", 0),
        ("\x7F", 1),
        ("\x07", 0),
        ("\u{85}", 0),
        ("\u{200B}", 1),
        ("\u{FEFF}", 1),
        ("\u{AD}", 1),
        ("\u{180E}", 1),
        ("🚀", 2),
        ("❤", 1),
        ("☺", 1),
        ("©", 1),
        ("\u{3000}", 2),
        ("Ａ", 2),
        ("ｱ", 1),
        ("한", 2),
        ("\u{1160}", 1),
        ("\u{300}", 0),
        ("☔", 2),
        ("⌚", 2),
        ("©\u{FE0F}", 2),
        ("‼\u{FE0F}", 2),
        ("a\u{FE0F}", 1),
        ("🚀\u{FE0F}", 2),
        ("1\u{FE0F}\u{20E3}", 2),
        ("#\u{FE0F}\u{20E3}", 2),
        ("1\u{20E3}", 2),
        ("🇯🇵", 2),
        ("🇯🇵🇯", 3),
        ("a\u{200D}b", 3),
        ("🇯", 1),
        ("\u{20E3}", 1),
        ("〰\u{FE0F}", 2),
        ("⌚\u{FE0F}", 2),
        ("\u{2049}\u{FE0F}", 2),
        ("x1\u{FE0F}\u{20E3}y", 4),
        ("1\u{FE0F}", 1),
        ("🇯🇵a", 3),
        // Text-default emoji that emoji-regex matches alone, and East Asian Wide marks.
        ("\u{261D}", 2),
        ("\u{1F590}", 2),
        ("\u{302A}", 2),
        ("\u{3164}", 2),
        // Wide in newer Unicode data than Prettier's.
        ("\u{17A4}", 1),
        ("\u{18E00}", 1),
        ("\u{1FA8B}", 1),
        ("a\u{7F}", 2),
        ("é\u{7F}", 1),
        ("\u{7F}", 1),
    ] {
        assert_eq!(string_width(text), width, "{text:?}");
    }
}

#[test]
fn emoji_sequences_are_named_not_measured() {
    for text in ["👋🏽", "🚀🏽", "👨‍👩‍👧‍👦", "←\u{FE0F}", "🏴\u{E0067}", "a\u{FE0F}"]
    {
        assert!(has_emoji_sequence(text), "{text:?}");
    }
    for text in [
        "hello",
        "日本語",
        "🚀",
        "\t",
        "🇯🇵",
        "1️⃣",
        "❤️",
        "a\u{200D}b",
    ] {
        assert!(!has_emoji_sequence(text), "{text:?}");
    }
}
