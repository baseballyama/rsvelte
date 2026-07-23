//! One-shot Node sidecar that applies a project's `compilerOptions.warningFilter`
//! — a JS predicate the native compiler can't evaluate — to the compiler warnings
//! a `rsvelte-check` run produced.
//!
//! `warningFilter` is a pure per-warning predicate applied by the official Svelte
//! compiler at emit time; because a dropped warning never affects anything else,
//! filtering the full collected batch in one post-pass is exactly equivalent to
//! filtering at emit time (the same argument the NAPI shim uses, #1666). So the
//! whole run's warnings are gathered and sent to Node **once**, the sidecar loads
//! the config, calls the function on each warning, and returns a keep/drop mask.
//!
//! The sidecar never rejects: a missing Node, an unimportable config, a timeout,
//! or a malformed response all degrade to "keep every warning" (plus a single
//! stderr note) — a warningFilter that can't run must never silently *drop* a
//! warning, only fail open. The exit code is unaffected: it's recomputed from the
//! surviving diagnostics like any other filter.

use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::{Duration, Instant};

use super::diagnostic::{Diagnostic, DiagnosticSeverity};

/// Upper bound before a hung sidecar is killed and the run falls back to
/// keeping every warning — a stuck Node / config must never block the CLI.
pub const DEFAULT_TIMEOUT: Duration = Duration::from_secs(30);
const POLL: Duration = Duration::from_millis(10);

/// The sidecar frames its JSON response between these markers so a config that
/// prints to stdout on import (a banner, a debug line, a native addon writing
/// straight to fd 1) can't corrupt the channel: the Rust side extracts only the
/// framed payload. Kept byte-identical to `RESP_MARKER` in `warning-filter.mjs`.
const RESP_MARKER: &[u8] = b"\x00<<rsvelte-warning-filter>>\x00";

/// Env var naming the Node interpreter the CLI launcher recorded (its own
/// `process.execPath`). Falls back to `node` on `PATH`.
const NODE_ENV: &str = "RSVELTE_CHECK_NODE";
/// Env var naming the `warning-filter.mjs` sidecar script the CLI launcher
/// ships alongside itself. Absent → the filter path is disabled.
const SIDECAR_ENV: &str = "RSVELTE_CHECK_WARNING_FILTER_SIDECAR";

/// Node interpreter + `warning-filter.mjs` script + timeout.
pub struct SidecarEnv {
    pub node: PathBuf,
    pub script: PathBuf,
    /// Overridable so tests can exercise the timeout path without a 30s wait.
    pub timeout: Duration,
}

impl SidecarEnv {
    /// Resolve the sidecar from the environment the launcher set. `None`
    /// disables the JS filter (the run keeps every warning). A runnable Node is
    /// required, so a misconfigured `RSVELTE_CHECK_NODE` degrades gracefully.
    pub fn from_env() -> Option<Self> {
        let script = PathBuf::from(std::env::var_os(SIDECAR_ENV)?);
        if !script.is_file() {
            return None;
        }
        let node = std::env::var_os(NODE_ENV)
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from("node"));
        node_runnable(&node).then_some(SidecarEnv {
            node,
            script,
            timeout: DEFAULT_TIMEOUT,
        })
    }
}

/// Apply the config's `warningFilter` to `diagnostics` in place, dropping every
/// Svelte compiler **warning** the predicate rejects. Errors and non-Svelte
/// (e.g. TypeScript) diagnostics are never touched — `warningFilter` only ever
/// sees compiler warnings. On any sidecar failure the diagnostics are left
/// untouched and a single note is printed to stderr.
pub fn apply(env: &SidecarEnv, config_path: &Path, diagnostics: &mut Vec<Diagnostic>) {
    // Indices of the Svelte warnings the filter is allowed to judge, in order.
    let indices: Vec<usize> = diagnostics
        .iter()
        .enumerate()
        .filter(|(_, d)| d.severity == DiagnosticSeverity::Warning && d.source == "svelte")
        .map(|(i, _)| i)
        .collect();
    if indices.is_empty() {
        return;
    }

    let warnings: Vec<_> = indices
        .iter()
        .map(|&i| warning_json(&diagnostics[i]))
        .collect();
    let Some(keep) = run_sidecar(env, config_path, &warnings) else {
        // Once per process, so `--watch` doesn't re-print it on every rebuild.
        static FAILED_NOTE: std::sync::Once = std::sync::Once::new();
        FAILED_NOTE.call_once(|| {
            eprintln!(
                "rsvelte-check: warning: `compilerOptions.warningFilter` left unapplied — the Node \
                 sidecar could not evaluate it (is Node available and the config importable?). All \
                 warnings are shown."
            );
        });
        return;
    };

    // `keep[k]` corresponds to `indices[k]`; drop the rejected originals.
    let drop: std::collections::HashSet<usize> = indices
        .iter()
        .zip(keep)
        .filter_map(|(&i, k)| (!k).then_some(i))
        .collect();
    if drop.is_empty() {
        return;
    }
    let mut i = 0;
    diagnostics.retain(|_| {
        let keep = !drop.contains(&i);
        i += 1;
        keep
    });
}

/// The warning object shape the official svelte-check passes to `warningFilter`
/// (Svelte's `Warning`): `code`, `message`, `filename`, and 1-indexed
/// `start`/`end` `{ line, column }`. Reconstructed from the diagnostic.
fn warning_json(d: &Diagnostic) -> serde_json::Value {
    let loc =
        |p: &super::diagnostic::Position| serde_json::json!({ "line": p.line, "column": p.column });
    serde_json::json!({
        "code": d.code,
        "message": d.message,
        "filename": d.file.to_string_lossy(),
        "start": d.range.map(|r| loc(&r.start)),
        "end": d.range.map(|r| loc(&r.end)),
    })
}

/// Spawn the sidecar once and return the keep/drop mask (one bool per warning,
/// in order). `None` on any failure so the caller fails open.
fn run_sidecar(
    env: &SidecarEnv,
    config_path: &Path,
    warnings: &[serde_json::Value],
) -> Option<Vec<bool>> {
    let payload = serde_json::json!({
        "configPath": config_path.to_string_lossy(),
        "warnings": warnings,
    });
    let body = serde_json::to_vec(&payload).ok()?;

    let mut child = Command::new(&env.node)
        .arg(&env.script)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .ok()?;

    // Any early exit past here must reap the child so a broken pipe never leaves
    // a zombie behind.
    let (Some(mut stdin), Some(mut stdout)) = (child.stdin.take(), child.stdout.take()) else {
        let _ = child.kill();
        let _ = child.wait();
        return None;
    };

    // Feed stdin and drain stdout on separate threads so a child that writes a
    // large burst before reading all of stdin can't deadlock our write. Dropping
    // the stdin handle closes the pipe, signalling EOF to the sidecar.
    let writer = std::thread::spawn(move || {
        let _ = stdin.write_all(&body);
    });
    let reader = std::thread::spawn(move || {
        let mut buf = Vec::new();
        let _ = stdout.read_to_end(&mut buf);
        buf
    });

    let deadline = Instant::now() + env.timeout;
    let status = loop {
        match child.try_wait() {
            Ok(Some(status)) => break Some(status),
            Ok(None) if Instant::now() >= deadline => {
                let _ = child.kill();
                let _ = child.wait();
                break None;
            }
            Ok(None) => std::thread::sleep(POLL),
            Err(_) => {
                let _ = child.kill();
                let _ = child.wait();
                break None;
            }
        }
    };
    let _ = writer.join();
    let stdout = reader.join().unwrap_or_default();
    if !status?.success() {
        return None;
    }

    let payload = extract_framed(&stdout)?;
    let resp: serde_json::Value = serde_json::from_slice(payload).ok()?;
    if resp.get("ok").and_then(serde_json::Value::as_bool) != Some(true) {
        return None;
    }
    let keep: Vec<bool> = resp
        .get("keep")?
        .as_array()?
        .iter()
        .map(|v| v.as_bool().unwrap_or(true))
        .collect();
    (keep.len() == warnings.len()).then_some(keep)
}

/// Extract the JSON payload framed by [`RESP_MARKER`] from raw stdout, discarding
/// any stray bytes around it. `None` when the frame is absent.
fn extract_framed(buf: &[u8]) -> Option<&[u8]> {
    let start = find_subslice(buf, RESP_MARKER)? + RESP_MARKER.len();
    let rest = &buf[start..];
    let end = find_subslice(rest, RESP_MARKER)?;
    Some(&rest[..end])
}

fn find_subslice(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack.windows(needle.len()).position(|w| w == needle)
}

/// Whether `node --version` runs, so a missing Node disables the path cleanly.
fn node_runnable(node: &Path) -> bool {
    Command::new(node)
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

// Only the pure, Node-free logic is unit-tested here so the `--lib` test-unit CI
// job stays runnable without a Node interpreter. The Node-backed `apply()`
// behaviour (sidecar spawn, timeout, protocol) is covered in the integration
// suite `tests/svelte_check_warning_filter.rs`, whose CI job installs Node.
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extract_framed_picks_payload_out_of_noise() {
        let mut buf = b"stray banner\n".to_vec();
        buf.extend_from_slice(RESP_MARKER);
        buf.extend_from_slice(br#"{"ok":true}"#);
        buf.extend_from_slice(RESP_MARKER);
        buf.extend_from_slice(b"trailing junk");
        assert_eq!(extract_framed(&buf), Some(&br#"{"ok":true}"#[..]));
    }

    #[test]
    fn extract_framed_absent_marker_is_none() {
        assert_eq!(extract_framed(b"no markers here"), None);
        assert_eq!(extract_framed(RESP_MARKER), None);
    }
}
