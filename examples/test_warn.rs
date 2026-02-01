use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn main() {
    let source = r#"<script>
	const dynamicRole = "button";
</script>

<!-- valid -->
<button on:click={() => {}}>click me</button>
<!-- svelte-ignore a11y_interactive_supports_focus -->
<div on:keydown={() => {}} role="button"></div>
<input type="text" on:click={() => {}} />
<div on:copy={() => {}}></div>
<a href="/foo" on:click={() => {}}>link</a>
<div role={dynamicRole} on:click={() => {}}></div>
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<footer on:keydown={() => {}}></footer>

<!-- invalid -->
<div on:keydown={() => {}}></div>
<!-- svelte-ignore a11y_missing_attribute -->
<a on:mousedown={() => {}} on:mouseup={() => {}} on:copy={() => {}}>link</a>
<div on:pointerdown={() => {}}></div>
<div on:pointerenter={() => {}}></div>
<div on:touchstart={() => {}}></div>"#;

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
