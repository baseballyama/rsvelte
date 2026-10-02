//! Svelte 5 syntax, semantic facts, and shared compiler IR.

pub mod compilation;
pub mod computation;
pub mod semantic;
pub mod syntax;

pub use computation::{
    Analyzed, Normalized, Parsed, Resolved, component_input, matches, register, svelte_input,
};
