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
