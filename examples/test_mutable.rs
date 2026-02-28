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

    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        accessors: true,
        ..Default::default()
    };

    match compile(input, opts) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
