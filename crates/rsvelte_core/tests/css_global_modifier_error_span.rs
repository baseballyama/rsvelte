use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn top_level_global_modifier_error_points_at_the_nesting_selector() {
    let source = "<style>\n:global {\n\t&.x { color: red; }\n}\n</style>";
    let diagnostic = compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("a top-level :global block cannot be modified")
    .diagnostic();
    let start = source.find('&').unwrap() as u32;

    assert_eq!(
        diagnostic.code.as_deref(),
        Some("css_global_block_invalid_modifier_start")
    );
    assert_eq!(diagnostic.span, Some((start, start + 1)));
}
