//! Svelte source trees.

pub mod syntax {
    mod character_references;
    pub mod names;
    pub mod syntax_tree;
}
pub use syntax::{names, syntax_tree};
