use svelte_compiler_rust::CompileOptions;
use svelte_compiler_rust::GenerateMode;
use svelte_compiler_rust::compile;
use svelte_compiler_rust::compiler::CssMode;

fn main() {
    // Use the exact input from the has test case
    let input =
        std::fs::read_to_string("svelte/packages/svelte/tests/css/samples/has/input.svelte")
            .unwrap();

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("input.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(&input, options) {
        Ok(result) => {
            if let Some(css) = result.css {
                println!("CSS output:");
                println!("{}", css.code);
            }
        }
        Err(e) => {
            eprintln!("Error: {:?}", e);
        }
    }
}
