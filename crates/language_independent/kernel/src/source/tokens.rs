//! Token tables: the layer below a surface tree that loses nothing.
//!
//! Whether a language's surface tree is an AST or a CST is the language's choice. What the kernel
//! asks of every surface layer is that nothing written is lost: its tokens, trivia (whitespace and
//! comments) included, laid end to end, are the source. [`Tokens::check_lossless`] tests exactly
//! that, knowing nothing about the language. Questions about what was written but carries no
//! meaning — is this expression parenthesized, which quote does this attribute use, what comment
//! sits before this statement — are answered here instead of by scanning source bytes.

use std::fmt::Debug;

use crate::index::{IndexVector, TypedIndex};
use crate::newtype_index;
use crate::performance::buffer_pool;
use crate::source::positions::Span;

pub trait TokenKind: Copy + Eq + Debug + 'static {
    /// Whitespace and comments: skipped by [`Tokens::after`].
    fn is_trivia(self) -> bool;
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Token<K> {
    pub kind: K,
    pub span: Span,
}

newtype_index!(
    pub struct TokenIdentifier;
);

/// Tokens in source order; they never overlap. A table may cover a whole document or only some
/// regions of it (the expressions of an embedding language).
#[derive(Debug)]
pub struct Tokens<K: TokenKind> {
    tokens: IndexVector<TokenIdentifier, Token<K>>,
}

/// The table's buffer is recycled through [`buffer_pool`], like a tree's columns.
impl<K: TokenKind> Default for Tokens<K> {
    fn default() -> Self {
        Self {
            tokens: buffer_pool::take().into(),
        }
    }
}

impl<K: TokenKind> Drop for Tokens<K> {
    fn drop(&mut self) {
        buffer_pool::give(std::mem::take(&mut self.tokens).into_raw());
    }
}

impl<K: TokenKind> Tokens<K> {
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    #[must_use]
    pub fn with_capacity(n: usize) -> Self {
        let mut t = Self::default();
        t.reserve(n);
        t
    }

    /// Room for `n` more tokens.
    pub fn reserve(&mut self, n: usize) {
        self.tokens.reserve(n);
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
        if let Some(last) = self.tokens.raw().last() {
            assert!(
                last.span.end_offset <= span.start_offset,
                "token {kind:?} at {span:?} overlaps or precedes {last:?}"
            );
        }
        self.tokens.push(Token { kind, span });
    }

    #[must_use]
    pub const fn len(&self) -> usize {
        self.tokens.len()
    }

    #[must_use]
    pub const fn is_empty(&self) -> bool {
        self.tokens.is_empty()
    }

    pub fn iter(&self) -> impl DoubleEndedIterator<Item = &Token<K>> + ExactSizeIterator {
        self.tokens.iter()
    }

    /// Keeps the first `n` tokens: a nested parser's tokens are dropped when its result is.
    pub fn truncate(&mut self, n: usize) {
        self.tokens.truncate(n);
    }

    /// The tokens after the first `n`: what a nested parser appended since the table had `n`.
    #[must_use]
    pub fn since(&self, n: usize) -> &[Token<K>] {
        &self.tokens.raw()[n..]
    }

    /// The first non-trivia token that starts at or after `offset`.
    #[must_use]
    pub fn after(&self, offset: u32) -> Option<TokenIdentifier> {
        let raw = self.tokens.raw();
        let start = raw.partition_point(|t| t.span.start_offset < offset);
        raw[start..]
            .iter()
            .position(|t| !t.kind.is_trivia())
            .map(|i| TokenIdentifier::new(start + i))
    }

    /// The tokens are the source: contiguous from 0 to `source_text.len()`.
    ///
    /// # Errors
    ///
    /// The first gap (or overlap) between consecutive tokens, or between the last token and the
    /// end.
    pub fn check_lossless(&self, source_text: &str) -> Result<(), Span> {
        let mut at = 0u32;
        for t in &self.tokens {
            if t.span.start_offset != at {
                return Err(Span::new(at, t.span.start_offset));
            }
            at = t.span.end_offset;
        }
        let len = source_text.len() as u32;
        if at != len {
            return Err(Span::new(at, len));
        }
        Ok(())
    }

    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.tokens.capacity() * size_of::<Token<K>>()
    }
}

// One per token of every document; `Option` of any `newtype_index!` identifier uses its niche.
const _: () = assert!(size_of::<Token<u8>>() == 12, "`Token<u8>` is 12 bytes");
const _: () = assert!(
    size_of::<Option<TokenIdentifier>>() == 4,
    "`Option<TokenId>` is 4 bytes"
);

#[cfg(test)]
mod tests;
