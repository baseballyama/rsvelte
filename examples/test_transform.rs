// Test the transform_state_in_expr function behavior
use std::fs;
use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn main() {
    // Use the action-context test which has count++ (reassigned)
    let source = fs::read_to_string(
        "svelte/packages/svelte/tests/runtime-runes/samples/action-context/main.svelte",
    )
    .expect("Failed to read file");

    println!("=== Source ===");
    println!("{}", source);

    println!("\n=== Compiling ===");
    let options = CompileOptions {
        generate: GenerateMode::Client,
        dev: false,
        ..Default::default()
    };

    match compile(&source, options) {
        Ok(result) => {
            println!("=== Compiled JS ===");
            println!("{}", result.js.code);
        }
        Err(e) => {
            println!("=== Error ===");
            println!("{:?}", e);
        }
    }
}
