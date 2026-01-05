use svelte_compiler_rust::compiler::CssMode;
use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn main() {
    let input = r#"<div>red</div>

<style>
	div {
		color: red;
	}
</style>"#;

    let expected = r#"	div.svelte-xyz {
		color: red;
	}
"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("basic/input.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    let result = compile(input, options).unwrap();

    if let Some(css) = result.css {
        let actual = css.code;

        // Normalize hash
        let hash_re = regex::Regex::new(r"svelte-[a-z0-9]+").unwrap();
        let normalized_actual = hash_re.replace_all(&actual, "svelte-xyz");
        let normalized_expected = hash_re.replace_all(expected, "svelte-xyz");

        println!("=== Expected (normalized) ===");
        println!("{}", normalized_expected.trim());
        println!();
        println!("=== Actual (normalized) ===");
        println!("{}", normalized_actual.trim());
        println!();

        if normalized_actual.trim() == normalized_expected.trim() {
            println!("✓ MATCH!");
        } else {
            println!("✗ MISMATCH");
        }
    } else {
        println!("No CSS output");
    }
}
