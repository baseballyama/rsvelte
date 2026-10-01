//! Svelte 5 syntax, semantic facts, compilation, and developer tools.

pub mod compilation;
pub mod computation;
pub mod semantic;
pub mod syntax;
pub mod tooling;

pub use computation::{
    Analyzed, Configuration, Normalized, Parsed, Resolved, ScopedStylesheet,
    TypeCheckConfiguration, compile_input, matches, register, svelte_input,
};
