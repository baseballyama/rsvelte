//! The facts about a document's project that a host with a file system finds next to it, as
//! `svelte-eslint-parser` and `eslint-plugin-svelte` find them.

use std::path::{Component, Path, PathBuf};

use rsvelte_kernel::computation::registry::Registry;

use crate::SvelteConfig;
use crate::computation::{SvelteConfiguration, SvelteKit};

#[cfg(test)]
mod tests;

/// What `eslint-plugin-svelte` knows of the `SvelteKit` project a document is in.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SvelteKitProject {
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
        |context| svelte_config_near(Path::new(&context.document.path)),
    );
    registry.provide::<SvelteKit>(
        "svelte.lint.file_system",
        |_| true,
        |context| svelte_kit_project(Path::new(&context.document.path)),
    );
}

/// The project of the nearest `package.json` above the document (`getProjectRootDir`).
///
/// # Panics
///
/// Never: the project's directory is an ancestor of the document.
#[must_use]
pub fn svelte_kit_project(document: &Path) -> SvelteKitProject {
    let file = absolute(document);
    let root = file
        .ancestors()
        .skip(1)
        .find(|directory| package_json(directory).is_some());
    let location = root.map_or(Location::NoProject, |root| {
        let relative = file.strip_prefix(root).expect("an ancestor of the file");
        Location::InProject(
            relative
                .components()
                .map(|c| c.as_os_str().to_string_lossy())
                .collect::<Vec<_>>()
                .join("/"),
        )
    });
    SvelteKitProject { location }
}

/// The `package.json` of `directory`, when it holds a JSON object (`readPackageJson`).
fn package_json(directory: &Path) -> Option<serde_json::Map<String, serde_json::Value>> {
    let text = std::fs::read_to_string(directory.join("package.json")).ok()?;
    serde_json::from_str(&text).ok()
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

/// The nearest `svelte.config.js` above the document, statically evaluated
/// (`resolveSvelteConfig`); the default without one.
///
/// A document that is not a file is looked up from the current directory, as upstream does.
///
/// # Errors
///
/// The file cannot be read or does not parse.
pub fn svelte_config_near(document: &Path) -> Result<SvelteConfig, String> {
    let file = absolute(document);
    let start = match file.parent() {
        Some(directory) if file.is_file() => directory.to_owned(),
        _ => std::env::current_dir().map_err(|e| format!("the current directory: {e}"))?,
    };
    // Upstream stops before the file system's root.
    let Some(config) = start
        .ancestors()
        .filter(|directory| directory.parent().is_some())
        .map(|directory| directory.join("svelte.config.js"))
        .find(|candidate| candidate.is_file())
    else {
        return Ok(SvelteConfig::default());
    };
    let source =
        std::fs::read_to_string(&config).map_err(|e| format!("{}: {e}", config.display()))?;
    crate::svelte_config::parse(&source).map_err(|e| format!("{}: {e}", config.display()))
}
