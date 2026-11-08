//! Svelte name resolution and semantic facts.

/// Name resolution, expression evaluation, and component facts.
pub mod semantic {
    pub mod analyze;
    pub mod evaluate;
    pub mod input;
    pub mod resolve;
    pub mod template;

    mod visited;
}
pub use semantic::{analyze, evaluate, input, resolve, template};
