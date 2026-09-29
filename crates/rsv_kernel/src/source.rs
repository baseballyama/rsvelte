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
    pub const fn new(lo: u32, hi: u32) -> Span {
        debug_assert!(lo <= hi && hi < MAX_SOURCE_LEN);
        Span { lo, hi }
    }

    #[inline]
    pub fn text(self, src: &str) -> &str {
        &src[self.lo as usize..self.hi as usize]
    }

    #[inline]
    pub fn len(self) -> u32 {
        self.hi - self.lo
    }

    #[inline]
    pub fn is_empty(self) -> bool {
        self.hi == self.lo
    }

    #[inline]
    pub fn to(self, other: Span) -> Span {
        Span {
            lo: self.lo,
            hi: other.hi,
        }
    }
}

/// Line starts plus a UTF-16 view, built once per document when something needs line/column or
/// JavaScript string offsets (diagnostics, source maps). Pure-ASCII documents skip the UTF-16 table.
pub struct LineIndex {
    line_starts: Vec<u32>,
    /// Byte offsets of every non-ASCII char and the UTF-16 length of the text before it; empty for ASCII.
    wide: Vec<(u32, u32)>,
}

pub struct LineCol {
    /// 1-based.
    pub line: u32,
    /// 0-based, in UTF-16 code units (what JavaScript tools report).
    pub column: u32,
    /// 0-based offset from the start of the document, in UTF-16 code units.
    pub character: u32,
}

impl LineIndex {
    pub fn new(src: &str) -> LineIndex {
        let mut line_starts = vec![0];
        for (i, b) in src.bytes().enumerate() {
            if b == b'\n' {
                line_starts.push(i as u32 + 1);
            }
        }
        let mut wide = Vec::new();
        if !src.is_ascii() {
            let mut utf16 = 0u32;
            for (i, ch) in src.char_indices() {
                if !ch.is_ascii() {
                    wide.push((i as u32, utf16));
                }
                utf16 += ch.len_utf16() as u32;
            }
        }
        LineIndex { line_starts, wide }
    }

    /// UTF-16 offset of a byte offset.
    pub fn utf16(&self, src: &str, byte: u32) -> u32 {
        if self.wide.is_empty() {
            return byte;
        }
        let i = self.wide.partition_point(|&(b, _)| b < byte);
        if i == 0 {
            return byte;
        }
        let (b, u) = self.wide[i - 1];
        let ch_len = src[b as usize..]
            .chars()
            .next()
            .map_or(0, |c| c.len_utf8() as u32);
        let ch_u16 = src[b as usize..]
            .chars()
            .next()
            .map_or(0, |c| c.len_utf16() as u32);
        u + ch_u16 + (byte - b - ch_len)
    }

    pub fn line_col(&self, src: &str, byte: u32) -> LineCol {
        let line = self.line_starts.partition_point(|&s| s <= byte) - 1;
        let start = self.line_starts[line];
        let character = self.utf16(src, byte);
        LineCol {
            line: line as u32 + 1,
            column: character - self.utf16(src, start),
            character,
        }
    }

    /// Byte offset of a 1-based line and 0-based UTF-16 column. The column may be the line's end;
    /// `None` past it or inside a surrogate pair, so a position that does not exist is never
    /// replaced by a nearby one that does.
    pub fn offset(&self, src: &str, line: u32, column: u32) -> Option<u32> {
        let start = *self.line_starts.get(line.checked_sub(1)? as usize)?;
        let mut units = 0;
        for (i, ch) in src[start as usize..].char_indices() {
            if units == column {
                return Some(start + i as u32);
            }
            if units > column || ch == '\n' {
                return None;
            }
            units += ch.len_utf16() as u32;
        }
        (units == column).then_some(src.len() as u32)
    }

    pub fn line_count(&self) -> usize {
        self.line_starts.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn utf16_columns_count_surrogate_pairs() {
        let src = "a😀b\nc";
        let idx = LineIndex::new(src);
        let b = src.find('b').unwrap() as u32;
        let lc = idx.line_col(src, b);
        assert_eq!((lc.line, lc.column, lc.character), (1, 3, 3));
        let c = src.find('c').unwrap() as u32;
        let lc = idx.line_col(src, c);
        assert_eq!((lc.line, lc.column, lc.character), (2, 0, 5));
        assert_eq!(idx.offset(src, 1, 3), Some(b));
    }

    #[test]
    fn offset_accepts_a_line_end_and_nothing_past_it() {
        let src = "a😀\nbc";
        let idx = LineIndex::new(src);
        assert_eq!(idx.offset(src, 1, 3), Some(src.find('\n').unwrap() as u32));
        assert_eq!(idx.offset(src, 1, 4), None);
        assert_eq!(idx.offset(src, 1, 2), None, "inside the surrogate pair");
        assert_eq!(idx.offset(src, 2, 2), Some(src.len() as u32));
        assert_eq!(idx.offset(src, 2, 3), None);
        assert_eq!(idx.offset(src, 3, 0), None);
        assert_eq!(idx.offset(src, 0, 0), None);
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
    pub const SYNTHETIC: Loc = Loc(Span {
        lo: MAX_SOURCE_LEN,
        hi: MAX_SOURCE_LEN,
    });

    #[inline]
    pub fn span(self) -> Option<Span> {
        (self != Loc::SYNTHETIC).then_some(self.0)
    }
}

impl From<Span> for Loc {
    #[inline]
    fn from(s: Span) -> Loc {
        Loc(s)
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
