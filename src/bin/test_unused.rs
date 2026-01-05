use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<div class='foo'></div>

<style>
	.foo {
		color: red;
	}

	.bar {
		color: blue;
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
        println!("	.foo.svelte-xyz {{ color: red; }}");
        println!();
        println!("	/* (unused) .bar {{ color: blue; }}*/");
    } else {
        println!("No CSS output");
    }
}
