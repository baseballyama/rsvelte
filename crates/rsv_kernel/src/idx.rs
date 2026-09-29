//! Typed ids and the vectors they index.
//!
//! Every layer of a document (the surface tree, the HIR,
//! name resolution, a control-flow graph) numbers its own things densely from zero, and every fact
//! a later layer adds about them lives in a side table indexed by those numbers instead of in the
//! tree. A side table is an [`IndexVec`]: indexing it with another layer's id does not compile, so
//! "the binding table read with a scope id" is a type error rather than a wrong answer.
//!
//! A layer built from another keeps the correspondence the same way: an `IndexVec<HirId, TId>` is
//! "which surface node each HIR node came from".

use std::marker::PhantomData;
use std::{fmt, ops};

pub trait Idx: Copy + Eq + Ord + std::hash::Hash + fmt::Debug + 'static {
    fn new(i: usize) -> Self;
    fn index(self) -> usize;
}

/// `newtype_index!(pub struct HirId);` — a `u32` id with [`Idx`], `Debug` as `HirId(3)`.
#[macro_export]
macro_rules! newtype_index {
    ($(#[$attr:meta])* $vis:vis struct $name:ident;) => {
        $(#[$attr])*
        #[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
        $vis struct $name(u32);

        impl $crate::idx::Idx for $name {
            #[inline]
            fn new(i: usize) -> Self {
                $name(u32::try_from(i).expect(concat!(stringify!($name), " overflows u32")))
            }
            #[inline]
            fn index(self) -> usize {
                self.0 as usize
            }
        }

        impl ::std::fmt::Debug for $name {
            fn fmt(&self, f: &mut ::std::fmt::Formatter<'_>) -> ::std::fmt::Result {
                write!(f, concat!(stringify!($name), "({})"), self.0)
            }
        }
    };
}

pub struct IndexVec<I: Idx, T> {
    raw: Vec<T>,
    _i: PhantomData<fn(&I)>,
}

impl<I: Idx, T> IndexVec<I, T> {
    #[must_use]
    pub const fn new() -> Self {
        Self {
            raw: Vec::new(),
            _i: PhantomData,
        }
    }

    #[must_use]
    pub fn with_capacity(n: usize) -> Self {
        Vec::with_capacity(n).into()
    }

    /// A side table with one `value` per id of a layer that has `n` of them.
    pub fn from_elem_n(value: T, n: usize) -> Self
    where
        T: Clone,
    {
        vec![value; n].into()
    }

    #[inline]
    pub fn push(&mut self, value: T) -> I {
        let id = I::new(self.raw.len());
        self.raw.push(value);
        id
    }

    /// The id the next [`push`](Self::push) returns.
    #[inline]
    #[must_use]
    pub fn next_id(&self) -> I {
        I::new(self.raw.len())
    }

    #[inline]
    #[must_use]
    pub const fn len(&self) -> usize {
        self.raw.len()
    }

    #[inline]
    #[must_use]
    pub const fn is_empty(&self) -> bool {
        self.raw.is_empty()
    }

    #[inline]
    pub fn get(&self, id: I) -> Option<&T> {
        self.raw.get(id.index())
    }

    pub fn iter(&self) -> std::slice::Iter<'_, T> {
        self.raw.iter()
    }

    #[must_use]
    pub fn iter_enumerated(&self) -> impl DoubleEndedIterator<Item = (I, &T)> + ExactSizeIterator {
        self.raw.iter().enumerate().map(|(i, t)| (I::new(i), t))
    }

    pub fn ids(&self) -> impl DoubleEndedIterator<Item = I> + ExactSizeIterator + 'static {
        (0..self.raw.len()).map(I::new)
    }

    /// The elements `range` names, which must have been pushed contiguously.
    pub fn slice(&self, range: IdxRange<I>) -> &[T] {
        &self.raw[range.start.index()..range.end.index()]
    }

    #[must_use]
    pub fn raw(&self) -> &[T] {
        &self.raw
    }

    #[must_use]
    pub const fn capacity(&self) -> usize {
        self.raw.capacity()
    }

    pub fn reserve(&mut self, n: usize) {
        self.raw.reserve(n);
    }
}

impl<I: Idx, T> Default for IndexVec<I, T> {
    fn default() -> Self {
        Self::new()
    }
}

impl<I: Idx, T: Clone> Clone for IndexVec<I, T> {
    fn clone(&self) -> Self {
        self.raw.clone().into()
    }
}

impl<I: Idx, T: fmt::Debug> fmt::Debug for IndexVec<I, T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_map().entries(self.iter_enumerated()).finish()
    }
}

impl<I: Idx, T> From<Vec<T>> for IndexVec<I, T> {
    fn from(raw: Vec<T>) -> Self {
        // Checks the length once so that every id `push` could have handed out fits in `I`.
        if let Some(last) = raw.len().checked_sub(1) {
            I::new(last);
        }
        Self {
            raw,
            _i: PhantomData,
        }
    }
}

impl<I: Idx, T> FromIterator<T> for IndexVec<I, T> {
    fn from_iter<It: IntoIterator<Item = T>>(iter: It) -> Self {
        iter.into_iter().collect::<Vec<T>>().into()
    }
}

impl<I: Idx, T> ops::Index<I> for IndexVec<I, T> {
    type Output = T;

    #[inline]
    fn index(&self, index: I) -> &T {
        &self.raw[index.index()]
    }
}

impl<I: Idx, T> ops::IndexMut<I> for IndexVec<I, T> {
    #[inline]
    fn index_mut(&mut self, index: I) -> &mut T {
        &mut self.raw[index.index()]
    }
}

impl<'a, I: Idx, T> IntoIterator for &'a IndexVec<I, T> {
    type IntoIter = std::slice::Iter<'a, T>;
    type Item = &'a T;

    fn into_iter(self) -> Self::IntoIter {
        self.raw.iter()
    }
}

/// A contiguous run of ids, `start..end`: how a node names its children in a flat layer.
#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub struct IdxRange<I: Idx> {
    pub start: I,
    pub end: I,
}

impl<I: Idx> IdxRange<I> {
    /// # Panics
    ///
    /// If `start` is after `end`.
    pub fn new(start: I, end: I) -> Self {
        assert!(start <= end, "{start:?}..{end:?} is backwards");
        Self { start, end }
    }

    pub const fn empty(at: I) -> Self {
        Self { start: at, end: at }
    }

    pub fn len(self) -> usize {
        self.end.index() - self.start.index()
    }

    pub fn is_empty(self) -> bool {
        self.start == self.end
    }

    pub fn iter(self) -> impl DoubleEndedIterator<Item = I> + ExactSizeIterator {
        (self.start.index()..self.end.index()).map(I::new)
    }
}

impl<I: Idx> fmt::Debug for IdxRange<I> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}..{:?}", self.start, self.end)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    newtype_index!(
        struct A;
    );
    newtype_index!(
        struct B;
    );

    #[test]
    fn push_hands_out_dense_ids_and_side_tables_line_up() {
        let mut v: IndexVec<A, &str> = IndexVec::new();
        let (x, y) = (v.push("x"), v.push("y"));
        assert_eq!((x.index(), y.index()), (0, 1));
        let mut seen: IndexVec<A, bool> = IndexVec::from_elem_n(false, v.len());
        seen[y] = true;
        let got: Vec<(A, bool)> = v.ids().map(|i| (i, seen[i])).collect();
        assert_eq!(got, [(x, false), (y, true)]);
        assert_eq!(format!("{v:?}"), r#"{A(0): "x", A(1): "y"}"#);
    }

    #[test]
    fn a_range_slices_what_was_pushed_contiguously() {
        let v: IndexVec<B, u8> = (0..5).collect();
        let r = IdxRange::new(B::new(1), B::new(4));
        assert_eq!(v.slice(r), [1, 2, 3]);
        assert_eq!(r.iter().map(Idx::index).collect::<Vec<_>>(), [1, 2, 3]);
        assert!(IdxRange::empty(B::new(2)).is_empty());
    }
}
