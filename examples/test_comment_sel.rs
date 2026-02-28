use svelte_compiler_rust::CompileOptions;
use svelte_compiler_rust::GenerateMode;
use svelte_compiler_rust::compile;
use svelte_compiler_rust::compiler::CssMode;

fn main() {
    let input = r#"<div class="foo">foo</div>
<div class="bar">bar</div>

<style>
	.foo,  /* some comment */
	.bar /* some other comment */
	{
		color: red;
	}
</style>"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("input.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(input, options) {
        Ok(result) => {
            if let Some(css) = result.css {
                println!("CSS output:");
                println!("{}", css.code);
            }
        }
        Err(e) => {
            eprintln!("Error: {:?}", e);
        }
    }
}
