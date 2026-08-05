//! Counts the quoted-module-source `String` allocations that the pre-refactor
//! `module_source` in `3_transform/builders.rs` and
//! `3_transform/js_ast/to_oxc.rs` performed.
//!
//! Load-independent: the recorder sits on the exact line that used to run
//! `format!("'{source}'")`, so `calls` is the number of heap `String`s the old
//! code allocated there. `--parse-only` is the negative control: it runs the
//! same binary over the same corpus without reaching the transform phase.
//! Requires the instrumentation feature:
//!
//! ```text
//! cargo run --profile profiling -p rsvelte_devtools --bin module_source_alloc_count \
//!   --features measure-module-source
//! ```

#[cfg(feature = "measure-module-source")]
use std::fs;
#[cfg(feature = "measure-module-source")]
use std::path::{Path, PathBuf};

#[cfg(feature = "measure-module-source")]
use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[cfg(feature = "measure-module-source")]
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

#[cfg(not(feature = "measure-module-source"))]
fn main() {
    eprintln!("build with --features measure-module-source");
    std::process::exit(2);
}

#[cfg(feature = "measure-module-source")]
fn main() {
    use rsvelte_core::measure_module_source;

    let mut mode = GenerateMode::Client;
    let mut parse_only = false;
    let mut per_file = false;
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
            "--per-file" => per_file = true,
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

    measure_module_source::reset();
    let mut previous = 0u64;
    for (path, content) in &files {
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
        if per_file {
            let (calls, _) = measure_module_source::snapshot();
            println!("{:>6}  {}", calls - previous, path.display());
            previous = calls;
        }
    }
    let (calls, source_bytes) = measure_module_source::snapshot();

    let n = files.len() as f64;
    println!("files: {}", files.len());
    println!(
        "module_source calls: {calls} total, {:.2}/file",
        calls as f64 / n
    );
    println!(
        "removed heap String allocations (old code): {calls}, {} bytes",
        source_bytes + 2 * calls
    );
    println!("removed arena allocations (old code): {calls}, {source_bytes} bytes");
}
