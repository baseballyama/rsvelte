use tower_lsp_server::gen_lsp_types::Position;

use super::{edit, lines, position};

#[test]
fn a_line_ends_at_cr_lf_or_crlf_and_a_column_counts_utf16_units() {
    for text in ["a\nb", "a\rb", "a\r\nb"] {
        let at = text.find('b').unwrap() as u32;
        assert_eq!(position(&lines(text), at), Position::new(1, 0), "{text:?}");
    }
    // U+2028 ends a line for ECMAScript, not for the protocol.
    let text = "a\u{2028}b";
    assert_eq!(
        position(&lines(text), text.find('b').unwrap() as u32),
        Position::new(0, 2)
    );
    let text = "😀é b";
    assert_eq!(
        position(&lines(text), text.find('b').unwrap() as u32),
        Position::new(0, 4)
    );
    // Past the end is the end, not a panic.
    assert_eq!(position(&lines("ab"), 99), Position::new(0, 2));
}

#[test]
fn equal_texts_need_no_edit() {
    assert!(edit("same", "same").is_none());
}

/// `text` with `edit` applied, its positions read as a client reads them.
fn apply(text: &str, edit: &tower_lsp_server::gen_lsp_types::TextEdit) -> String {
    let offset = |p: Position| {
        let mut at = 0;
        for _ in 0..p.line {
            let rest = &text[at..];
            let end = rest.find(['\r', '\n']).expect("the line exists");
            at += end
                + if rest[end..].starts_with("\r\n") {
                    2
                } else {
                    1
                };
        }
        let mut units = 0;
        for (i, c) in text[at..].char_indices() {
            if units >= p.character || c == '\r' || c == '\n' {
                return at + i;
            }
            units += c.len_utf16() as u32;
        }
        text.len()
    };
    let (start, end) = (offset(edit.range.start), offset(edit.range.end));
    format!("{}{}{}", &text[..start], edit.new_text, &text[end..])
}

#[test]
fn an_edit_never_splits_a_line_break_or_a_character() {
    for (old, new) in [
        ("a\r\nb", "a\r\r\nb"),
        ("a\r\nb", "a\rb"),
        ("x\r\n", "x\n"),
        ("é", "è"),
        ("😀", "😁"),
        ("ab", "a😀b"),
    ] {
        let edit = edit(old, new).expect("the texts differ");
        assert_eq!(apply(old, &edit), new, "{old:?} -> {new:?}");
    }
}

#[test]
fn an_edit_turns_any_text_into_any_other() {
    let pieces = ["a", "\n", "\r\n", "\r", "é", "😀", "\u{2028}", " "];
    let mut state = 0x9E37_79B9_7F4A_7C15_u64;
    let mut next = |n: u64| {
        state ^= state << 13;
        state ^= state >> 7;
        state ^= state << 17;
        state % n
    };
    let text = |next: &mut dyn FnMut(u64) -> u64| -> String {
        (0..next(12)).map(|_| pieces[next(8) as usize]).collect()
    };
    for _ in 0..5000 {
        let old = text(&mut next);
        // Mostly a small change to `old`, as a formatter makes.
        let new = if next(2) == 0 {
            text(&mut next)
        } else {
            let cut = (0..=old.len())
                .filter(|&i| old.is_char_boundary(i))
                .nth(next(old.chars().count() as u64 + 1) as usize)
                .unwrap_or(0);
            format!("{}{}{}", &old[..cut], text(&mut next), &old[cut..])
        };
        match edit(&old, &new) {
            Some(edit) => assert_eq!(apply(&old, &edit), new, "{old:?} -> {new:?}"),
            None => assert_eq!(old, new),
        }
    }
}
