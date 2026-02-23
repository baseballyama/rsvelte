use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let src = r#"<script>
	import Sub from './Sub.svelte';
	export let selected;
	let banana = {};
	let component = banana;
	$: selected ? component = Sub : component = banana;
</script>

<svelte:component this={component} />"#;

    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(src, opts) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => {
            eprintln!("ERROR: {:?}", e);
            // Also try with the raw string if we can
        }
    }
}
