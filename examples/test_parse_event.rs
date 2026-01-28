use svelte_compiler_rust::{ParseOptions, parse};

fn main() {
    let source = r#"<script>
	let count = $state(0);
</script>

<button onclick={(e) => {
	const data = new FormData(e.target);
	console.log(data);
}}>Click</button>"#;

    match parse(source, ParseOptions::default()) {
        Ok(result) => {
            let fragment = serde_json::to_string_pretty(&result.fragment).unwrap();
            println!("{}", fragment);
        }
        Err(e) => {
            println!("Error: {:?}", e);
        }
    }
}
