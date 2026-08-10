use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn regex_after_return_is_not_a_template_close_tag() {
    let output = compile(
        "<script>let value = ''; </script><p>{typeof /[//]/.exec(value)}</p>",
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("valid template expression was rejected: {error:?}"))
    .js
    .code;

    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, &output, SourceType::mjs()).parse();
    assert!(
        !parsed.panicked && parsed.diagnostics.is_empty(),
        "client output must parse:\n{output}"
    );
}
