use unicode_id_start as unicode_identifier_start;

fn is_identifier_start(c: char) -> bool {
    c == '$' || c == '_' || unicode_identifier_start::is_id_start(c)
}

pub(super) fn is_identifier_continue(c: char) -> bool {
    c == '$' || c == '\u{200c}' || c == '\u{200d}' || unicode_identifier_start::is_id_continue(c)
}

/// The length of the identifier `s` starts with (`$` and `_` included), 0 if none.
pub(super) fn identifier_len(s: &str) -> usize {
    let mut chars = s.char_indices();
    match chars.next() {
        Some((_, c)) if is_identifier_start(c) => {}
        _ => return 0,
    }
    chars
        .find(|&(_, c)| !is_identifier_continue(c))
        .map_or(s.len(), |(i, _)| i)
}

/// The length of the bracketed text `s` starts with, through its matching bracket; strings and
/// template literals are skipped. Upstream `match_bracket`.
pub(super) const fn match_bracket(s: &str, open: u8, close: u8) -> Option<usize> {
    let b = s.as_bytes();
    let mut depth = 0usize;
    let mut i = 0;
    while i < b.len() {
        let c = b[i];
        if c == open || (open != b'<' && matches!(c, b'{' | b'[' | b'(')) {
            depth += 1;
        } else if c == close || (open != b'<' && matches!(c, b'}' | b']' | b')')) {
            depth -= 1;
            if depth == 0 {
                return Some(i + 1);
            }
        } else if matches!(c, b'"' | b'\'' | b'`') {
            i += 1;
            while i < b.len() && b[i] != c {
                if b[i] == b'\\' {
                    i += 1;
                }
                i += 1;
            }
        }
        i += 1;
    }
    None
}
