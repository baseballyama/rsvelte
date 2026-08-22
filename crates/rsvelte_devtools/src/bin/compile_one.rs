//! Prints one component's generated JS, so a corpus divergence can be reproduced
//! from a single source file without standing the whole corpus harness back up.
//!
//! Usage:
//!   cargo run -p `rsvelte_devtools` --bin `compile_one` -- <file.svelte> [--server] [--dev]
//!     [--runes-false | --runes-true]
//!
//! A `.svelte.js` / `.svelte.ts` path goes through `compile_module`, which is a
//! different entry point with its own defects — see #2986 / #3071.

use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let Some(path) = args.iter().find(|a| !a.starts_with("--")) else {
        eprintln!("usage: compile_one <file.svelte> [--server] [--dev]");
        std::process::exit(1);
    };
    let dev = args.iter().any(|a| a == "--dev");
    let runes = if args.iter().any(|a| a == "--runes-false") {
        Some(false)
    } else if args.iter().any(|a| a == "--runes-true") {
        Some(true)
    } else {
        None
    };
    let generate = if args.iter().any(|a| a == "--server") {
        GenerateMode::Server
    } else {
        GenerateMode::Client
    };

    let source = match std::fs::read_to_string(path) {
        Ok(source) => source,
        Err(err) => {
            eprintln!("{path}: {err}");
            std::process::exit(1);
        }
    };

    let is_module = path.ends_with(".svelte.js") || path.ends_with(".svelte.ts");
    let result = if is_module {
        compile_module(
            &source,
            ModuleCompileOptions {
                generate,
                dev,
                filename: Some(path.clone()),
                ..Default::default()
            },
        )
        .map(|r| r.js.code)
    } else {
        compile(
            &source,
            CompileOptions {
                generate,
                dev,
                runes,
                filename: Some(path.clone()),
                ..Default::default()
            },
        )
        .map(|r| r.js.code)
    };

    match result {
        Ok(code) => print!("{code}"),
        Err(err) => {
            eprintln!("{err:?}");
            std::process::exit(2);
        }
    }
}
