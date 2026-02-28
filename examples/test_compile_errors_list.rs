use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let tests = vec![
        "lifecycle-onmount-infinite-loop",
        "destructuring-assignment-array",
        "event-handler-dynamic-multiple",
        "slot",
        "dynamic-element-action-update",
        "escape-template-literals",
        "component-binding-reactive-property-no-extra-call",
        "store-auto-resubscribe-immediate",
        "reactive-value-assign-properties",
        "store-assignment-updates-destructure",
        "nested-destructure-assignment",
        "nested-destructure-assignment-2",
        "const-tag-each-destructure-computed-in-computed",
        "const-tag-each-destructure-computed-props",
        "dynamic-component-evals-props-once",
        "instrumentation-template-destructuring",
        "reactive-assignment-in-complex-declaration-with-store-2",
    ];

    for test in tests {
        let src_path = format!(
            "/Users/baseballyama/git/svelte-compiler-rust/svelte/packages/svelte/tests/runtime-legacy/samples/{}/main.svelte",
            test
        );
        let src = match std::fs::read_to_string(&src_path) {
            Ok(s) => s,
            Err(e) => {
                eprintln!("=== {} ===\n  CANNOT READ: {}", test, e);
                continue;
            }
        };

        let opts = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("main.svelte".to_string()),
            css: CssMode::External,
            ..Default::default()
        };

        match compile(&src, opts) {
            Ok(_) => {
                println!("=== {} === OK (no compile error)", test);
            }
            Err(e) => {
                println!("=== {} ===", test);
                println!("  ERROR: {:?}", e);
            }
        }
    }
}
