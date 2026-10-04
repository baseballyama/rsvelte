//! Svelte parsing.

pub mod syntax;
pub use syntax::parse;

mod computation;
pub use computation::{Parsed, matches, register};

pub use computation::PLUGIN;
