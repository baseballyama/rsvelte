//! Attributes heap allocations to the rsvelte code that requests them, by
//! sampling one in every `--every` allocations and recording an unsymbolized
//! stack.
//!
//! The sample unit is an *allocation*, not a timer tick, so unlike a sampling
//! time profile the result does not move when other work is running on the
//! machine. Symbols are resolved once at the end, off the hot path.

use std::alloc::{GlobalAlloc, Layout, System};
use std::cell::Cell;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const MAX_FRAMES: usize = 32;

static ALLOCS: AtomicU64 = AtomicU64::new(0);
static SAMPLING: AtomicBool = AtomicBool::new(false);
static EVERY: AtomicU64 = AtomicU64::new(512);
static STACKS: Mutex<Vec<([usize; MAX_FRAMES], u8, usize)>> = Mutex::new(Vec::new());

thread_local! {
    /// Recording a stack allocates; without this the recorder would sample itself.
    static IN_RECORDER: Cell<bool> = const { Cell::new(false) };
}

struct Sampling;

impl Sampling {
    fn maybe_record(size: usize) {
        if !SAMPLING.load(Ordering::Relaxed) {
            return;
        }
        let n = ALLOCS.fetch_add(1, Ordering::Relaxed);
        if !n.is_multiple_of(EVERY.load(Ordering::Relaxed)) {
            return;
        }
        IN_RECORDER.with(|flag| {
            if flag.get() {
                return;
            }
            flag.set(true);
            let mut frames = [0usize; MAX_FRAMES];
            let mut depth = 0u8;
            // SAFETY: single-threaded run, and the callback neither unwinds nor
            // re-enters the tracer.
            unsafe {
                backtrace::trace_unsynchronized(|frame| {
                    if (depth as usize) < MAX_FRAMES {
                        frames[depth as usize] = frame.ip() as usize;
                        depth += 1;
                        true
                    } else {
                        false
                    }
                });
            }
            if let Ok(mut stacks) = STACKS.lock() {
                stacks.push((frames, depth, size));
            }
            flag.set(false);
        });
    }
}

// SAFETY: every method forwards to `System` with the layout it was given,
// adding only sampling bookkeeping, so the allocator contract is exactly
// `System`'s.
unsafe impl GlobalAlloc for Sampling {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        Self::maybe_record(layout.size());
        // SAFETY: `layout` is the caller's, passed through unchanged.
        unsafe { System.alloc(layout) }
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        // SAFETY: `ptr` came from `System.alloc` with this same `layout`.
        unsafe { System.dealloc(ptr, layout) }
    }

    unsafe fn realloc(&self, ptr: *mut u8, layout: Layout, new_size: usize) -> *mut u8 {
        Self::maybe_record(new_size.saturating_sub(layout.size()));
        // SAFETY: `ptr` came from `System` with this `layout`, and `new_size` is
        // the caller's.
        unsafe { System.realloc(ptr, layout, new_size) }
    }
}

#[global_allocator]
static ALLOC: Sampling = Sampling;

fn collect(dir: &Path, files: &mut Vec<(PathBuf, String)>) {
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    let mut paths: Vec<PathBuf> = entries.flatten().map(|e| e.path()).collect();
    paths.sort();
    for path in paths {
        if path.is_dir() {
            if path.file_name().is_some_and(|n| n == "node_modules") {
                continue;
            }
            collect(&path, files);
        } else if path.extension().is_some_and(|e| e == "svelte")
            && let Ok(content) = fs::read_to_string(&path)
        {
            files.push((path, content));
        }
    }
}

/// Names the kind of object being allocated, from the innermost frame that says
/// so. `serde_json` is checked before the generic string/map buckets because a
/// `Map` insert underneath it is JSON materialization, not a caller's own map.
fn categorize(names: &[String]) -> &'static str {
    for name in names {
        if name.contains("serde_json") || name.contains("JsNode as serde::ser::Serialize") {
            return "serde_json";
        }
        if name.contains("indexmap") || name.contains("hashbrown") || name.contains("SipHash") {
            return "hash/map";
        }
        if name.contains("alloc::string")
            || name.contains("to_string")
            || name.contains("to_owned")
            || name.contains("push_str")
            || name.contains("core::fmt")
        {
            return "string";
        }
        if name.contains("alloc::vec") || name.contains("RawVec") {
            return "vec";
        }
        if name.contains("compact_str") {
            return "compact_str";
        }
    }
    "other"
}

fn is_rsvelte_source(path: &Path) -> bool {
    path.to_str()
        .is_some_and(|s| s.contains("/crates/rsvelte") && !s.contains("/crates/rsvelte_devtools"))
}

/// Keeps the crate-relative part so rows stay short and stable across checkouts.
fn short_path(path: &Path) -> String {
    let s = path.to_string_lossy();
    match s.rfind("/crates/") {
        Some(pos) => s[pos + "/crates/".len()..].to_string(),
        None => s.into_owned(),
    }
}

/// Strips the monomorphization hash and generic arguments so that samples from
/// the same source function aggregate into one row.
fn clean(name: &str) -> String {
    let mut out = String::with_capacity(name.len());
    let mut depth = 0usize;
    for ch in name.chars() {
        match ch {
            '<' => depth += 1,
            '>' if depth > 0 => depth -= 1,
            _ if depth == 0 => out.push(ch),
            _ => {}
        }
    }
    // Trailing `::h0123456789abcdef` added by the symbol mangler.
    if let Some(pos) = out.rfind("::h")
        && out[pos + 3..].len() == 16
    {
        out.truncate(pos);
    }
    out
}

fn main() {
    let mut mode = GenerateMode::Client;
    let mut top = 40usize;
    let mut root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("submodules/flowbite-svelte");
    let args: Vec<String> = std::env::args().skip(1).collect();
    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--mode" => {
                i += 1;
                mode = match args[i].as_str() {
                    "server" => GenerateMode::Server,
                    _ => GenerateMode::Client,
                };
            }
            "--dir" => {
                i += 1;
                root = PathBuf::from(&args[i]);
            }
            "--every" => {
                i += 1;
                EVERY.store(args[i].parse().expect("--every"), Ordering::Relaxed);
            }
            "--top" => {
                i += 1;
                top = args[i].parse().expect("--top");
            }
            other => panic!("unknown argument: {other}"),
        }
        i += 1;
    }

    let mut files = Vec::new();
    collect(&root, &mut files);
    assert!(
        !files.is_empty(),
        "no .svelte files under {}",
        root.display()
    );

    // One untimed pass so lazily-built statics are not charged to the sample set.
    let _ = compile(
        &files[0].1,
        CompileOptions {
            generate: mode,
            ..Default::default()
        },
    );

    SAMPLING.store(true, Ordering::Relaxed);
    for (_, content) in &files {
        let _ = compile(
            content,
            CompileOptions {
                generate: mode,
                ..Default::default()
            },
        );
    }
    SAMPLING.store(false, Ordering::Relaxed);

    let stacks = std::mem::take(&mut *STACKS.lock().unwrap());
    let sampled = ALLOCS.load(Ordering::Relaxed);
    let every = EVERY.load(Ordering::Relaxed);

    let mut by_frame: std::collections::HashMap<String, (u64, u64)> =
        std::collections::HashMap::new();
    let mut by_stack_top: std::collections::HashMap<String, u64> = std::collections::HashMap::new();
    let mut by_category: std::collections::HashMap<&'static str, u64> =
        std::collections::HashMap::new();
    let mut by_category_site: std::collections::HashMap<(&'static str, String), u64> =
        std::collections::HashMap::new();

    for (frames, depth, size) in &stacks {
        let mut names: Vec<String> = Vec::new();
        for ip in &frames[..*depth as usize] {
            // SAFETY: `ip` came from this process's own stack walk.
            unsafe {
                backtrace::resolve_unsynchronized(*ip as *mut _, |symbol| {
                    // Inlining collapses whole call trees into one symbol name, so
                    // the line table -- which still points at the original source
                    // line -- is the only per-site attribution available.
                    match (symbol.filename(), symbol.lineno()) {
                        (Some(file), Some(line)) if is_rsvelte_source(file) => {
                            names.push(format!("{}:{line}", short_path(file)));
                        }
                        _ => {
                            if let Some(name) = symbol.name() {
                                names.push(clean(&name.to_string()));
                            }
                        }
                    }
                });
            }
        }
        // A frame is credited once per stack even if it recurses, so a recursive
        // walker does not out-rank a flat one purely by depth.
        let mut seen = std::collections::HashSet::new();
        let mut first_rsvelte: Option<String> = None;
        for name in &names {
            if !name.starts_with("rsvelte") {
                continue;
            }
            if first_rsvelte.is_none() {
                first_rsvelte = Some(name.clone());
            }
            if seen.insert(name.clone()) {
                let entry = by_frame.entry(name.clone()).or_default();
                entry.0 += 1;
                entry.1 += *size as u64;
            }
        }
        let category = categorize(&names);
        *by_category.entry(category).or_default() += 1;
        if let Some(name) = first_rsvelte {
            *by_category_site
                .entry((category, name.clone()))
                .or_default() += 1;
            *by_stack_top.entry(name).or_default() += 1;
        }
    }

    let total = stacks.len().max(1) as f64;
    let n_files = files.len() as f64;

    println!(
        "files: {}, sampled allocations: {sampled} (1 in {every})",
        files.len()
    );
    println!("stacks captured: {}", stacks.len());
    println!();
    println!("== what is being allocated ==");
    let mut cats: Vec<_> = by_category.into_iter().collect();
    cats.sort_by_key(|b| std::cmp::Reverse(b.1));
    for (name, count) in &cats {
        println!(
            "{:6.2}%  {:8.1}/file  {name}",
            *count as f64 / total * 100.0,
            *count as f64 * every as f64 / n_files
        );
    }
    for (category, _) in &cats {
        let mut rows: Vec<_> = by_category_site
            .iter()
            .filter(|((c, _), _)| c == category)
            .map(|((_, site), count)| (site.clone(), *count))
            .collect();
        rows.sort_by_key(|b| std::cmp::Reverse(b.1));
        println!();
        println!("== {category}: innermost rsvelte site ==");
        for (site, count) in rows.into_iter().take(top) {
            println!(
                "{:6.2}%  {:8.1}/file  {site}",
                count as f64 / total * 100.0,
                count as f64 * every as f64 / n_files
            );
        }
    }
    println!();
    println!("== innermost rsvelte frame (self) ==");
    let mut rows: Vec<_> = by_stack_top.into_iter().collect();
    rows.sort_by_key(|b| std::cmp::Reverse(b.1));
    for (name, count) in rows.into_iter().take(top) {
        println!(
            "{:6.2}%  {:8.1}/file  {name}",
            count as f64 / total * 100.0,
            count as f64 * every as f64 / n_files
        );
    }
    println!();
    println!("== anywhere on the stack (inclusive) ==");
    let mut rows: Vec<_> = by_frame.into_iter().collect();
    rows.sort_by_key(|b| std::cmp::Reverse(b.1.0));
    for (name, (count, bytes)) in rows.into_iter().take(top) {
        println!(
            "{:6.2}%  {:8.1}/file  {:9.0} B/file  {name}",
            count as f64 / total * 100.0,
            count as f64 * every as f64 / n_files,
            bytes as f64 * every as f64 / n_files
        );
    }
}
