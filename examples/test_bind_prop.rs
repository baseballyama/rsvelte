use svelte_compiler_rust::compiler::compile;
use svelte_compiler_rust::compiler::{CompileOptions, GenerateMode};

fn main() {
    let source = r#"<script>
	export const items1 = {};
	export const items2 = {};
	export let data = [{ id: 1, text: "b" }, { id: 2, text: "c" }];
</script>

{#each data as item (item.id)}
	<div bind:this={items1[item.id]}>{item.text}</div>
	<div bind:this={items2[item.id]}>{item.text}</div>
{/each}"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        accessors: true,
        ..Default::default()
    };

    match compile(source, options) {
        Ok(result) => {
            println!("=== CLIENT OUTPUT ===");
            println!("{}", result.js.code);
        }
        Err(e) => {
            eprintln!("Error: {:?}", e);
        }
    }
}
