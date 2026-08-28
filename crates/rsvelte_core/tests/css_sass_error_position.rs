use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn unprocessed_indented_sass_errors_after_the_first_property_colon() {
    let source = "<style lang=\"sass\">\n\t.card\n\t\tdisplay: block\n</style>";
    let expected = source.find("display:").unwrap() + "display:".len();

    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let diagnostic = compile(
            source,
            CompileOptions {
                generate,
                ..Default::default()
            },
        )
        .expect_err("official rejects Sass that has not been preprocessed")
        .diagnostic();

        assert_eq!(
            (diagnostic.code.as_deref(), diagnostic.span,),
            (Some("css_expected_identifier"), Some((expected, expected)))
        );
    }
}
