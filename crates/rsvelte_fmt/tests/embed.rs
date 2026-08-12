//! `FormatSession` (`crates/rsvelte_fmt/src/embed.rs`) is the in-process
//! pipeline the language server embeds — no `rsvelte-fmt` subprocess, so an
//! embedder that knows where the consumer's `oxfmt` lives needs a way to tell
//! it, the same way the CLI's own `--oxfmt-bin` flag does (#1792). Before this
//! fix, `FormatSession::resolve` always built `OptionFlags::default()`, so a
//! bare `oxfmt` on `$PATH` was the only option — never guaranteed for a
//! process an editor spawns.
//!
//! `crates/rsvelte_fmt/tests/cli/delegation.rs` covers the CLI's own
//! `--oxfmt-bin` handling; this file covers the equivalent embedder-facing
//! surface: `FormatSession::resolve_with_oxfmt_bin` (an explicit parameter)
//! and the `RSVELTE_FMT_OXFMT_BIN` env var `FormatSession::resolve` reads as
//! its fallback.

use std::path::PathBuf;
use std::process::{Command, Stdio};

use rsvelte_fmt::FormatSession;

/// A fake `oxfmt` for the `--stdin-filepath` path `oxfmt_stdin` drives:
/// prefixes whatever it receives on stdin and echoes it to stdout.
const MARKER_OXFMT_STDIN: &str = r"const fs = require('node:fs');
process.stdout.write('/*FMT*/' + fs.readFileSync(0, 'utf8'));
";

fn node_runnable() -> bool {
    let ok = Command::new("node")
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .is_ok_and(|s| s.success());
    // Only a job that promised Node may fail on its absence.
    assert!(
        ok || std::env::var_os("RSVELTE_REQUIRE_PREREQS").is_none(),
        "no `node` on $PATH in a job that declares RSVELTE_REQUIRE_PREREQS — the oxfmt-bin resolution \
         assertions would be silently skipped."
    );
    ok
}

fn tempdir(label: &str) -> PathBuf {
    static COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
    let seq = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    let dir = std::env::temp_dir().join(format!(
        "rsvelte_fmt_embed_test_{}_{}_{}",
        std::process::id(),
        label,
        seq
    ));
    std::fs::create_dir_all(&dir).unwrap();
    dir
}

/// `FormatSession::format` on a `.ts` file has no in-process formatter
/// (`format_in_process` only handles `.svelte` and native CSS — see
/// `stdin.rs`), so it always falls through to `oxfmt_stdin`. Resolving with an
/// explicit `oxfmt_bin` must route that fallback through it — the embedder
/// equivalent of the CLI's `--oxfmt-bin` flag.
#[test]
fn resolve_with_oxfmt_bin_routes_non_svelte_formatting_through_it() {
    if !node_runnable() {
        eprintln!("[embed] no `node` on $PATH; skipping.");
        return;
    }

    let dir = tempdir("explicit");
    let fake = dir.join("fake-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT_STDIN).unwrap();

    let ts_path = dir.join("a.ts");
    let session =
        FormatSession::resolve_with_oxfmt_bin(&ts_path, Some(fake)).expect("resolve session");
    let out = session
        .format("const x=1\n", &ts_path)
        .expect("format via the explicit oxfmt_bin");

    assert!(
        out.contains("/*FMT*/"),
        "explicit oxfmt_bin was not used by FormatSession (no marker):\n{out}"
    );
}

/// `resolve_with_oxfmt_bin(path, None)` must behave exactly like `resolve`
/// (both fall back to the `RSVELTE_FMT_OXFMT_BIN` env var, and from there to a
/// bare `oxfmt` on `$PATH`) — proving `None` really means "no override," not
/// "no oxfmt."
///
/// This is the only test in this binary that touches
/// `RSVELTE_FMT_OXFMT_BIN`, so mutating it here doesn't race another test —
/// see the module doc comment.
#[test]
fn resolve_falls_back_to_the_env_var_then_resolve_with_none_matches_it() {
    if !node_runnable() {
        eprintln!("[embed] no `node` on $PATH; skipping.");
        return;
    }

    let dir = tempdir("env-fallback");
    let fake = dir.join("fake-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT_STDIN).unwrap();

    // SAFETY: this is the only test in this binary that touches this
    // environment variable (see the doc comment above).
    unsafe {
        std::env::set_var("RSVELTE_FMT_OXFMT_BIN", &fake);
    }

    let ts_path = dir.join("b.ts");
    let via_resolve = FormatSession::resolve(&ts_path)
        .expect("resolve session")
        .format("const x=1\n", &ts_path)
        .expect("format via the env-resolved oxfmt_bin");

    let ts_path2 = dir.join("c.ts");
    let via_none = FormatSession::resolve_with_oxfmt_bin(&ts_path2, None)
        .expect("resolve session")
        .format("const x=1\n", &ts_path2)
        .expect("format via the env-resolved oxfmt_bin");

    // SAFETY: this is the only test in this binary that touches this
    // environment variable (see the doc comment above).
    unsafe {
        std::env::remove_var("RSVELTE_FMT_OXFMT_BIN");
    }

    assert!(
        via_resolve.contains("/*FMT*/"),
        "resolve() did not pick up RSVELTE_FMT_OXFMT_BIN:\n{via_resolve}"
    );
    assert_eq!(
        via_resolve, via_none,
        "resolve() and resolve_with_oxfmt_bin(path, None) must agree"
    );
}
