//! Real paths in the form every tool reads.
//!
//! On Windows `std::fs::canonicalize` returns the verbatim form, `\\?\C:\…`, which TypeScript 7
//! refuses as a network path (TS5116) and which users do not write, so a path is canonicalized
//! here, and only here.

use std::borrow::Cow;
use std::io;
use std::path::{Path, PathBuf};

/// The real path of `path`, with symbolic links resolved, as [`std::fs::canonicalize`] gives
/// it, but in its [`plain`] form where that names the same file.
///
/// # Errors
/// `path` does not exist, or a component of it cannot be read.
#[expect(
    clippy::disallowed_methods,
    reason = "the one call, which every other canonicalization goes through"
)]
pub fn canonicalize(path: impl AsRef<Path>) -> io::Result<PathBuf> {
    let real = std::fs::canonicalize(path)?;
    if !cfg!(windows) {
        return Ok(real);
    }
    let length = real.as_os_str().len();
    let shorter = (real.to_str().map(plain))
        .filter(|path| path.len() < length)
        .map(|path| PathBuf::from(path.as_ref()));
    Ok(shorter.unwrap_or(real))
}

/// `path` without the verbatim prefix of a Windows path, where the plain form names the same file.
///
/// `\\?\C:\a` is `C:\a`, and `\\?\UNC\server\share\a` is `\\server\share\a`. A path the plain
/// form would read otherwise stays verbatim: one longer than `MAX_PATH`, or with a component that
/// Windows rewrites or reserves, such as `a.`, `a `, `..` or `NUL`.
#[must_use]
pub fn plain(path: &str) -> Cow<'_, str> {
    if let Some(rest) = path.strip_prefix(r"\\?\UNC\") {
        let mut parts = rest.split('\\');
        let named = parts.next().is_some_and(|server| !server.is_empty())
            && parts.next().is_some_and(|share| !share.is_empty());
        if named && readable(rest, rest.len() + 2) {
            return Cow::Owned(format!(r"\\{rest}"));
        }
    } else if let Some(rest) = path.strip_prefix(r"\\?\") {
        let drive = rest.as_bytes();
        let rooted = drive.len() >= 3
            && drive[0].is_ascii_alphabetic()
            && drive[1] == b':'
            && drive[2] == b'\\';
        if rooted && readable(&rest[3..], rest.len()) {
            return Cow::Borrowed(rest);
        }
    }
    Cow::Borrowed(path)
}

/// The longest path that Windows reads without the verbatim prefix, `MAX_PATH` less its NUL.
const MOST_PLAIN_LENGTH: usize = 259;

/// Whether Windows reads `components`, a plain path's part after its root, as they are, in a
/// path of `length` bytes.
fn readable(components: &str, length: usize) -> bool {
    length <= MOST_PLAIN_LENGTH
        && (components.is_empty() || components.split('\\').all(readable_component))
}

fn readable_component(component: &str) -> bool {
    !component.is_empty()
        && !component.ends_with(['.', ' '])
        && !component
            .chars()
            .any(|c| c.is_control() || matches!(c, '<' | '>' | ':' | '"' | '/' | '|' | '?' | '*'))
        && !reserved(component.split('.').next().unwrap_or(component))
}

/// Whether Windows reads `stem` as a device, with any extension and in any case.
fn reserved(stem: &str) -> bool {
    let stem = stem.trim_end();
    ["CON", "PRN", "AUX", "NUL", "CONIN$", "CONOUT$"]
        .iter()
        .any(|device| stem.eq_ignore_ascii_case(device))
        || (stem.chars().count() == 4
            && stem.get(..3).is_some_and(|name| {
                name.eq_ignore_ascii_case("COM") || name.eq_ignore_ascii_case("LPT")
            }))
}

#[cfg(test)]
mod tests;
