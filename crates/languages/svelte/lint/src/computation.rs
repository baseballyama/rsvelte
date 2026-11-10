use std::path::Path;

use rsvelte_kernel::computation::database::{Artifact, DocumentContext, Facet};
use rsvelte_svelte_semantic::Resolved;
use rsvelte_svelte_semantic::legacy::Legacy;
use rsvelte_svelte_syntax::Parsed;
use rsvelte_typescript_syntax::NodeIdentifier;

use crate::project::SvelteKitProject;
use crate::types::TypeFacts;
use crate::{Configuration, SvelteConfig};

#[derive(Debug)]
pub(crate) struct LintConfiguration;

impl Facet for LintConfiguration {
    type Output = std::sync::Arc<Configuration>;

    const NAME: &'static str = "svelte.lint.configuration";
}

/// The condition type of each JS/TS node of a component, from a host's type provider
/// ([`crate::register_type_provider`]), or why they do not fit the component. Without one, rules
/// use [`NativeConditionTypes`].
#[derive(Debug)]
pub(crate) struct ConditionTypes;

impl Facet for ConditionTypes {
    type Output = Result<TypeFacts, String>;

    const NAME: &'static str = "svelte.lint.condition_types";
}

/// The built-in prototype's [`ConditionTypes`].
#[derive(Debug)]
pub(crate) struct NativeConditionTypes;

impl Artifact for NativeConditionTypes {
    type Output = TypeFacts;

    const NAME: &'static str = "svelte.lint.native_condition_types";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let component = context
            .get::<Parsed>()
            .as_ref()
            .expect("lint requests types after parsing");
        let resolution = context
            .get::<Resolved>()
            .as_ref()
            .expect("a parsed component resolves");
        TypeFacts::infer(component, resolution, context.source_text())
    }
}

#[derive(Debug)]
pub(crate) struct Parents;

impl Artifact for Parents {
    type Output = Vec<NodeIdentifier>;

    const NAME: &'static str = "svelte.lint.parents";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        context
            .get::<Parsed>()
            .as_ref()
            .expect("lint requests parents after parsing")
            .javascript
            .parents()
    }
}

/// The component's legacy reactivity: `$:` statements, the variables they declare, and store
/// subscriptions.
#[derive(Debug)]
pub(crate) struct LegacyReactivity;

impl Artifact for LegacyReactivity {
    type Output = Legacy;

    const NAME: &'static str = "svelte.lint.legacy_reactivity";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let component = context
            .get::<Parsed>()
            .as_ref()
            .expect("lint requests legacy reactivity after parsing");
        let resolution = context
            .get::<Resolved>()
            .as_ref()
            .expect("a parsed component resolves");
        let programs: Vec<NodeIdentifier> = component
            .module
            .iter()
            .map(|script| script.program)
            .chain(std::iter::once(component.program))
            .collect();
        Legacy::new(&component.javascript, &resolution.sem, &programs)
    }
}

/// [`Parents`] of a JavaScript or TypeScript module.
#[derive(Debug)]
pub(crate) struct ModuleParents;

impl Artifact for ModuleParents {
    type Output = Vec<NodeIdentifier>;

    const NAME: &'static str = "svelte.lint.module_parents";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        context
            .get::<rsvelte_typescript_syntax::Parsed>()
            .as_ref()
            .expect("lint requests parents after parsing")
            .syntax_tree
            .parents()
    }
}

/// The document's `svelte.config.js`, as `svelte-eslint-parser` finds it, or why it cannot be
/// read. The host loads it ([`crate::project::register_file_system`] from the files).
#[derive(Debug)]
pub struct SvelteConfiguration;

impl Facet for SvelteConfiguration {
    type Output = Result<SvelteConfig, String>;

    const NAME: &'static str = "svelte.lint.svelte_config";
}

/// Where the document is in its `SvelteKit` project, as `eslint-plugin-svelte` finds it from the
/// `package.json` files above it. The host answers it
/// ([`crate::project::register_file_system`] from the files).
#[derive(Debug)]
pub struct SvelteKit;

impl Facet for SvelteKit {
    type Output = SvelteKitProject;

    const NAME: &'static str = "svelte.lint.svelte_kit";
}

/// The on-disk name of the file a component or a runes module shares its name with.
///
/// `Foo.svelte` and `Foo.svelte.ts` share one. A host that has its own view of the files can
/// provide it; without a provider, [`SameNamedFileOnDisk`] reads the process's file system. Only
/// `svelte/no-conflicting-module-names` asks.
#[derive(Debug)]
pub struct SameNamedFile;

impl Facet for SameNamedFile {
    type Output = Option<String>;

    const NAME: &'static str = "svelte.lint.same_named_file";
}

/// [`SameNamedFile`] from the process's file system.
#[derive(Debug)]
pub(crate) struct SameNamedFileOnDisk;

impl Artifact for SameNamedFileOnDisk {
    type Output = Option<String>;

    const NAME: &'static str = "svelte.lint.same_named_file_on_disk";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        same_named_file(context)
    }
}

/// The extensions TypeScript's resolution appends to a `.svelte` specifier; `.d.ts` declares a
/// component instead of shadowing it.
const MODULE_EXTENSIONS: [&str; 8] = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".mjs", ".cjs"];

/// A document that is not a file has none.
fn same_named_file(context: &DocumentContext<'_>) -> Option<String> {
    let path = context.document.path.as_str();
    if !is_file(path) {
        return None;
    }
    if rsvelte_svelte_syntax::matches(context.document) {
        return MODULE_EXTENSIONS
            .iter()
            .map(|extension| format!("{path}{extension}"))
            .find(|module| is_file(module))
            .map(|module| real_name(&module));
    }
    let extension = MODULE_EXTENSIONS.iter().find(|e| path.ends_with(*e))?;
    let component = &path[..path.len() - extension.len()];
    (component.ends_with(".svelte") && is_file(component)).then(|| real_name(component))
}

fn is_file(path: &str) -> bool {
    std::fs::metadata(path).is_ok_and(|metadata| metadata.is_file())
}

/// The file name as its directory spells it: a case-insensitive file system finds `foo.svelte.ts`
/// when asked for `Foo.svelte.ts`.
fn real_name(path: &str) -> String {
    let path = Path::new(path);
    let wanted = path
        .file_name()
        .and_then(|name| name.to_str())
        .expect("a path built from a file name");
    let directory = match path.parent() {
        Some(directory) if !directory.as_os_str().is_empty() => directory,
        _ => Path::new("."),
    };
    let names: Vec<String> = std::fs::read_dir(directory)
        .into_iter()
        .flatten()
        .filter_map(|entry| entry.ok()?.file_name().into_string().ok())
        .collect();
    let lower = wanted.to_lowercase();
    names
        .iter()
        .find(|name| *name == wanted)
        .or_else(|| names.iter().find(|name| name.to_lowercase() == lower))
        .map_or_else(|| wanted.to_owned(), Clone::clone)
}
