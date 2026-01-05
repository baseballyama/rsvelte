use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<style>
	.a + .b { color: green; }
	.a + .c { color: green; }
</style>

{#if true}
	<div class="a"></div>
	<div class="b"></div>
{:else}
	<div class="a"></div>
	<div class="c"></div>
{/if}"#;

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
