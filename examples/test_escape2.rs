use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};
fn main() {
    let src_path = "/workspace/svelte/packages/svelte/tests/runtime-legacy/samples/escape-template-literals/main.svelte";
    let src = std::fs::read_to_string(src_path).expect("cannot read");
    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };
    unsafe {
        std::env::set_var("DEBUG_CODEGEN", "1");
    }
    match compile(&src, opts) {
        Ok(r) => println!("SUCCESS:\n{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
