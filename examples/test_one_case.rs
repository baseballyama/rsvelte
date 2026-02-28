use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let test = std::env::args()
        .nth(1)
        .expect("Usage: test_one_case <test_name>");
    let src_path = format!(
        "/Users/baseballyama/git/svelte-compiler-rust/svelte/packages/svelte/tests/runtime-legacy/samples/{}/main.svelte",
        test
    );
    let src = std::fs::read_to_string(&src_path).expect("Failed to read test file");

    unsafe {
        std::env::set_var("DEBUG_CODEGEN", "1");
    }

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
        }
    }
}
