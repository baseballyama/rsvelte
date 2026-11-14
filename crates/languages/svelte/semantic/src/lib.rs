//! The Svelte template as the compiler reads it, name resolution, and component facts.

pub mod analyze;
pub mod compiler_syntax_tree;
pub mod evaluate;
pub mod input;
pub mod javascript_error;
pub mod legacy;
pub mod resolve;
pub mod template;
pub mod typescript;
pub mod warnings;

mod visited;

mod computation;
pub use computation::{
    Analyzed, Lowered, PLUGIN, Resolved, Warned, component_input, javascript_error, register,
    svelte_input,
};
