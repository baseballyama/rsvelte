//! Watch loop for the `svelte-check` CLI. Runs the regular `run` once,
//! prints diagnostics, and then keeps re-running on file-system events
//! filtered down to the kinds of files the JS reference reacts to:
//! `.svelte`, `.ts`, `.js`, `.tsx`, `.jsx`, plus `tsconfig.json`.
//!
//! Mirrors the high-level behaviour of
//! `submodules/language-tools/packages/svelte-check/src/index.ts` ↔
//! `runChecks` — minus the watch UI niceties (preserveWatchOutput etc).
//! The intent is for `--incremental` and `--watch` to compose: every
//! re-run reuses the on-disk manifest so unchanged files skip the
//! overlay step.

use std::path::Path;
use std::sync::mpsc::{Receiver, channel};
use std::time::{Duration, Instant};

use notify::{EventKind, RecommendedWatcher, RecursiveMode, Watcher, recommended_watcher};

use super::runner::{RunOptions, RunResult, run};

/// Runtime knobs for the watch loop. Kept narrow on purpose — anything
/// we want to expose on the CLI lives on `RunOptions` instead.
#[derive(Debug, Clone)]
pub struct WatchOptions {
    /// Coalesce a burst of FS events into a single rerun. The JS
    /// reference uses 250ms; matching that lets editors that touch
    /// multiple files in quick succession (gofmt-style "save all")
    /// produce one rerun instead of N.
    pub debounce: Duration,
    /// When `true`, `clear` the terminal between runs. Set to `false`
    /// by `--preserve-watch-output`.
    pub clear_between_runs: bool,
}

impl Default for WatchOptions {
    fn default() -> Self {
        Self {
            debounce: Duration::from_millis(250),
            clear_between_runs: true,
        }
    }
}

/// Poll the watcher until cancelled, calling `on_run` on every coalesced
/// batch of relevant events. The first call happens immediately so the
/// caller sees diagnostics for the initial state.
///
/// `on_run` returns the result of one `run` invocation; the watch loop
/// itself doesn't print anything — all rendering is the caller's job.
/// On platforms where `notify` initialisation fails (e.g. inside a
/// container with no inotify), this returns the error so the caller can
/// fall back to a single non-watch run.
pub fn run_watch(
    options: RunOptions,
    watch: WatchOptions,
    mut on_run: impl FnMut(&RunResult),
) -> notify::Result<()> {
    let workspace = options.workspace.clone();
    let (tx, rx) = channel::<notify::Result<notify::Event>>();
    let mut watcher: RecommendedWatcher = recommended_watcher(move |res| {
        let _ = tx.send(res);
    })?;
    watcher.watch(&workspace, RecursiveMode::Recursive)?;

    // Initial run.
    let initial = run(&options);
    on_run(&initial);

    loop {
        if !wait_for_change(&rx, &watch.debounce, &workspace) {
            // Channel disconnected — the watcher was dropped.
            return Ok(());
        }
        if watch.clear_between_runs {
            // ANSI clear-screen + cursor-home. Matches the JS
            // reference's behaviour and is a no-op when stdout isn't a
            // terminal (the bytes are still emitted but most CI logs
            // ignore them).
            print!("\x1b[2J\x1b[H");
        }
        let result = run(&options);
        on_run(&result);
    }
}

/// Block until at least one relevant change has arrived, then drain
/// any further events that land within the debounce window so a flurry
/// of saves coalesces into a single rerun. Returns `false` only when
/// the channel has been closed by the watcher being dropped.
fn wait_for_change(
    rx: &Receiver<notify::Result<notify::Event>>,
    debounce: &Duration,
    workspace: &Path,
) -> bool {
    // Wait for the first interesting event indefinitely. `recv` returns
    // Err only after the sender has been dropped.
    loop {
        let event = match rx.recv() {
            Ok(Ok(e)) => e,
            Ok(Err(_)) => continue,
            Err(_) => return false,
        };
        if event_is_relevant(&event, workspace) {
            break;
        }
    }
    // Drain anything that arrives during the debounce window.
    let deadline = Instant::now() + *debounce;
    while let Some(remaining) = deadline.checked_duration_since(Instant::now()) {
        match rx.recv_timeout(remaining) {
            Ok(_) => continue, // ignore details; we're already going to rerun
            Err(_) => break,
        }
    }
    true
}

fn event_is_relevant(event: &notify::Event, workspace: &Path) -> bool {
    if !matches!(
        event.kind,
        EventKind::Create(_) | EventKind::Modify(_) | EventKind::Remove(_)
    ) {
        return false;
    }
    event.paths.iter().any(|p| path_is_relevant(p, workspace))
}

fn path_is_relevant(path: &Path, workspace: &Path) -> bool {
    // Skip events on the cache dir itself — the runner writes to
    // `<workspace>/.svelte-check/` on every run, and re-reacting would
    // produce an infinite loop.
    let cache_dir = workspace.join(".svelte-check");
    if path.starts_with(&cache_dir) {
        return false;
    }
    if path
        .components()
        .any(|c| c.as_os_str() == "node_modules" || c.as_os_str() == ".git")
    {
        return false;
    }
    let ext = path.extension().and_then(|s| s.to_str()).unwrap_or("");
    let basename = path
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or_default();
    matches!(ext, "svelte" | "ts" | "js" | "tsx" | "jsx" | "mts" | "cts")
        || basename == "tsconfig.json"
        || basename == "svelte.config.js"
        || basename == "svelte.config.ts"
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn relevant_path_filter_recognises_svelte_and_config_files() {
        let ws = PathBuf::from("/tmp/ws");
        assert!(path_is_relevant(&ws.join("src/App.svelte"), &ws));
        assert!(path_is_relevant(&ws.join("src/lib.ts"), &ws));
        assert!(path_is_relevant(&ws.join("tsconfig.json"), &ws));
        assert!(path_is_relevant(&ws.join("svelte.config.js"), &ws));

        // node_modules / .git / cache dir are filtered out.
        assert!(!path_is_relevant(&ws.join("node_modules/foo/bar.ts"), &ws));
        assert!(!path_is_relevant(&ws.join(".git/HEAD"), &ws));
        assert!(!path_is_relevant(
            &ws.join(".svelte-check/svelte/Foo.svelte.tsx"),
            &ws
        ));

        // Random non-source extensions ignored.
        assert!(!path_is_relevant(&ws.join("README.md"), &ws));
        assert!(!path_is_relevant(&ws.join("a.png"), &ws));
    }
}
