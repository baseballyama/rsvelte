use svelte_compiler_rust::{ParseOptions, parse};

fn main() {
    let input = r#"<x><y></y></x>
<style>
	x :is(y) {
		color: green;
	}
</style>
"#;

    let options = ParseOptions::default();
    match parse(input, options) {
        Ok(ast) => {
            // Print the CSS AST
            if let Some(css) = ast.css {
                println!("{}", serde_json::to_string_pretty(&css).unwrap());
            }
        }
        Err(e) => {
            eprintln!("Error: {:?}", e);
        }
    }
}
