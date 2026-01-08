fn main() {
    let css = r#"
	div {
		@apply --funky-div;
		color: red;
	}
"#;
    println!("Parsing CSS...");
    let children = svelte_compiler_rust::compiler::phases::phase1_parse::css::parse_css(css, 0);
    println!("Parsed {} nodes", children.len());
    println!("{}", serde_json::to_string_pretty(&children).unwrap());
}
