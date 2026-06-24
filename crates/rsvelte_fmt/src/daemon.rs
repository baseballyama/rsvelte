//! Unix-socket client for the persistent oxfmt formatting daemon (POSIX only).
//!
//! Formatting a `<style>` block by spawning `oxfmt` pays a Node cold start
//! (~370ms measured) every time. This client talks to a long-lived daemon
//! (`apps/npm/fmt/daemon/daemon.mjs`, shipped in `@rsvelte/fmt`) that keeps
//! oxfmt warm, turning each block into a ~ms socket round-trip. The daemon is
//! deliberately "dumb": we resolve the oxfmt options here and send them inline,
//! so its output is byte-identical to the spawn path (same engine, same
//! options). Any failure — no Node, no bundle, connect/spawn/protocol error —
//! returns `None` so the caller falls back to spawning `oxfmt` directly.
//!
//! Windows has no Unix sockets here and stays on the spawn path; the daemon is a
//! pure speedup, never a correctness dependency.

#![cfg(unix)]

use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::io::{BufRead, BufReader, Write};
use std::os::unix::net::UnixStream;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::{Duration, Instant};

/// Wire-protocol version. Must match `PROTOCOL_VERSION` in `daemon.mjs`; it is
/// mixed into the socket path so incompatible binaries never share a daemon.
const PROTOCOL_VERSION: u32 = 1;

/// How long to wait for a freshly-spawned daemon to start accepting.
const SPAWN_CONNECT_TIMEOUT: Duration = Duration::from_secs(5);
const SPAWN_CONNECT_POLL: Duration = Duration::from_millis(10);

/// A connected daemon session for one `rsvelte-fmt` invocation.
pub(crate) struct DaemonClient {
    reader: BufReader<UnixStream>,
    writer: UnixStream,
    next_id: u64,
}

impl DaemonClient {
    /// Try to connect to (or spawn) the daemon for this `oxfmt`. Returns `None`
    /// when the daemon can't be used (no Node interpreter, no bundle, or any
    /// connect/spawn failure) — the caller then falls back to spawning oxfmt.
    pub(crate) fn try_start(oxfmt: &Path) -> Option<Self> {
        // Escape hatch: force the spawn path (also how the parity tests pin the
        // two paths against each other).
        if std::env::var_os("RSVELTE_FMT_NO_DAEMON").is_some_and(|v| !v.is_empty() && v != "0") {
            return None;
        }
        // The daemon is a Node script: without a known interpreter (oxfmt
        // installed as a native binary on `$PATH`), there's nothing to run it.
        let node = crate::oxfmt_node()?;
        let bundle = daemon_bundle_path()?;
        let pkg_dir = oxfmt_pkg_dir(oxfmt)?;
        let socket = socket_path(oxfmt)?;

        let stream = connect_or_spawn(&socket, &node, &bundle, &pkg_dir)?;
        let reader = BufReader::new(stream.try_clone().ok()?);
        Some(DaemonClient {
            reader,
            writer: stream,
            next_id: 0,
        })
    }

    /// Format a group of `(css, lang)` blocks at the given resolved `options`
    /// (already including the per-block `printWidth`). Returns the formatted
    /// bodies in input order plus whether every block formatted cleanly, or
    /// `None` on any I/O / protocol error (caller falls back to spawn).
    pub(crate) fn format_group(
        &mut self,
        styles: &[(&str, &str)],
        options: &serde_json::Value,
    ) -> Option<(Vec<String>, bool)> {
        // Send every request, then read every response, matching by id. The
        // daemon answers each as it completes (possibly out of order).
        let base = self.next_id;
        let mut want: Vec<u64> = Vec::with_capacity(styles.len());
        for (i, (css, lang)) in styles.iter().enumerate() {
            let id = base + i as u64;
            want.push(id);
            let req = serde_json::json!({
                "id": id,
                "fileName": format!("inline.{}", crate::oxfmt_ext(lang)),
                "content": css,
                "options": options,
            });
            let mut line = serde_json::to_string(&req).ok()?;
            line.push('\n');
            self.writer.write_all(line.as_bytes()).ok()?;
        }
        self.writer.flush().ok()?;
        self.next_id = base + styles.len() as u64;

        // Collect responses by id.
        let mut by_id: std::collections::HashMap<u64, (String, bool)> =
            std::collections::HashMap::with_capacity(styles.len());
        while by_id.len() < styles.len() {
            let mut line = String::new();
            let n = self.reader.read_line(&mut line).ok()?;
            if n == 0 {
                return None; // daemon closed the connection early
            }
            let trimmed = line.trim_end();
            if trimmed.is_empty() {
                continue;
            }
            let value: serde_json::Value = serde_json::from_str(trimmed).ok()?;
            let id = value.get("id").and_then(serde_json::Value::as_u64)?;
            let ok = value
                .get("ok")
                .and_then(serde_json::Value::as_bool)
                .unwrap_or(false);
            let code = value.get("code").and_then(serde_json::Value::as_str)?;
            by_id.insert(id, (code.to_string(), ok));
        }

        let mut results = Vec::with_capacity(styles.len());
        let mut all_ok = true;
        for id in want {
            let (code, ok) = by_id.remove(&id)?;
            all_ok &= ok;
            results.push(code);
        }
        Some((results, all_ok))
    }
}

/// Connect to the socket, or spawn the daemon and connect once it's up. A
/// confirmed-stale socket (file exists but refuses connections) is removed
/// before spawning.
fn connect_or_spawn(
    socket: &Path,
    node: &Path,
    bundle: &Path,
    pkg_dir: &Path,
) -> Option<UnixStream> {
    if let Ok(stream) = UnixStream::connect(socket) {
        return Some(stream);
    }

    // No live daemon. Clear a stale socket file so the daemon can bind.
    if socket.exists() {
        let _ = std::fs::remove_file(socket);
    }

    spawn_daemon(socket, node, bundle, pkg_dir)?;

    // Poll for the daemon to start accepting. Multiple concurrent invocations
    // may each spawn a daemon; all but one lose the listen race and exit, and
    // everyone connects to the winner.
    let deadline = Instant::now() + SPAWN_CONNECT_TIMEOUT;
    loop {
        if let Ok(stream) = UnixStream::connect(socket) {
            return Some(stream);
        }
        if Instant::now() >= deadline {
            return None;
        }
        std::thread::sleep(SPAWN_CONNECT_POLL);
    }
}

/// Spawn the daemon detached so it outlives this invocation. Best-effort: a
/// spawn error returns `None` (caller falls back to spawning oxfmt).
fn spawn_daemon(socket: &Path, node: &Path, bundle: &Path, pkg_dir: &Path) -> Option<()> {
    use std::os::unix::process::CommandExt;
    Command::new(node)
        .arg(bundle)
        .arg(socket)
        .arg(pkg_dir)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        // New process group so it isn't killed with the parent's group and
        // survives to serve later invocations.
        .process_group(0)
        .spawn()
        .ok()
        .map(|_| ())
}

/// Locate the `daemon.mjs` bundle. A test/dev override comes first; otherwise it
/// sits next to the installed binary at `<pkg>/daemon/daemon.mjs` (the binary
/// lives at `<pkg>/bin/rsvelte-fmt`).
fn daemon_bundle_path() -> Option<PathBuf> {
    if let Some(p) = std::env::var_os("RSVELTE_FMT_DAEMON_BUNDLE").filter(|v| !v.is_empty()) {
        let p = PathBuf::from(p);
        return p.is_file().then_some(p);
    }
    let exe = std::env::current_exe().ok()?;
    let pkg = exe.parent()?.parent()?;
    let bundle = pkg.join("daemon").join("daemon.mjs");
    bundle.is_file().then_some(bundle)
}

/// Derive oxfmt's package directory from its launcher path
/// (`<pkg>/bin/oxfmt` → `<pkg>`), verifying a `package.json` is there. Returns
/// `None` for an oxfmt that isn't a resolvable npm package (e.g. a bare native
/// binary on `$PATH`), in which case the daemon can't `import('oxfmt')`.
fn oxfmt_pkg_dir(oxfmt: &Path) -> Option<PathBuf> {
    let pkg = oxfmt.parent()?.parent()?;
    pkg.join("package.json")
        .is_file()
        .then(|| pkg.to_path_buf())
}

/// Version-keyed socket path: `<tmp>/rsvelte-fmt-d-<hash>.sock`, where the hash
/// covers the oxfmt fingerprint + protocol version. An oxfmt upgrade or a
/// protocol bump yields a different path, so a fresh daemon is started rather
/// than reusing an incompatible one. Kept short for the `sun_path` limit.
fn socket_path(oxfmt: &Path) -> Option<PathBuf> {
    let dir = runtime_dir();
    let mut h = DefaultHasher::new();
    PROTOCOL_VERSION.hash(&mut h);
    oxfmt_fingerprint(oxfmt).hash(&mut h);
    let hash = h.finish();
    Some(dir.join(format!("rsvelte-fmt-d-{hash:016x}.sock")))
}

/// Prefer `$XDG_RUNTIME_DIR` (short, user-private), else the system temp dir.
fn runtime_dir() -> PathBuf {
    std::env::var_os("XDG_RUNTIME_DIR")
        .filter(|v| !v.is_empty())
        .map(PathBuf::from)
        .unwrap_or_else(std::env::temp_dir)
}

/// Cheap oxfmt identity (path + size + mtime) so a reinstall of a new version
/// rotates the socket. Mirrors the style cache's fingerprint; a path that can't
/// be stat'd contributes just its bytes (a bare `$PATH` command).
fn oxfmt_fingerprint(oxfmt: &Path) -> Vec<u8> {
    let mut fp = oxfmt.to_string_lossy().into_owned().into_bytes();
    if let Ok(md) = std::fs::metadata(oxfmt) {
        fp.extend_from_slice(&md.len().to_le_bytes());
        if let Ok(mtime) = md.modified()
            && let Ok(dur) = mtime.duration_since(std::time::UNIX_EPOCH)
        {
            fp.extend_from_slice(&dur.as_nanos().to_le_bytes());
        }
    }
    fp
}
