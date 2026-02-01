use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn main() {
    // Test just the <div role={dynamicRole}> case
    let source = r#"<script>
const dynamicRole = "button";
</script>
<div role={dynamicRole} on:click={() => {}}></div>"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("test.svelte".to_string()),
        ..Default::default()
    };

    match compile(source, options) {
        Ok(result) => {
            println!(
                "Compilation succeeded with {} warnings",
                result.warnings.len()
            );
            for (i, warning) in result.warnings.iter().enumerate() {
                println!("  {}: {} - {}", i + 1, warning.code, warning.message);
            }
        }
        Err(e) => {
            println!("Compilation failed: {:?}", e);
        }
    }
}
