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
    .unwrap_or_else(|error| panic!("compile failed: {error:?}"))
    .js
    .code
}

#[test]
fn unicode_identifier_adjacent_to_await_does_not_enable_async_lowering() {
    for source in [
        "<script>let 名前await = 1; let value = $derived(名前await);</script>{value}",
        "<script>let await名前 = 1; let value = $derived(await名前);</script>{value}",
    ] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let output = compile_async(source, generate);
            assert!(!output.contains("$.run(["), "{output}");
            assert!(!output.contains("$.await("), "{output}");
        }
    }
}

#[test]
fn unicode_arrow_parameter_does_not_split_a_text_scan_at_a_utf8_byte() {
    let output = compile_async(
        "<script>let f = 名前 => 名前; let value = $derived(f);</script>{value}",
        GenerateMode::Client,
    );
    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, &output, SourceType::mjs()).parse();
    assert!(
        !parsed.panicked && parsed.diagnostics.is_empty(),
        "client output must parse:\n{output}"
    );
}
