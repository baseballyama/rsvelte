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

/// What an import of a component that is not projected reads: a component of any props.
///
/// The svelte package's `declare module '*.svelte'` declares the same. Its names are the
/// projection's own, so a module script before it binds none of them.
pub const STAND_IN: &str = "import { SvelteComponent as __rsvelte_svelte_component } from 'svelte';\n\
    import { LegacyComponentType as __rsvelte_legacy_component } from 'svelte/legacy';\n\
    declare const __rsvelte_stand_in: __rsvelte_legacy_component;\n\
    type __rsvelte_stand_in = __rsvelte_svelte_component;\n\
    export default __rsvelte_stand_in;\n";

/// [`STAND_IN`] after the component's `<script module>`, so an import of a component that is not
/// projected still reads its module's exports with their types. `None` without a module script.
#[must_use]
pub fn stand_in(
    component: &rsvelte_svelte_syntax::syntax_tree::Component,
    source: &str,
) -> Option<String> {
    let module = component.module.as_ref()?.content.text(source);
    // The `;` ends a module whose last statement has none.
    Some(format!("{module}\n;\n{STAND_IN}"))
}

/// Takes no options.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "svelte.typescript_projection",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
