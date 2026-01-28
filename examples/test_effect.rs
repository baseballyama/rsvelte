use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn main() {
    let source = r#"<script>
	let x = $state(0);
	let y = $state(0);

	$effect(() => {
		console.log(x);
	});
</script>

<button on:click={() => x++}>{x}</button>
<button on:click={() => y++}>{y}</button>"#;

    let client_options = CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Client,
        ..Default::default()
    };

    let client_result = compile(source, client_options).expect("Failed to compile client");
    println!("=== OUR CLIENT ===");
    println!("{}", client_result.js.code);
}
