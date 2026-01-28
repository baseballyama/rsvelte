use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn main() {
    let source = r#"<script>
	import { writable } from 'svelte/store';

	const count = writable(0);

	$count += 1;
	$count += 1;
	$count += 1;
</script>

<p>{$count}</p>"#;

    let client_options = CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Client,
        ..Default::default()
    };

    let client_result = compile(source, client_options).expect("Failed to compile client");
    println!("=== CLIENT ===");
    println!("{}", client_result.js.code);

    let server_options = CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Server,
        ..Default::default()
    };

    let server_result = compile(source, server_options).expect("Failed to compile server");
    println!("\n=== SERVER ===");
    println!("{}", server_result.js.code);
}
