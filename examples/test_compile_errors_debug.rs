use std::fs;
use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let tests = vec![
        "binding-this-each-block-property-2",
        "reactive-statement-indirect",
        "each-block-scope-shadow-bind-4",
        "nested-destructure-assignment-2",
        "component-svelte-fragment-let-destructured-2",
        "inline-style-directive-update-object-property",
        "nested-destructure-assignment",
        "select-lazy-options",
        "instrumentation-template-loop-scope",
        "dynamic-element-action-update",
        "destructuring-one-value-reactive",
        "reactive-function-called-reassigned",
        "store-assignment-updates-destructure",
        "store-auto-resubscribe-immediate",
        "reactive-assignment-in-complex-declaration-with-store-2",
        "reactive-value-assign-properties",
    ];

    let svelte_path = std::env::var("SVELTE_PATH").unwrap_or_else(|_| "svelte".to_string());

    for test_name in &tests {
        let input_path = format!(
            "{}/packages/svelte/tests/runtime-legacy/samples/{}/main.svelte",
            svelte_path, test_name
        );

        let input = match fs::read_to_string(&input_path) {
            Ok(s) => s,
            Err(_) => {
                println!("=== {} === SKIPPED (no input)", test_name);
                continue;
            }
        };

        let options = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("main.svelte".to_string()),
            css: CssMode::External,
            accessors: true,
            ..Default::default()
        };

        match compile(&input, options) {
            Ok(_result) => {
                // Check if it passes
                println!("=== {} === COMPILED OK", test_name);
            }
            Err(e) => {
                let err_str = format!("{:?}", e);
                if err_str.contains("Parse errors") {
                    println!("=== {} === PARSE ERROR (codegen)", test_name);
                } else {
                    println!("=== {} === OTHER ERROR: {}", test_name, err_str);
                }
            }
        }
    }
}
