//! Test the new visitor system

use svelte_compiler_rust::compiler::CompileOptions;
use svelte_compiler_rust::compiler::compile;

fn main() {
    // SAFETY: This is a single-threaded test before any other threads are spawned
    unsafe { std::env::set_var("SVELTE_USE_NEW_VISITORS", "1") };

    let source = "<h1>hello world</h1>";
    let options = CompileOptions::default();

    eprintln!("Compiling: {}", source);
    eprintln!(
        "SVELTE_USE_NEW_VISITORS: {:?}",
        std::env::var("SVELTE_USE_NEW_VISITORS")
    );

    match compile(source, options) {
        Ok(result) => {
            eprintln!("Success!");
            println!("{}", result.js.code);
        }
        Err(e) => {
            eprintln!("Error: {:?}", e);
        }
    }
}
