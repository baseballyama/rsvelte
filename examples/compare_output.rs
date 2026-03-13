//! Compare output with and without OXC normalization to understand what OXC fixes

use svelte_compiler_rust::compiler::phases::phase1_parse::{ParseOptions, parse};
use svelte_compiler_rust::compiler::phases::phase2_analyze::analyze_component;
use svelte_compiler_rust::{CompileOptions, GenerateMode};

fn main() {
    let source = r#"<script>
    let count = $state(0);
    let name = $state('world');
</script>

<h1>Hello {name}!</h1>
<button onclick={() => count++}>Clicks: {count}</button>

<style>
    h1 { color: red; }
</style>"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        dev: false,
        ..Default::default()
    };

    let mut ast = parse(source, ParseOptions::default()).unwrap();
    let analysis = analyze_component(&mut ast, source, &options).unwrap();

    // Get the normalized result

    // We need to access the program before generate() consumes it.
    // Let's use the internal transform directly to get the program.
    // For now, just show the normalized result.
    use svelte_compiler_rust::compiler::phases::phase3_transform::client;
    let result = client::transform_client(&analysis, &ast, source, &options).unwrap();
    println!("=== NORMALIZED (with OXC) ===");
    println!("{}", result.code);

    // To see raw, we need to temporarily switch generate to generate_fast
    // Let's just compare timings
    println!("\n=== TIMING ===");
    use std::time::Instant;
    let iterations = 100;

    // With OXC
    let start = Instant::now();
    for _ in 0..iterations {
        let mut ast2 = parse(source, ParseOptions::default()).unwrap();
        let analysis2 = analyze_component(&mut ast2, source, &options).unwrap();
        let _ = client::transform_client(&analysis2, &ast2, source, &options);
    }
    let with_oxc = start.elapsed() / iterations;
    println!("With OXC:    {:?} per iteration", with_oxc);
}
