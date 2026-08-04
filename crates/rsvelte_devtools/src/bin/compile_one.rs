//! Prints one component's generated JS, so a corpus divergence can be reproduced
//! from a single source file without standing the whole corpus harness back up.
//!
//! Usage:
//!   cargo run -p rsvelte_devtools --bin compile_one -- <file.svelte> [--server] [--dev]

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let Some(path) = args.iter().find(|a| !a.starts_with("--")) else {
        eprintln!("usage: compile_one <file.svelte> [--server] [--dev]");
        std::process::exit(1);
    };
    let dev = args.iter().any(|a| a == "--dev");
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

    match compile(
        &source,
        CompileOptions {
            generate,
            dev,
            filename: Some(path.clone()),
            ..Default::default()
        },
    ) {
        Ok(result) => print!("{}", result.js.code),
        Err(err) => {
            eprintln!("{err:?}");
            std::process::exit(2);
        }
    }
}
