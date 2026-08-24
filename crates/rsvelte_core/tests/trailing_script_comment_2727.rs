//! A comment trailing the last legacy `$:` statement must not be spliced into the
//! generated setter.
//!
//! The regex body is what made this a scanner problem: `/[//]/` looks like the
//! start of a line comment, so the statement's end was mis-located and the
//! comment landed inside `$.legacy_pre_effect(…)`. Upstream drops the comment —
//! its `$:` becomes a builder-made effect whose block parks esrap's comment
//! cursor — so the output must simply not carry it, and must still parse.

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
        !output.contains("// } c"),
        "upstream drops the comment with the statement it trailed:\n{output}"
    );
    assert!(
        output.contains("$.set(k, typeof (/[//]/).exec(String(v())));"),
        "the reactive statement was mis-scanned:\n{output}"
    );

    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, &output, SourceType::mjs()).parse();
    assert!(
        !parsed.panicked && parsed.diagnostics.is_empty(),
        "client output must parse:\n{output}"
    );
}
