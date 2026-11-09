use std::path::Path;

use rsvelte_kernel::computation::database::{Artifact, DocumentContext, Facet};
use rsvelte_svelte::Parsed;
use rsvelte_typescript::NodeIdentifier;

use crate::{Configuration, SvelteConfig};

#[derive(Debug)]
pub struct LintConfiguration;

impl Facet for LintConfiguration {
    type Output = std::sync::Arc<Configuration>;

    const NAME: &'static str = "svelte.lint.configuration";
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

/// [`Parents`] of a JavaScript or TypeScript module.
#[derive(Debug)]
pub(crate) struct ModuleParents;

impl Artifact for ModuleParents {
    type Output = Vec<NodeIdentifier>;

    const NAME: &'static str = "svelte.lint.module_parents";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        context
            .get::<rsvelte_typescript::Parsed>()
            .as_ref()
            .expect("lint requests parents after parsing")
            .syntax_tree
            .parents()
    }
}

/// The document's `svelte.config.js`, as `svelte-eslint-parser` finds it; the host loads it.
#[derive(Debug)]
pub struct SvelteConfiguration;

impl Facet for SvelteConfiguration {
    type Output = SvelteConfig;

    const NAME: &'static str = "svelte.lint.svelte_config";
}

/// The on-disk name of the file a component or a runes module shares its name with.
///
/// `Foo.svelte` and `Foo.svelte.ts` share one. It reads the file system, so it is a facet a host
/// can answer from its own view of the files; only `svelte/no-conflicting-module-names` asks.
#[derive(Debug)]
pub struct SameNamedFile;

impl Facet for SameNamedFile {
    type Output = Option<String>;

    const NAME: &'static str = "svelte.lint.same_named_file";
}

/// The extensions TypeScript's resolution appends to a `.svelte` specifier; `.d.ts` declares a
/// component instead of shadowing it.
const MODULE_EXTENSIONS: [&str; 8] = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".mjs", ".cjs"];

/// [`SameNamedFile`] from the process's file system; a document that is not a file has none.
pub(crate) fn same_named_file(context: &DocumentContext<'_>) -> Option<String> {
    let path = context.document.path.as_str();
    if !is_file(path) {
        return None;
    }
    if rsvelte_svelte::matches(context.document) {
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
