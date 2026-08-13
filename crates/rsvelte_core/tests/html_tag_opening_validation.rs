use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_html_tag(source: &str, runes: Option<bool>) -> Result<(), rsvelte_core::CompileError> {
    compile(
        source,
        CompileOptions {
            filename: Some("HtmlTag.svelte".into()),
            generate: GenerateMode::Client,
            runes,
            ..Default::default()
        },
    )
    .map(|_| ())
}

#[test]
fn runes_html_tag_requires_at_sign_immediately_after_opening_bracket() {
    for source in ["{ @html value}", "{\n@html value}"] {
        let error =
            compile_html_tag(source, Some(true)).expect_err("runes mode must reject whitespace");
        let diagnostic = error.diagnostic();

        assert_eq!(
            diagnostic.code.as_deref(),
            Some("block_unexpected_character")
        );
        assert_eq!(
            diagnostic.message,
            "Expected a `@` character immediately following the opening bracket\nhttps://svelte.dev/e/block_unexpected_character"
        );
        assert_eq!(diagnostic.span, Some((0, 5)));
    }
}

#[test]
fn legacy_html_tag_allows_whitespace_after_opening_bracket() {
    compile_html_tag("{ @html value}", Some(false)).expect("legacy html tag should compile");
}
