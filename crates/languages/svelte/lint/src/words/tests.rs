use super::words;

fn texts(text: &str) -> Vec<&str> {
    words(text, 10)
        .into_iter()
        .map(|span| &text[span.start_offset as usize - 10..span.end_offset as usize - 10])
        .collect()
}

#[test]
fn splits_at_separators_of_any_width() {
    assert_eq!(
        texts(" a\u{a0}b\u{3000}c, d,,e\u{feff}"),
        ["a", "b", "c", "d", "e"]
    );
}

#[test]
fn keeps_a_trailing_word() {
    assert_eq!(texts("a b"), ["a", "b"]);
}

#[test]
fn next_line_does_not_separate_words() {
    assert_eq!(texts("a\u{85}b"), ["a\u{85}b"]);
}
