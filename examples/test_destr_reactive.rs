use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<script> 
    import { writable } from 'svelte/store';

	let { foo, toggleFoo } = (() => {
		const foo = writable(false);
		return { foo, toggleFoo: () => foo.update(f => !f) }
	})();
</script>

<button on:click={toggleFoo}>{$foo}</button>
<button on:click={() => foo = null}>click handler marks foo as reactive</button>"#;

    let opts = CompileOptions {
        generate: GenerateMode::Server,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(input, opts) {
        Ok(r) => println!("--- OUTPUT ---\n{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
