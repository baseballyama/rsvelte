use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("compile failed: {error:?}"))
    .js
    .code
}

#[test]
fn nested_async_function_does_not_make_derived_async() {
    let output = client(
        "<script>\n\tconst value = $derived((async function () { return await Promise.resolve(1); })());\n</script>\n\n<p>{value}</p>",
    );

    assert!(output.contains("$.derived"), "{output}");
    assert!(
        !output.contains("$.async_derived"),
        "a nested async function must not make the enclosing component async:\n{output}"
    );
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, &output, SourceType::mjs()).parse();
    assert!(
        !parsed.panicked && parsed.diagnostics.is_empty(),
        "client output must parse:\n{output}"
    );
}
