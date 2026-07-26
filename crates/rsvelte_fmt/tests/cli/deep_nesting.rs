//! Regression tests for #1838: `rsvelte-fmt`'s directory pass formats every
//! file on rayon workers (see `run_svelte_files_native` in
//! `src/svelte_pipeline.rs`, driven by `run()`'s pool in `src/run.rs`), and
//! the formatter's own recursive printer can overflow a small worker stack in
//! an unoptimized build at a nesting depth the parser still accepts (just
//! under `MAX_NESTING_DEPTH = 128`, mirroring
//! `rsvelte_core`'s `deep_nesting_1794.rs`).
//!
//! A rayon worker that never gets an explicit `stack_size` falls back to
//! `RUST_MIN_STACK` (default 2 MiB) exactly like any other spawned thread, so
//! forcing that env var down to something clearly insufficient (256 KiB) is a
//! deterministic, platform-independent way to simulate "no dedicated pool" —
//! the exact overflow margin at 2 MiB varies by target and toolchain, but no
//! platform prints this deep in 256 KiB. Once `run()` builds its own pool
//! with an explicit `stack_size` (see `fmt_thread_pool`), that override wins
//! over `RUST_MIN_STACK` unconditionally, so these tests only pass if the
//! fix's dedicated stack size is actually in effect.
//!
//! `RAYON_NUM_THREADS=1` collapses the pool to a single worker and — because
//! `run()` calls `rayon::join`/`par_iter` from the (non-pool) main thread —
//! forces the *entire* per-file pass onto that one worker rather than letting
//! rayon execute a branch inline on the caller, so the deep-nested file's
//! print recursion is guaranteed to run on the worker whose stack is under
//! test, not on the process's main thread (which always gets a generous OS
//! default regardless of this bug).

use std::process::{Command, Stdio};

use crate::common::{bin, tempdir};

/// A stack clearly too small for this recursion depth on any platform, used
/// to stand in for "no dedicated pool" (see module docs) — the point isn't to
/// find the exact overflow boundary, only to prove the fix's pool ignores it.
const TINY_STACK: &str = "262144";

fn nested(open: &str, inner: &str, close: &str, depth: usize) -> String {
    let mut source = String::with_capacity((open.len() + close.len()) * depth + inner.len());
    for _ in 0..depth {
        source.push_str(open);
    }
    source.push_str(inner);
    for _ in 0..depth {
        source.push_str(close);
    }
    source
}

/// Run `rsvelte-fmt --write <dir> --oxfmt-bin true` with a deliberately tiny
/// `RUST_MIN_STACK` and a single-worker pool, returning the exit status.
/// `--oxfmt-bin true` is a no-op stand-in: every file here is handled
/// in-process, so nothing ever spawns it.
fn write_under_tiny_stack(dir: &std::path::Path) -> std::process::ExitStatus {
    Command::new(bin())
        .args([dir.to_str().unwrap(), "--write", "--oxfmt-bin", "true"])
        .env("RUST_MIN_STACK", TINY_STACK)
        .env("RAYON_NUM_THREADS", "1")
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .status()
        .expect("spawn rsvelte-fmt")
}

/// `MAX_NESTING_DEPTH - 1` nested `<div>`s — the deepest markup the parser
/// still accepts (the root fragment occupies the remaining level) — must
/// format successfully even when its rayon worker only has a 256 KiB stack,
/// because `run()`'s dedicated pool stack size overrides it.
#[test]
fn deeply_nested_elements_survive_a_tiny_worker_stack() {
    let dir = tempdir();
    let file = dir.join("deep.svelte");
    let depth = 128 - 1;
    std::fs::write(&file, nested("<div>", "hi", "</div>", depth) + "\n").unwrap();

    let status = write_under_tiny_stack(&dir);
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        out.starts_with("<div>\n  <div>\n    <div>"),
        "expected reindented nested markup, got:\n{}",
        &out[..out.len().min(200)]
    );
    assert!(
        out.trim_end().ends_with("</div>\n  </div>\n</div>") || out.contains("hi"),
        "formatted output looks truncated/corrupted"
    );
}

/// The CSS-nesting counterpart: `MAX_NESTING_DEPTH - 1` nested selectors in an
/// embedded `<style>` block, formatted in-process (native CSS is the
/// default), must survive the same tiny-worker-stack scenario.
#[test]
fn deeply_nested_css_survives_a_tiny_worker_stack() {
    let dir = tempdir();
    let file = dir.join("deep.svelte");
    let depth = 128 - 1;
    let css = nested(":is(", "a", ")", depth);
    std::fs::write(
        &file,
        format!("<div></div>\n<style>{css}{{color:red;}}</style>\n"),
    )
    .unwrap();

    let status = write_under_tiny_stack(&dir);
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        out.contains("color: red;"),
        "formatted output looks truncated/corrupted:\n{}",
        &out[..out.len().min(400)]
    );
}
