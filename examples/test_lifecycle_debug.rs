use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    // Test: lifecycle-onmount-infinite-loop
    // The issue is that `count++` inside a callback generates invalid JS
    let src = r#"<script>
	import { onMount, mount } from 'svelte';
	import Child from './Child.svelte';

	let root;
	export let count = 0;

	onMount(() => {
		if (count < 5) {
			count++;
			mount(Child, { target: root });
		}
	});
</script>

<div bind:this={root}></div>"#;

    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(src, opts) {
        Ok(r) => println!("SUCCESS:\n{}", r.js.code),
        Err(e) => {
            eprintln!("ERROR: {:?}", e);
            // Show what was generated before the re-parse
        }
    }
}
