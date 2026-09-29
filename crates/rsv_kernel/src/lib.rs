//! The language-agnostic core. Nothing in this crate knows what Svelte, JavaScript or CSS is:
//! languages plug in through [`pipeline::Language`], [`db::Artifact`] and [`pipeline::Task`].

pub mod db;
pub mod diag;
pub mod doc;
pub mod emit;
pub mod idx;
pub mod intern;
pub mod json;
pub mod lint;
pub mod metrics;
pub mod pipeline;
pub mod pool;
pub mod source;

pub use db::{Artifact, Ctx};
pub use diag::{Diagnostic, Severity};
pub use idx::{Idx, IdxRange, IndexVec};
pub use intern::{Atom, Interner};
pub use source::{LineIndex, Span};
