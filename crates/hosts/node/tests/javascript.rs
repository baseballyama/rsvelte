//! `rsvelte/compiler` over the addon this crate builds returns what `svelte/compiler` returns:
//! runs `apps/rsvelte/compiler.test.ts` with Node.js.

use std::path::{Path, PathBuf};
use std::process::Command;

/// The addon, built now: cargo builds a cdylib for no test, and an older one would pass stale code.
/// cargo's report of the build names the file, wherever the build directory puts it.
fn addon() -> PathBuf {
    let mut build = Command::new(env!("CARGO"));
    build.args([
        "build",
        "--offline",
        "--package",
        "rsvelte_node",
        "--message-format=json-render-diagnostics",
    ]);
    if !cfg!(debug_assertions) {
        build.arg("--release");
    }
    let output = build.output().expect("run cargo");
    assert!(
        output.status.success(),
        "cargo build --package rsvelte_node failed"
    );
    let extension = std::env::consts::DLL_SUFFIX;
    String::from_utf8_lossy(&output.stdout)
        .lines()
        .filter(|line| {
            line.contains("\"reason\":\"compiler-artifact\"")
                && line.contains("\"name\":\"rsvelte_node\"")
        })
        .flat_map(|line| line.split('"'))
        .find(|field| field.ends_with(extension))
        .map(PathBuf::from)
        .expect("cargo reports the addon it built")
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
