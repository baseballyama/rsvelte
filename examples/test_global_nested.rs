use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let source = r#"<div><p>{@html whatever}</p></div>

<style>
	div {
		:global {
			.x {
				color: green;
			}
		}

		:global(.x) {
			color: green;
			&:hover {
				color: green;
			}
			&div {
				color: green;
			}
			.unused {
				color: red;
			}
		}

		p :global {
			.y {
				color: green;
			}
		}

		p :global(.y) {
			color: green;
		}

		.unused :global {
			.z {
				color: red;
			}
		}

		.unused :global(.z) {
			color: red;
		}
	}
</style>
"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("input.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(source, options) {
        Ok(result) => {
            println!("=== ACTUAL CSS ===");
            if let Some(css) = result.css {
                // Use a regex to normalize any svelte hash
                let re = regex::Regex::new(r"svelte-[a-z0-9]+").unwrap();
                let css_normalized = re.replace_all(&css.code, "svelte-xyz").to_string();
                println!("{}", css_normalized);
            } else {
                println!("No CSS output");
            }
        }
        Err(e) => {
            println!("Compilation error: {:?}", e);
        }
    }
}
