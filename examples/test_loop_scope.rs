use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<script>
	let x = 0;

	function foo() {
		(() => {
			for (let x = 0; x < 10; x++) {}
			x = 42;
		})();
	}
</script>

<button on:click={foo}>foo</button>

<p>x: {x}</p>"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        accessors: true,
        ..Default::default()
    };

    match compile(input, options) {
        Ok(result) => {
            println!("=== CLIENT JS ===");
            println!("{}", result.js.code);
        }
        Err(e) => {
            println!("Error: {:?}", e);
            // Try to get the raw code before formatting
            println!("\nLet's try without OXC formatting...");
        }
    }
}
