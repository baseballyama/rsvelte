//! The facts about a document's project that a host with a file system finds next to it, as
//! `svelte-eslint-parser` and `eslint-plugin-svelte` find them.
//!
//! Each `package.json` and `svelte.config.js` is a [`FileFact`] of its own path, so a run reads
//! and parses it once for all the documents below it, and a host that invalidates the path drops
//! it alone.

use std::path::{Component, Path, PathBuf};

use rsvelte_kernel::computation::file_facts::{FileFact, FileFacts};
use rsvelte_kernel::computation::registry::Registry;

use crate::SvelteConfig;
use crate::computation::{SvelteConfiguration, SvelteKit};

mod package;

#[cfg(test)]
mod tests;

use package::Package;

/// What `eslint-plugin-svelte` knows of the `SvelteKit` project a document is in.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SvelteKitProject {
    /// `@sveltejs/kit`'s version as upstream names it, `1.0.0-next` or a major version; `None`
    /// outside a `SvelteKit` project.
    pub version: Option<String>,
    pub location: Location,
}

/// Where a document is, for telling route files.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Location {
    /// The document's path from the directory of the nearest `package.json`, `/`-separated.
    InProject(String),
    /// No `package.json` is above the document, so it is no route file.
    NoProject,
    /// There are no files, so a route file is known by its name alone, as upstream does in a
    /// browser.
    NameOnly,
}

/// Answers [`SvelteConfiguration`] and [`SvelteKit`] from the files around each document. Each
/// answer is read when a rule first asks for it.
pub fn register_file_system(registry: &mut Registry) {
    registry.provide::<SvelteConfiguration>(
        "svelte.lint.file_system",
        |_| true,
        |context| svelte_config_near(context.files(), Path::new(&context.document.path)),
    );
    registry.provide::<SvelteKit>(
        "svelte.lint.file_system",
        |_| true,
        |context| svelte_kit_project(context.files(), Path::new(&context.document.path)),
    );
}

/// A `package.json`, when it holds a JSON object (`readPackageJson`).
struct PackageJson;

impl FileFact for PackageJson {
    type Output = Option<Package>;

    const NAME: &'static str = "svelte.lint.package_json";

    fn read(path: &Path) -> Option<Package> {
        Package::read(path)
    }
}

/// The version of the `@sveltejs/kit` installed in a directory: `None` when it is no directory,
/// and `Some(None)` when its version is not one upstream knows.
struct InstalledKit;

impl FileFact for InstalledKit {
    type Output = Option<Option<String>>;

    const NAME: &'static str = "svelte.lint.installed_kit";

    fn read(path: &Path) -> Option<Option<String>> {
        path.is_dir().then(|| {
            Package::read(&path.join("package.json"))?
                .version
                .as_deref()
                .and_then(package::kit_version)
        })
    }
}

/// A `svelte.config.js`, statically evaluated; `None` when it is no file.
struct SvelteConfigFile;

impl FileFact for SvelteConfigFile {
    type Output = Option<Result<SvelteConfig, String>>;

    const NAME: &'static str = "svelte.lint.svelte_config_file";

    fn read(path: &Path) -> Self::Output {
        if !path.is_file() {
            return None;
        }
        Some(
            std::fs::read_to_string(path)
                .map_err(|e| e.to_string())
                .and_then(|source| crate::svelte_config::parse(&source))
                .map_err(|e| format!("{}: {e}", path.display())),
        )
    }
}

/// The project of the nearest `package.json` above the document (`getProjectRootDir`), with the
/// version of `SvelteKit` it uses (`getSvelteKitVersion`).
///
/// # Panics
///
/// Never: the project's directory is an ancestor of the document.
#[must_use]
pub fn svelte_kit_project(files: &FileFacts, document: &Path) -> SvelteKitProject {
    let file = absolute(document);
    let package = |directory: &Path| files.get::<PackageJson>(&directory.join("package.json"));
    let mut directories = file.ancestors().skip(1);
    let nearest = directories.by_ref().find_map(|directory| {
        let package = package(directory);
        package.is_some().then_some((directory, package))
    });
    let location = nearest.as_ref().map_or(Location::NoProject, |&(root, _)| {
        let relative = file.strip_prefix(root).expect("an ancestor of the file");
        Location::InProject(
            relative
                .components()
                .map(|c| c.as_os_str().to_string_lossy())
                .collect::<Vec<_>>()
                .join("/"),
        )
    });
    let installed = || {
        file.ancestors()
            .skip(1)
            .find_map(|directory| {
                (*files.get::<InstalledKit>(&directory.join("node_modules/@sveltejs/kit"))).clone()
            })
            .flatten()
    };
    let declared = || {
        let nearest = nearest.as_ref()?.1.as_ref().as_ref()?;
        // Upstream's own tests run without SvelteKit installed, so its package counts as Kit 2.
        if nearest.is_eslint_plugin_svelte {
            return Some("2".to_owned());
        }
        nearest.kit.clone().or_else(|| {
            directories.find_map(|directory| package(directory).as_ref().as_ref()?.kit.clone())
        })
    };
    SvelteKitProject {
        version: installed().or_else(declared),
        location,
    }
}

/// The nearest `svelte.config.js` above the document, statically evaluated
/// (`resolveSvelteConfig`); the default without one.
///
/// A document that is not a file is looked up from the current directory, as upstream does.
///
/// # Errors
///
/// The file cannot be read or does not parse.
pub fn svelte_config_near(files: &FileFacts, document: &Path) -> Result<SvelteConfig, String> {
    let file = absolute(document);
    let start = match file.parent() {
        Some(directory) if file.is_file() => directory.to_owned(),
        _ => std::env::current_dir().map_err(|e| format!("the current directory: {e}"))?,
    };
    // Upstream stops before the file system's root.
    start
        .ancestors()
        .filter(|directory| directory.parent().is_some())
        .find_map(|directory| {
            (*files.get::<SvelteConfigFile>(&directory.join("svelte.config.js"))).clone()
        })
        .unwrap_or_else(|| Ok(SvelteConfig::default()))
}

/// The document's path as `ESLint` names it (`path.resolve`): absolute, from the current
/// directory, without `.` or `..`.
fn absolute(path: &Path) -> PathBuf {
    let absolute = std::path::absolute(path).unwrap_or_else(|_| path.to_owned());
    let mut out = PathBuf::new();
    for component in absolute.components() {
        match component {
            Component::ParentDir => {
                out.pop();
            }
            Component::CurDir => {}
            _ => out.push(component),
        }
    }
    out
}
