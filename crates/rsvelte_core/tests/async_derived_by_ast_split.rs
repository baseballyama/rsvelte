use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

fn compile_async(source: &str, generate: GenerateMode) -> String {
    compile(
        source,
        CompileOptions {
            generate,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("compile failed for {generate:?}: {error:?}"))
    .js
    .code
}

fn assert_parses(code: &str) {
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, code, SourceType::mjs()).parse();
    assert!(
        !parsed.panicked && parsed.diagnostics.is_empty(),
        "generated JavaScript must parse:\n{code}"
    );
}

#[test]
fn async_derived_by_callback_does_not_split_component_body() {
    let source =
        "<script>\nconst value = $derived.by(async () => await load());\n</script>\n{value}";

    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = compile_async(source, generate);
        assert!(
            code.contains("const value = $.derived(async () => await load());"),
            "{generate:?} must retain the callback-derived declaration in the sync prelude:\n{code}"
        );
        assert!(
            !code.contains("$.async_derived"),
            "{generate:?} must not turn $derived.by into async derived:\n{code}"
        );
        assert!(
            !code.contains("var $$promises"),
            "{generate:?} must not split a component without a top-level await:\n{code}"
        );
        assert_parses(&code);
    }
}

#[test]
fn async_derived_by_callback_stays_sync_when_component_also_awaits() {
    let source = "<script>\nconst value = $derived.by(async () => await load());\nconst resolved = await load();\n</script>\n{value}{resolved}";

    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = compile_async(source, generate);
        assert!(
            code.contains("const value = $.derived(async () => await load());"),
            "{generate:?} must keep callback-derived declaration outside the async thunk:\n{code}"
        );
        assert!(code.contains("var $$promises"), "{generate:?}:\n{code}");
        assert_parses(&code);
    }
}
