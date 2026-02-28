use svelte_compiler_rust::CompileOptions;
use svelte_compiler_rust::GenerateMode;
use svelte_compiler_rust::compile;
use svelte_compiler_rust::compiler::CssMode;

fn main() {
    let input = r#"<x>
<y></y>
</x>
<style>
x:has(> y) {
    color: green;
}
x:has(~y) {
    color: green;
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
