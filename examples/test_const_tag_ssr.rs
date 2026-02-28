use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<svelte:options runes={false} />
{#if true}
	{@const foo = bar}
	{@const yoo = foo}
	{@const bar = 'world'}
	<h1>Hello {bar}{yoo}!</h1>
{/if}"#;

    // Server-side
    let options = CompileOptions {
        generate: GenerateMode::Server,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(input, options) {
        Ok(result) => {
            println!("=== SERVER JS ===");
            println!("{}", result.js.code);
        }
        Err(e) => {
            println!("Server Error: {:?}", e);
        }
    }
}
