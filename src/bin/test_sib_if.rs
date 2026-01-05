use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<script>
	let foo = true;
	let bar = true;
</script>

<style>
	.a + .b { color: green; }
	.a + .c { color: green; }
	.a + .d { color: green; }
	.b + .e { color: green; }
	.c + .e { color: green; }
	.d + .e { color: green; }

	/* no match */
	.a + .e { color: green; }
	.b + .c { color: green; }
	.b + .d { color: green; }
	.c + .d { color: green; }
</style>

<div class="a"></div>

{#if foo}
	<div class="b"></div>
{:else if bar}
	<div class="c"></div>
{:else}
	<div class="d"></div>
{/if}

<div class="e"></div>"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("test.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };

    let result = compile(input, options).unwrap();

    if let Some(css) = result.css {
        println!("=== CSS Output ===");
        println!("{}", css.code);
    } else {
        println!("No CSS output");
    }
}
