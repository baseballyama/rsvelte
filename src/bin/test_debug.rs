use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<img src="foo.jpg" alt="a foo" />

<style>
	img[alt] {
		border: 1px solid green;
	}

	img[alt=""] {
		border: 1px solid red;
	}
</style>"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("test.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    let result = compile(input, options).unwrap();

    if let Some(css) = result.css {
        println!("=== CSS Output ===");
        println!("{}", css.code);
        println!("\n=== Expected ===");
        println!("img[alt].svelte-xyz {{ border: 1px solid green; }}");
        println!("/* (unused) img[alt=\"\"] {{ border: 1px solid red; }} */");
    } else {
        println!("No CSS output");
    }
}
