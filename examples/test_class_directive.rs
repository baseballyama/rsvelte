use svelte_compiler_rust::{
    CompileOptions, ExperimentalOptions, GenerateMode, compile, compiler::CssMode,
};

fn main() {
    let src = r#"<script>
	let { foo = false, bar = true } = $props();
</script>

<div></div>
<div class="foo"></div>

<style>
	div {
		color: red;
	}
</style>"#;

    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        experimental: ExperimentalOptions { r#async: true },
        ..Default::default()
    };

    match compile(src, opts) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
