use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

fn compile_module_script(generate: GenerateMode) -> String {
    compile(
		"<script module>\n\tconst p = Promise.resolve(1);\n\tconst [a, b] = $derived(await p);\n</script>\n\n<p>ok</p>",
		CompileOptions {
			generate,
			experimental: ExperimentalOptions { r#async: true },
			..Default::default()
		},
	)
	.unwrap()
	.js
	.code
}

#[test]
fn directly_awaited_module_derived_pattern_is_not_an_async_cell() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = compile_module_script(generate);
        assert!(
            code.contains("const [a, b] = await p;"),
            "module declaration must retain its direct await ({generate:?}):\n{code}"
        );
        assert!(
            !code.contains("$.async_derived"),
            "module declaration must not create an async cell ({generate:?}):\n{code}"
        );
    }
}
