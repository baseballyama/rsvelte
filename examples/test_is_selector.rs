use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<x><y></y></x>

<style>
	x :is(y) {
		color: green;
	}
</style>
"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("test.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(input, options) {
        Ok(result) => {
            if let Some(css) = result.css {
                println!("=== Generated CSS ===");
                println!("{}", css.code);
            }
        }
        Err(e) => {
            eprintln!("Error: {:?}", e);
        }
    }
}
