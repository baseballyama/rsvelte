use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn main() {
    let source = r#"<script>
	let { count=0 } = $props();

	export {
		count
	}
</script>

<p>{count}</p>"#;

    let client_options = CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Client,
        ..Default::default()
    };

    let client_result = compile(source, client_options).expect("Failed to compile client");
    println!("=== OUR CLIENT ===");
    println!("{}", client_result.js.code);
}
