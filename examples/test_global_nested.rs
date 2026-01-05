use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<div><p>{@html whatever}</p></div>

<style>
	div {
		:global {
			.x {
				color: green;
			}
		}
	}
</style>
"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("test.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    println!("Compiling global-nested-block test...");
    match compile(input, options) {
        Ok(result) => {
            println!("Compilation successful!");
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
