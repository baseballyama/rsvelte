//! Counts every heap allocation a client compile of the flowbite-svelte corpus
//! makes, so a per-site allocation figure can be read as a share of the whole
//! rather than as a bare number.
//!
//! Deliberately uses the system allocator: the count is what is being measured,
//! and it does not depend on which allocator services the request.

use std::alloc::{GlobalAlloc, Layout, System};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};

use rsvelte_core::{CompileOptions, GenerateMode, compile};

static ALLOCS: AtomicU64 = AtomicU64::new(0);
static BYTES: AtomicU64 = AtomicU64::new(0);
static SMALL: AtomicU64 = AtomicU64::new(0);

struct Counting;

// SAFETY: every method forwards to `System` with the layout it was given,
// adding only relaxed counter arithmetic, so the allocator contract is exactly
// `System`'s.
unsafe impl GlobalAlloc for Counting {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        ALLOCS.fetch_add(1, Ordering::Relaxed);
        BYTES.fetch_add(layout.size() as u64, Ordering::Relaxed);
        if layout.size() <= 64 {
            SMALL.fetch_add(1, Ordering::Relaxed);
        }
        // SAFETY: `layout` is the caller's, passed through unchanged.
        unsafe { System.alloc(layout) }
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        // SAFETY: `ptr` came from `System.alloc` with this same `layout`.
        unsafe { System.dealloc(ptr, layout) }
    }

    unsafe fn realloc(&self, ptr: *mut u8, layout: Layout, new_size: usize) -> *mut u8 {
        ALLOCS.fetch_add(1, Ordering::Relaxed);
        BYTES.fetch_add(
            new_size.saturating_sub(layout.size()) as u64,
            Ordering::Relaxed,
        );
        // SAFETY: `ptr` came from `System` with this `layout`, and `new_size` is
        // the caller's.
        unsafe { System.realloc(ptr, layout, new_size) }
    }
}

#[global_allocator]
static ALLOC: Counting = Counting;

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

fn main() {
    let mut mode = GenerateMode::Client;
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

    // One untimed pass so lazily-built statics are not charged to the count.
    let _ = compile(
        &files[0].1,
        CompileOptions {
            generate: mode,
            ..Default::default()
        },
    );

    ALLOCS.store(0, Ordering::Relaxed);
    BYTES.store(0, Ordering::Relaxed);
    SMALL.store(0, Ordering::Relaxed);
    for (_, content) in &files {
        let _ = compile(
            content,
            CompileOptions {
                generate: mode,
                ..Default::default()
            },
        );
    }
    let allocs = ALLOCS.load(Ordering::Relaxed);
    let bytes = BYTES.load(Ordering::Relaxed);
    let small = SMALL.load(Ordering::Relaxed);

    let n = files.len() as f64;
    println!("files:      {}", files.len());
    println!("allocations: {allocs} total, {:.0}/file", allocs as f64 / n);
    println!(
        "  <= 64B:    {small} total, {:.0}/file  ({:.1}% of allocations)",
        small as f64 / n,
        small as f64 / allocs as f64 * 100.0
    );
    println!("bytes:       {bytes} total, {:.0}/file", bytes as f64 / n);
}
