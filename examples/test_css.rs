use std::fs;
use std::sync::Arc;
use svelte_compiler_rust::CompileOptions;
use svelte_compiler_rust::compile;

fn main() {
    let input = fs::read_to_string("/Users/baseballyama/git/svelte-compiler-rust/svelte/packages/svelte/tests/css/samples/host/input.svelte").unwrap();

    let options = CompileOptions {
        css_hash: Some(Arc::new(|_| "svelte-xyz".to_string())),
        ..Default::default()
    };

    match compile(&input, options) {
        Ok(result) => {
            println!("=== ACTUAL CSS ===");
            if let Some(css) = result.css {
                println!("{}", css.code);
            } else {
                println!("No CSS output");
            }

        }
        Err(e) => {
            println!("Error: {:?}", e);
        }
    }
}
