//! Lint parts every language shares; language rules live in their own crates.
//!
//! - [`rule`]: what a rule implements, and the [`rule::Reporter`] it reports through.
//! - [`findings`]: runs rules over a document and orders their findings as `ESLint` does.
//! - [`output`]: writes findings as `ESLint` reports them.
//! - [`configuration`]: reads a rule's entry in lint options.

pub mod configuration;
pub mod findings;
pub mod output;
pub mod rule;
