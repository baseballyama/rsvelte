use svelte_compiler_rust::CompileOptions;
use svelte_compiler_rust::GenerateMode;
use svelte_compiler_rust::compile;
use svelte_compiler_rust::compiler::CssMode;

fn main() {
    let input = r#"<script>
	import { get, set } from "./test.svelte.js";

	$$props;
</script>

<p>{get()}</p>

<button onclick={() => set()}></button>"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("input.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(input, options) {
        Ok(result) => {
            println!("{}", result.js.code);
        }
        Err(e) => {
            eprintln!("Error: {:?}", e);
        }
    }
}
