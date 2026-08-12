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
//! Neither offset nor length carries provenance, so a value measured against a
//! trimmed copy can still be used against the original string.

use std::ops::{Add, Sub};

/// Offset in bytes. Only these may index a `&str`.
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug, Hash)]
pub struct ByteOffset(usize);

/// Offset in `char`s. Only these may index a `[char]`.
///
/// ```compile_fail
/// use rsvelte_core::compiler::phases::phase3_transform::shared::offsets::CharOffset;
///
/// let _ = CharOffset::new(4) + "$名前".len();
/// ```
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug, Hash)]
pub struct CharOffset(usize);

/// Length in bytes. Only this may advance a [`ByteOffset`].
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug, Hash)]
pub struct ByteLen(usize);

/// Length in `char`s. Only this may advance a [`CharOffset`].
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug, Hash)]
pub struct CharLen(usize);

impl ByteLen {
    pub const ONE: Self = Self(1);

    pub fn of(s: &str) -> Self {
        Self(s.len())
    }

    pub fn get(self) -> usize {
        self.0
    }
}

impl CharLen {
    pub const ONE: Self = Self(1);

    pub fn of(s: &str) -> Self {
        Self(s.chars().count())
    }

    pub fn get(self) -> usize {
        self.0
    }
}

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
        Self(ByteLen::of(s).get())
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

    pub fn next(self) -> Self {
        self + ByteLen::ONE
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

    pub fn next(self) -> Self {
        self + CharLen::ONE
    }
}

impl Add<ByteLen> for ByteOffset {
    type Output = Self;
    fn add(self, n: ByteLen) -> Self {
        Self(self.0 + n.0)
    }
}

impl Sub<ByteLen> for ByteOffset {
    type Output = Self;
    fn sub(self, n: ByteLen) -> Self {
        Self(self.0 - n.0)
    }
}

impl Add<CharLen> for CharOffset {
    type Output = Self;
    fn add(self, n: CharLen) -> Self {
        Self(self.0 + n.0)
    }
}

impl Sub<CharLen> for CharOffset {
    type Output = Self;
    fn sub(self, n: CharLen) -> Self {
        Self(self.0 - n.0)
    }
}

/// Char → byte lookup for one string, so a conversion is O(1) rather than a
/// rescan per crossing.
pub struct CharToByte {
    offsets: Vec<ByteOffset>,
    byte_len: ByteOffset,
}

impl CharToByte {
    pub fn new(s: &str) -> Self {
        Self::from_boundaries(
            s.char_indices().map(|(b, _)| ByteOffset::new(b)).collect(),
            ByteOffset::end_of(s),
        )
    }

    /// Builds a conversion table from byte offsets at character boundaries.
    pub(crate) fn from_boundaries(offsets: Vec<ByteOffset>, byte_len: ByteOffset) -> Self {
        debug_assert!(offsets.windows(2).all(|pair| pair[0] < pair[1]));
        debug_assert!(offsets.iter().all(|offset| *offset < byte_len));
        Self { offsets, byte_len }
    }

    /// Past-the-end char offsets map to the string's byte length, matching the
    /// exclusive end of a slice range.
    pub fn byte(&self, at: CharOffset) -> ByteOffset {
        self.offsets.get(at.0).copied().unwrap_or(self.byte_len)
    }

    /// `None` when `at` lands inside a character rather than starting one.
    pub fn char_of(&self, at: ByteOffset) -> Option<CharOffset> {
        self.offsets.binary_search(&at).ok().map(CharOffset)
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

    #[test]
    fn lengths_only_advance_offsets_in_the_same_unit() {
        let chars = CharOffset::new(4) + CharLen::of("$名前");
        let bytes = ByteOffset::new(4) + ByteLen::of("$名前");
        assert_eq!(chars.get(), 7);
        assert_eq!(bytes.get(), 11);
    }
}
