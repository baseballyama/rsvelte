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
/// form would read otherwise stays verbatim: one with a component that Windows rewrites or
/// reserves, such as `a.`, `a `, `..` or `NUL`. Length is not such a rule: Rust, Go and Node add
/// the prefix to a long plain path themselves, so it names the same file.
#[must_use]
pub fn plain(path: &str) -> Cow<'_, str> {
    if let Some(rest) = path.strip_prefix(r"\\?\UNC\") {
        let mut parts = rest.split('\\');
        let named = parts.next().is_some_and(|server| !server.is_empty())
            && parts.next().is_some_and(|share| !share.is_empty());
        if named && readable(rest) {
            return Cow::Owned(format!(r"\\{rest}"));
        }
    } else if let Some(rest) = path.strip_prefix(r"\\?\") {
        let drive = rest.as_bytes();
        let rooted = drive.len() >= 3
            && drive[0].is_ascii_alphabetic()
            && drive[1] == b':'
            && drive[2] == b'\\';
        if rooted && readable(&rest[3..]) {
            return Cow::Borrowed(rest);
        }
    }
    Cow::Borrowed(path)
}

/// `path` as TypeScript names a file. Its `normalizeSlashes` reads every `\` as `/` on every
/// platform, so `C:\a\b.ts` is `C:/a/b.ts` in its messages and in what it asks a content mapper.
#[must_use]
pub fn typescript(path: &str) -> Cow<'_, str> {
    if path.contains('\\') {
        Cow::Owned(path.replace('\\', "/"))
    } else {
        Cow::Borrowed(path)
    }
}

/// Whether Windows reads `components`, a plain path's part after its root, as they are.
fn readable(components: &str) -> bool {
    components.is_empty() || components.split('\\').all(readable_component)
}

fn readable_component(component: &str) -> bool {
    !component.is_empty()
        && !component.ends_with(['.', ' '])
        && !component
            .chars()
            .any(|c| c < ' ' || matches!(c, '<' | '>' | ':' | '"' | '/' | '|' | '?' | '*'))
        && !reserved(component.split('.').next().unwrap_or(component))
}

/// Whether Windows reads `stem`, a name before its first dot, as a device, in any case. The
/// numbered devices are those Microsoft's file naming rules list, `0` among them.
fn reserved(stem: &str) -> bool {
    let stem = stem.trim_end();
    let numbered = |name: &str| {
        let mut chars = stem.chars();
        let prefix: String = chars.by_ref().take(3).collect();
        prefix.eq_ignore_ascii_case(name)
            && chars
                .next()
                .is_some_and(|n| n.is_ascii_digit() || matches!(n, '\u{b9}' | '\u{b2}' | '\u{b3}'))
            && chars.next().is_none()
    };
    ["CON", "PRN", "AUX", "NUL", "CONIN$", "CONOUT$"]
        .iter()
        .any(|device| stem.eq_ignore_ascii_case(device))
        || numbered("COM")
        || numbered("LPT")
}

#[cfg(test)]
mod tests;
