//! One-shot Node sidecar that sorts Tailwind classes through the real
//! `prettier-plugin-tailwindcss` — the same plugin (and API) `oxfmt` uses — so a
//! custom Tailwind config (`@theme` / `@plugin` / v3 config) sorts byte-for-byte
//! like the oxfmt oracle. Driven by [`crate::main`] only for the `SortViaJs`
//! decision; the default zero-config path stays pure-Rust.

use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

/// Node interpreter + `tailwind-sort.mjs` script. `None` at the call site
/// disables the JS path, so a custom config falls back to warn+skip.
pub struct SidecarEnv {
    pub node: PathBuf,
    pub script: PathBuf,
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
    // Dropping the moved-out stdin at the end of the statement closes the pipe,
    // signalling EOF to the sidecar's `readStdin`.
    child.stdin.take()?.write_all(&body).ok()?;
    let out = child.wait_with_output().ok()?;
    if !out.status.success() {
        return None;
    }

    let resp: serde_json::Value = serde_json::from_slice(&out.stdout).ok()?;
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
