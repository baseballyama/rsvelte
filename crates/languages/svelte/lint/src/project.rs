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
        |context| svelte_config_near(Path::new(&context.document.path)),
    );
    registry.provide::<SvelteKit>(
        "svelte.lint.file_system",
        |_| true,
        |context| svelte_kit_project(Path::new(&context.document.path)),
    );
}

/// The project of the nearest `package.json` above the document (`getProjectRootDir`), with the
/// version of `SvelteKit` it uses (`getSvelteKitVersion`).
///
/// # Panics
///
/// Never: the project's directory is an ancestor of the document.
#[must_use]
pub fn svelte_kit_project(document: &Path) -> SvelteKitProject {
    let file = absolute(document);
    let packages: Vec<(&Path, serde_json::Map<String, serde_json::Value>)> = file
        .ancestors()
        .skip(1)
        .filter_map(|directory| Some((directory, package_json(directory)?)))
        .collect();
    let version = installed_kit(&file).or_else(|| declared_kit(&packages));
    let location = packages.first().map_or(Location::NoProject, |&(root, _)| {
        let relative = file.strip_prefix(root).expect("an ancestor of the file");
        Location::InProject(
            relative
                .components()
                .map(|c| c.as_os_str().to_string_lossy())
                .collect::<Vec<_>>()
                .join("/"),
        )
    });
    SvelteKitProject { version, location }
}

/// The version of the nearest installed `@sveltejs/kit`.
fn installed_kit(file: &Path) -> Option<String> {
    let package = file
        .ancestors()
        .skip(1)
        .map(|directory| directory.join("node_modules/@sveltejs/kit"))
        .find(|package| package.is_dir())?;
    let version = package_json(&package)?.get("version")?.as_str()?.to_owned();
    kit_version(&version)
}

/// The version of `@sveltejs/kit` that the nearest `package.json` declaring one declares.
fn declared_kit(
    packages: &[(&Path, serde_json::Map<String, serde_json::Value>)],
) -> Option<String> {
    // Upstream's own tests run without SvelteKit installed, so its package counts as Kit 2.
    if packages.first().is_some_and(|(_, package)| {
        package.get("name").and_then(|n| n.as_str()) == Some("eslint-plugin-svelte")
    }) {
        return Some("2".to_owned());
    }
    packages.iter().find_map(|(_, package)| {
        let declared = ["dependencies", "devDependencies"]
            .iter()
            .find_map(|field| package.get(*field)?.get("@sveltejs/kit"))?;
        kit_version(declared.as_str()?)
    })
}

/// `checkAndSetSvelteKitVersion`: `1.0.0-next` for Kit 1's prereleases, else the major version
/// of a version or a `^` or `~` range.
fn kit_version(version: &str) -> Option<String> {
    let version = version.strip_prefix(['^', '~']).unwrap_or(version);
    let digits = version.len()
        - version
            .trim_start_matches(|c: char| c.is_ascii_digit())
            .len();
    if digits == 0 {
        return None;
    }
    let (major, rest) = version.split_at(digits);
    if major == "1" && rest.starts_with(".0.0-next") {
        return Some("1.0.0-next".to_owned());
    }
    rest.starts_with('.').then(|| major.to_owned())
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
