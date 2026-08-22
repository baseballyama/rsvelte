//! Prints one component's generated JS, so a corpus divergence can be reproduced
//! from a single source file without standing the whole corpus harness back up.
//!
//! Usage:
//!   cargo run -p `rsvelte_devtools` --bin `compile_one` -- <file.svelte> [--server] [--dev]
//!     [--runes-false | --runes-true]
//!
//! A path that does not end in `.svelte` is compiled as a `.svelte.js` module.

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

    // `.svelte.js` / `.svelte.ts` go through `compileModule`, which is a
    // different pipeline from a component's — the same source can diverge in
    // one and not the other.
    let compiled = if path.ends_with(".svelte") {
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
    } else {
        compile_module(
            &source,
            ModuleCompileOptions {
                generate,
                dev,
                filename: Some(path.clone()),
                ..Default::default()
            },
        )
    };

    match compiled {
        Ok(result) => print!("{}", result.js.code),
        Err(err) => {
            eprintln!("{err:?}");
            std::process::exit(2);
        }
    }
}
