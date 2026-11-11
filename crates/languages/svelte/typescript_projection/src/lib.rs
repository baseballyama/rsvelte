//! Svelte to a source-mapped TypeScript AST.

mod buffers;
pub mod content_mapper;
mod lower;
pub mod syntax_tree;
pub use lower::{Resolve, lower, lower_alone};
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

/// What an import of a component that is not projected reads: a component of any props, as the
/// svelte package's `declare module '*.svelte'` declares one.
pub const STAND_IN: &str = "import { SvelteComponent } from 'svelte';\n\
    import { LegacyComponentType } from 'svelte/legacy';\n\
    declare const Comp: LegacyComponentType;\n\
    type Comp = SvelteComponent;\n\
    export default Comp;\n";

/// Takes no options.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "svelte.typescript_projection",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
