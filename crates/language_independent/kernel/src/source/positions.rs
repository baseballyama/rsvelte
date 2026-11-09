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
    /// Lines whose terminator is longer than one byte (CRLF, U+2028, U+2029), by zero-based line
    /// index, with the terminator's length.
    long_breaks: Vec<(u32, u32)>,
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

/// Which characters end a line.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum LineBreaks {
    /// `\n` only (a CR before it belongs to the terminator), as the Svelte compiler counts lines.
    Newline,
    /// ECMAScript's line terminators: `\r\n`, `\n`, `\r`, U+2028 and U+2029, as `ESLint` counts
    /// lines.
    Ecmascript,
}

impl LineIndex {
    /// Lines that end at `\n`.
    #[must_use]
    pub fn new(source_text: &str) -> Self {
        Self::with_breaks(source_text, LineBreaks::Newline)
    }

    #[must_use]
    pub fn with_breaks(source_text: &str, breaks: LineBreaks) -> Self {
        let mut line_starts = buffer_pool::take_keyed::<Self, u32>();
        let mut long_breaks = buffer_pool::take_keyed::<Self, (u32, u32)>();
        line_starts.push(0);
        let bytes = source_text.as_bytes();
        let mut push = |next: usize, len: u32| {
            if len > 1 {
                long_breaks.push((line_starts.len() as u32 - 1, len));
            }
            line_starts.push(next as u32);
        };
        let ecmascript = breaks == LineBreaks::Ecmascript;
        for (i, &byte) in bytes.iter().enumerate() {
            let after_cr = i > 0 && bytes[i - 1] == b'\r';
            match byte {
                // A CRLF is counted at its CR.
                b'\n' if after_cr && ecmascript => {}
                b'\n' => push(i + 1, if after_cr { 2 } else { 1 }),
                b'\r' if ecmascript && bytes.get(i + 1) == Some(&b'\n') => push(i + 2, 2),
                b'\r' if ecmascript => push(i + 1, 1),
                // U+2028 and U+2029 are E2 80 A8 and E2 80 A9.
                0xE2 if ecmascript
                    && matches!(bytes.get(i + 1..i + 3), Some([0x80, 0xA8 | 0xA9])) =>
                {
                    push(i + 3, 3);
                }
                _ => {}
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
            long_breaks,
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

    /// Byte offset of a UTF-16 offset; `None` past the end or inside a character, the inverse of
    /// [`LineIndex::utf16`] on character boundaries.
    #[must_use]
    pub fn byte(&self, utf16: u32) -> Option<u32> {
        let i = self.wide.partition_point(|w| w.utf16_end() <= utf16);
        if self.wide.get(i).is_some_and(|w| w.utf16 < utf16) {
            return None;
        }
        let byte = i.checked_sub(1).map_or(utf16, |j| {
            self.wide[j].end + (utf16 - self.wide[j].utf16_end())
        });
        (byte <= self.len).then_some(byte)
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
            let terminator = self
                .long_breaks
                .binary_search_by_key(&(l as u32), |&(line, _)| line)
                .map_or(1, |i| self.long_breaks[i].1);
            next - terminator
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

    /// The 1-based line of a byte offset, without the column.
    #[must_use]
    pub fn line(&self, byte: u32) -> u32 {
        let byte = byte.min(self.len);
        self.line_starts.partition_point(|&s| s <= byte) as u32
    }

    #[must_use]
    pub const fn line_count(&self) -> usize {
        self.line_starts.len()
    }
}

impl Drop for LineIndex {
    fn drop(&mut self) {
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.wide));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.long_breaks));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.line_starts));
    }
}

// Positions are in every node of every tree; the sizes are part of the layout, not incidental.
const _: () = assert!(size_of::<Span>() == 8, "`Span` is 8 bytes");
const _: () = assert!(
    size_of::<SourceLocation>() == 8,
    "`SourceLocation` keeps \"synthesized\" inside a span's 8 bytes"
);

/// Sources must be shorter than this, so that [`SourceLocation`] can keep "synthesized" in the same
/// 8 bytes. Checked once where text enters the pipeline
/// ([`crate::source::document::Document::new`]).
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

#[cfg(test)]
mod tests;
