//! Locate a `tsgo` / `corsa` executable to drive the type checker.
//!
//! A trimmed port of `vize_carton::corsa_resolver`: environment overrides
//! first, then the `@typescript/native-preview` npm layout discovered by
//! walking up from a starting directory, then `PATH`.
//!
//! NOT the same thing as `rsvelte_check::tsgo::find_compiler`,
//! which resolves a BATCH compiler run as `<bin> -p tsconfig --pretty false`
//! and is overridden by `$TSGO_BIN`. What we need here is a long-lived corsa
//! API worker (`<bin> --api --cwd …`, msgpack/JSON-RPC over stdio) — a mode
//! only `typescript-go` builds have, so `$TSGO_BIN` is deliberately not read:
//! CI points it at a stock TypeScript 5 `tsc`, which would resolve here and
//! then fail to speak the protocol.

use std::path::{Path, PathBuf};

/// Environment variables checked, in precedence order.
const ENV_VARS: &[&str] = &[
    "CORSA_PATH",
    "CORSA_EXECUTABLE",
    "TSGO_PATH",
    "TSGO_EXECUTABLE",
];

/// Setup instructions shown when no API-capable binary can be found.
pub const MISSING_TSGO_HELP: &str = "\
no tsgo / corsa binary found — the type-aware lint backend cannot run.

Provide one of:
  * `npm i @typescript/native-preview` at the repo root (the resolver walks
    up from this crate and picks up `node_modules/@typescript/native-preview*`), or
  * set $CORSA_EXECUTABLE (or $CORSA_PATH / $TSGO_PATH / $TSGO_EXECUTABLE)
    to an API-capable binary, or
  * put `tsgo` / `corsa` on $PATH.

`pnpm run test:type-aware-lint` does all of this for you.
Note: $TSGO_BIN is NOT read here — it names a batch `tsc`/`tsgo` for
rsvelte-check, which cannot serve the corsa `--api` protocol.";

/// Resolve a `tsgo`/`corsa` executable, searching from `start_dir` upward for
/// an `@typescript/native-preview` install.
///
/// Returns `None` when none is found, in which case type-aware linting degrades
/// to a no-op.
#[must_use]
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

/// [`resolve_tsgo`], but panics with [`MISSING_TSGO_HELP`] instead of returning
/// `None`.
///
/// For the test suite: this crate is an opt-in, out-of-workspace target you
/// only build when you mean to exercise the type-aware backend, so a missing
/// binary is a setup error. Skipping quietly made all nine tests report green
/// while covering nothing (issue #1790).
///
/// # Panics
///
/// Panics when no API-capable `tsgo` or `corsa` executable can be resolved.
#[must_use]
pub fn require_tsgo(start_dir: &Path) -> PathBuf {
    resolve_tsgo(start_dir).unwrap_or_else(|| panic!("{MISSING_TSGO_HELP}"))
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
