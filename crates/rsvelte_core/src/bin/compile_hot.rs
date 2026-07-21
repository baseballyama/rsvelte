//! Long-running full-`compile()` loop over the Svelte test corpus, for use with
//! a sampling profiler (`samply record -- target/profiling/compile_hot`). Unlike
//! `compile_profile` (which runs each file once for a phase-timing breakdown),
//! this repeats the whole corpus enough times to give a sampler a dense
//! flamegraph of where single-component compile time actually goes.

#[cfg(all(
    feature = "mimalloc-alloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

#[cfg(all(
    feature = "jemalloc",
    not(feature = "mimalloc-alloc"),
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;

use std::fs;
use std::path::PathBuf;

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn collect_files() -> Vec<String> {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let test_dir = base.join("submodules/svelte/packages/svelte/tests");
    let categories = [
        "runtime-runes/samples",
        "runtime-legacy/samples",
        "snapshot/samples",
        "css/samples",
        "server-side-rendering/samples",
    ];
    let mut files = Vec::new();
    for cat in &categories {
        let dir = test_dir.join(cat);
        if dir.exists() {
            collect(&dir, &mut files);
        }
    }
    files
}

fn collect(dir: &std::path::Path, files: &mut Vec<String>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                collect(&path, files);
            } else if path.extension().is_some_and(|e| e == "svelte")
                && let Ok(content) = fs::read_to_string(&path)
            {
                files.push(content);
            }
        }
    }
}

fn main() {
    let files = collect_files();
    let iters: usize = std::env::args()
        .nth(1)
        .and_then(|s| s.parse().ok())
        .unwrap_or(40);
    eprintln!("compile_hot: {} files x {} iters", files.len(), iters);

    let mut sink = 0usize;
    for _ in 0..iters {
        for content in &files {
            if let Ok(r) = compile(
                content,
                CompileOptions {
                    generate: GenerateMode::Client,
                    ..Default::default()
                },
            ) {
                sink = sink.wrapping_add(r.js.code.len());
            }
        }
    }
    // Prevent the optimizer from eliding the work.
    eprintln!("done (sink={sink})");
}
