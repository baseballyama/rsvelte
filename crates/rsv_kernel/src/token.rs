//! Token tables: the layer below a surface tree that loses nothing.
//!
//! Whether a language's surface tree is an AST or a CST is the language's choice. What the kernel
//! asks of every surface layer is that nothing written is lost: its tokens, trivia (whitespace and
//! comments) included, laid end to end, are the source. [`Tokens::check_lossless`] tests exactly
//! that, knowing nothing about the language. Questions about what was written but carries no
//! meaning — is this expression parenthesized, which quote does this attribute use, what comment
//! sits before this statement — are answered here instead of by scanning source bytes.

use std::fmt::Debug;

use crate::idx::{Idx, IndexVec};
use crate::newtype_index;
use crate::source::Span;

pub trait TokenKind: Copy + Eq + Debug + 'static {
    /// Whitespace and comments: skipped by [`Tokens::before`] and [`Tokens::after`].
    fn is_trivia(self) -> bool;
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Token<K> {
    pub kind: K,
    pub span: Span,
}

newtype_index!(
    pub struct TokenId;
);

/// Tokens in source order; they never overlap. A table may cover a whole document or only some
/// regions of it (the expressions of an embedding language).
#[derive(Debug)]
pub struct Tokens<K> {
    toks: IndexVec<TokenId, Token<K>>,
}

impl<K: TokenKind> Default for Tokens<K> {
    fn default() -> Self {
        Self {
            toks: IndexVec::new(),
        }
    }
}

impl<K: TokenKind> Tokens<K> {
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    #[must_use]
    pub fn with_capacity(n: usize) -> Self {
        Self {
            toks: IndexVec::with_capacity(n),
        }
    }

    /// Room for `n` more tokens.
    pub fn reserve(&mut self, n: usize) {
        self.toks.reserve(n);
    }

    /// Empty spans are not tokens and are dropped.
    ///
    /// # Panics
    ///
    /// If `span` starts before the previous token ends.
    #[inline]
    pub fn push(&mut self, kind: K, span: Span) {
        if span.is_empty() {
            return;
        }
        if let Some(last) = self.toks.raw().last() {
            assert!(
                last.span.hi <= span.lo,
                "token {kind:?} at {span:?} overlaps or precedes {last:?}"
            );
        }
        self.toks.push(Token { kind, span });
    }

    #[must_use]
    pub const fn len(&self) -> usize {
        self.toks.len()
    }

    #[must_use]
    pub const fn is_empty(&self) -> bool {
        self.toks.is_empty()
    }

    #[must_use]
    pub fn get(&self, id: TokenId) -> &Token<K> {
        &self.toks[id]
    }

    #[must_use]
    pub fn iter(&self) -> impl DoubleEndedIterator<Item = &Token<K>> + ExactSizeIterator {
        self.toks.iter()
    }

    /// The tokens after the first `n`: what a nested parser appended since the table had `n`.
    #[must_use]
    pub fn since(&self, n: usize) -> &[Token<K>] {
        &self.toks.raw()[n..]
    }

    /// The token containing `offset`.
    #[must_use]
    pub fn at(&self, offset: u32) -> Option<TokenId> {
        let raw = self.toks.raw();
        let i = raw.partition_point(|t| t.span.hi <= offset);
        (i < raw.len() && raw[i].span.lo <= offset).then(|| TokenId::new(i))
    }

    /// The last non-trivia token that ends at or before `offset` (typescript-eslint's
    /// `getTokenBefore` for a node starting at `offset`).
    pub fn before(&self, offset: u32) -> Option<TokenId> {
        let raw = self.toks.raw();
        let end = raw.partition_point(|t| t.span.hi <= offset);
        raw[..end]
            .iter()
            .rposition(|t| !t.kind.is_trivia())
            .map(TokenId::new)
    }

    /// The first non-trivia token that starts at or after `offset`.
    #[must_use]
    pub fn after(&self, offset: u32) -> Option<TokenId> {
        let raw = self.toks.raw();
        let start = raw.partition_point(|t| t.span.lo < offset);
        raw[start..]
            .iter()
            .position(|t| !t.kind.is_trivia())
            .map(|i| TokenId::new(start + i))
    }

    /// The tokens are the source: contiguous from 0 to `src.len()`.
    ///
    /// # Errors
    ///
    /// The first gap (or overlap) between consecutive tokens, or between the last token and the
    /// end.
    pub fn check_lossless(&self, src: &str) -> Result<(), Span> {
        let mut at = 0u32;
        for t in &self.toks {
            if t.span.lo != at {
                return Err(Span::new(at, t.span.lo));
            }
            at = t.span.hi;
        }
        let len = src.len() as u32;
        if at != len {
            return Err(Span::new(at, len));
        }
        Ok(())
    }

    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.toks.capacity() * size_of::<Token<K>>()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Clone, Copy, PartialEq, Eq, Debug)]
    enum K {
        Word,
        Space,
    }

    impl TokenKind for K {
        fn is_trivia(self) -> bool {
            self == Self::Space
        }
    }

    fn words(src: &str) -> Tokens<K> {
        let mut t = Tokens::new();
        let mut lo = 0;
        for (i, c) in src.char_indices().chain([(src.len(), ' ')]) {
            let space = c == ' ';
            let prev_space = i > 0 && src.as_bytes()[i - 1] == b' ';
            if i > lo && (space != prev_space || i == src.len()) {
                t.push(
                    if prev_space { K::Space } else { K::Word },
                    Span::new(lo as u32, i as u32),
                );
                lo = i;
            }
        }
        t
    }

    #[test]
    fn lookups_skip_trivia() {
        let src = "ab  cd e";
        let t = words(src);
        assert_eq!(t.check_lossless(src), Ok(()));
        let text = |id: Option<TokenId>| id.map(|i| t.get(i).span.text(src));
        assert_eq!(text(t.at(3)), Some("  "));
        assert_eq!(text(t.before(4)), Some("ab"));
        assert_eq!(text(t.after(2)), Some("cd"));
        assert_eq!(text(t.after(8)), None);
        assert_eq!(text(t.before(0)), None);
    }

    #[test]
    fn a_gap_or_a_short_table_is_reported() {
        let mut t = Tokens::new();
        t.push(K::Word, Span::new(0, 2));
        t.push(K::Word, Span::new(3, 4));
        assert_eq!(t.check_lossless("ab c"), Err(Span::new(2, 3)));
        assert_eq!(words("ab").check_lossless("ab "), Err(Span::new(2, 3)));
    }

    #[test]
    #[should_panic(expected = "overlaps")]
    fn tokens_cannot_overlap() {
        let mut t = Tokens::new();
        t.push(K::Word, Span::new(0, 2));
        t.push(K::Word, Span::new(1, 3));
    }
}
