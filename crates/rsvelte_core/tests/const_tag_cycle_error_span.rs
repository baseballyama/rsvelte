use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn const_tag_cycle_points_at_the_first_declaration_in_the_cycle() {
    let source = "{#if true}\n\t{@const a = b}\n\t{@const b = a}\n{/if}";
    let diagnostic = compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            runes: Some(false),
            ..Default::default()
        },
    )
    .expect_err("cyclical const tags must be rejected")
    .diagnostic();
    let declaration = "{@const a = b}";
    let start = source.find(declaration).unwrap() as u32;

    assert_eq!(diagnostic.code.as_deref(), Some("const_tag_cycle"));
    assert_eq!(
        diagnostic.span,
        Some((start, start + declaration.len() as u32))
    );
}
