//! Edits as the Language Server Protocol writes them: lines that end at CR, LF or CRLF, and
//! columns in UTF-16 code units.

use rsvelte_kernel::source::positions::{LineBreaks, LineIndex, Span};
use tower_lsp_server::gen_lsp_types::{Position, Range, TextEdit};

/// The lines of `text`, as a client counts them.
pub(super) fn lines(text: &str) -> LineIndex {
    LineIndex::with_breaks(text, LineBreaks::LanguageServer)
}

/// The position of byte `offset`, rounded as [`LineIndex::line_column`] rounds.
fn position(lines: &LineIndex, offset: u32) -> Position {
    let at = lines.line_column(offset);
    Position::new(at.line - 1, at.column)
}

/// The range of `span`, rounded as [`position`] rounds.
pub(super) fn range(lines: &LineIndex, span: Span) -> Range {
    Range::new(
        position(lines, span.start_offset),
        position(lines, span.end_offset),
    )
}

/// One edit that turns `old` into `new`: the part between their common start and end, or `None`
/// when they are equal.
pub(super) fn edit(old: &str, new: &str) -> Option<TextEdit> {
    if old == new {
        return None;
    }
    // A position cannot fall between the CR and the LF of a line break: the client would take
    // the end of the line instead.
    let splits = |at: usize| {
        !old.is_char_boundary(at) || (at > 0 && old.as_bytes()[at - 1..].starts_with(b"\r\n"))
    };
    let mut start = (old.bytes().zip(new.bytes()))
        .take_while(|(a, b)| a == b)
        .count();
    while splits(start) || !new.is_char_boundary(start) {
        start -= 1;
    }
    let most = old.len().min(new.len()) - start;
    let mut end = (old.bytes().rev().zip(new.bytes().rev()))
        .take(most)
        .take_while(|(a, b)| a == b)
        .count();
    while splits(old.len() - end) || !new.is_char_boundary(new.len() - end) {
        end -= 1;
    }
    let lines = lines(old);
    let span = Span::new(start as u32, (old.len() - end) as u32);
    Some(TextEdit::new(
        range(&lines, span),
        new[start..new.len() - end].to_owned(),
    ))
}

#[cfg(test)]
mod tests;
