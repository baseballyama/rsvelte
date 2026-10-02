//! Svelte name resolution and semantic facts.

pub mod semantic;
pub use semantic::{analyze, evaluate, input, resolve, template};
