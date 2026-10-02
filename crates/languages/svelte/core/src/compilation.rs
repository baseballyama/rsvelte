mod normalize;

pub mod compiler_syntax_tree {
    pub use rsvelte_svelte_hir::compiler_syntax_tree::*;

    pub use super::normalize::lower;
}
