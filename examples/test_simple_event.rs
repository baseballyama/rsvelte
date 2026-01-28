use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn main() {
    let source = r#"<script>
	let count = $state(0);
</script>

<button onclick={(e) => {
	const data = new FormData(e.target);
	console.log(data);
}}>Click</button>"#;

    let client_options = CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Client,
        ..Default::default()
    };

    let client_result = compile(source, client_options).expect("Failed to compile client");
    println!("=== OUR CLIENT ===");
    println!("{}", client_result.js.code);
}
