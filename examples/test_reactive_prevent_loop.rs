use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<script>
	let count1 = 0;
	let count2 = 0;

	function increaseCount1() {
		count1++;
	}

	$: if (count2 < 10) {
		console.log(1);
		increaseCount1();
	}

	$: if (count1 < 10) {
		console.log(2);
		count2++;
	}
</script>

<button on:click={() => count1++}>{count1} / {count2}</button>"#;

    let opts = CompileOptions {
        generate: GenerateMode::Server,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(input, opts) {
        Ok(r) => println!("--- OUTPUT ---\n{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
