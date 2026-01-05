use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"{#snippet my_snippet()}
  <span>Hello world</span>
{/snippet}

<div>{@render my_snippet()}</div>

<p>
	{#snippet my_snippet()}
		<span>Hello world</span>
	{/snippet}

	<strong>{@render my_snippet()}</strong>
</p>

<style>
	div > span {
		color: green;
	}
	div span {
		color: green;
	}
	div :global(span) {
		color: green;
	}
	p span {
		color: green;
	}
	p .foo {
		color: red;
	}
	span div {
		color: red;
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
