//! Shared source data, computed results, diagnostics, output, and performance measurements.

pub mod computation;
pub mod diagnostics;
pub mod output;
pub mod performance;
pub mod source;

pub use computation::database::{Artifact, DocumentContext};
pub use diagnostics::diagnostic::{Diagnostic, Severity};
pub use source::index::{IndexRange, IndexVector, TypedIndex};
pub use source::interning::{Atom, Interner};
pub use source::positions::{LineIndex, Span};
