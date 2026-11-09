//! The words of a comment, the way upstream's regular expressions split them.

use rsvelte_kernel::source::positions::Span;

/// JavaScript's `\s`.
pub(crate) const fn is_js_space(c: char) -> bool {
    matches!(
        c,
        '\t' | '\n' | '\u{b}' | '\u{c}' | '\r' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200a}'
                | '\u{2028}'
                | '\u{2029}'
                | '\u{202f}'
                | '\u{205f}'
                | '\u{3000}'
                | '\u{feff}'
    )
}

/// The runs of `text` between commas and `\s`, as spans of the document `text` starts at `base` in.
pub(crate) fn words(text: &str, base: u32) -> Vec<Span> {
    let mut out = Vec::new();
    let mut start = None;
    for (i, c) in text.char_indices() {
        let separator = c == ',' || is_js_space(c);
        match (start, separator) {
            (None, false) => start = Some(i),
            (Some(s), true) => {
                out.push(span(base, s, i));
                start = None;
            }
            _ => {}
        }
    }
    if let Some(s) = start {
        out.push(span(base, s, text.len()));
    }
    out
}

fn span(base: u32, start: usize, end: usize) -> Span {
    let offset = |i: usize| base + u32::try_from(i).expect("a document is smaller than 4 GiB");
    Span::new(offset(start), offset(end))
}

#[cfg(test)]
mod tests;
