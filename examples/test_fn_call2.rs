use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let tests = vec![
        ("runtime-runes", "props-assignment-tracking", false),
        ("runtime-runes", "store-directive", false),
    ];
    for (category, test, accessors) in &tests {
        let src_path = format!(
            "svelte/packages/svelte/tests/{}/samples/{}/main.svelte",
            category, test
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
            accessors: *accessors,
            ..Default::default()
        };

        match compile(&src, opts) {
            Ok(r) => println!("=== {} ===\n{}\n", test, r.js.code),
            Err(e) => eprintln!("ERROR {}: {:?}\n", test, e),
        }
    }
}
