fn main() {
    // Simpler test case
    let css = r#"
	div {
		color: red;
	}
"#;
    println!("Parsing simple CSS...");
    let children = svelte_compiler_rust::parser::css::parse_css(css, 0);
    println!("Parsed {} nodes", children.len());

    // Now test with @apply
    let css2 = r#"
	div {
		@apply --test;
	}
"#;
    println!("\nParsing CSS with @apply...");
    let children2 = svelte_compiler_rust::parser::css::parse_css(css2, 0);
    println!("Parsed {} nodes", children2.len());
}
