//! Svelte to a source-mapped TypeScript AST.

mod buffers;
pub mod content_mapper;
mod lower;
pub mod syntax_tree;
pub use lower::lower;
mod emit;
pub use emit::emit;
mod computation;
pub use computation::{Printed, Projected, register, register_artifacts};

pub const DECLARATIONS: (&str, &str) = (
    "svelte-jsx-v4.d.ts",
    concat!(
        include_str!("../vendor/svelte-jsx-v4.d.ts"),
        "\n",
        include_str!("../projection.d.ts")
    ),
);

pub use computation::PLUGIN;
