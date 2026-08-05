//! Decomposes `transform_prop_reads_in_expr`, which the time-share profile put
//! at 10.2% self time, into the work its per-prop re-scan actually performs.
//!
//! `scanned / expr` is the re-scan factor: the ceiling on what a single-pass
//! rewrite can remove. `--parse-only` is the negative control. Requires the
//! instrumentation feature:
//!
//! ```text
//! cargo run --profile profiling -p rsvelte_devtools --bin prop_reads_work_count \
//!   --features measure-prop-reads
//! ```

use std::fs;
use std::path::{Path, PathBuf};

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn collect(dir: &Path, files: &mut Vec<String>) {
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
            files.push(content);
        }
    }
}

const DEFAULT_CORPORA: &[&str] = &[
    "compatibility/sources",
    "submodules/flowbite-svelte",
    "submodules/bits-ui",
    "submodules/shadcn-svelte",
    "submodules/melt-ui",
    "submodules/layerchart",
    "submodules/svelte-ux",
    "submodules/skeleton",
    "submodules/svelte",
];

#[cfg(not(feature = "measure-prop-reads"))]
fn main() {
    eprintln!("build with --features measure-prop-reads");
    std::process::exit(2);
}

#[cfg(feature = "measure-prop-reads")]
fn main() {
    use rsvelte_core::measure_prop_reads;

    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let mut dirs: Vec<PathBuf> = Vec::new();
    let mut parse_only = false;
    let mut mode = GenerateMode::Client;
    let args: Vec<String> = std::env::args().skip(1).collect();
    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--dir" => {
                i += 1;
                dirs.push(PathBuf::from(&args[i]));
            }
            "--mode" => {
                i += 1;
                mode = match args[i].as_str() {
                    "server" => GenerateMode::Server,
                    _ => GenerateMode::Client,
                };
            }
            "--parse-only" => parse_only = true,
            other => panic!("unknown argument: {other}"),
        }
        i += 1;
    }
    if dirs.is_empty() {
        dirs = DEFAULT_CORPORA.iter().map(|d| base.join(d)).collect();
    }

    let mut files = Vec::new();
    for dir in &dirs {
        collect(dir, &mut files);
    }
    assert!(!files.is_empty(), "no .svelte files under {dirs:?}");

    measure_prop_reads::reset();
    for content in &files {
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
    let (calls, empty, no_match, slow, expr_chars, scanned, vec_elems, props, max_props) =
        measure_prop_reads::snapshot();

    println!("files: {}", files.len());
    println!("transform_prop_reads_in_expr calls: {calls}");
    println!("  returned early, no props:      {empty}");
    println!("  returned early, no identifier: {no_match}");
    println!("  reached the per-prop loop:     {slow}");
    if slow == 0 {
        println!("(no slow-path calls; nothing to decompose)");
        return;
    }
    println!("slow path:");
    println!(
        "  expression chars (one pass would walk): {expr_chars} ({:.1}/call)",
        expr_chars as f64 / slow as f64
    );
    println!(
        "  chars actually walked:                  {scanned} ({:.1}/call)",
        scanned as f64 / slow as f64
    );
    println!(
        "  RE-SCAN FACTOR: {:.2}x",
        scanned as f64 / expr_chars.max(1) as f64
    );
    println!(
        "  Vec<char> elements materialized:        {vec_elems} ({} bytes at 4 B/char)",
        vec_elems * 4
    );
    println!(
        "  prop vars: {props} total, {:.2}/call, max {max_props}",
        props as f64 / slow as f64
    );
}
