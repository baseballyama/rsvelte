use super::*;

#[test]
fn utf16_columns_count_surrogate_pairs() {
    let source_text = "a😀b\nc";
    let index = LineIndex::new(source_text);
    let b = source_text.find('b').unwrap() as u32;
    let lc = index.line_column(b);
    assert_eq!((lc.line, lc.column, lc.character), (1, 3, 3));
    let c = source_text.find('c').unwrap() as u32;
    let lc = index.line_column(c);
    assert_eq!((lc.line, lc.column, lc.character), (2, 0, 5));
    assert_eq!(index.offset(1, 3), Some(b));
}

#[test]
fn offset_accepts_a_line_end_and_nothing_past_it() {
    let source_text = "a😀\nbc";
    let index = LineIndex::new(source_text);
    assert_eq!(
        index.offset(1, 3),
        Some(source_text.find('\n').unwrap() as u32)
    );
    assert_eq!(index.offset(1, 4), None);
    assert_eq!(index.offset(1, 2), None, "inside the surrogate pair");
    assert_eq!(index.offset(2, 2), Some(source_text.len() as u32));
    assert_eq!(index.offset(2, 3), None);
    assert_eq!(index.offset(3, 0), None);
    assert_eq!(index.offset(0, 0), None);
}

#[test]
fn a_crlf_terminator_is_not_part_of_the_line() {
    let index = LineIndex::new("a\r\nb");
    assert_eq!(index.offset(1, 1), Some(1));
    assert_eq!(index.offset(1, 2), None);
    assert_eq!(index.offset(2, 0), Some(3));
}

#[test]
fn an_offset_inside_a_character_rounds_down_to_its_start() {
    let source_text = "é😀x";
    let index = LineIndex::new(source_text);
    assert_eq!(index.utf16(1), 0, "inside é");
    assert_eq!(index.utf16(2), 1);
    assert_eq!(index.utf16(4), 1, "inside the emoji");
    assert_eq!(index.utf16(6), 3);
    assert_eq!(index.utf16(7), 4);
    assert_eq!(index.utf16(99), 4, "past the end");
    assert_eq!(index.line_column(99).line, 1);
}

/// Every boundary maps to what walking the text gives, and back.
#[test]
fn utf16_and_offset_agree_with_a_walk_of_the_text() {
    let source_text = "aé\n😀b\n\nçd😀\n";
    let index = LineIndex::new(source_text);
    let (mut utf16, mut line, mut column) = (0, 1, 0);
    for (i, ch) in source_text
        .char_indices()
        .chain([(source_text.len(), '\0')])
    {
        let i = i as u32;
        assert_eq!(index.utf16(i), utf16, "utf16 at {i}");
        let lc = index.line_column(i);
        assert_eq!((lc.line, lc.column), (line, column), "line_col at {i}");
        assert_eq!(
            index.offset(line, column),
            Some(i),
            "offset of {line}:{column}"
        );
        utf16 += ch.len_utf16() as u32;
        if ch == '\n' {
            (line, column) = (line + 1, 0);
        } else {
            column += ch.len_utf16() as u32;
        }
    }
}

#[test]
fn byte_inverts_utf16_on_character_boundaries() {
    let source_text = "aé😀b";
    let lines = LineIndex::new(source_text);
    for (byte, _) in source_text.char_indices().chain([(source_text.len(), ' ')]) {
        let byte = byte as u32;
        assert_eq!(lines.byte(lines.utf16(byte)), Some(byte));
    }
    // Between the surrogates of the emoji, and past the end.
    assert_eq!(lines.byte(3), None);
    assert_eq!(lines.byte(6), None);
}
