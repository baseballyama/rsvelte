use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn main() {
    // Simple test with $inspect
    let source = r#"<script>
	let x = $state(0);
	$inspect(x);
</script>

<button on:click={() => x++}>{x}</button>"#;

    // Test in prod mode (dev: false)
    let prod_options = CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Client,
        dev: false,
        ..Default::default()
    };

    let prod_result = compile(source, prod_options).expect("Failed to compile in prod mode");
    println!("=== PROD MODE (dev: false) ===");
    println!("{}", prod_result.js.code);

    println!("\n");

    // Test in dev mode (dev: true)
    let dev_options = CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Client,
        dev: true,
        ..Default::default()
    };

    let dev_result = compile(source, dev_options).expect("Failed to compile in dev mode");
    println!("=== DEV MODE (dev: true) ===");
    println!("{}", dev_result.js.code);
}
