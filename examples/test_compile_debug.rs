use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    // Test a few of the compilation error cases
    let tests: Vec<(&str, &str)> = vec![
        (
            "reactive-statement-indirect",
            r#"<script>
	let count = 1;
	// Could be a let or simplified, but this tests that it still works like this
	$: indirect_double = 2;
	$: if (count > 0) {
		indirect_double = count * 2;
	}
</script>

<h1>{indirect_double}</h1>
<button on:click={() => count++}>Increment</button>"#,
        ),
        (
            "instrumentation-template-loop-scope",
            r#"<script>
	let x = 0;
</script>

<button on:click="{() => {
	(() => {
		for (let x = 0; x < 10; x++) {}
		x = 42;
	})();
}}">foo</button>

<p>x: {x}</p>"#,
        ),
        (
            "reactive-function-called-reassigned",
            r#"<script>
	let count = 0;

	function increment() {
		count += 1;
	}

	$: double = count * 2;
</script>

<button on:click={increment}>{count} / {double}</button>"#,
        ),
        (
            "destructuring-one-value-reactive",
            r#"<script>
    import { writable } from 'svelte/store';

    let { foo, toggleFoo } = (() => {
        const foo = writable(false);

        return { foo, toggleFoo: () => foo.update(f => !f) };
    })();
</script>

<button on:click={toggleFoo}>{$foo}</button>"#,
        ),
    ];

    for (name, input) in &tests {
        println!("\n=== {} ===", name);
        let options = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("main.svelte".to_string()),
            css: CssMode::External,
            accessors: true,
            ..Default::default()
        };

        match compile(input, options) {
            Ok(result) => {
                println!("SUCCESS:");
                println!("{}", result.js.code);
            }
            Err(e) => {
                println!("Error: {:?}", e);
            }
        }
    }
}
