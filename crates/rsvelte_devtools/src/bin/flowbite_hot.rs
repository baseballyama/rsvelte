//! Serial `compile()` loop over the flowbite-svelte corpus, for use with a
//! sampling profiler (`samply record -- target/profiling/flowbite_hot`).
//!
//! Distinct from `compile_hot` (Svelte's own test corpus, which is a submodule
//! that is often not checked out) and from `profiler` (per-phase timings): this
//! drives the production `compile()` entry point on real shipped components so
//! the sampler sees the same call graph a consumer would.
//!
//! ```text
//! cargo build --profile profiling -p rsvelte_devtools --bin flowbite_hot
//! samply record ./target/profiling/flowbite_hot --iterations 20
//! ```

// Allocator policy stays at the executable boundary so the compiler libraries
// never impose one on embedders. mimalloc matches what the shipped addon uses.
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

use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Instant;

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn collect(dir: &Path, files: &mut Vec<(PathBuf, String)>) {
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    let mut paths: Vec<PathBuf> = entries.flatten().map(|e| e.path()).collect();
    // Sort so the traversal order is identical between runs and between machines.
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
    let mut iterations = 20usize;
    let mut mode = GenerateMode::Client;
    let mut root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("submodules/flowbite-svelte");

    let args: Vec<String> = env::args().skip(1).collect();
    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--iterations" => {
                i += 1;
                iterations = args[i].parse().expect("--iterations expects a number");
            }
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
    let bytes: usize = files.iter().map(|(_, c)| c.len()).sum();
    eprintln!(
        "Loaded {} files, {} bytes from {}",
        files.len(),
        bytes,
        root.display()
    );

    let opts = || CompileOptions {
        generate: mode,
        ..Default::default()
    };

    // One untimed pass so the sampler never sees first-touch page faults.
    let mut errors = 0usize;
    for (_, content) in &files {
        if compile(content, opts()).is_err() {
            errors += 1;
        }
    }
    eprintln!("Warmup done ({errors} files failed to compile)");

    let start = Instant::now();
    for _ in 0..iterations {
        for (_, content) in &files {
            let _ = compile(content, opts());
        }
    }
    let elapsed = start.elapsed();
    let per_file = elapsed.as_secs_f64() / (iterations * files.len()) as f64;
    eprintln!(
        "{iterations} iterations in {:.3}s = {:.1}us/file ({:.3}us per 1% of profile)",
        elapsed.as_secs_f64(),
        per_file * 1e6,
        per_file * 1e4
    );
}
