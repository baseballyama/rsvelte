//! Attributes the allocate / copy / hash bucket to the rsvelte code that causes
//! it, by sampling one in every `--every` allocator events and recording an
//! unsymbolized stack together with the requested size and, for `realloc`, the
//! number of bytes the runtime has to copy.
//!
//! Unlike `alloc_callers` this records **three** measured quantities per site
//! (events, requested bytes, copied bytes) plus a modelled time built from a
//! calibration of the shipping allocator, because ranking allocation work by
//! event count alone silently ignores `memcpy`, which is a separate 9.4% of
//! non-kernel CPU and is driven by bytes, not by events.
//!
//! The sample unit is an allocator event, not a timer tick, so the result is
//! deterministic and does not move when other work runs on the machine.

#[cfg(all(
    feature = "mimalloc-alloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
type Backing = mimalloc::MiMalloc;
#[cfg(all(
    feature = "mimalloc-alloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
const BACKING: Backing = mimalloc::MiMalloc;

#[cfg(not(all(
    feature = "mimalloc-alloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
)))]
type Backing = std::alloc::System;
#[cfg(not(all(
    feature = "mimalloc-alloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
)))]
const BACKING: Backing = std::alloc::System;

use std::alloc::{GlobalAlloc, Layout};
use std::cell::Cell;
use std::fmt::Write as _;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const MAX_FRAMES: usize = 40;

static EVENTS: AtomicU64 = AtomicU64::new(0);
static BYTES: AtomicU64 = AtomicU64::new(0);
static COPIED: AtomicU64 = AtomicU64::new(0);
static SAMPLING: AtomicBool = AtomicBool::new(false);
static EVERY: AtomicU64 = AtomicU64::new(256);

struct Sample {
    frames: [usize; MAX_FRAMES],
    depth: u8,
    size: usize,
    copied: usize,
}

static STACKS: Mutex<Vec<Sample>> = Mutex::new(Vec::new());

thread_local! {
    /// Recording a stack allocates; without this the recorder would sample itself.
    static IN_RECORDER: Cell<bool> = const { Cell::new(false) };
}

struct Sampling;

impl Sampling {
    #[inline]
    fn record(size: usize, copied: usize) {
        if !SAMPLING.load(Ordering::Relaxed) {
            return;
        }
        // The recorder's own buffer growth is a `realloc` of tens of megabytes;
        // counting it would put the instrument itself at the top of the copied
        // -bytes column. Checked before the counters, not just before the stack
        // walk, so the totals exclude it too.
        if IN_RECORDER.with(Cell::get) {
            return;
        }
        let n = EVENTS.fetch_add(1, Ordering::Relaxed);
        BYTES.fetch_add(size as u64, Ordering::Relaxed);
        COPIED.fetch_add(copied as u64, Ordering::Relaxed);
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
                stacks.push(Sample {
                    frames,
                    depth,
                    size,
                    copied,
                });
            }
            flag.set(false);
        });
    }
}

// SAFETY: every method forwards to `BACKING` with the layout it was given,
// adding only sampling bookkeeping, so the allocator contract is exactly the
// backing allocator's.
unsafe impl GlobalAlloc for Sampling {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        Self::record(layout.size(), 0);
        // SAFETY: `layout` is the caller's, passed through unchanged.
        unsafe { BACKING.alloc(layout) }
    }

    unsafe fn alloc_zeroed(&self, layout: Layout) -> *mut u8 {
        // Zeroing writes the whole block, so it is memset traffic of `size`.
        Self::record(layout.size(), layout.size());
        // SAFETY: `layout` is the caller's, passed through unchanged.
        unsafe { BACKING.alloc_zeroed(layout) }
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        // SAFETY: `ptr` came from the backing allocator with this same layout.
        unsafe { BACKING.dealloc(ptr, layout) }
    }

    unsafe fn realloc(&self, ptr: *mut u8, layout: Layout, new_size: usize) -> *mut u8 {
        // A grow copies the whole old block, which is the memcpy this bucket is
        // asking about; the requested-bytes column takes only the increment so
        // it stays comparable with `alloc`.
        Self::record(new_size.saturating_sub(layout.size()), layout.size());
        // SAFETY: `ptr` came from the backing allocator with `layout`, and
        // `new_size` is the caller's.
        unsafe { BACKING.realloc(ptr, layout, new_size) }
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

fn is_rsvelte_source(path: &Path) -> bool {
    path.to_str()
        .is_some_and(|s| s.contains("/crates/rsvelte") && !s.contains("/crates/rsvelte_devtools"))
}

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
    if let Some(pos) = out.rfind("::h")
        && out[pos + 3..].len() == 16
    {
        out.truncate(pos);
    }
    out
}

/// Names the kind of object being allocated, from the innermost frame that says
/// so. Checked innermost-out because a `Vec` grow underneath `IndexMap` is the
/// map's cost, not a caller's own vector.
fn categorize(names: &[String]) -> &'static str {
    for name in names {
        if name.contains("serde_json") || name.contains("JsNode as serde::ser::Serialize") {
            return "serde_json";
        }
        if name.contains("indexmap") || name.contains("hashbrown") || name.contains("SipHash") {
            return "hash/map";
        }
        if name.contains("compact_str") {
            return "compact_str";
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
        if name.contains("alloc::boxed") || name.contains("Box") {
            return "box";
        }
    }
    "unclassified"
}

/// Per-event cost of the shipping allocator, measured here rather than assumed,
/// because the whole point of the table is to rank by time and a size-blind
/// model would just reproduce the event-count ranking.
struct Calibration {
    /// `alloc` + matching `dealloc`, nanoseconds, indexed by `size_class`.
    per_event_ns: [f64; N_CLASSES],
    /// Nanoseconds per byte copied by `realloc`/`alloc_zeroed`.
    per_copied_byte_ns: f64,
}

const N_CLASSES: usize = 6;
const CLASS_SIZES: [usize; N_CLASSES] = [16, 64, 256, 1024, 8192, 65536];

fn size_class(size: usize) -> usize {
    match size {
        0..=32 => 0,
        33..=128 => 1,
        129..=512 => 2,
        513..=2048 => 3,
        2049..=16384 => 4,
        _ => 5,
    }
}

fn calibrate() -> Calibration {
    // Allocate a batch, then free it: the shipped compiler holds thousands of
    // live nodes at once, so an alloc/free ping-pong (which always hits the
    // same free-list slot) would understate the cost.
    const BATCH: usize = 4096;
    const ROUNDS: usize = 40;
    let mut per_event_ns = [0.0f64; N_CLASSES];
    for (i, &size) in CLASS_SIZES.iter().enumerate() {
        let layout = Layout::from_size_align(size, 8).unwrap();
        let mut best = f64::MAX;
        for _ in 0..ROUNDS {
            let mut ptrs: Vec<*mut u8> = Vec::with_capacity(BATCH);
            let t = std::time::Instant::now();
            for _ in 0..BATCH {
                // SAFETY: non-zero layout; every pointer is freed below.
                ptrs.push(unsafe { std::alloc::alloc(layout) });
            }
            for &p in &ptrs {
                // SAFETY: `p` came from `alloc` with `layout`.
                unsafe { std::alloc::dealloc(p, layout) }
            }
            let ns = t.elapsed().as_nanos() as f64 / BATCH as f64;
            if ns < best {
                best = ns;
            }
        }
        per_event_ns[i] = best;
    }

    // memcpy rate. Measured on a buffer larger than L2 so the constant is not a
    // cache-resident fiction; a 64 KiB buffer measured 0.0009 ns/byte (1.1 TB/s),
    // which is above this machine's L1 bandwidth and would zero out the copy
    // term entirely.
    let src = vec![7u8; 8 << 20];
    let mut dst = vec![0u8; 8 << 20];
    let mut best = f64::MAX;
    for _ in 0..20 {
        let t = std::time::Instant::now();
        dst.copy_from_slice(&src);
        let ns = t.elapsed().as_nanos() as f64 / src.len() as f64;
        if ns < best {
            best = ns;
        }
    }
    std::hint::black_box(&dst);

    Calibration {
        per_event_ns,
        per_copied_byte_ns: best,
    }
}

#[derive(Default, Clone)]
struct Row {
    samples: u64,
    bytes: u64,
    copied: u64,
    ns: f64,
    /// Kept per size class so a different cost model can be applied offline
    /// without another 40-minute rebuild. The printed `ns` is one model among
    /// many; these counts are the measurement.
    classes: [u64; N_CLASSES],
}

impl Row {
    fn add(&mut self, s: &Sample, cal: &Calibration) {
        self.samples += 1;
        self.bytes += s.size as u64;
        self.copied += s.copied as u64;
        self.classes[size_class(s.size)] += 1;
        self.ns += cal.per_event_ns[size_class(s.size)] + s.copied as f64 * cal.per_copied_byte_ns;
    }
}

fn main() {
    let mut mode = GenerateMode::Client;
    let mut dev = false;
    let mut top = 30usize;
    let mut label = String::from("corpus");
    let mut min_bytes = 0usize;
    let mut max_bytes = usize::MAX;
    let mut json_out: Option<String> = None;
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
            "--dev" => dev = true,
            "--dir" => {
                i += 1;
                root = PathBuf::from(&args[i]);
            }
            "--label" => {
                i += 1;
                label = args[i].clone();
            }
            "--every" => {
                i += 1;
                EVERY.store(args[i].parse().expect("--every"), Ordering::Relaxed);
            }
            "--top" => {
                i += 1;
                top = args[i].parse().expect("--top");
            }
            // The gap being chased is a slope, so a ranking that only holds at
            // one input size is not a ranking; these two run the same table over
            // a size band so the ordering's stability is observable.
            "--min-bytes" => {
                i += 1;
                min_bytes = args[i].parse().expect("--min-bytes");
            }
            "--max-bytes" => {
                i += 1;
                max_bytes = args[i].parse().expect("--max-bytes");
            }
            "--json" => {
                i += 1;
                json_out = Some(args[i].clone());
            }
            other => panic!("unknown argument: {other}"),
        }
        i += 1;
    }

    let cal = calibrate();

    let mut files = Vec::new();
    collect(&root, &mut files);
    files.retain(|(_, c)| c.len() >= min_bytes && c.len() <= max_bytes);
    assert!(
        !files.is_empty(),
        "no .svelte files under {} in [{min_bytes}, {max_bytes}] bytes",
        root.display()
    );
    let mean_bytes = files.iter().map(|(_, c)| c.len()).sum::<usize>() as f64 / files.len() as f64;

    let opts = CompileOptions {
        generate: mode,
        dev,
        ..Default::default()
    };

    // One untimed pass so lazily-built statics are not charged to the sample set.
    let _ = compile(&files[0].1, opts.clone());

    SAMPLING.store(true, Ordering::Relaxed);
    for (_, content) in &files {
        let _ = compile(content, opts.clone());
    }
    SAMPLING.store(false, Ordering::Relaxed);

    let stacks = std::mem::take(&mut *STACKS.lock().unwrap());
    let events = EVENTS.load(Ordering::Relaxed);
    let bytes = BYTES.load(Ordering::Relaxed);
    let copied = COPIED.load(Ordering::Relaxed);
    let every = EVERY.load(Ordering::Relaxed) as f64;
    let n_files = files.len() as f64;

    // Resolve every sample once, off the hot path.
    let mut resolved: Vec<(Vec<String>, &Sample)> = Vec::with_capacity(stacks.len());
    for s in &stacks {
        let mut names: Vec<String> = Vec::new();
        for ip in &s.frames[..s.depth as usize] {
            // SAFETY: `ip` came from this process's own stack walk.
            unsafe {
                backtrace::resolve_unsynchronized(*ip as *mut _, |symbol| {
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
        resolved.push((names, s));
    }

    let mut by_site: std::collections::HashMap<String, Row> = std::collections::HashMap::new();
    let mut by_category: std::collections::HashMap<&'static str, Row> =
        std::collections::HashMap::new();
    let mut by_cat_site: std::collections::HashMap<(&'static str, String), Row> =
        std::collections::HashMap::new();
    let mut by_inclusive: std::collections::HashMap<String, Row> = std::collections::HashMap::new();

    for (names, s) in &resolved {
        let category = categorize(names);
        by_category.entry(category).or_default().add(s, &cal);
        let innermost = names
            .iter()
            .find(|n| n.starts_with("rsvelte"))
            .cloned()
            .unwrap_or_else(|| String::from("<no rsvelte frame>"));
        by_site.entry(innermost.clone()).or_default().add(s, &cal);
        by_cat_site
            .entry((category, innermost))
            .or_default()
            .add(s, &cal);
        let mut seen = std::collections::HashSet::new();
        for name in names.iter().filter(|n| n.starts_with("rsvelte")) {
            if seen.insert(name.clone()) {
                by_inclusive.entry(name.clone()).or_default().add(s, &cal);
            }
        }
    }

    let total_ns: f64 = by_site.values().map(|r| r.ns).sum();
    let scale = every / n_files;

    println!("== {label} ==");
    println!(
        "files {} (mean {:.0} B, band [{min_bytes}, {}]), mode {:?}{}, every 1/{}",
        files.len(),
        mean_bytes,
        if max_bytes == usize::MAX {
            String::from("inf")
        } else {
            max_bytes.to_string()
        },
        mode,
        if dev { " dev" } else { "" },
        every as u64
    );
    println!(
        "allocator events {events} ({:.0}/file), requested {:.1} MiB ({:.1} KiB/file), copied {:.1} MiB ({:.1} KiB/file)",
        events as f64 / n_files,
        bytes as f64 / (1 << 20) as f64,
        bytes as f64 / n_files / 1024.0,
        copied as f64 / (1 << 20) as f64,
        copied as f64 / n_files / 1024.0
    );
    println!("stacks captured {}", stacks.len());
    print!("calibration ns/event:");
    for (i, &size) in CLASS_SIZES.iter().enumerate() {
        print!(" {size}B={:.1}", cal.per_event_ns[i]);
    }
    println!(" | memcpy {:.4} ns/byte", cal.per_copied_byte_ns);
    println!(
        "modelled allocator time {:.1} ms total, {:.1} us/file",
        total_ns * every / 1e6,
        total_ns * scale / 1000.0
    );
    println!();

    let dump = |title: &str, rows: &mut Vec<(String, Row)>, n: usize| {
        rows.sort_by(|a, b| b.1.ns.partial_cmp(&a.1.ns).unwrap());
        println!("== {title} ==");
        println!(
            "{:>7} {:>10} {:>9} {:>11} {:>11}  site",
            "%time", "us/file", "ev/file", "B/file", "copiedB/file"
        );
        for (name, r) in rows.iter().take(n) {
            println!(
                "{:>6.2}% {:>10.2} {:>9.1} {:>11.0} {:>11.0}  {name}",
                r.ns / total_ns * 100.0,
                r.ns * scale / 1000.0,
                r.samples as f64 * scale,
                r.bytes as f64 * scale,
                r.copied as f64 * scale,
            );
        }
        println!();
    };

    let mut cats: Vec<(String, Row)> = by_category
        .into_iter()
        .map(|(k, v)| (k.to_string(), v))
        .collect();
    dump("what is being allocated", &mut cats, 20);

    let mut sites: Vec<(String, Row)> = by_site.into_iter().collect();
    dump(
        "innermost rsvelte site (exclusive), ranked by modelled time",
        &mut sites,
        top,
    );

    let mut incl: Vec<(String, Row)> = by_inclusive.into_iter().collect();
    dump(
        "anywhere on the stack (inclusive), ranked by modelled time",
        &mut incl,
        top,
    );

    if let Some(path) = &json_out {
        let mut out = String::new();
        write!(
            out,
            "{{\"label\":{label:?},\"files\":{},\"mean_bytes\":{mean_bytes:.0},\"every\":{},\"events\":{events},\"bytes\":{bytes},\"copied\":{copied},\"class_sizes\":{CLASS_SIZES:?},\"cal_ns\":{:?},\"cal_memcpy_ns_per_byte\":{},\"sites\":[",
            files.len(),
            every as u64,
            cal.per_event_ns,
            cal.per_copied_byte_ns,
        )
        .expect("write to String");
        for (i, (name, r)) in sites.iter().enumerate() {
            if i > 0 {
                out.push(',');
            }
            write!(
                out,
                "{{\"site\":{name:?},\"samples\":{},\"bytes\":{},\"copied\":{},\"classes\":{:?}}}",
                r.samples, r.bytes, r.copied, r.classes
            )
            .expect("write to String");
        }
        out.push_str("]}\n");
        fs::write(path, out).expect("write --json");
    }

    for cat in ["hash/map", "serde_json", "string", "vec", "compact_str"] {
        let mut rows: Vec<(String, Row)> = by_cat_site
            .iter()
            .filter(|((c, _), _)| *c == cat)
            .map(|((_, site), r)| (site.clone(), r.clone()))
            .collect();
        if rows.is_empty() {
            continue;
        }
        dump(&format!("{cat}: innermost rsvelte site"), &mut rows, 15);
    }
}
