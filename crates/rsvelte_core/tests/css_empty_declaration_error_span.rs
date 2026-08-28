use rsvelte_core::{CompileOptions, compile};

#[test]
fn empty_css_declaration_span_includes_following_whitespace() {
    let source = concat!(
        "<div class=\"post\">{@html content}</div>\n\n",
        "<style>\n",
        "  .post :global {\n",
        "    p {...}\n",
        "  }\n",
        "</style>",
    );
    let diagnostic = compile(source, CompileOptions::default())
        .expect_err("an empty CSS declaration must be rejected")
        .diagnostic();
    let start = source.find("...}").unwrap() as u32;
    let end = source.find("\n  }").unwrap() as u32 + 3;

    assert_eq!(diagnostic.code.as_deref(), Some("css_empty_declaration"));
    assert_eq!(diagnostic.span, Some((start, end)));
}
