use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};
fn main() {
    let src = r#"<script>
	let x = 0;
</script>

<button on:click="{() => ({ x } = { x: 1 })}">foo</button>
<button on:click="{() => ([x] = [2])}">bar</button>

<p>x: {x}</p>"#;

    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    unsafe {
        std::env::set_var("DEBUG_CODEGEN", "1");
    }

    match compile(src, opts) {
        Ok(r) => println!("SUCCESS:\n{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
