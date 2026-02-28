use svelte_compiler_rust::CompileOptions;
use svelte_compiler_rust::GenerateMode;
use svelte_compiler_rust::compile;
use svelte_compiler_rust::compiler::CssMode;

fn main() {
    // Simulate the has test case more closely
    let input = "<x>\n\t<y>\n\t\t<z></z>\n\t</y>\n</x>\n\n<style>\n\tx:has(> y) {\n\t\tcolor: green;\n\t}\n\tx:has(~y) {\n\t\tcolor: green;\n\t}\n</style>";

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
