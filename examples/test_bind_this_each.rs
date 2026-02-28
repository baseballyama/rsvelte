use svelte_compiler_rust::compiler::compile;
use svelte_compiler_rust::compiler::{CompileOptions, GenerateMode};

fn main() {
    let source = r#"<script>
	export let visible = false;

	export let items = [{ value: 'a', ref: null }];
</script>

{#if visible}
	{#each items as item}
		<div bind:this={item.ref}>{item.value}</div>
	{/each}
{/if}"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
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
