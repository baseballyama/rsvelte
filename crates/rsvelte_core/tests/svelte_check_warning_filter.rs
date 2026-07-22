//! End-to-end coverage for issue #1679 — `rsvelte-check` must honor a
//! function `compilerOptions.warningFilter` declared in `svelte.config.js`.
//!
//! The native compiler can't evaluate the JS predicate, so the CLI hands the
//! collected warnings to a one-shot Node sidecar (`warning-filter.mjs`) that
//! imports the config and applies the real function. These tests spawn the
//! compiled `svelte_check` binary with the sidecar env vars the npm launcher
//! sets, and assert the observable warnings-only behaviour: warnings dropped
//! when a filter rejects them, and a clean fail-open (all warnings shown) when
//! Node is unavailable or the config is broken.
//!
//! Run with:
//!     cargo test --test svelte_check_warning_filter

use std::path::{Path, PathBuf};
use std::process::{Command, Output};

fn bin() -> &'static str {
    env!("CARGO_BIN_EXE_svelte_check")
}

/// The bundled sidecar script, resolved from the workspace `apps/npm` tree so
/// the test exercises the real `warning-filter.mjs`, not a fake.
fn sidecar_script() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../apps/npm/svelte-check/lib/warning-filter.mjs")
}

fn node_available() -> bool {
    Command::new("node")
        .arg("--version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

fn workspace(tag: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!(
        "rsvelte_wf_{tag}_{}_{}",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0)
    ));
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    dir
}

fn write(dir: &Path, name: &str, body: &str) {
    std::fs::write(dir.join(name), body).unwrap();
}

/// A `.svelte` file whose only diagnostic is a single css_unused_selector
/// warning.
const WARN_ONLY: &str = "<div>hello</div>\n<style>\n  .unused { color: red; }\n</style>\n";

/// Run the CLI with the sidecar env vars the npm launcher provides.
fn run_with_sidecar(dir: &Path, args: &[&str]) -> Output {
    Command::new(bin())
        .arg("--workspace")
        .arg(dir)
        .args(args)
        .env("RSVELTE_CHECK_NODE", "node")
        .env("RSVELTE_CHECK_WARNING_FILTER_SIDECAR", sidecar_script())
        .output()
        .expect("failed to spawn svelte_check binary")
}

/// Run the CLI WITHOUT the sidecar env vars (as if Node were unavailable).
fn run_without_sidecar(dir: &Path, args: &[&str]) -> Output {
    Command::new(bin())
        .arg("--workspace")
        .arg(dir)
        .args(args)
        .env_remove("RSVELTE_CHECK_NODE")
        .env_remove("RSVELTE_CHECK_WARNING_FILTER_SIDECAR")
        .output()
        .expect("failed to spawn svelte_check binary")
}

#[test]
fn function_warning_filter_drops_matching_warning() {
    if !node_available() {
        return;
    }
    let dir = workspace("drop");
    write(&dir, "Warn.svelte", WARN_ONLY);
    write(
        &dir,
        "svelte.config.js",
        "export default { compilerOptions: { warningFilter: (w) => w.code !== 'css_unused_selector' } };",
    );

    let out = run_with_sidecar(&dir, &["--no-type-check"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        !stdout.contains("Unused CSS selector"),
        "warningFilter should drop the css_unused_selector warning; got:\n{stdout}"
    );
    assert!(
        stdout.contains("0 errors and 0 warnings"),
        "the dropped warning must not be counted; got:\n{stdout}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn function_warning_filter_keeps_non_matching_warning() {
    if !node_available() {
        return;
    }
    let dir = workspace("keep");
    write(&dir, "Warn.svelte", WARN_ONLY);
    // Filter rejects a different code, so our warning survives.
    write(
        &dir,
        "svelte.config.js",
        "export default { compilerOptions: { warningFilter: (w) => w.code !== 'a11y_missing_attribute' } };",
    );

    let out = run_with_sidecar(&dir, &["--no-type-check"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        stdout.contains("Unused CSS selector"),
        "a filter that doesn't match must keep the warning; got:\n{stdout}"
    );
    assert!(
        stdout.contains("0 errors and 1 warning"),
        "the kept warning must be counted; got:\n{stdout}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn no_warning_filter_configured_does_not_change_output() {
    // With no warningFilter, the sidecar is never spawned and every warning
    // is shown exactly as before (zero-overhead path).
    let dir = workspace("none");
    write(&dir, "Warn.svelte", WARN_ONLY);
    write(
        &dir,
        "svelte.config.js",
        "export default { compilerOptions: { runes: true } };",
    );

    let out = run_with_sidecar(&dir, &["--no-type-check"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        stdout.contains("Unused CSS selector") && stdout.contains("0 errors and 1 warning"),
        "no warningFilter must leave all warnings intact; got:\n{stdout}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn missing_sidecar_fails_open_with_note() {
    // A function warningFilter is declared but no Node sidecar is available:
    // the run must keep every warning and print a one-time stderr note.
    let dir = workspace("failopen");
    write(&dir, "Warn.svelte", WARN_ONLY);
    write(
        &dir,
        "svelte.config.js",
        "export default { compilerOptions: { warningFilter: (w) => false } };",
    );

    let out = run_without_sidecar(&dir, &["--no-type-check"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stdout.contains("Unused CSS selector"),
        "with no sidecar the warning must still be shown (fail open); got:\n{stdout}"
    );
    assert!(
        stderr.contains("warningFilter"),
        "a fail-open must explain why the filter was skipped; got:\n{stderr}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn broken_config_fails_open() {
    if !node_available() {
        return;
    }
    // The static probe sees a function-shaped warningFilter, but the config
    // throws on import → the sidecar returns non-ok → keep every warning.
    let dir = workspace("broken");
    write(&dir, "Warn.svelte", WARN_ONLY);
    write(
        &dir,
        "svelte.config.js",
        "throw new Error('boom');\nexport default { compilerOptions: { warningFilter: (w) => false } };",
    );

    let out = run_with_sidecar(&dir, &["--no-type-check"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        stdout.contains("Unused CSS selector"),
        "a config that fails to import must fail open; got:\n{stdout}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}
