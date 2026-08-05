//! Counts the slot-name `String` allocations that the pre-refactor component
//! slot grouping in `3_transform/client/visitors/shared/component.rs`
//! performed.
//!
//! Load-independent: the recorder sits on the exact line that used to produce
//! the owned key, so `calls` is the number of `String`s the old code allocated
//! and `bytes` is how many bytes they copied. The new code allocates none
//! there. Requires the instrumentation feature:
//!
//! ```text
//! cargo run --profile profiling -p rsvelte_devtools --bin slot_key_alloc_count \
//!   --features measure-slot-key
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

#[cfg(not(feature = "measure-slot-key"))]
fn main() {
    eprintln!("build with --features measure-slot-key");
    std::process::exit(2);
}

#[cfg(feature = "measure-slot-key")]
fn main() {
    use rsvelte_core::measure_slot_key;

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

    measure_slot_key::reset();
    for (_, content) in &files {
        let _ = compile(
            content,
            CompileOptions {
                generate: mode,
                ..Default::default()
            },
        );
    }
    let (calls, bytes, default_keys) = measure_slot_key::snapshot();

    let n = files.len() as f64;
    println!("files: {}", files.len());
    println!(
        "slot-key computations: {calls} total, {:.2}/file",
        calls as f64 / n
    );
    println!("  named slot keys:  {}", calls - default_keys);
    println!("  \"default\" keys:   {default_keys}");
    println!("removed String allocations (old code): {calls}, {bytes} bytes");
    println!("new code allocates 0 at this site");
}
