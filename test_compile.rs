// 簡単なコンパイルテスト
use svelte_compiler_rust::compile;
use std::fs;

fn main() {
    let source = fs::read_to_string("test_simple.svelte").expect("Failed to read file");

    match compile(&source, "TestComponent", false) {
        Ok(result) => {
            println!("=== Client Code ===");
            println!("{}", result.js);
            println!("\n=== CSS ===");
            println!("{}", result.css.unwrap_or_default());
        }
        Err(e) => {
            eprintln!("Compilation error: {:?}", e);
        }
    }
}
