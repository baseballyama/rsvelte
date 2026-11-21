//! The project facts lint reads from the process's file system when no host provides them.

use std::path::Path;

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};

/// [`crate::project::SameNamedFile`] from the process's file system.
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

/// A document with a name only has none.
fn same_named_file(context: &DocumentContext<'_>) -> Option<String> {
    let path = context.document.file.as_deref()?.to_str()?;
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

/// [`crate::project::PostcssConfiguration`] from the process's file system, searched once.
#[derive(Debug)]
pub(crate) struct PostcssConfigurationOnDisk;

impl Artifact for PostcssConfigurationOnDisk {
    type Output = bool;

    const NAME: &'static str = "svelte.lint.postcss_configuration_on_disk";

    fn compute(_: &DocumentContext<'_>) -> Self::Output {
        static FOUND: std::sync::OnceLock<bool> = std::sync::OnceLock::new();
        *FOUND.get_or_init(postcss_configuration_found)
    }
}

/// `postcss-load-config` 3's search: from the working directory up to the home directory, a
/// file in one of its places that is not empty, or a `package.json` with a `postcss` key.
fn postcss_configuration_found() -> bool {
    const PLACES: [&str; 10] = [
        ".postcssrc",
        ".postcssrc.json",
        ".postcssrc.yaml",
        ".postcssrc.yml",
        ".postcssrc.ts",
        ".postcssrc.js",
        ".postcssrc.cjs",
        "postcss.config.ts",
        "postcss.config.js",
        "postcss.config.cjs",
    ];
    #[derive(serde::Deserialize)]
    struct Package {
        postcss: Option<serde::de::IgnoredAny>,
    }
    let Ok(start) = std::env::current_dir() else {
        return false;
    };
    let home = std::env::var_os("HOME").map(std::path::PathBuf::from);
    for directory in start.ancestors() {
        let package = std::fs::read_to_string(directory.join("package.json"))
            .ok()
            .and_then(|text| serde_json::from_str::<Package>(&text).ok())
            .is_some_and(|package| package.postcss.is_some());
        let place = PLACES.iter().any(|place| {
            std::fs::read_to_string(directory.join(place)).is_ok_and(|text| !text.trim().is_empty())
        });
        if package || place {
            return true;
        }
        if home.as_deref() == Some(directory) {
            break;
        }
    }
    false
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
