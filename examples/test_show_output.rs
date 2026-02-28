use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let test = std::env::args()
        .nth(1)
        .expect("Usage: test_show_output <test_name>");
    let src_path = format!(
        "/Users/baseballyama/git/svelte-compiler-rust/svelte/packages/svelte/tests/runtime-legacy/samples/{}/main.svelte",
        test
    );
    let src = std::fs::read_to_string(&src_path).expect("Failed to read test file");

    // Try bypassing transform to see what intermediate code we generate
    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(&src, opts) {
        Ok(r) => println!("SUCCESS:\n{}", r.js.code),
        Err(e) => {
            eprintln!("ERROR: {:?}", e);
            // Try to show a simplified version
            let opts2 = CompileOptions {
                generate: GenerateMode::Server,
                filename: Some("main.svelte".to_string()),
                css: CssMode::External,
                ..Default::default()
            };
            match compile(&src, opts2) {
                Ok(r) => println!("SERVER SUCCESS:\n{}", r.js.code),
                Err(e2) => eprintln!("SERVER ERROR: {:?}", e2),
            }
        }
    }
}
