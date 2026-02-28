use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};
fn main() {
    let src_path = "/workspace/svelte/packages/svelte/tests/runtime-legacy/samples/instrumentation-auto-subscription-self-assignment/main.svelte";
    let src = std::fs::read_to_string(src_path).expect("cannot read");
    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };
    match compile(&src, opts) {
        Ok(r) => println!("SUCCESS:\n{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
