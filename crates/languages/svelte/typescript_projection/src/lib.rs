//! Svelte to a source-mapped TypeScript AST.

mod buffers;
pub mod content_mapper;
mod lower;
pub mod syntax_tree;
pub use lower::{Refusal, Resolve, lower, lower_alone, store_reads};
mod emit;
pub use emit::emit;
mod computation;
mod read;
pub use computation::{
    EmittedProjection, ProjectionTree, TASK, THROWN, register, register_artifacts,
};
pub use read::{Read, cut_short_at, read, read_alone};

/// The helpers' declarations without the element types, for a project that reads them from
/// svelte's own `svelte-html.d.ts`, as svelte-check does when the package has one.
pub const SHIMS: (&str, &str) = (
    "svelte-shims-v4.d.ts",
    concat!(
        include_str!("../vendor/svelte-shims-v4.d.ts"),
        "\n",
        include_str!("../projection.d.ts")
    ),
);

pub const DECLARATIONS: (&str, &str) = (
    "svelte-jsx-v4.d.ts",
    concat!(
        include_str!("../vendor/svelte-jsx-v4.d.ts"),
        "\n",
        include_str!("../vendor/svelte-shims-v4.d.ts"),
        "\n",
        include_str!("../projection.d.ts")
    ),
);

/// svelte2tsx's `classNameFromFilename`: the name a component's default export declares.
///
/// It is the part of the file name before the first `.` in `PascalCase`, without the characters
/// a name cannot have, and with the suffix that keeps it apart from the component's own names.
#[must_use]
pub fn default_export_name(path: &str) -> String {
    const SUFFIX: &str = "__SvelteComponent_";
    let file = path.rsplit(['/', '\\']).next().unwrap_or(path);
    let stem = file.split('.').next().unwrap_or(file);
    // One allocation per document: the name never outgrows the stem, an `A` and the suffix.
    let mut out = String::with_capacity(1 + stem.len() + SUFFIX.len());
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
    out.push_str(SUFFIX);
    out
}

/// What an import of a component that is not projected reads: a component of any props whose
/// instance is `any`, since neither its props nor its exports are known.
///
/// The props stay a record of `any`, so a callback passed to it reads its parameters as `any`
/// rather than implicitly. Its name is the projection's own, so a module script before it binds
/// none of it.
pub const STAND_IN: &str = "declare const __rsvelte_stand_in: {\n\
    (internals: any, props: Record<string, any>): any;\n\
    new (options: any): any;\n\
    };\n\
    type __rsvelte_stand_in = any;\n\
    export default __rsvelte_stand_in;\n";

/// Why a component has no projection.
#[derive(Clone, Copy, Debug)]
pub enum Unprojected<'a> {
    /// svelte2tsx throws, on the markup or on a script.
    Thrown,
    /// The projection does not cover the component.
    Unsupported(&'a rsvelte_svelte_syntax::syntax_tree::Component),
}

/// What the checker reads for a component that has no projection.
///
/// When svelte2tsx throws, svelte-check reads the bare instance script, else the module script,
/// which declares globals for the whole project when it neither imports nor exports. Otherwise
/// it is [`STAND_IN`] after the module script, so an import still reads the module's exports with
/// their types.
#[must_use]
pub fn unprojected(source: &str, why: Unprojected<'_>) -> String {
    match why {
        Unprojected::Thrown => rsvelte_svelte_syntax::parse::parse_without_scripts(source)
            .ok()
            .and_then(|component| {
                let script = component.instance.as_ref().or(component.module.as_ref())?;
                Some(script.content.text(source).to_owned())
            })
            .unwrap_or_default(),
        // The `;` ends a module whose last statement has none.
        Unprojected::Unsupported(component) => component.module.as_ref().map_or_else(
            || STAND_IN.to_owned(),
            |module| format!("{}\n;\n{STAND_IN}", module.content.text(source)),
        ),
    }
}

/// Takes no options.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "svelte.typescript_projection",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
