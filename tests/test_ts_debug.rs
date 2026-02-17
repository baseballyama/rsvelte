use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

#[test]
fn test_ts_enum_detection() {
    let source = r#"<script lang="ts">
	enum Foo {
		bar = 1
	}
</script>"#;

    // Check the parsed AST
    let parse_options = svelte_compiler_rust::ParseOptions {
        modern: true,
        loose: false,
        filename: None,
    };
    let ast = svelte_compiler_rust::parse(source, parse_options).unwrap();

    if let Some(ref instance) = ast.instance {
        let svelte_compiler_rust::ast::js::Expression::Value(ref val) = instance.content;
        let json_str = serde_json::to_string(val).unwrap();
        eprintln!(
            "AST contains TSEnumDeclaration: {}",
            json_str.contains("TSEnumDeclaration")
        );
        eprintln!(
            "AST body len: {}",
            val.get("body")
                .and_then(|v| v.as_array())
                .map_or(0, |a| a.len())
        );
    }

    let options = CompileOptions {
        generate: GenerateMode::Client,
        ..Default::default()
    };

    let result = compile(source, options);
    match &result {
        Ok(_) => eprintln!("Compilation SUCCEEDED (bug!)"),
        Err(e) => eprintln!("Compilation FAILED with: {:?}", e),
    }
    assert!(result.is_err(), "Expected error for TS enum");
}
