mod normalize;

pub mod compiler_syntax_tree {
    pub use rsvelte_svelte_compiler_syntax_tree::compiler_syntax_tree::*;

    pub use super::normalize::lower;
}
