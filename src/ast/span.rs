//! Source span types for tracking positions in source code.
//!
//! Uses u32 for positions to save memory while supporting files up to 4GB.

use serde::{Deserialize, Serialize};

/// A span in the source code, represented as byte offsets.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default, Serialize, Deserialize)]
pub struct Span {
    pub start: u32,
    pub end: u32,
}

impl Span {
    #[inline]
    pub const fn new(start: u32, end: u32) -> Self {
        Self { start, end }
    }

    #[inline]
    pub const fn empty() -> Self {
        Self { start: 0, end: 0 }
    }

    #[inline]
    pub const fn len(&self) -> u32 {
        self.end - self.start
    }

    #[inline]
    pub const fn is_empty(&self) -> bool {
        self.start == self.end
    }

    /// Merge two spans into one that covers both.
    #[inline]
    pub const fn merge(self, other: Self) -> Self {
        Self {
            start: if self.start < other.start {
                self.start
            } else {
                other.start
            },
            end: if self.end > other.end {
                self.end
            } else {
                other.end
            },
        }
    }
}

/// Source location with line and column information.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default, Serialize, Deserialize)]
pub struct SourceLocation {
    pub start: LineColumn,
    pub end: LineColumn,
}

/// Line and column position (1-indexed for lines, 0-indexed for columns).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default, Serialize, Deserialize)]
pub struct LineColumn {
    pub line: u32,
    pub column: u32,
}

impl LineColumn {
    #[inline]
    pub const fn new(line: u32, column: u32) -> Self {
        Self { line, column }
    }
}

/// Trait for AST nodes that have a span.
pub trait Spanned {
    fn span(&self) -> Span;

    #[inline]
    fn start(&self) -> u32 {
        self.span().start
    }

    #[inline]
    fn end(&self) -> u32 {
        self.span().end
    }
}
