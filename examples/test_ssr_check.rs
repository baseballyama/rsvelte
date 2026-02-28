use std::fs;
use svelte_compiler_rust::{
    CompileOptions, ExperimentalOptions, GenerateMode, compile, compiler::CssMode,
};

fn main() {
    // Read the main.svelte for class-directive
    let input = fs::read_to_string(
        "svelte/packages/svelte/tests/runtime-runes/samples/class-directive/main.svelte",
    )
    .unwrap();

    let options = CompileOptions {
        generate: GenerateMode::Server,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        experimental: ExperimentalOptions { r#async: true },
        ..Default::default()
    };

    match compile(&input, options) {
        Ok(result) => {
            println!("=== class-directive SERVER ===");
            println!("{}", result.js.code);
        }
        Err(e) => {
            eprintln!("class-directive error: {:?}", e);
        }
    }
}
