//! Svelte to a source-mapped TypeScript AST.

mod buffers;
pub mod content_mapper;
mod lower;
pub mod syntax_tree;
pub use lower::{Resolve, lower, lower_alone};
mod emit;
pub use emit::{emit, emit_named};
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

/// svelte2tsx's `classNameFromFilename`: the name a component's default export declares.
///
/// It is the part of the file name before the first `.` in `PascalCase`, without the characters
/// a name cannot have, and with the suffix that keeps it apart from the component's own names.
#[must_use]
pub fn component_name(path: &str) -> String {
    let mut name = String::new();
    write_component_name(path, &mut name);
    name
}

/// Appends [`component_name`] to `out`.
pub(crate) fn write_component_name(path: &str, out: &mut String) {
    let file = path.rsplit(['/', '\\']).next().unwrap_or(path);
    let stem = file.split('.').next().unwrap_or(file);
    let valid = |c: &char| c.is_ascii_alphanumeric() || matches!(c, '_' | '-');
    // A name starts at its first letter; JavaScript's `substr(-1)` keeps the last character
    // when there is none.
    let start = stem
        .find(|c: char| c.is_ascii_alphabetic())
        .unwrap_or_else(|| {
            out.push('A');
            stem.char_indices()
                .rfind(|(_, c)| valid(c))
                .map_or(stem.len(), |(i, _)| i)
        });
    let mut upper = true;
    for c in stem[start..].chars().filter(valid) {
        if matches!(c, '_' | '-') {
            upper = true;
        } else if upper {
            out.push(c.to_ascii_uppercase());
            upper = false;
        } else {
            out.push(c);
        }
    }
    out.push_str("__SvelteComponent_");
}

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
