//! Svelte source trees.

pub mod syntax {
    pub mod names;
    pub mod syntax_tree;
}
pub use syntax::{names, syntax_tree};
