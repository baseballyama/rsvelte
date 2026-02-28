use svelte_compiler_rust::compiler::compile;
use svelte_compiler_rust::compiler::{CompileOptions, GenerateMode};

fn main() {
    let source = r#"<script>
	import { tick } from 'svelte';
	let refs = [];

	export function addItem() {
		refs = refs.concat({ ref: null });
		return tick();
	}

	export let callback;

	$: callback(refs);
</script>

{#each refs as xxx}
	<div bind:this={xxx.ref}></div>
{/each}"#;

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
