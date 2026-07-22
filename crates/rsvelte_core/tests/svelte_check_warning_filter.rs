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
use std::time::Duration;

use rsvelte_core::svelte_check::diagnostic::{Diagnostic, DiagnosticSeverity, Position, Range};
use rsvelte_core::svelte_check::warning_filter::{DEFAULT_TIMEOUT, SidecarEnv, apply};

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
fn falsy_non_false_return_drops_warning() {
    if !node_available() {
        return;
    }
    // Svelte uses a truthiness test (`if (!warning_filter(w)) return;`), so a
    // predicate returning `undefined` (falsy, but not strictly `false`) must
    // drop the warning — not keep it.
    let dir = workspace("falsy");
    write(&dir, "Warn.svelte", WARN_ONLY);
    write(
        &dir,
        "svelte.config.js",
        "export default { compilerOptions: { warningFilter: (w) => (w.code === 'css_unused_selector' ? undefined : true) } };",
    );

    let out = run_with_sidecar(&dir, &["--no-type-check"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        !stdout.contains("Unused CSS selector"),
        "a falsy (undefined) return must drop the warning; got:\n{stdout}"
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

#[test]
fn warning_filter_wins_over_compiler_warnings_error_promotion() {
    if !node_available() {
        return;
    }
    // A warning the filter rejects must be *gone* before `--compiler-warnings
    // code:error` could promote it — matching the official filter-then-promote
    // order. Without the fix the rejected warning would surface as an ERROR and
    // flip the exit code.
    let dir = workspace("filter_then_promote");
    write(&dir, "Warn.svelte", WARN_ONLY);
    write(
        &dir,
        "svelte.config.js",
        "export default { compilerOptions: { warningFilter: (w) => w.code !== 'css_unused_selector' } };",
    );

    let out = run_with_sidecar(
        &dir,
        &[
            "--no-type-check",
            "--compiler-warnings",
            "css_unused_selector:error",
        ],
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        !stdout.contains("Unused CSS selector"),
        "a filtered warning must not be promoted to an error; got:\n{stdout}"
    );
    assert!(
        stdout.contains("0 errors and 0 warnings"),
        "the filtered warning must not be counted as an error; got:\n{stdout}"
    );
    assert_eq!(
        out.status.code(),
        Some(0),
        "a filtered-away warning must not flip the exit code via error promotion"
    );
    let _ = std::fs::remove_dir_all(&dir);
}

// ── `warning_filter::apply()` protocol coverage ─────────────────────────────
// These drive the Rust sidecar runner directly against fake Node scripts, so
// they need a Node interpreter — hence they live in this integration suite (its
// CI job installs Node) rather than in the `--lib` unit tests.

fn node_bin() -> Option<PathBuf> {
    node_available().then(|| PathBuf::from("node"))
}

fn warn(code: &str) -> Diagnostic {
    Diagnostic {
        file: PathBuf::from("Foo.svelte"),
        severity: DiagnosticSeverity::Warning,
        code: Some(code.into()),
        message: "msg".into(),
        range: Some(Range {
            start: Position { line: 1, column: 0 },
            end: Position { line: 1, column: 4 },
        }),
        source: "svelte",
    }
}

/// Write `body` to a unique temp `.mjs` and build a `SidecarEnv` around it.
fn env_with_script(node: PathBuf, body: &str, timeout: Duration) -> (SidecarEnv, PathBuf) {
    use std::sync::atomic::{AtomicU32, Ordering};
    static N: AtomicU32 = AtomicU32::new(0);
    let script = std::env::temp_dir().join(format!(
        "rsvelte-wf-sidecar-test-{}-{}.mjs",
        std::process::id(),
        N.fetch_add(1, Ordering::Relaxed)
    ));
    std::fs::write(&script, body).unwrap();
    (
        SidecarEnv {
            node,
            script: script.clone(),
            timeout,
        },
        script,
    )
}

/// A fake sidecar that keeps warnings whose `code` isn't "drop_me",
/// exercising the real framed request/response protocol end-to-end.
const FAKE_SIDECAR: &str = r#"
    const M = '\x00<<rsvelte-warning-filter>>\x00';
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => {
        const req = JSON.parse(data);
        const keep = req.warnings.map((w) => w.code !== 'drop_me');
        process.stdout.write(M + JSON.stringify({ ok: true, keep }) + M);
    });
"#;

#[test]
fn apply_drops_rejected_warning_keeps_others() {
    let Some(node) = node_bin() else { return };
    let (env, script) = env_with_script(node, FAKE_SIDECAR, DEFAULT_TIMEOUT);
    let mut diags = vec![warn("drop_me"), warn("keep_me")];
    apply(&env, Path::new("svelte.config.js"), &mut diags);
    let codes: Vec<_> = diags.iter().map(|d| d.code.clone().unwrap()).collect();
    assert_eq!(codes, vec!["keep_me".to_string()]);
    let _ = std::fs::remove_file(script);
}

#[test]
fn apply_hung_sidecar_times_out_and_keeps_all() {
    let Some(node) = node_bin() else { return };
    let (env, script) = env_with_script(
        node,
        "setInterval(() => {}, 1000);",
        Duration::from_millis(200),
    );
    let mut diags = vec![warn("a"), warn("b")];
    apply(&env, Path::new("svelte.config.js"), &mut diags);
    assert_eq!(diags.len(), 2, "a timeout must keep every warning");
    let _ = std::fs::remove_file(script);
}

#[test]
fn apply_malformed_response_keeps_all() {
    let Some(node) = node_bin() else { return };
    let (env, script) = env_with_script(
        node,
        "process.stdout.write('not framed json');",
        DEFAULT_TIMEOUT,
    );
    let mut diags = vec![warn("a")];
    apply(&env, Path::new("svelte.config.js"), &mut diags);
    assert_eq!(diags.len(), 1);
    let _ = std::fs::remove_file(script);
}

#[test]
fn apply_leaves_non_svelte_and_error_diagnostics_untouched() {
    let Some(node) = node_bin() else { return };
    // Even a filter that drops everything must not remove errors / ts diags.
    let sidecar = r#"
        const M = '\x00<<rsvelte-warning-filter>>\x00';
        let data = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (c) => (data += c));
        process.stdin.on('end', () => {
            const req = JSON.parse(data);
            process.stdout.write(M + JSON.stringify({ ok: true, keep: req.warnings.map(() => false) }) + M);
        });
    "#;
    let (env, script) = env_with_script(node, sidecar, DEFAULT_TIMEOUT);
    let mut err = warn("x");
    err.severity = DiagnosticSeverity::Error;
    let mut ts = warn("y");
    ts.source = "ts";
    let mut diags = vec![warn("droppable"), err, ts];
    apply(&env, Path::new("svelte.config.js"), &mut diags);
    // Only the single svelte warning is removed.
    assert_eq!(diags.len(), 2);
    assert!(diags.iter().all(|d| d.code.as_deref() != Some("droppable")));
    let _ = std::fs::remove_file(script);
}
