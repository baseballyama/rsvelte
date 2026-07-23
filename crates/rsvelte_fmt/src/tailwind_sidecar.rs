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

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU32, Ordering};

    #[test]
    fn extract_framed_picks_payload_out_of_noise() {
        let mut buf = b"stray oxide banner\n".to_vec();
        buf.extend_from_slice(RESP_MARKER);
        buf.extend_from_slice(br#"{"ok":true}"#);
        buf.extend_from_slice(RESP_MARKER);
        buf.extend_from_slice(b"trailing junk");
        assert_eq!(extract_framed(&buf), Some(&br#"{"ok":true}"#[..]));
    }

    #[test]
    fn extract_framed_absent_marker_is_none() {
        assert_eq!(extract_framed(b"no markers here"), None);
        assert_eq!(extract_framed(RESP_MARKER), None); // only one marker
    }

    fn node() -> Option<PathBuf> {
        let node = PathBuf::from("node");
        Command::new(&node)
            .arg("--version")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
            .then_some(node)
    }

    /// Write `body` to a unique temp `.mjs` and build a `SidecarEnv` around it.
    fn env_with_script(node: PathBuf, body: &str, timeout: Duration) -> (SidecarEnv, PathBuf) {
        static N: AtomicU32 = AtomicU32::new(0);
        let script = std::env::temp_dir().join(format!(
            "rsvelte-tw-sidecar-test-{}-{}.mjs",
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

    fn req(classes: &[&str]) -> Vec<String> {
        classes.iter().map(|s| s.to_string()).collect()
    }

    /// Run `sort` against a fake sidecar `script_body`. `None` return means "no
    /// Node — test skipped"; `Some(result)` is the actual `sort` outcome.
    fn run(script_body: &str, timeout: Duration, classes: &[&str]) -> Option<Option<Vec<String>>> {
        let node = node()?;
        let (env, path) = env_with_script(node, script_body, timeout);
        let request = SortRequest {
            filepath: Path::new("/tmp/x.svelte"),
            stylesheet_path: None,
            config_path: None,
            preserve_whitespace: false,
            preserve_duplicates: false,
            classes: req(classes),
        };
        let out = sort(&env, &request);
        let _ = std::fs::remove_file(path);
        Some(out)
    }

    /// Skip the enclosing test (via `return`) when Node is unavailable.
    macro_rules! run_or_skip {
        ($($arg:tt)*) => {
            match run($($arg)*) {
                Some(out) => out,
                None => {
                    eprintln!("[tw-sidecar] no node; skipping.");
                    return;
                }
            }
        };
    }

    const M: &str = "\x00<<rsvelte-tw-sort>>\x00";

    fn responder(response_expr: &str) -> String {
        format!(
            "let d='';process.stdin.setEncoding('utf8');\
             process.stdin.on('data',c=>d+=c);\
             process.stdin.on('end',()=>{{const req=JSON.parse(d);\
             process.stdout.write({response_expr});}});"
        )
    }

    #[test]
    fn ok_response_round_trips() {
        // Echo the classes back framed — proves the framed happy path parses.
        let body = responder(&format!(
            "'{M}'+JSON.stringify({{ok:true,sorted:req.classes}})+'{M}'"
        ));
        let out = run_or_skip!(&body, DEFAULT_TIMEOUT, &["p-4", "m-2"]);
        assert_eq!(out, Some(req(&["p-4", "m-2"])));
    }

    #[test]
    fn stray_fd1_output_before_frame_is_tolerated() {
        // A native addon printing straight to fd 1 must not corrupt the channel.
        let body = responder(&format!(
            "'oxide deprecation notice\\n'+'{M}'+JSON.stringify({{ok:true,sorted:req.classes}})+'{M}'"
        ));
        let out = run_or_skip!(&body, DEFAULT_TIMEOUT, &["flex", "p-4"]);
        assert_eq!(out, Some(req(&["flex", "p-4"])));
    }

    #[test]
    fn non_ok_response_falls_back() {
        let body = responder(&format!(
            "'{M}'+JSON.stringify({{ok:false,error:'boom'}})+'{M}'"
        ));
        let out = run_or_skip!(&body, DEFAULT_TIMEOUT, &["p-4"]);
        assert_eq!(out, None);
    }

    #[test]
    fn malformed_response_falls_back() {
        // Framed but not JSON.
        let framed_garbage = responder(&format!("'{M}'+'not json at all'+'{M}'"));
        let out = run_or_skip!(&framed_garbage, DEFAULT_TIMEOUT, &["p-4"]);
        assert_eq!(out, None);
        // No frame markers at all.
        let unframed = responder("'plain stdout, no markers'");
        let out = run_or_skip!(&unframed, DEFAULT_TIMEOUT, &["p-4"]);
        assert_eq!(out, None);
    }

    #[test]
    fn length_mismatch_falls_back() {
        let body = responder(&format!(
            "'{M}'+JSON.stringify({{ok:true,sorted:['only-one']}})+'{M}'"
        ));
        let out = run_or_skip!(&body, DEFAULT_TIMEOUT, &["p-4", "m-2"]);
        assert_eq!(out, None);
    }

    #[test]
    fn hung_sidecar_times_out_and_falls_back() {
        // Never reads stdin, never exits; the injected short timeout must kill it.
        let start = Instant::now();
        let out = run_or_skip!(
            "setInterval(()=>{},100000);",
            Duration::from_millis(300),
            &["p-4", "m-2"]
        );
        assert_eq!(out, None);
        assert!(
            start.elapsed() < Duration::from_secs(10),
            "timeout should fire promptly, took {:?}",
            start.elapsed()
        );
    }
}
