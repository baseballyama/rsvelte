//! Byte and char offsets as distinct types.
//!
//! Both units are `usize`, so a scanner that measures in one and a caller that
//! consumes in the other type-check and mis-slice silently. Giving them separate
//! types moves that to a compile error at the crossing.
//!
//! There is deliberately no `From`/`Into` between them: an implicit conversion
//! would restore exactly the silence this removes. Every crossing goes through a
//! named method and stays greppable.
//!
//! Two things this does **not** catch. `Add<usize>` accepts any `usize`, so
//! `char_offset + name.len()` — a char offset advanced by a byte length — still
//! compiles. And neither type carries provenance, so an offset measured against a
//! trimmed copy still slices the original without complaint.

use std::ops::{Add, Sub};

/// Offset in bytes. Only these may index a `&str`.
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug, Hash)]
pub struct ByteOffset(usize);

/// Offset in `char`s. Only these may index a `[char]`.
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug, Hash)]
pub struct CharOffset(usize);

impl ByteOffset {
    pub const ZERO: Self = Self(0);

    pub fn new(at: usize) -> Self {
        Self(at)
    }

    pub fn get(self) -> usize {
        self.0
    }

    /// Byte offset one past the end of `s`.
    pub fn end_of(s: &str) -> Self {
        Self(s.len())
    }

    pub fn before(self, s: &str) -> &str {
        &s[..self.0]
    }

    pub fn after(self, s: &str) -> &str {
        &s[self.0..]
    }

    pub fn to(self, end: Self, s: &str) -> &str {
        &s[self.0..end.0]
    }
}

impl CharOffset {
    pub const ZERO: Self = Self(0);

    pub fn new(at: usize) -> Self {
        Self(at)
    }

    pub fn get(self) -> usize {
        self.0
    }

    pub fn at(self, chars: &[char]) -> Option<char> {
        chars.get(self.0).copied()
    }

    /// Length of `s` counted in the same unit, for comparing against an offset.
    pub fn len_of(s: &str) -> Self {
        Self(s.chars().count())
    }
}

impl Add<usize> for ByteOffset {
    type Output = Self;
    fn add(self, n: usize) -> Self {
        Self(self.0 + n)
    }
}

impl Sub<usize> for ByteOffset {
    type Output = Self;
    fn sub(self, n: usize) -> Self {
        Self(self.0 - n)
    }
}

impl Add<usize> for CharOffset {
    type Output = Self;
    fn add(self, n: usize) -> Self {
        Self(self.0 + n)
    }
}

impl Sub<usize> for CharOffset {
    type Output = Self;
    fn sub(self, n: usize) -> Self {
        Self(self.0 - n)
    }
}

/// Char → byte lookup for one string, so a conversion is O(1) rather than a
/// rescan per crossing.
pub struct CharToByte {
    offsets: Vec<usize>,
    byte_len: usize,
}

impl CharToByte {
    pub fn new(s: &str) -> Self {
        Self {
            offsets: s.char_indices().map(|(b, _)| b).collect(),
            byte_len: s.len(),
        }
    }

    /// Past-the-end char offsets map to the string's byte length, matching the
    /// exclusive end of a slice range.
    pub fn byte(&self, at: CharOffset) -> ByteOffset {
        ByteOffset(self.offsets.get(at.0).copied().unwrap_or(self.byte_len))
    }

    /// `None` when `at` lands inside a character rather than starting one.
    pub fn char_of(&self, at: ByteOffset) -> Option<CharOffset> {
        self.offsets.binary_search(&at.0).ok().map(CharOffset)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn conversion_lands_on_char_boundaries() {
        let s = "aあbい";
        let table = CharToByte::new(s);
        for i in 0..=s.chars().count() {
            let at = table.byte(CharOffset::new(i));
            // Would panic if the offset were not a boundary.
            let _ = at.before(s);
        }
        assert_eq!(table.byte(CharOffset::new(4)), ByteOffset::end_of(s));
    }

    #[test]
    fn char_of_rejects_an_interior_byte() {
        let s = "aあb";
        let table = CharToByte::new(s);
        assert_eq!(table.char_of(ByteOffset::new(1)), Some(CharOffset::new(1)));
        assert_eq!(table.char_of(ByteOffset::new(2)), None);
        assert_eq!(table.char_of(ByteOffset::new(4)), Some(CharOffset::new(2)));
    }

    #[test]
    fn past_the_end_saturates_at_the_byte_length() {
        let s = "あ";
        let table = CharToByte::new(s);
        assert_eq!(table.byte(CharOffset::new(9)), ByteOffset::new(3));
    }
}
