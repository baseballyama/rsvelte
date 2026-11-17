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

#[test]
fn ecmascript_lines_also_end_at_a_lone_cr_and_the_unicode_separators() {
    let source_text = "a\rb\u{2028}c\u{2029}d\r\ne\nf";
    let newline = LineIndex::new(source_text);
    let ecmascript = LineIndex::with_breaks(source_text, LineBreaks::Ecmascript);
    let f = source_text.find('f').unwrap() as u32;
    assert_eq!((newline.line(f), newline.line_count()), (3, 3));
    assert_eq!((ecmascript.line(f), ecmascript.line_count()), (6, 6));
    for (ch, line) in [('a', 1), ('b', 2), ('c', 3), ('d', 4), ('e', 5), ('f', 6)] {
        let at = source_text.find(ch).unwrap() as u32;
        let lc = ecmascript.line_column(at);
        assert_eq!((lc.line, lc.column), (line, 0), "{ch}");
        assert_eq!(ecmascript.line(at), line, "{ch}");
        assert_eq!(ecmascript.offset(line, 0), Some(at), "{ch}");
        // Each line is one character long: its terminator is not part of it.
        assert_eq!(ecmascript.offset(line, 1), Some(at + 1), "{ch}");
        assert_eq!(ecmascript.offset(line, 2), None, "{ch}");
    }
}

#[test]
fn a_line_span_leaves_out_the_terminator() {
    let source_text = "ab\r\nc\u{2028}\nd";
    let ecmascript = LineIndex::with_breaks(source_text, LineBreaks::Ecmascript);
    let lines: Vec<&str> = (1..=ecmascript.line_count() as u32)
        .map(|line| ecmascript.line_span(line).unwrap().text(source_text))
        .collect();
    assert_eq!(lines, ["ab", "c", "", "d"]);
    assert_eq!(ecmascript.line_span(0), None);
    assert_eq!(ecmascript.line_span(5), None);
    let newline = LineIndex::new(source_text);
    assert_eq!(newline.line_span(2).unwrap().text(source_text), "c\u{2028}");
}

#[test]
fn a_cursor_agrees_with_the_index_on_any_order_of_offsets() {
    let pieces = [
        "a",
        "bc",
        "\n",
        "\r\n",
        "\r",
        "é",
        "😀",
        "\u{2028}",
        "x\u{2029}",
        "    ",
    ];
    let mut state = 0x9E37_79B9_7F4A_7C15_u64;
    let mut next = |n: u64| {
        state ^= state << 13;
        state ^= state >> 7;
        state ^= state << 17;
        state % n
    };
    for _ in 0..200 {
        let text: String = (0..next(400)).map(|_| pieces[next(10) as usize]).collect();
        let len = text.len() as u64;
        for breaks in [LineBreaks::Newline, LineBreaks::Ecmascript] {
            let index = LineIndex::with_breaks(&text, breaks);
            for given in [Some(&index), None] {
                let mut cursor = LineCursor::new(&text, breaks, given);
                let mut at = 0_u64;
                for _ in 0..300 {
                    // Mostly small steps forward, sometimes a jump anywhere, past the end included.
                    at = if next(8) == 0 {
                        next(len + 2)
                    } else {
                        at + next(6)
                    };
                    let at = at as u32;
                    let (want, got) = (index.line_column(at), cursor.line_column(at));
                    assert_eq!(
                        (got.line, got.column, got.character),
                        (want.line, want.column, want.character),
                        "{text:?} {breaks:?} at {at}"
                    );
                }
            }
        }
    }
}

/// The line starts and long breaks of `text`, found by reading every byte.
fn breaks_by_every_byte(text: &str, breaks: LineBreaks) -> (Vec<u32>, Vec<(u32, u32)>) {
    let (bytes, ecmascript) = (text.as_bytes(), breaks == LineBreaks::Ecmascript);
    let (mut starts, mut long) = (vec![0_u32], Vec::new());
    let mut push = |next: usize, len: u32, starts: &mut Vec<u32>| {
        if len > 1 {
            long.push((starts.len() as u32 - 1, len));
        }
        starts.push(next as u32);
    };
    for (i, &byte) in bytes.iter().enumerate() {
        let after_cr = i > 0 && bytes[i - 1] == b'\r';
        match byte {
            b'\n' if after_cr && ecmascript => {}
            b'\n' => push(i + 1, if after_cr { 2 } else { 1 }, &mut starts),
            b'\r' if ecmascript && bytes.get(i + 1) == Some(&b'\n') => push(i + 2, 2, &mut starts),
            b'\r' if ecmascript => push(i + 1, 1, &mut starts),
            0xE2 if ecmascript && matches!(bytes.get(i + 1..i + 3), Some([0x80, 0xA8 | 0xA9])) => {
                push(i + 3, 3, &mut starts);
            }
            _ => {}
        }
    }
    (starts, long)
}

#[test]
fn an_index_finds_the_breaks_that_reading_every_byte_finds() {
    let pieces = [
        "a", "\n", "\r\n", "\r", "\n\r", "é", "€", "😀", "\u{2028}", "\u{2029}", "\u{2027}",
    ];
    let mut state = 0x2545_F491_4F6C_DD1D_u64;
    let mut next = |n: u64| {
        state ^= state << 13;
        state ^= state >> 7;
        state ^= state << 17;
        state % n
    };
    for _ in 0..500 {
        let text: String = (0..next(300)).map(|_| pieces[next(11) as usize]).collect();
        for breaks in [LineBreaks::Newline, LineBreaks::Ecmascript] {
            let index = LineIndex::with_breaks(&text, breaks);
            let (starts, long) = breaks_by_every_byte(&text, breaks);
            assert_eq!(
                (index.line_starts.as_slice(), index.long_breaks.as_slice()),
                (starts.as_slice(), long.as_slice()),
                "{text:?} {breaks:?}"
            );
        }
    }
}
