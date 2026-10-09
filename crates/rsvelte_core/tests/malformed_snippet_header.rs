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

fn compile_client(src: &str) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|out| out.js.code)
    .map_err(|error| format!("{error:?}"))
}

const TYPED_ROW: &str = "<script lang=\"ts\">\n  const x = 1;\n</script>\n\n{#snippet row({\n  name,\n}: {\n__COMMENT__  name: string;\n})}\n  <p>{name}{x}</p>\n{/snippet}\n\n{@render row({ name: 'a' })}\n";

// The upstream parser counts parentheses without reading strings or comments,
// so an apostrophe in a comment of the parameter types is just text: the
// component compiles exactly as it does with the apostrophe spelled out.
#[test]
fn an_apostrophe_in_a_parameter_comment_is_not_a_string() {
    let with_apostrophe =
        compile_client(&TYPED_ROW.replace("__COMMENT__", "  // it's a comment\n")).unwrap();
    let without =
        compile_client(&TYPED_ROW.replace("__COMMENT__", "  // it s a comment\n")).unwrap();
    assert_eq!(with_apostrophe.replace("it's", "it s"), without);
}

// Upstream's paren count stops at the `)` inside the string, so the parameters
// it hands to the expression parser hold an unterminated string.
#[test]
fn a_closing_paren_inside_a_parameter_string_ends_the_list_as_upstream() {
    let error = compile_client("{#snippet row(a = \")\")}\n  <p>{a}</p>\n{/snippet}\n")
        .expect_err("upstream rejects this header");
    assert!(error.contains("js_parse_error"), "{error}");
}
