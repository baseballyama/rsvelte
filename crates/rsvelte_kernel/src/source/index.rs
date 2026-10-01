//! Typed identifiers and the vectors they index.
//!
//! Every layer of a document (the surface tree, the HIR,
//! name resolution, a control-flow graph) numbers its own things densely from zero, and every fact
//! a later layer adds about them lives in a side table indexed by those numbers instead of in the
//! tree. A side table is an [`IndexVector`]: indexing it with another layer's identifier does not
//! compile, so "the binding table read with a scope identifier" is a type error rather than a wrong
//! answer.
//!
//! A layer built from another keeps the correspondence the same way: an
//! `IndexVector<CompilerNodeIdentifier, TemplateNodeIdentifier>` is "which surface node each HIR
//! node came from".

use std::marker::PhantomData;
use std::{fmt, ops as operators};

pub trait TypedIndex: Copy + Eq + Ord + std::hash::Hash + fmt::Debug + 'static {
    fn new(i: usize) -> Self;
    fn index(self) -> usize;
}

/// `newtype_index!(pub struct CompilerNodeIdentifier;)` — a `u32` identifier with [`TypedIndex`],
/// `Debug` as `CompilerNodeIdentifier(3)`; named identifiers follow as `const ROOT = 0;`.
///
/// Stored as the index plus one in a `NonZeroU32`, as rustc's and oxc's identifiers are, so
/// `Option<Identifier>` is four bytes rather than eight: an optional parent or target costs nothing
/// over a plain one.
#[macro_export]
macro_rules! newtype_index {
    (
        $(#[$attribute:meta])* $vis:vis struct $name:ident;
        $($(#[$cattr:meta])* const $c:ident = $v:literal;)*
    ) => {
        $(#[$attribute])*
        #[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
        $vis struct $name(::std::num::NonZeroU32);

        impl $name {
            $(
                $(#[$cattr])*
                pub const $c: Self = match ::std::num::NonZeroU32::new($v + 1) {
                    Some(n) => Self(n),
                    None => panic!("an index constant overflows u32"),
                };
            )*
        }

        impl $crate::source::index::TypedIndex for $name {
            #[inline]
            fn new(i: usize) -> Self {
                // `i + 1` wraps to zero exactly when `i` is `u32::MAX`, so one test covers both.
                u32::try_from(i)
                    .ok()
                    .and_then(|i| ::std::num::NonZeroU32::new(i.wrapping_add(1)))
                    .map($name)
                    .expect(concat!(stringify!($name), " overflows u32"))
            }
            #[inline]
            fn index(self) -> usize {
                (self.0.get() - 1) as usize
            }
        }

        impl ::std::fmt::Debug for $name {
            fn fmt(&self, f: &mut ::std::fmt::Formatter<'_>) -> ::std::fmt::Result {
                write!(f, concat!(stringify!($name), "({})"), self.0.get() - 1)
            }
        }
    };
}

pub struct IndexVector<I: TypedIndex, T> {
    raw: Vec<T>,
    _i: PhantomData<fn(&I)>,
}

impl<I: TypedIndex, T> IndexVector<I, T> {
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

    /// A side table with one `value` per identifier of a layer that has `n` of them.
    pub fn from_element_n(value: T, n: usize) -> Self
    where
        T: Clone,
    {
        vec![value; n].into()
    }

    #[inline]
    pub fn push(&mut self, value: T) -> I {
        let identifier = I::new(self.raw.len());
        self.raw.push(value);
        identifier
    }

    /// The identifier the next [`push`](Self::push) returns.
    #[inline]
    #[must_use]
    pub fn next_identifier(&self) -> I {
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
    pub fn get(&self, identifier: I) -> Option<&T> {
        self.raw.get(identifier.index())
    }

    pub fn iter(&self) -> std::slice::Iter<'_, T> {
        self.raw.iter()
    }

    #[must_use]
    pub fn iter_enumerated(&self) -> impl DoubleEndedIterator<Item = (I, &T)> + ExactSizeIterator {
        self.raw.iter().enumerate().map(|(i, t)| (I::new(i), t))
    }

    pub fn identifiers(&self) -> impl DoubleEndedIterator<Item = I> + ExactSizeIterator + 'static {
        (0..self.raw.len()).map(I::new)
    }

    /// The elements `range` names, which must have been pushed contiguously.
    pub fn slice(&self, range: IndexRange<I>) -> &[T] {
        &self.raw[range.start.index()..range.end.index()]
    }

    #[must_use]
    pub fn raw(&self) -> &[T] {
        &self.raw
    }

    #[must_use]
    pub fn into_raw(self) -> Vec<T> {
        self.raw
    }

    #[must_use]
    pub const fn capacity(&self) -> usize {
        self.raw.capacity()
    }

    pub fn reserve(&mut self, n: usize) {
        self.raw.reserve(n);
    }

    /// Keeps the first `len` elements.
    pub fn truncate(&mut self, len: usize) {
        self.raw.truncate(len);
    }
}

impl<I: TypedIndex, T> Default for IndexVector<I, T> {
    fn default() -> Self {
        Self::new()
    }
}

impl<I: TypedIndex, T: Clone> Clone for IndexVector<I, T> {
    fn clone(&self) -> Self {
        self.raw.clone().into()
    }
}

impl<I: TypedIndex, T: fmt::Debug> fmt::Debug for IndexVector<I, T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_map().entries(self.iter_enumerated()).finish()
    }
}

impl<I: TypedIndex, T> From<Vec<T>> for IndexVector<I, T> {
    fn from(raw: Vec<T>) -> Self {
        // Checks the length once so that every identifier `push` could have handed out fits in `I`.
        if let Some(last) = raw.len().checked_sub(1) {
            I::new(last);
        }
        Self {
            raw,
            _i: PhantomData,
        }
    }
}

impl<I: TypedIndex, T> FromIterator<T> for IndexVector<I, T> {
    fn from_iter<It: IntoIterator<Item = T>>(iter: It) -> Self {
        iter.into_iter().collect::<Vec<T>>().into()
    }
}

impl<I: TypedIndex, T> operators::Index<I> for IndexVector<I, T> {
    type Output = T;

    #[inline]
    fn index(&self, index: I) -> &T {
        &self.raw[index.index()]
    }
}

impl<I: TypedIndex, T> operators::IndexMut<I> for IndexVector<I, T> {
    #[inline]
    fn index_mut(&mut self, index: I) -> &mut T {
        &mut self.raw[index.index()]
    }
}

impl<'a, I: TypedIndex, T> IntoIterator for &'a IndexVector<I, T> {
    type IntoIter = std::slice::Iter<'a, T>;
    type Item = &'a T;

    fn into_iter(self) -> Self::IntoIter {
        self.raw.iter()
    }
}

/// A contiguous run of identifiers, `start..end`: how a node names its children in a flat layer.
#[derive(Clone, Copy, PartialEq, Eq, Hash)]
pub struct IndexRange<I: TypedIndex> {
    pub start: I,
    pub end: I,
}

impl<I: TypedIndex> IndexRange<I> {
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

impl<I: TypedIndex> fmt::Debug for IndexRange<I> {
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
    fn push_hands_out_dense_identifiers_and_side_tables_line_up() {
        let mut v: IndexVector<A, &str> = IndexVector::new();
        let (x, y) = (v.push("x"), v.push("y"));
        assert_eq!((x.index(), y.index()), (0, 1));
        let mut seen: IndexVector<A, bool> = IndexVector::from_element_n(false, v.len());
        seen[y] = true;
        let got: Vec<(A, bool)> = v.identifiers().map(|i| (i, seen[i])).collect();
        assert_eq!(got, [(x, false), (y, true)]);
        assert_eq!(format!("{v:?}"), r#"{A(0): "x", A(1): "y"}"#);
    }

    #[test]
    fn a_range_slices_what_was_pushed_contiguously() {
        let v: IndexVector<B, u8> = (0..5).collect();
        let r = IndexRange::new(B::new(1), B::new(4));
        assert_eq!(v.slice(r), [1, 2, 3]);
        assert_eq!(
            r.iter().map(TypedIndex::index).collect::<Vec<_>>(),
            [1, 2, 3]
        );
        assert!(IndexRange::empty(B::new(2)).is_empty());
    }
}
