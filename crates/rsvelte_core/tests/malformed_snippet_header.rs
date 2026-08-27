use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn an_unclosed_snippet_parameter_list_requires_the_closing_paren() {
    let error = compile(
        "{#snippet children(hi{/snippet}\n",
        CompileOptions {
            filename: Some("X.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("the snippet parameter list is not closed");

    let text = format!("{error:?}");
    assert!(text.contains("expected_token"), "{text}");
    assert!(text.contains("Expected token )"), "{text}");
    assert!(text.contains("span: (31, 31)"), "{text}");
}
