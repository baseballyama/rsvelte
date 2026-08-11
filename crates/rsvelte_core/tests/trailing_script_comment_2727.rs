use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

const SOURCE: &str = "<script>\n\texport let v;\n\tlet k;\n\t$: k = typeof /[//]/.exec(String(v));\n\t// } c\n</script><p>{k}</p>";

#[test]
fn trailing_line_comment_stays_outside_the_generated_setter() {
    let output = compile(
        SOURCE,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code;

    assert!(
        output.contains("// } c\n\t$.legacy_pre_effect"),
        "the trailing comment was spliced into the generated setter:\n{output}"
    );

    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, &output, SourceType::mjs()).parse();
    assert!(
        !parsed.panicked && parsed.diagnostics.is_empty(),
        "client output must parse:\n{output}"
    );
}
