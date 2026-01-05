use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<x>
	<y>
		<z></z>
	</y>
</x>

<style>
	x :is(y) {
		color: green;
	}
	x :is(y, .unused) {
		color: green;
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
