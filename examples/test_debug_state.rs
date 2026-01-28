use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn main() {
    // A simple test with state
    let source = r#"<script>
	let count = $state(0);
</script>

<p>{count}</p>"#;

    // First, let's check what the analysis produces
    let client_options = CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Client,
        ..Default::default()
    };

    let client_result = compile(source, client_options).expect("Failed to compile client");
    println!("=== METADATA DEBUG ===");
    println!("Runes mode: {}", client_result.metadata.runes);

    println!("\n=== CLIENT OUTPUT ===");
    println!("{}", client_result.js.code);
}
