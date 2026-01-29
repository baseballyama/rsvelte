use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn main() {
    let source = r#"<script>
	let stuff = $state({ foo: true, bar: [1, 2, {baz: 'baz'}] });
	let { foo, bar: [a, b, { baz }]} = $derived(stuff);

	let stuff2 = $state([1, 2, 3]);
	let [d, e, f] = $derived(stuff2);
</script>

{foo} {a} {b} {baz} {d} {e} {f}
"#;

    let client_options = CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Client,
        ..Default::default()
    };

    match compile(source, client_options) {
        Ok(result) => {
            println!("=== CLIENT OUTPUT ===");
            println!("{}", result.js.code);
        }
        Err(e) => {
            println!("=== CLIENT ERROR ===");
            println!("{:?}", e);
        }
    }
}
