use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn snippet_conflict_points_at_the_explicit_children_snippet() {
    let source = "<Button>\n\thello\n\t{#snippet children()}hi{/snippet}\n</Button>";
    let diagnostic = compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("explicit and implicit children must conflict")
    .diagnostic();
    let snippet = "{#snippet children()}hi{/snippet}";
    let start = source.find(snippet).unwrap() as u32;

    assert_eq!(diagnostic.code.as_deref(), Some("snippet_conflict"));
    assert_eq!(diagnostic.span, Some((start, start + snippet.len() as u32)));
}
