//! Counts the `String` allocations that the pre-refactor `await` scanner in
//! `3_transform/client/expression_utils.rs` performed, over the flowbite-svelte
//! corpus.
//!
//! Load-independent: the replayed scanner runs next to the current one on the
//! same inputs, so the totals are "what the old code would have allocated"
//! against the current code's zero at those sites. The same run also compares
//! the two scanners' verdicts, so a nonzero mismatch count means the refactor
//! changed behavior. Requires the instrumentation feature:
//!
//! ```text
//! cargo run --profile profiling -p rsvelte_devtools --bin await_alloc_count \
//!   --features measure-await
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

#[cfg(not(feature = "measure-await"))]
fn main() {
    eprintln!("build with --features measure-await");
    std::process::exit(2);
}

#[cfg(feature = "measure-await")]
fn main() {
    use rsvelte_core::measure_await;

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

    measure_await::reset();
    for (_, content) in &files {
        let _ = compile(
            content,
            CompileOptions {
                generate: mode,
                ..Default::default()
            },
        );
    }
    let (calls, input_bytes, word_async, rest, rest_again, word_await, alloc_bytes, mismatch) =
        measure_await::snapshot();

    let n = files.len() as f64;
    let total = word_async + rest + rest_again + word_await;
    println!("files: {}", files.len());
    println!(
        "scanner calls:  {calls} total, {:.1}/file",
        calls as f64 / n
    );
    println!(
        "scanned bytes:  {input_bytes} total, {:.1}/call",
        input_bytes as f64 / calls.max(1) as f64
    );
    println!("removed String allocations (old code):");
    println!("  word (async test): {word_async}");
    println!("  rest:              {rest}");
    println!("  rest (again):      {rest_again}");
    println!("  word (await test): {word_await}");
    println!(
        "  total:             {total}, {:.1}/file, {alloc_bytes} bytes",
        total as f64 / n
    );
    println!("new code allocates 0 at these four sites");
    println!("verdict mismatches (old vs new): {mismatch}");
}
