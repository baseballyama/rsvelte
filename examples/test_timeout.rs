use std::time::Instant;
use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<div></div>

<style>
	div {
		@apply --funky-div;
		color: red;
	}

	div {

	}
</style>
"#;

    let start = Instant::now();
    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("test.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    println!("Starting compilation...");
    match compile(input, options) {
        Ok(result) => {
            println!("Compilation took: {:?}", start.elapsed());
            if let Some(css) = result.css {
                println!("=== Generated CSS ===");
                println!("{}", css.code);
            }
        }
        Err(e) => {
            println!("Compilation took: {:?}", start.elapsed());
            eprintln!("Error: {:?}", e);
        }
    }
}
