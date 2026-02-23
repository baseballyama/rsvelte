use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    // Minimal test case - just the on:test2 handler
    let cases = [
        // Should work: let $store inside function in template
        r#"<script>
function test2(store) {
    let $store;
}
</script>
<div
    on:test2={(store) => {
        let $store;
    }}
/>"#,
        // Should work: arrow fn parameter
        r#"<script>
function test(store) {
    return derived(store, $store => {});
}
</script>
<div on:test={(store) => { derived(store, $store => {}); }} />"#,
    ];

    for (i, case) in cases.iter().enumerate() {
        println!("=== Case {} ===", i + 1);
        let opts = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("main.svelte".to_string()),
            css: CssMode::External,
            ..Default::default()
        };
        match compile(case, opts) {
            Ok(r) => println!("OK: {}", &r.js.code[..r.js.code.len().min(100)]),
            Err(e) => eprintln!("ERROR: {:?}", e),
        }
    }
}
