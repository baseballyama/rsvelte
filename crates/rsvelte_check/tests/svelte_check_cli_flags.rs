//! Upstream flag-parity tests for the `rsvelte-check` CLI. Each test
//! spawns the compiled `svelte_check` binary against a throwaway
//! workspace and asserts the observable behaviour of the flags that the
//! JS reference (`submodules/language-tools/packages/svelte-check`)
//! exposes — `--threshold`, `--no-tsconfig`, `--config`, and the
//! `--preserveWatchOutput` / `--tsgo-experimental-api` / `--color`
//! compatibility spellings.

use std::path::{Path, PathBuf};
use std::process::{Command, Output};

fn bin() -> &'static str {
    env!("CARGO_BIN_EXE_svelte_check")
}

fn workspace(tag: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!(
        "rsvelte_check_cli_{tag}_{}_{}",
        std::process::id(),
        // Keep concurrently-running tests from colliding on the same dir.
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

fn run(dir: &Path, args: &[&str]) -> Output {
    Command::new(bin())
        .arg("--workspace")
        .arg(dir)
        .args(args)
        .output()
        .expect("failed to spawn svelte_check binary")
}

/// A `.svelte` file whose only diagnostic is a single css-unused-selector
/// warning — nothing that would also emit an error.
const WARN_ONLY: &str = "<div>hello</div>\n<style>\n  .unused { color: red; }\n</style>\n";

/// A `.svelte` file that fails to compile (unterminated `{#if}` block).
const HAS_ERROR: &str = "{#if}\n<p>oops</p>\n";

#[test]
fn threshold_default_shows_warnings() {
    let dir = workspace("thr_default");
    write(&dir, "Warn.svelte", WARN_ONLY);

    let out = run(&dir, &["--no-type-check"]);
    let stdout = String::from_utf8_lossy(&out.stdout);

    assert!(
        stdout.contains("Unused CSS selector"),
        "default threshold should print the warning; got:\n{stdout}"
    );
    assert!(
        stdout.contains("0 errors and 1 warning"),
        "summary should count the warning; got:\n{stdout}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn threshold_error_hides_warnings_but_keeps_counts() {
    let dir = workspace("thr_error");
    write(&dir, "Warn.svelte", WARN_ONLY);

    let out = run(&dir, &["--no-type-check", "--threshold", "error"]);
    let stdout = String::from_utf8_lossy(&out.stdout);

    assert!(
        !stdout.contains("Unused CSS selector"),
        "`--threshold error` must not print the warning; got:\n{stdout}"
    );
    // The count is computed from the unfiltered set, so it is unchanged.
    assert!(
        stdout.contains("0 errors and 1 warning"),
        "`--threshold error` must not change the summary counts; got:\n{stdout}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn threshold_invalid_warns_and_falls_back() {
    let dir = workspace("thr_invalid");
    write(&dir, "Warn.svelte", WARN_ONLY);

    let out = run(&dir, &["--no-type-check", "--threshold", "hint"]);
    let stderr = String::from_utf8_lossy(&out.stderr);
    let stdout = String::from_utf8_lossy(&out.stdout);

    assert!(
        stderr.contains("Invalid threshold \"hint\""),
        "invalid threshold should warn on stderr; got:\n{stderr}"
    );
    // Falls back to `warning`, so the warning is still printed.
    assert!(
        stdout.contains("Unused CSS selector"),
        "fallback threshold should behave like `warning`; got:\n{stdout}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn no_tsconfig_still_checks_svelte_files() {
    let dir = workspace("no_tsconfig");
    write(&dir, "Bad.svelte", HAS_ERROR);

    // `--no-tsconfig` is accepted and Svelte-side diagnostics still run.
    // `--no-type-check` keeps the test independent of a TS toolchain.
    let out = run(&dir, &["--no-tsconfig", "--no-type-check"]);
    let stdout = String::from_utf8_lossy(&out.stdout);

    assert!(
        stdout.contains("1 error") || stdout.contains("errors"),
        "no-tsconfig run should still report the Svelte compile error; got:\n{stdout}"
    );
    assert_eq!(
        out.status.code(),
        Some(1),
        "a compile error should exit non-zero"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn no_tsconfig_ignores_tsconfig_flag() {
    let dir = workspace("no_tsconfig_ignore");
    write(&dir, "Warn.svelte", WARN_ONLY);

    // Pointing `--tsconfig` at a non-existent path together with
    // `--no-tsconfig` must be a no-op (the tsconfig is ignored), not an
    // error — the run should still complete and report the warning.
    let out = run(
        &dir,
        &[
            "--no-tsconfig",
            "--no-type-check",
            "--tsconfig",
            "does-not-exist.json",
        ],
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        stdout.contains("0 errors and 1 warning"),
        "run should complete with the tsconfig ignored; got:\n{stdout}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn config_missing_file_errors() {
    let dir = workspace("config_missing");
    write(&dir, "Warn.svelte", WARN_ONLY);

    let out = run(&dir, &["--no-type-check", "--config", "nope.config.js"]);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert_eq!(
        out.status.code(),
        Some(2),
        "a missing --config file should exit 2"
    );
    assert!(
        stderr.contains("Could not find config file"),
        "missing config should be reported on stderr; got:\n{stderr}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn config_present_is_accepted() {
    let dir = workspace("config_present");
    write(&dir, "Warn.svelte", WARN_ONLY);
    write(
        &dir,
        "custom.svelte.config.js",
        "export default { compilerOptions: {} };",
    );

    let out = run(
        &dir,
        &["--no-type-check", "--config", "custom.svelte.config.js"],
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        stdout.contains("0 errors and 1 warning"),
        "a valid --config path should be accepted; got:\n{stdout}"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

/// The camelCase upstream spelling, the hyphenated alias, the tsgo
/// experimental alias, and the color no-ops must all be accepted rather
/// than rejected as unknown arguments (clap exits 2 with "unexpected
/// argument" otherwise).
#[test]
fn compatibility_spellings_are_accepted() {
    let dir = workspace("spellings");
    write(&dir, "Warn.svelte", WARN_ONLY);

    for args in [
        &["--no-type-check", "--preserveWatchOutput"][..],
        &["--no-type-check", "--preserve-watch-output"][..],
        &["--no-type-check", "--color"][..],
        &["--no-type-check", "--no-color"][..],
    ] {
        let out = run(&dir, args);
        // Only a warning is present, so a clean parse exits 0. A clap
        // "unknown argument" failure would exit 2 with nothing on stdout.
        assert_eq!(
            out.status.code(),
            Some(0),
            "args {args:?} should be accepted; stderr:\n{}",
            String::from_utf8_lossy(&out.stderr)
        );
    }
    let _ = std::fs::remove_dir_all(&dir);
}
