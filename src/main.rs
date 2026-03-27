//! CLI for the Svelte Rust compiler.

use std::fs;
use std::path::PathBuf;

use svelte_compiler_rust::{ParseOptions, parse};

fn main() {
    let args: Vec<String> = std::env::args().collect();

    if args.len() < 2 {
        eprintln!("Usage: svelte-compiler-rust <file.svelte>");
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
