use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};

use rayon::prelude::*;
use rsvelte_formatter::{ClassSorter, FormatOptions, format};

use crate::oxfmt::oxfmt_node;
use crate::tailwind_sidecar;

/// A resolved custom-Tailwind `sortTailwindcss` awaiting its one sidecar call.
/// Held until every class string across the run is collected, so the Node
/// sidecar runs exactly once for the whole batch.
pub struct PendingJsSort {
    pub(crate) env: tailwind_sidecar::SidecarEnv,
    pub(crate) filepath: PathBuf,
    pub(crate) stylesheet_path: Option<PathBuf>,
    pub(crate) config_path: Option<PathBuf>,
    pub(crate) preserve_whitespace: bool,
    pub(crate) preserve_duplicates: bool,
}

impl PendingJsSort {
    /// Sort `classes` (deduped) via the sidecar into an `orig -> sorted` map.
    /// `None` on any sidecar failure, so the caller leaves classes untouched.
    fn resolve(&self, classes: Vec<String>) -> Option<HashMap<String, String>> {
        let req = tailwind_sidecar::SortRequest {
            filepath: &self.filepath,
            stylesheet_path: self.stylesheet_path.as_deref(),
            config_path: self.config_path.as_deref(),
            preserve_whitespace: self.preserve_whitespace,
            preserve_duplicates: self.preserve_duplicates,
            classes: classes.clone(),
        };
        let sorted = tailwind_sidecar::sort(&self.env, &req)?;
        Some(classes.into_iter().zip(sorted).collect())
    }
}

/// A class sorter that records every value it sees (returning it unchanged), for
/// the collection pass that gathers all class strings before the sidecar call.
fn collecting_sorter(sink: Arc<Mutex<HashSet<String>>>) -> ClassSorter {
    Arc::new(move |s: &str| {
        sink.lock()
            .expect("class sink poisoned")
            .insert(s.to_string());
        s.to_string()
    })
}

/// A class sorter backed by a resolved `orig -> sorted` map; an unseen value
/// (e.g. a sidecar miss) is returned unchanged.
fn map_sorter(map: Arc<HashMap<String, String>>) -> ClassSorter {
    Arc::new(move |s: &str| map.get(s).cloned().unwrap_or_else(|| s.to_string()))
}

/// Format `source` with a collecting class sorter, returning the set of static
/// class-attribute values it contains. Style formatting is skipped — only the
/// class strings matter here.
pub fn collect_source_classes(source: &str, options: &FormatOptions) -> HashSet<String> {
    let sink: Arc<Mutex<HashSet<String>>> = Arc::default();
    let mut opts = options.clone();
    opts.class_sorter = Some(collecting_sorter(sink.clone()));
    opts.style_formatter = None;
    let _ = format(source, &opts);
    std::mem::take(&mut *sink.lock().expect("class sink poisoned"))
}

/// Collect every static class-attribute value across `files` in parallel, for
/// the single batched sidecar sort.
pub fn collect_svelte_classes(files: &[PathBuf], options: &FormatOptions) -> HashSet<String> {
    let sink: Arc<Mutex<HashSet<String>>> = Arc::default();
    let mut opts = options.clone();
    opts.class_sorter = Some(collecting_sorter(sink.clone()));
    opts.style_formatter = None;
    files.par_iter().for_each(|path| {
        if let Ok(source) = std::fs::read_to_string(path) {
            let _ = format(&source, &opts);
        }
    });
    std::mem::take(&mut *sink.lock().expect("class sink poisoned"))
}

/// Resolve the JS class sorter for a batch: collect all class strings, run the
/// sidecar once, and return a map-backed sorter. On sidecar failure, warns once
/// and returns `None` so classes are left unsorted (never wrongly reordered).
pub fn resolve_js_class_sorter(
    pending: &PendingJsSort,
    classes: HashSet<String>,
) -> Option<ClassSorter> {
    if classes.is_empty() {
        return None;
    }
    pending.resolve(classes.into_iter().collect()).map_or_else(
        || {
            eprintln!(
                "rsvelte-fmt: warning: `sortTailwindcss` left unapplied — the Node sidecar could \
             not sort classes (is prettier-plugin-tailwindcss installed?)."
            );
            None
        },
        |map| Some(map_sorter(Arc::new(map))),
    )
}

/// Locate the Tailwind sidecar Node environment, requiring both the script and a
/// runnable Node. `None` disables the JS sort path (a custom Tailwind config then
/// warns and skips). Only called when `sortTailwindcss` is configured, so the
/// Node probe never touches the default path.
pub fn js_sort_env() -> Option<tailwind_sidecar::SidecarEnv> {
    let script = tailwind_sidecar_script()?;
    let node = oxfmt_node().unwrap_or_else(|| PathBuf::from("node"));
    node_runnable(&node).then_some(tailwind_sidecar::SidecarEnv {
        node,
        script,
        timeout: tailwind_sidecar::DEFAULT_TIMEOUT,
    })
}

/// Whether `node --version` runs — so a missing Node yields a Node-specific
/// warning rather than blaming the plugin.
fn node_runnable(node: &Path) -> bool {
    Command::new(node)
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .is_ok_and(|s| s.success())
}

/// The `tailwind-sort.mjs` sidecar: `RSVELTE_FMT_TAILWIND_SIDECAR` when set
/// (tests / overrides), else `lib/tailwind-sort.mjs` beside the installed
/// `bin/rsvelte-fmt`.
fn tailwind_sidecar_script() -> Option<PathBuf> {
    if let Some(p) = std::env::var_os("RSVELTE_FMT_TAILWIND_SIDECAR") {
        let p = PathBuf::from(p);
        return p.is_file().then_some(p);
    }
    let exe = std::env::current_exe().ok()?;
    let script = exe.parent()?.parent()?.join("lib/tailwind-sort.mjs");
    script.is_file().then_some(script)
}
