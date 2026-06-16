//! Locate a `tsgo` / `corsa` executable to drive the type checker.
//!
//! A trimmed port of `vize_carton::corsa_resolver`: environment overrides
//! first, then the `@typescript/native-preview` npm layout discovered by
//! walking up from a starting directory, then `PATH`.

use std::path::{Path, PathBuf};

/// Environment variables checked, in precedence order.
const ENV_VARS: &[&str] = &[
    "CORSA_PATH",
    "CORSA_EXECUTABLE",
    "TSGO_PATH",
    "TSGO_EXECUTABLE",
];

/// Resolve a `tsgo`/`corsa` executable, searching from `start_dir` upward for
/// an `@typescript/native-preview` install. Returns `None` when none is found,
/// in which case type-aware linting degrades to a no-op.
pub fn resolve_tsgo(start_dir: &Path) -> Option<PathBuf> {
    for var in ENV_VARS {
        if let Ok(val) = std::env::var(var) {
            let p = PathBuf::from(val);
            if p.is_file() {
                return Some(p);
            }
        }
    }

    let mut dir = Some(start_dir);
    while let Some(d) = dir {
        if let Some(found) = native_preview_in(d) {
            return Some(found);
        }
        dir = d.parent();
    }

    which_on_path("tsgo").or_else(|| which_on_path("corsa"))
}

/// Look for `node_modules/@typescript/native-preview-<platform>/lib/tsgo[.exe]`
/// (the native binary), falling back to the `native-preview/bin/tsgo.js` Node
/// wrapper.
fn native_preview_in(dir: &Path) -> Option<PathBuf> {
    let typescript = dir.join("node_modules").join("@typescript");
    if !typescript.is_dir() {
        return None;
    }
    // Platform-specific native binary, e.g. native-preview-darwin-arm64.
    if let Ok(entries) = std::fs::read_dir(&typescript) {
        for entry in entries.flatten() {
            let name = entry.file_name();
            let name = name.to_string_lossy();
            if name.starts_with("native-preview-") {
                for cand in ["lib/tsgo", "lib/tsgo.exe", "bin/tsgo", "bin/tsgo.exe"] {
                    let p = entry.path().join(cand);
                    if p.is_file() {
                        return Some(p);
                    }
                }
            }
        }
    }
    // Node wrapper.
    let wrapper = typescript
        .join("native-preview")
        .join("bin")
        .join("tsgo.js");
    if wrapper.is_file() {
        return Some(wrapper);
    }
    None
}

fn which_on_path(name: &str) -> Option<PathBuf> {
    let path = std::env::var_os("PATH")?;
    for dir in std::env::split_paths(&path) {
        let cand = dir.join(name);
        if cand.is_file() {
            return Some(cand);
        }
    }
    None
}
