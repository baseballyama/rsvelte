//! Positions. A [`Span`] is a half-open UTF-8 byte range inside one document; which document is
//! always known from context, so the file id is not stored per node.

/// 8 bytes. Always a real range: a node without a source position has a [`Loc`], not a `Span`.
#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug, Default)]
pub struct Span {
    pub lo: u32,
    pub hi: u32,
}

impl Span {
    #[inline]
    #[must_use]
    pub const fn new(lo: u32, hi: u32) -> Self {
        debug_assert!(
            lo <= hi && hi < MAX_SOURCE_LEN,
            "span out of order or past MAX_SOURCE_LEN"
        );
        Self { lo, hi }
    }

    #[inline]
    #[must_use]
    pub fn text(self, src: &str) -> &str {
        &src[self.lo as usize..self.hi as usize]
    }

    #[inline]
    #[must_use]
    pub const fn len(self) -> u32 {
        self.hi - self.lo
    }

    #[inline]
    #[must_use]
    pub const fn is_empty(self) -> bool {
        self.hi == self.lo
    }

    #[inline]
    #[must_use]
    pub const fn to(self, other: Self) -> Self {
        Self {
            lo: self.lo,
            hi: other.hi,
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
pub struct LineCol {
    /// 1-based.
    pub line: u32,
    /// 0-based, in UTF-16 code units (what JavaScript tools report).
    pub column: u32,
    /// 0-based offset from the start of the document, in UTF-16 code units.
    pub character: u32,
}

impl LineIndex {
    #[must_use]
    pub fn new(src: &str) -> Self {
        let mut line_starts = vec![0];
        line_starts.extend(
            src.bytes()
                .enumerate()
                .filter(|&(_, b)| b == b'\n')
                .map(|(i, _)| i as u32 + 1),
        );
        let mut wide = Vec::new();
        if !src.is_ascii() {
            let mut utf16 = 0u32;
            for (i, ch) in src.char_indices() {
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
            wide,
            len: src.len() as u32,
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
    pub fn line_col(&self, byte: u32) -> LineCol {
        let byte = byte.min(self.len);
        let line = self.line_starts.partition_point(|&s| s <= byte) - 1;
        let character = self.utf16(byte);
        LineCol {
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
        let end = self
            .line_starts
            .get(l + 1)
            .map_or(self.len, |&next| next - 1);
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

// Positions are in every node of every tree; the sizes are part of the layout, not incidental.
const _: () = assert!(size_of::<Span>() == 8, "`Span` is 8 bytes");
const _: () = assert!(
    size_of::<Loc>() == 8,
    "`Loc` keeps \"synthesized\" inside a span's 8 bytes"
);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn utf16_columns_count_surrogate_pairs() {
        let src = "a😀b\nc";
        let idx = LineIndex::new(src);
        let b = src.find('b').unwrap() as u32;
        let lc = idx.line_col(b);
        assert_eq!((lc.line, lc.column, lc.character), (1, 3, 3));
        let c = src.find('c').unwrap() as u32;
        let lc = idx.line_col(c);
        assert_eq!((lc.line, lc.column, lc.character), (2, 0, 5));
        assert_eq!(idx.offset(1, 3), Some(b));
    }

    #[test]
    fn offset_accepts_a_line_end_and_nothing_past_it() {
        let src = "a😀\nbc";
        let idx = LineIndex::new(src);
        assert_eq!(idx.offset(1, 3), Some(src.find('\n').unwrap() as u32));
        assert_eq!(idx.offset(1, 4), None);
        assert_eq!(idx.offset(1, 2), None, "inside the surrogate pair");
        assert_eq!(idx.offset(2, 2), Some(src.len() as u32));
        assert_eq!(idx.offset(2, 3), None);
        assert_eq!(idx.offset(3, 0), None);
        assert_eq!(idx.offset(0, 0), None);
    }

    #[test]
    fn an_offset_inside_a_character_rounds_down_to_its_start() {
        let src = "é😀x";
        let idx = LineIndex::new(src);
        assert_eq!(idx.utf16(1), 0, "inside é");
        assert_eq!(idx.utf16(2), 1);
        assert_eq!(idx.utf16(4), 1, "inside the emoji");
        assert_eq!(idx.utf16(6), 3);
        assert_eq!(idx.utf16(7), 4);
        assert_eq!(idx.utf16(99), 4, "past the end");
        assert_eq!(idx.line_col(99).line, 1);
    }

    /// Every boundary maps to what walking the text gives, and back.
    #[test]
    fn utf16_and_offset_agree_with_a_walk_of_the_text() {
        let src = "aé\n😀b\n\nçd😀\n";
        let idx = LineIndex::new(src);
        let (mut utf16, mut line, mut column) = (0, 1, 0);
        for (i, ch) in src.char_indices().chain([(src.len(), '\0')]) {
            let i = i as u32;
            assert_eq!(idx.utf16(i), utf16, "utf16 at {i}");
            let lc = idx.line_col(i);
            assert_eq!((lc.line, lc.column), (line, column), "line_col at {i}");
            assert_eq!(
                idx.offset(line, column),
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

/// Sources must be shorter than this, so that [`Loc`] can keep "synthesized" in the same 8 bytes.
/// Checked once where text enters the pipeline ([`crate::pipeline::Document::new`]).
pub const MAX_SOURCE_LEN: u32 = u32::MAX;

/// Where a tree node came from: a source range, or nowhere (a lowering made it up).
///
/// The only way to read a [`Span`] out of a `Loc` is [`Loc::span`], which forces the caller to
/// handle the synthesized case.
#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub struct Loc(Span);

impl Loc {
    pub const SYNTHETIC: Self = Self(Span {
        lo: MAX_SOURCE_LEN,
        hi: MAX_SOURCE_LEN,
    });

    #[inline]
    #[must_use]
    pub fn span(self) -> Option<Span> {
        (self != Self::SYNTHETIC).then_some(self.0)
    }
}

impl From<Span> for Loc {
    #[inline]
    fn from(s: Span) -> Self {
        Self(s)
    }
}

impl std::fmt::Debug for Loc {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.span() {
            Some(s) => write!(f, "{}..{}", s.lo, s.hi),
            None => f.write_str("synthetic"),
        }
    }
}
