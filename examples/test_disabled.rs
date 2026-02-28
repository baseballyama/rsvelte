use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<script>
	export let selected;
</script>

<p>selected: {selected}</p>

<select bind:value={selected}>
	<option disabled>x</option>
	<option>a</option>
	<option>b</option>
	<option>c</option>
</select>

<p>selected: {selected}</p>"#;

    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    match compile(input, opts) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
