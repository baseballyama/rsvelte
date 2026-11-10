//! The Svelte template as the compiler reads it, name resolution, and component facts.

pub mod analyze;
pub mod compiler_syntax_tree;
pub mod evaluate;
pub mod input;
pub mod legacy;
pub mod resolve;
pub mod template;
pub mod warnings;

mod visited;

mod computation;
pub use computation::{
    Analyzed, Lowered, PLUGIN, Resolved, Warned, component_input, register, svelte_input,
};
