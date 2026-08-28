use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn invalid_rune_initializer_in_non_runes_mode_points_at_the_call() {
    let source =
        "<script>\nfunction bar($derived) {\n    const x = $derived(foo + 1);\n}\n</script>";
    let diagnostic = compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("a rune initializer must be rejected in non-runes mode")
    .diagnostic();
    let call = "$derived(foo + 1)";
    let start = source.find(call).unwrap() as u32;

    assert_eq!(diagnostic.code.as_deref(), Some("rune_invalid_usage"));
    assert_eq!(diagnostic.span, Some((start, start + call.len() as u32)));
}
