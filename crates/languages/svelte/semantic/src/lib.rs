//! The Svelte template as the compiler reads it, name resolution, and component facts.

pub mod analyze;
pub mod compiler_syntax_tree;
pub mod evaluate;
pub mod fuzzymatch;
pub mod identifiers;
pub mod input;
pub mod javascript_error;
pub mod legacy;
pub mod markup_tree;
pub mod namespaces;
pub mod resolve;
pub mod typescript;
pub mod warnings;

mod visited;

mod computation;
pub use computation::{
    Analyzed, Lowered, PLUGIN, Resolved, Warned, component_input, register, resolve_component,
};
