use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

#[test]
fn leading_block_svelte_ignore_before_async_derived_is_retained_and_parseable() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let output = compile(
            "<script>\n/* svelte-ignore await_waterfall */ const value = $derived(await Promise.resolve(1));\n</script>\n<p>{value}</p>",
            CompileOptions {
                generate,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
            },
        )
        .unwrap_or_else(|error| panic!("compile failed for {generate:?}: {error:?}"))
        .js
        .code;

        assert!(
            output.contains("svelte-ignore await_waterfall"),
            "{generate:?} output lost the ignore comment:\n{output}"
        );
        assert!(!output.contains("void (/*"), "{output}");
        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, &output, SourceType::mjs()).parse();
        assert!(
            !parsed.panicked && parsed.diagnostics.is_empty(),
            "{generate:?} output must parse:\n{output}"
        );
    }
}

#[test]
fn inspect_after_top_level_await_keeps_its_async_slot() {
    let output = compile(
        "<script>\nlet data = await Promise.resolve(42);\n$inspect(data);\n</script>\n<p>{data}</p>",
        CompileOptions {
            generate: GenerateMode::Client,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("compile failed: {error:?}"))
    .js
    .code;

    assert!(output.contains("() => void 0"), "{output}");
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, &output, SourceType::mjs()).parse();
    assert!(
        !parsed.panicked && parsed.diagnostics.is_empty(),
        "client output must parse:\n{output}"
    );
}
