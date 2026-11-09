//! Svelte 5 syntax, semantic facts, and shared compiler IR.

pub mod compilation;
pub mod computation;
pub use rsvelte_svelte_semantic::semantic;
pub mod syntax;
pub mod warnings;

pub use computation::{
    Analyzed, Normalized, PLUGIN, Parsed, Resolved, Warned, component_input, fully_parsed, matches,
    register, svelte_input,
};
