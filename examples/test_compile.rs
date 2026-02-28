use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let path = std::env::args().nth(1).expect("Usage: test_compile <path>");
    let mode = std::env::args()
        .nth(2)
        .unwrap_or_else(|| "client".to_string());
    let src = std::fs::read_to_string(&path).expect("Failed to read file");

    let opts = CompileOptions {
        generate: if mode == "server" {
            GenerateMode::Server
        } else {
            GenerateMode::Client
        },
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(&src, opts) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
