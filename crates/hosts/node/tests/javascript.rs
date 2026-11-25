//! Over the addon this crate builds, `rsvelte/compiler` returns what `svelte/compiler` returns and
//! the package's command does what the `rsvelte` executable does: runs `apps/rsvelte`'s tests with
//! Node.js.

use std::path::{Path, PathBuf};
use std::process::Command;

/// The addon and the `rsvelte` executable, built now: cargo builds a cdylib for no test, and an
/// older one would pass stale code. cargo's report of the build names the files, wherever the
/// build directory puts them.
fn built() -> (PathBuf, PathBuf) {
    let mut build = Command::new(env!("CARGO"));
    build.args([
        "build",
        "--offline",
        "--package",
        "rsvelte_node",
        "--package",
        "rsvelte_command_line",
        "--lib",
        "--bin",
        "rsvelte",
        "--message-format=json-render-diagnostics",
    ]);
    if !cfg!(debug_assertions) {
        build.arg("--release");
    }
    let output = build.output().expect("run cargo");
    assert!(output.status.success(), "cargo build failed");
    let report = String::from_utf8_lossy(&output.stdout);
    let artifact = |name: &str| {
        report.lines().find(|line| {
            line.contains("\"reason\":\"compiler-artifact\"")
                && line.contains(&format!("\"name\":\"{name}\""))
        })
    };
    let extension = std::env::consts::DLL_SUFFIX;
    let addon = artifact("rsvelte_node")
        .and_then(|line| line.split('"').find(|field| field.ends_with(extension)))
        .expect("cargo reports the addon it built");
    let executable = artifact("rsvelte")
        .and_then(|line| line.split("\"executable\":\"").nth(1))
        .and_then(|rest| rest.split('"').next())
        .expect("cargo reports the executable it built");
    (PathBuf::from(addon), PathBuf::from(executable))
}

#[test]
fn the_package_does_what_svelte_compiler_and_the_executable_do() {
    let (addon, executable) = built();
    let package = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../apps/rsvelte");
    let output = Command::new("node")
        .args(["--test", "compiler.test.ts", "command.test.ts"])
        .current_dir(&package)
        .env("RSVELTE_BINDING", addon)
        .env("RSVELTE_COMMAND", executable)
        .output()
        .expect("run node: install Node.js and run `pnpm install` at the repository root");
    assert!(
        output.status.success(),
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
}
