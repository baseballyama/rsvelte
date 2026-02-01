use std::env;
use std::fs;
use std::sync::Arc;
use svelte_compiler_rust::CompileOptions;
use svelte_compiler_rust::compile;

fn main() {
    let args: Vec<String> = env::args().collect();
    let test_name = args
        .get(1)
        .map(|s| s.as_str())
        .unwrap_or("await-then-destruct-object");
    let input = fs::read_to_string(format!("/Users/baseballyama/git/svelte-compiler-rust/svelte/packages/svelte/tests/runtime-legacy/samples/{}/main.svelte", test_name)).unwrap();

    println!("=== INPUT ===");
    println!("{}", input);
    println!();

    let options = CompileOptions {
        css_hash: Some(Arc::new(|_| "svelte-xyz".to_string())),
        generate: svelte_compiler_rust::GenerateMode::Server,
        ..Default::default()
    };

    match compile(&input, options) {
        Ok(result) => {
            println!("=== SERVER JS ===");
            println!("{}", result.js.code);
        }
        Err(e) => {
            println!("Error: {:?}", e);
        }
    }
}
