//! One-shot Node sidecar that sorts Tailwind classes through the real
//! `prettier-plugin-tailwindcss` — the same plugin (and API) `oxfmt` uses — so a
//! custom Tailwind config (`@theme` / `@plugin` / v3 config) sorts byte-for-byte
//! like the oxfmt oracle. Driven by [`crate::main`] only for the `SortViaJs`
//! decision; the default zero-config path stays pure-Rust.

use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::{Duration, Instant};

/// Upper bound on how long the sidecar may run before it's killed and the run
/// falls back to unsorted classes — a hung Node / plugin must never block the
/// whole formatter.
pub const DEFAULT_TIMEOUT: Duration = Duration::from_secs(30);
const POLL: Duration = Duration::from_millis(10);

/// The sidecar frames its JSON response between these markers, so a native addon
/// (e.g. the Tailwind v4 oxide binary) writing straight to fd 1 — bypassing the
/// script's `process.stdout.write` guard — can't corrupt the channel: the Rust
/// side extracts only the framed payload and discards any stray bytes. Kept
/// byte-identical to the `RESP_MARKER` in `tailwind-sort.mjs`.
const RESP_MARKER: &[u8] = b"\x00<<rsvelte-tw-sort>>\x00";

/// Node interpreter + `tailwind-sort.mjs` script. `None` at the call site
/// disables the JS path, so a custom config falls back to warn+skip.
pub struct SidecarEnv {
    pub node: PathBuf,
    pub script: PathBuf,
    /// Overridable so tests can exercise the timeout path without a 30s wait.
    pub timeout: Duration,
}

/// A single batch sort request; all class strings for one `rsvelte-fmt` run are
/// deduped and sent together.
pub struct SortRequest<'a> {
    pub filepath: &'a Path,
    pub stylesheet_path: Option<&'a Path>,
    pub config_path: Option<&'a Path>,
    pub preserve_whitespace: bool,
    pub preserve_duplicates: bool,
    pub classes: Vec<String>,
}

/// Sort `classes` via the sidecar. Returns the sorted list (same order and
/// length as the input) on success, or `None` on any failure — no Node, an
/// unresolvable plugin, a non-`ok` response, or a shape mismatch — so the caller
/// leaves the classes untouched rather than risking a wrong reorder.
pub fn sort(env: &SidecarEnv, req: &SortRequest) -> Option<Vec<String>> {
    if req.classes.is_empty() {
        return Some(Vec::new());
    }

    let payload = serde_json::json!({
        "filepath": req.filepath.to_string_lossy(),
        "stylesheetPath": req.stylesheet_path.map(|p| p.to_string_lossy()),
        "configPath": req.config_path.map(|p| p.to_string_lossy()),
        "preserveWhitespace": req.preserve_whitespace,
        "preserveDuplicates": req.preserve_duplicates,
        "classes": &req.classes,
    });
    let body = serde_json::to_vec(&payload).ok()?;

    let mut child = Command::new(&env.node)
        .arg(&env.script)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .ok()?;

    // Any early exit past this point must reap the child, so a broken pipe or a
    // missing pipe handle never leaves a zombie behind.
    let (Some(mut stdin), Some(mut stdout)) = (child.stdin.take(), child.stdout.take()) else {
        let _ = child.kill();
        let _ = child.wait();
        return None;
    };

    // Feed stdin on its own thread and drain stdout on another, concurrently, so
    // a child that writes a large burst to stdout before reading all of stdin
    // (e.g. a native addon printing straight to fd 1) can't deadlock our write.
    // Dropping the stdin handle at the end of the closure closes the pipe,
    // signalling EOF to the sidecar's `readStdin`.
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
            // `try_wait`/`wait` reap the child, so no explicit reap is needed here.
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
    let sorted: Option<Vec<String>> = resp
        .get("sorted")?
        .as_array()?
        .iter()
        .map(|v| v.as_str().map(str::to_owned))
        .collect();
    let sorted = sorted?;
    (sorted.len() == req.classes.len()).then_some(sorted)
}

/// Extract the JSON payload framed by [`RESP_MARKER`] from the sidecar's raw
/// stdout, discarding any stray bytes before, after, or (defensively) around it.
/// `None` when the frame is absent, so a truncated / corrupt response falls back
/// like any other sidecar miss.
fn extract_framed(buf: &[u8]) -> Option<&[u8]> {
    let start = find_subslice(buf, RESP_MARKER)? + RESP_MARKER.len();
    let rest = &buf[start..];
    let end = find_subslice(rest, RESP_MARKER)?;
    Some(&rest[..end])
}

fn find_subslice(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack.windows(needle.len()).position(|w| w == needle)
}
