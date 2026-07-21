//! CLI for the Svelte Rust compiler.

// Defined per-bin rather than once in the lib so that linking the `rsvelte_core`
// rlib never imposes an allocator on the consumer.
#[cfg(all(
    feature = "jemalloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;

use std::fs;
use std::path::PathBuf;

use rsvelte_core::{ParseOptions, parse};

fn main() {
    let args: Vec<String> = std::env::args().collect();

    if args.len() < 2 {
        eprintln!("Usage: rsvelte_core <file.svelte>");
        std::process::exit(1);
    }

    let path = PathBuf::from(&args[1]);
    let source = match fs::read_to_string(&path) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Error reading file: {}", e);
            std::process::exit(1);
        }
    };

    let options = ParseOptions {
        modern: true,
        ..Default::default()
    };

    match parse(&source, options) {
        Ok(_ast) => {
            println!("Parsed successfully");
        }
        Err(e) => {
            eprintln!("Parse error: {:?}", e);
            std::process::exit(1);
        }
    }
}
