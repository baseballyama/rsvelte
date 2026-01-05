use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<p class="foo">foo</p>
<p class="bar">
	bar
	<span>baz</span>
</p>
<span>buzz</span>

<style>
	:not(.foo) {
		color: green;
	}
	p:not(.foo) {
		color: green;
	}
	span:not(p span) {
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
        println!("\n=== Expected ===");
        println!("	.svelte-xyz:not(.foo) {{ color: green; }}");
        println!("	p.svelte-xyz:not(.foo) {{ color: green; }}");
        println!(
            "	span.svelte-xyz:not(p:where(.svelte-xyz) span:where(.svelte-xyz)) {{ color: green; }}"
        );
    } else {
        println!("No CSS output");
    }
}
