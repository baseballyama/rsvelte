use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn main() {
    let source = std::fs::read_to_string("/tmp/test_snippet.svelte").unwrap();

    let client_options = CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Client,
        ..Default::default()
    };

    let client_result = compile(&source, client_options).expect("Failed to compile client");
    println!("=== CLIENT ===");
    println!("{}", client_result.js.code);
}
