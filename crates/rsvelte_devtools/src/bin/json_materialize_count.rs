//! Counts the `serde_json::Value` that a client compile materializes out of the
//! typed `JsNode` AST, over the flowbite-svelte corpus.
//!
//! Load-independent alternative to a sampling profile: the JSON-backed readers
//! in Phase 3 are all read-only queries, so every object and key counted here is
//! work that a typed reader would not do. Requires the instrumentation feature:
//!
//! ```text
//! cargo run --profile profiling -p rsvelte_devtools --bin json_materialize_count \
//!   --features measure-json
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

#[cfg(not(feature = "measure-json"))]
fn main() {
    eprintln!("build with --features measure-json");
    std::process::exit(2);
}

#[cfg(feature = "measure-json")]
fn main() {
    use rsvelte_core::ast::js::measure_json;

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

    measure_json::reset();
    for (_, content) in &files {
        let _ = compile(
            content,
            CompileOptions {
                generate: mode,
                ..Default::default()
            },
        );
    }
    let (materializations, objects, entries, strings) = measure_json::snapshot();

    let n = files.len() as f64;
    println!("files: {}", files.len());
    println!(
        "materializations: {materializations} total, {:.1}/file",
        materializations as f64 / n
    );
    println!(
        "objects:          {objects} total, {:.1}/file",
        objects as f64 / n
    );
    println!(
        "map entries:      {entries} total, {:.1}/file  (= key String allocs = map inserts = hashes)",
        entries as f64 / n
    );
    println!(
        "strings:          {strings} total, {:.1}/file  (keys + string values)",
        strings as f64 / n
    );
}
