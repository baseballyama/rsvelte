use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let tests = vec![
        "component-not-constructor",
        "escape-template-literals",
        "store-shadow-scope-declaration",
        "destructuring-assignment-array",
        "slot",
    ];

    for test in tests {
        let path = format!(
            "/Users/baseballyama/git/svelte-compiler-rust/svelte/packages/svelte/tests/runtime-legacy/samples/{}/main.svelte",
            test
        );
        let src = match std::fs::read_to_string(&path) {
            Ok(s) => s,
            Err(_) => {
                println!("=== {} === MISSING FILE", test);
                continue;
            }
        };
        println!("=== {} ===", test);
        let opts = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("main.svelte".to_string()),
            css: CssMode::External,
            ..Default::default()
        };
        match compile(&src, opts) {
            Ok(r) => println!("OK: {}", &r.js.code[..r.js.code.len().min(200)]),
            Err(e) => eprintln!("ERROR: {:?}", e),
        }
    }
}
