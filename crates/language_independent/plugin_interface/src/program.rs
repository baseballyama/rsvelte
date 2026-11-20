use std::io;
use std::path::{Path, PathBuf};

#[cfg(test)]
mod tests;

/// Where a program named in options is.
///
/// A path is relative to `base`, and made absolute since programs may run in another directory.
/// A bare name is looked for in `node_modules/.bin` of `base` and its parents first, as package
/// managers run a project's tools; when none has it, the bare name is returned so that starting
/// the program looks in `PATH`.
///
/// # Errors
///
/// `value` is empty, or `base` cannot be made absolute.
pub fn program_path(value: &str, base: &Path) -> io::Result<PathBuf> {
    if value.is_empty() {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "a program needs a name",
        ));
    }
    let path = Path::new(value);
    if path.components().nth(1).is_some() {
        return std::path::absolute(base.join(path));
    }
    let base = std::path::absolute(base)?;
    let installed = base
        .ancestors()
        .map(|directory| directory.join("node_modules/.bin").join(path))
        .find(|candidate| candidate.is_file());
    Ok(installed.unwrap_or_else(|| path.to_owned()))
}

/// The directory of package `name` as Node resolves it from `base`: `node_modules/<name>` of
/// `base` or its nearest parent that has one, with links resolved.
///
/// # Errors
///
/// `base` cannot be made absolute, or a found package's link cannot be resolved.
pub fn installed_package(name: &str, base: &Path) -> io::Result<Option<PathBuf>> {
    let base = std::path::absolute(base)?;
    base.ancestors()
        .map(|directory| directory.join("node_modules").join(name))
        .find(|candidate| candidate.join("package.json").is_file())
        .map(std::fs::canonicalize)
        .transpose()
}

/// The script that the command `bin` of package `name` runs, when `base` resolves the package.
/// Run through `node`, it starts the same way on every platform, without the package manager's
/// shell shims.
///
/// # Errors
///
/// As [`installed_package`], or the package's `package.json` cannot be read or decoded.
pub fn installed_bin(name: &str, bin: &str, base: &Path) -> io::Result<Option<PathBuf>> {
    let Some((package, manifest)) = installed_manifest::<Manifest>(name, base)? else {
        return Ok(None);
    };
    let script = match manifest.bin {
        Some(Bin::One(script)) if manifest.name == bin => Some(script),
        Some(Bin::Named(mut scripts)) => scripts.remove(bin),
        _ => None,
    };
    Ok(script.map(|script| package.join(script)))
}

/// The `version` of package `name` when `base` resolves it and the version is a string.
///
/// # Errors
///
/// As [`installed_package`], or the package's `package.json` cannot be read or decoded.
pub fn installed_version(name: &str, base: &Path) -> io::Result<Option<String>> {
    let manifest = installed_manifest::<Versioned>(name, base)?;
    Ok(manifest.and_then(|(_, manifest)| match manifest.version? {
        Version::Text(version) => Some(version),
        Version::Other(_) => None,
    }))
}

fn installed_manifest<T: serde::de::DeserializeOwned>(
    name: &str,
    base: &Path,
) -> io::Result<Option<(PathBuf, T)>> {
    let Some(package) = installed_package(name, base)? else {
        return Ok(None);
    };
    let manifest = std::fs::read(package.join("package.json"))?;
    let manifest = serde_json::from_slice(&manifest).map_err(io::Error::other)?;
    Ok(Some((package, manifest)))
}

#[derive(serde::Deserialize)]
struct Manifest {
    #[serde(default)]
    name: String,
    bin: Option<Bin>,
}

/// Only the version, so that a malformed `bin` or `name` does not hide it.
#[derive(serde::Deserialize)]
struct Versioned {
    version: Option<Version>,
}

#[derive(serde::Deserialize)]
#[serde(untagged)]
enum Version {
    Text(String),
    Other(serde::de::IgnoredAny),
}

#[derive(serde::Deserialize)]
#[serde(untagged)]
enum Bin {
    One(String),
    Named(std::collections::HashMap<String, String>),
}
