//! Quick profiling target for samply
use std::fs;
use std::path::PathBuf;
use svelte_compiler_rust::compiler::phases::phase1_parse::{ParseOptions, parse};

fn main() {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let dirs = [
        "submodules/svelte/packages/svelte/tests/runtime-runes/samples",
        "submodules/svelte/packages/svelte/tests/runtime-legacy/samples",
    ];
    let mut files = Vec::new();
    for dir in &dirs {
        let path = base.join(dir);
        if !path.exists() {
            continue;
        }
        for entry in fs::read_dir(&path).unwrap().flatten() {
            let input = entry.path().join("input.svelte");
            if let Ok(content) = fs::read_to_string(&input) {
                files.push(content);
            }
        }
    }
    eprintln!("Loaded {} files", files.len());
    // Parse all files 50 times
    for _ in 0..50 {
        for content in &files {
            let _ = parse(
                content,
                ParseOptions {
                    modern: true,
                    skip_expression_loc: true,
                    ..Default::default()
                },
            );
        }
    }
}
