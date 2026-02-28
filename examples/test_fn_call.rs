use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let tests = [
        "default-data-function",
        "event-handler-deconflicted",
        "if-block-conservative-update",
    ];
    for test in &tests {
        let src_path = format!(
            "svelte/packages/svelte/tests/runtime-legacy/samples/{}/main.svelte",
            test
        );
        let src = match std::fs::read_to_string(&src_path) {
            Ok(s) => s,
            Err(e) => {
                eprintln!("Could not read {}: {}", test, e);
                continue;
            }
        };

        let opts = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("main.svelte".to_string()),
            css: CssMode::External,
            accessors: true,
            ..Default::default()
        };

        match compile(&src, opts) {
            Ok(r) => println!("=== {} ===\n{}\n", test, r.js.code),
            Err(e) => eprintln!("ERROR {}: {:?}\n", test, e),
        }
    }
}
