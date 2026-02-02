use std::fs;
use svelte_compiler_rust::{
    CompileOptions, ExperimentalOptions, GenerateMode, compile, compiler::CssMode,
};

fn main() {
    let source = fs::read_to_string(
        "svelte/packages/svelte/tests/runtime-runes/samples/snippet-namespace-2/main.svelte",
    )
    .expect("Failed to read file");

    println!("=== SERVER OUTPUT ===");
    let server_opts = CompileOptions {
        generate: GenerateMode::Server,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        experimental: ExperimentalOptions { r#async: true },
        dev: false,
        ..Default::default()
    };

    match compile(&source, server_opts) {
        Ok(result) => {
            println!("{}", result.js.code);
        }
        Err(e) => {
            println!("=== Error ===");
            println!("{:?}", e);
        }
    }
}
