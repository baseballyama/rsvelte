//! The words of a comment, the way upstream's regular expressions split them.

pub(crate) use rsvelte_kernel::source::characters::is_ecmascript_whitespace as is_javascript_space;
use rsvelte_kernel::source::positions::Span;

/// The runs of `text` between commas and `\s`, as spans of the document `text` starts at `base` in.
pub(crate) fn words(text: &str, base: u32) -> Vec<Span> {
    let mut out = Vec::new();
    let mut start = None;
    for (i, c) in text.char_indices() {
        let separator = c == ',' || is_javascript_space(c);
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
