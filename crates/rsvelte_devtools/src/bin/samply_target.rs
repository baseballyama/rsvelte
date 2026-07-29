//! Quick development profiling target for samply.

// Use mimalloc for this development binary. Allocator policy stays at the
// executable boundary so compiler libraries never impose one on embedders.
#[cfg(all(
    feature = "mimalloc-alloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use rsvelte_core::compiler::phases::phase1_parse::{ParseOptions, parse};
use std::fs;
use std::path::PathBuf;

fn main() {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
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
                &oxc_allocator::Allocator::default(),
                ParseOptions {
                    modern: true,
                    skip_expression_loc: true,
                    ..Default::default()
                },
            );
        }
    }
}
