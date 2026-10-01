//! Positions. A [`Span`] is a half-open UTF-8 byte range inside one document; which document is
//! always known from context, so the file identifier is not stored per node.

use crate::performance::buffer_pool;

/// 8 bytes. Always a real range: a node without a source position has a [`SourceLocation`], not a
/// `Span`.
#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug, Default)]
pub struct Span {
    pub start_offset: u32,
    pub end_offset: u32,
}

impl Span {
    #[inline]
    #[must_use]
    pub const fn new(start_offset: u32, end_offset: u32) -> Self {
        debug_assert!(
            start_offset <= end_offset && end_offset < MAXIMUM_SOURCE_LENGTH,
            "span out of order or past MAXIMUM_SOURCE_LENGTH"
        );
        Self {
            start_offset,
            end_offset,
        }
    }

    #[inline]
    #[must_use]
    pub fn text(self, source_text: &str) -> &str {
        &source_text[self.start_offset as usize..self.end_offset as usize]
    }

    #[inline]
    #[must_use]
    pub const fn len(self) -> u32 {
        self.end_offset - self.start_offset
    }

    #[inline]
    #[must_use]
    pub const fn is_empty(self) -> bool {
        self.end_offset == self.start_offset
    }

    #[inline]
    #[must_use]
    pub const fn to(self, other: Self) -> Self {
        Self {
            start_offset: self.start_offset,
            end_offset: other.end_offset,
        }
    }
}

/// Line starts plus a UTF-16 view of one document.
///
/// Built once per document when something needs line/column or JavaScript string offsets
/// (diagnostics, source maps). Every query is answered from the tables alone, by binary search,
/// without the text; a pure-ASCII document has no UTF-16 table.
#[derive(Debug)]
pub struct LineIndex {
    line_starts: Vec<u32>,
    /// Lines whose terminator is CRLF, by zero-based line index.
    crlf: Vec<u32>,
    /// Every non-ASCII character, in order.
    wide: Vec<Wide>,
    len: u32,
}

#[derive(Clone, Copy, Debug)]
struct Wide {
    /// Its bytes.
    start: u32,
    end: u32,
    /// The UTF-16 offset of its start.
    utf16: u32,
}

impl Wide {
    /// The UTF-16 offset just past it: a character outside the BMP is a surrogate pair.
    const fn utf16_end(self) -> u32 {
        self.utf16 + if self.end - self.start == 4 { 2 } else { 1 }
    }
}

#[derive(Debug)]
pub struct LineColumn {
    /// 1-based.
    pub line: u32,
    /// 0-based, in UTF-16 code units (what JavaScript tools report).
    pub column: u32,
    /// 0-based offset from the start of the document, in UTF-16 code units.
    pub character: u32,
}

impl LineIndex {
    #[must_use]
    pub fn new(source_text: &str) -> Self {
        let mut line_starts = buffer_pool::take_keyed::<Self, u32>();
        line_starts.push(0);
        line_starts.extend(
            source_text
                .bytes()
                .enumerate()
                .filter(|&(_, b)| b == b'\n')
                .map(|(i, _)| i as u32 + 1),
        );
        let mut crlf = buffer_pool::take_keyed::<Self, u32>();
        for (line, &start) in line_starts.iter().enumerate().skip(1) {
            let lf = start as usize - 1;
            if lf > 0 && source_text.as_bytes()[lf - 1] == b'\r' {
                crlf.push(line as u32 - 1);
            }
        }
        let mut wide = buffer_pool::take_keyed::<Self, Wide>();
        if !source_text.is_ascii() {
            let mut utf16 = 0u32;
            for (i, ch) in source_text.char_indices() {
                if !ch.is_ascii() {
                    let start = i as u32;
                    wide.push(Wide {
                        start,
                        end: start + ch.len_utf8() as u32,
                        utf16,
                    });
                }
                utf16 += ch.len_utf16() as u32;
            }
        }
        Self {
            line_starts,
            crlf,
            wide,
            len: source_text.len() as u32,
        }
    }

    /// UTF-16 offset of a byte offset. An offset inside a character counts as that character's
    /// start, and one past the end as the end.
    #[must_use]
    pub fn utf16(&self, byte: u32) -> u32 {
        let byte = byte.min(self.len);
        let i = self.wide.partition_point(|w| w.end <= byte);
        if let Some(w) = self.wide.get(i).filter(|w| w.start < byte) {
            return w.utf16;
        }
        i.checked_sub(1).map_or(byte, |j| {
            self.wide[j].utf16_end() + (byte - self.wide[j].end)
        })
    }

    /// The line and column of a byte offset, rounded as [`LineIndex::utf16`] rounds.
    #[must_use]
    pub fn line_column(&self, byte: u32) -> LineColumn {
        let byte = byte.min(self.len);
        let line = self.line_starts.partition_point(|&s| s <= byte) - 1;
        let character = self.utf16(byte);
        LineColumn {
            line: line as u32 + 1,
            column: character - self.utf16(self.line_starts[line]),
            character,
        }
    }

    /// Byte offset of a 1-based line and 0-based UTF-16 column. The column may be the line's end;
    /// `None` past it or inside a surrogate pair, so a position that does not exist is never
    /// replaced by a nearby one that does.
    #[must_use]
    pub fn offset(&self, line: u32, column: u32) -> Option<u32> {
        let l = line.checked_sub(1)? as usize;
        let start = *self.line_starts.get(l)?;
        // The line ends at its newline, or at the end of the text.
        let end = self.line_starts.get(l + 1).map_or(self.len, |&next| {
            let cr = u32::from(self.crlf.binary_search(&(l as u32)).is_ok());
            next - 1 - cr
        });
        let target = self.utf16(start).checked_add(column)?;
        let i = self.wide.partition_point(|w| w.utf16_end() <= target);
        if self.wide.get(i).is_some_and(|w| w.utf16 < target) {
            return None;
        }
        let byte = i.checked_sub(1).map_or(target, |j| {
            self.wide[j].end + (target - self.wide[j].utf16_end())
        });
        (byte <= end).then_some(byte)
    }

    #[must_use]
    pub const fn line_count(&self) -> usize {
        self.line_starts.len()
    }
}

impl Drop for LineIndex {
    fn drop(&mut self) {
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.wide));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.crlf));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.line_starts));
    }
}

// Positions are in every node of every tree; the sizes are part of the layout, not incidental.
const _: () = assert!(size_of::<Span>() == 8, "`Span` is 8 bytes");
const _: () = assert!(
    size_of::<SourceLocation>() == 8,
    "`SourceLocation` keeps \"synthesized\" inside a span's 8 bytes"
);

#[cfg(test)]
mod tests {
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
}

/// Sources must be shorter than this, so that [`SourceLocation`] can keep "synthesized" in the same
/// 8 bytes. Checked once where text enters the pipeline
/// ([`crate::computation::pipeline::Document::new`]).
pub const MAXIMUM_SOURCE_LENGTH: u32 = u32::MAX;

/// Where a tree node came from: a source range, or nowhere (a lowering made it up).
///
/// The only way to read a [`Span`] out of a `SourceLocation` is [`SourceLocation::span`], which
/// forces the caller to handle the synthesized case.
#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub struct SourceLocation(Span);

impl SourceLocation {
    pub const SYNTHETIC: Self = Self(Span {
        start_offset: MAXIMUM_SOURCE_LENGTH,
        end_offset: MAXIMUM_SOURCE_LENGTH,
    });

    #[inline]
    #[must_use]
    pub fn span(self) -> Option<Span> {
        (self != Self::SYNTHETIC).then_some(self.0)
    }
}

impl From<Span> for SourceLocation {
    #[inline]
    fn from(s: Span) -> Self {
        Self(s)
    }
}

impl std::fmt::Debug for SourceLocation {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.span() {
            Some(s) => write!(f, "{}..{}", s.start_offset, s.end_offset),
            None => f.write_str("synthetic"),
        }
    }
}
