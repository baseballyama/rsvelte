use svelte_compiler_rust::{
    CompileOptions, ExperimentalOptions, GenerateMode, compile, compiler::CssMode,
};

fn main() {
    let input = r#"<script>
	let { foo = false, bar = true } = $props();
</script>

<div></div>
<span></span>
<div><span></span></div>

<div class="foo"></div>
<span class="foo"></span>
<div><span class="foo"></span></div>

<div class="foo" class:bar></div>
<span class="foo" class:bar></span>
<div><span class="foo" class:bar></span></div>

<div class="foo" class:foo></div>
<span class="foo" class:foo></span>
<div><span class="foo" class:foo></span></div>

<div class="foo" class:bar class:foo></div>
<span class="foo" class:bar class:foo></span>
<div><span class="foo" class:bar class:foo></span></div>

<div class="football" class:bar class:foo></div>
<span class="football" class:bar class:foo></span>
<div><span class="football" class:bar class:foo></span></div>

<div class="foo" class:bar class:foo class:not-foo={!foo}></div>
<span class="foo" class:bar class:foo class:not-foo={!foo}></span>
<div><span class="foo" class:bar class:foo class:not-foo={!foo}></span></div>

<style>
	div {
		color: red;
	}
	div > span {
		font-weight: bold;
	}
</style>"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        experimental: ExperimentalOptions { r#async: true },
        ..Default::default()
    };

    match compile(input, options) {
        Ok(result) => {
            println!("=== CLIENT JS ===");
            println!("{}", result.js.code);
        }
        Err(e) => {
            eprintln!("Compilation error: {:?}", e);
        }
    }
}
