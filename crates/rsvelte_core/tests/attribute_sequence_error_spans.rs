use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn assert_sequence_error_span(source: &str) {
    let diagnostic = compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("unparenthesized sequence attributes must be rejected in runes mode")
    .diagnostic();
    let start = source.rfind("x, y, z").unwrap() as u32;

    assert_eq!(
        diagnostic.code.as_deref(),
        Some("attribute_invalid_sequence_expression")
    );
    assert_eq!(diagnostic.span, Some((start, start + 7)));
}

#[test]
fn component_sequence_error_points_at_the_expression() {
    assert_sequence_error_span(
        "<script>let { x, y, z } = $props();</script>\n<Child foo={x, y, z} />",
    );
}

#[test]
fn element_sequence_error_points_at_the_expression() {
    assert_sequence_error_span(
        "<script>let { x, y, z } = $props();</script>\n<span foo={x, y, z} />",
    );
}
