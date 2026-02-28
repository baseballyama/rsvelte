use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    // Test: await-catch with computed key destructuring
    // Compare with a simpler case first
    let src1 = r#"<script>
	export let promise2 = {a: 1, b: 2, c: 3};
</script>
{#await promise2 catch { a, b, c }}
	<p>{a}, {b}, {c}</p>
{/await}
"#;

    let src2 = r#"<script>
	export let promise2 = {length: 12, width: 5, height: 13};
	const th = 'th';
</script>
{#await promise2 catch { [`leng${th}`]: l, [`wid${th}`]: w, height: h }}
	<p>{l}, {w}, {h}</p>
{/await}
"#;

    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    println!("=== Simple case ===");
    match compile(src1, opts.clone()) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }

    println!("\n=== Computed key case ===");
    match compile(src2, opts.clone()) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
