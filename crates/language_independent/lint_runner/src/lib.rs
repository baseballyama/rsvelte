//! Lint parts every language shares; language rules live in their own crates.
//!
//! - [`rule`]: what a rule implements, and the [`rule::Reporter`] it reports through.
//! - [`finding`]: a finding with its fix and suggestions, and how `ESLint` applies fixes.
//! - [`findings`]: runs rules over a document and orders their findings as `ESLint` does.
//! - [`output`]: writes findings as `ESLint` reports them.
//! - [`configuration`]: reads a rule's entry in lint options.
//! - [`catalog`]: the rules a linter knows, the plugins that add more, and the rules that run.

pub mod catalog;
pub mod configuration;
pub mod finding;
pub mod findings;
pub mod output;
pub mod rule;
