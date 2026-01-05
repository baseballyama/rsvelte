use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<div class='animated'>animated</div>
<div class='also-animated'>also animated</div>

<style>
	@keyframes why {
		0% { color: red; }
		100% { color: blue; }
	}

	.animated {
		-webkit-animation: why 2s;
		animation: why 2s;
	}

	.also-animated {
		animation: not-defined-here 2s;
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
    } else {
        println!("No CSS output");
    }
}
