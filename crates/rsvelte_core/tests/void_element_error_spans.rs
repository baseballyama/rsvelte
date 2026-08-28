use rsvelte_core::{CompileOptions, compile};

#[test]
fn void_element_closing_errors_point_at_the_closing_tag() {
    for source in [
        "<input>content</input>",
        "<div></input></div>",
        "<div>{#if true}</input>{/if}</div>",
    ] {
        let diagnostic = compile(source, CompileOptions::default())
            .expect_err("void element closing tags must be rejected")
            .diagnostic();
        let start = source.find("</input>").unwrap() as u32;

        assert_eq!(
            diagnostic.code.as_deref(),
            Some("void_element_invalid_content")
        );
        assert_eq!(diagnostic.span, Some((start, start)));
    }
}
