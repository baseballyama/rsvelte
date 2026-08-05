//! Weighs the `hoisted` pre-allocation in `clean_node_list` against a lazily
//! growing `Vec`.
//!
//! Load-independent: the recorder captures the final `hoisted` length of every
//! `clean_node_list` call, and the growth curves are measured on the real
//! element type, so both allocation counts are derived rather than timed.
//! `--parse-only` is the negative control: it runs the same binary over the same
//! corpus without reaching the transform phase. Requires the instrumentation
//! feature:
//!
//! ```text
//! cargo run --profile profiling -p rsvelte_devtools --bin hoisted_alloc_count \
//!   --features measure-hoisted
//! ```

use std::fs;
use std::path::{Path, PathBuf};

use rsvelte_core::{CompileOptions, GenerateMode, compile};

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

#[cfg(not(feature = "measure-hoisted"))]
fn main() {
    eprintln!("build with --features measure-hoisted");
    std::process::exit(2);
}

#[cfg(feature = "measure-hoisted")]
fn main() {
    use rsvelte_core::measure_hoisted;

    let mut mode = GenerateMode::Client;
    let mut parse_only = false;
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
            "--parse-only" => parse_only = true,
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

    measure_hoisted::reset();
    for (_, content) in &files {
        if parse_only {
            let allocator = oxc_allocator::Allocator::default();
            let _ = rsvelte_core::parse(content, &allocator, rsvelte_core::ParseOptions::default());
        } else {
            let _ = compile(
                content,
                CompileOptions {
                    generate: mode,
                    ..Default::default()
                },
            );
        }
    }
    let (calls, empty_input, hist, over) = measure_hoisted::snapshot();

    // Measured growth: the lengths at which a push (re)allocates.
    let longest = over.iter().copied().max().unwrap_or(hist.len());
    let lazy_steps = measure_hoisted::growth_steps(0, longest + 1);
    let capped_steps = measure_hoisted::growth_steps(8, longest + 1);
    let allocs_lazy = |len: usize| lazy_steps.iter().filter(|&&s| s <= len).count() as u64;
    // The old code sized the vec at `min(input, 8)`; `hoisted.len() <= input`, so
    // it reallocated only past 8.
    let allocs_capped = |len: usize| 1 + capped_steps.iter().filter(|&&s| s <= len).count() as u64;

    let mut old_allocs = 0u64;
    let mut new_allocs = 0u64;
    let mut hoisted_empty = 0u64;
    let mut hoisted_over8 = 0u64;
    for (len, n) in hist.iter().enumerate() {
        if *n == 0 {
            continue;
        }
        if len == 0 {
            hoisted_empty += n;
        }
        if len > 8 {
            hoisted_over8 += n;
        }
        // An empty input allocated nothing even in the old code.
        let old_per_call = if len == 0 { 1 } else { allocs_capped(len) };
        old_allocs += n * old_per_call;
        new_allocs += n * allocs_lazy(len);
    }
    for len in &over {
        hoisted_over8 += 1;
        old_allocs += allocs_capped(*len);
        new_allocs += allocs_lazy(*len);
    }
    // Calls with no input nodes at all allocated nothing on either side.
    old_allocs -= empty_input;

    println!("files: {}", files.len());
    println!("clean_node_list calls: {calls}");
    println!("  empty input (allocated nothing either way): {empty_input}");
    println!(
        "  hoisted empty: {hoisted_empty} ({:.2}%)",
        hoisted_empty as f64 * 100.0 / calls as f64
    );
    println!("  hoisted len > 8: {hoisted_over8}");
    println!("element size: {} bytes", measure_hoisted::element_size());
    println!("measured growth from cap 0: {lazy_steps:?}");
    println!("measured growth from cap 8: {capped_steps:?}");
    println!("hoisted length histogram (len: calls):");
    for (len, n) in hist.iter().enumerate() {
        if *n > 0 {
            println!("  {len:>3}: {n}");
        }
    }
    if !over.is_empty() {
        println!("  >32: {over:?}");
    }
    println!("hoisted allocations, old `with_capacity(min(n,8))`: {old_allocs}");
    println!("hoisted allocations, lazy `Vec::new()`:             {new_allocs}");
    println!(
        "delta (negative = lazy wins): {}",
        new_allocs as i64 - old_allocs as i64
    );
}
