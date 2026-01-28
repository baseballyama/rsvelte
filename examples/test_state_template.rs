use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn main() {
    let source = std::fs::read_to_string(
        "svelte/packages/svelte/tests/runtime-runes/samples/state-in-template/main.svelte",
    )
    .unwrap();

    let client_options = CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Client,
        ..Default::default()
    };

    let client_result = compile(&source, client_options).expect("Failed to compile client");
    println!("=== OUR CLIENT ===");
    println!("{}", client_result.js.code);

    println!("\n=== EXPECTED CLIENT ===");
    let expected = std::fs::read_to_string("svelte/packages/svelte/tests/runtime-runes/samples/state-in-template/_output/client/main.svelte.js").unwrap();
    println!("{}", expected);
}
