use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let test_name = std::env::args()
        .nth(1)
        .expect("Usage: test_specific <test_name>");
    let src = std::fs::read_to_string(format!(
        "/workspace/svelte/packages/svelte/tests/runtime-legacy/samples/{}/main.svelte",
        test_name
    ))
    .expect("Failed to read test file");

    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(&src, opts) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
