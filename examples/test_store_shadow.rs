use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let src = std::fs::read_to_string(
        "/Users/baseballyama/git/svelte-compiler-rust/svelte/packages/svelte/tests/runtime-legacy/samples/store-shadow-scope-declaration/main.svelte"
    ).expect("read file");
    println!("Input:\n{}", &src);
    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };
    match compile(&src, opts) {
        Ok(r) => println!("OK:\n{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
