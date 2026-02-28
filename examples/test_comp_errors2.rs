use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let src = std::fs::read_to_string(
        "/Users/baseballyama/git/svelte-compiler-rust/svelte/packages/svelte/tests/runtime-legacy/samples/component-not-constructor/main.svelte"
    ).expect("read file");

    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(&src, opts) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
