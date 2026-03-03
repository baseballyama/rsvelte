use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};
fn main() {
    unsafe {
        std::env::set_var("DEBUG_CODEGEN", "1");
    }
    // Test failing test cases
    let tests = ["async-const", "destructure-async-assignments"];
    for test_name in &tests {
        let path = format!(
            "svelte/packages/svelte/tests/runtime-runes/samples/{}/main.svelte",
            test_name
        );
        let src = match std::fs::read_to_string(&path) {
            Ok(s) => s,
            Err(e) => {
                eprintln!("Cannot read {}: {}", path, e);
                continue;
            }
        };
        let opts = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("main.svelte".to_string()),
            css: CssMode::Injected,
            dev: false,
            ..Default::default()
        };
        eprintln!("\n=== {} ===", test_name);
        match compile(&src, opts) {
            Ok(_result) => eprintln!("OK"),
            Err(e) => eprintln!("ERROR: {}", e),
        }
    }
}
