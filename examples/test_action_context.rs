use std::fs;
use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn main() {
    let source = fs::read_to_string(
        "svelte/packages/svelte/tests/runtime-runes/samples/action-context/main.svelte",
    )
    .unwrap();

    let options = CompileOptions {
        generate: GenerateMode::Client,
        dev: false,
        ..Default::default()
    };

    let result = compile(&source, options).unwrap();

    println!("=== Compiled JS ===");
    println!("{}", result.js.code);
}
