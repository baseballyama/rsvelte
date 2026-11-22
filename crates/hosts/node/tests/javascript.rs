//! `rsvelte/compiler` over the addon this crate builds returns what `svelte/compiler` returns:
//! runs `apps/rsvelte/compiler.test.ts` with Node.js.

use std::path::{Path, PathBuf};
use std::process::Command;

/// The addon, built now: cargo builds a cdylib for no test, and an older one would pass stale code.
fn addon() -> PathBuf {
    let mut build = Command::new(env!("CARGO"));
    build.args(["build", "--offline", "--package", "rsvelte_node"]);
    if !cfg!(debug_assertions) {
        build.arg("--release");
    }
    let status = build.status().expect("run cargo");
    assert!(
        status.success(),
        "cargo build --package rsvelte_node failed"
    );
    let name = if cfg!(windows) {
        "rsvelte_node.dll"
    } else if cfg!(target_os = "macos") {
        "librsvelte_node.dylib"
    } else {
        "librsvelte_node.so"
    };
    let test = std::env::current_exe().expect("the test's path");
    let addon = test
        .parent()
        .and_then(Path::parent)
        .expect("target/<profile>/deps/<test>")
        .join(name);
    assert!(addon.is_file(), "{} is missing", addon.display());
    addon
}

#[test]
fn rsvelte_compiler_returns_what_svelte_compiler_returns() {
    let package = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../apps/rsvelte");
    let output = Command::new("node")
        .args(["--test", "compiler.test.ts"])
        .current_dir(&package)
        .env("RSVELTE_BINDING", addon())
        .output()
        .expect("run node: install Node.js and run `pnpm install` at the repository root");
    assert!(
        output.status.success(),
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
}
